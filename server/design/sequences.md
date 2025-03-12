---
reqmd.package: server.design.sequences
---

# Sequences

This document outlines the design for sequence number management within the Voedger platform.

## Background

A **Sequence** in Voedger is defined as a monotonically increasing series of numbers. The platform provides a unified mechanism for sequence generation that ensures reliable, ordered number production.

As of March 1, 2025, Voedger implements four specific sequence types using this mechanism:

- **PLogOffsetSequence**: Tracks write positions in the PLog
- **WLogOffsetSequence**: Manages offsets in the WLog
- **CRecordIDSequence**: Generates unique identifiers for CRecords
- **OWRecordIDSequence**: Provides sequential IDs for O/W- Records

As the Voedger platform evolves, the number of sequence types is expected to expand. Future development will enable applications to define their own custom sequence types, extending the platform's flexibility to meet diverse business requirements beyond the initially implemented system sequences.

These sequences ensure consistent ordering of operations, proper transaction management, and unique identification across the platform's distributed architecture. The design prioritizes performance and scalability by implementing an efficient caching strategy and background updates that minimize memory usage and recovery time.

## Motivation

As of March 1, 2025, the sequence implementation has several critical limitations that impact system performance and scalability:

- **Unbound Memory Growth**: Sequence data for all workspaces is loaded into memory simultaneously, creating a direct correlation between memory usage and the number of workspaces. This approach becomes unsustainable as applications scale.

- **Prolonged Startup Times**: During command processor initialization, a resource-intensive "recovery process" must read and process the entire PLog to determine the last used sequence numbers. This causes significant startup delays that worsen as event volume grows.

The proposed redesign addresses these issues through intelligent caching, background updates, and optimized storage mechanisms that maintain sequence integrity while dramatically improving resource utilization and responsiveness.

## Solution overview

The proposed approach implements a more efficient and scalable sequence management system through the following key components:

- **Projection-Based Storage**: Each application partition will maintain sequence data in a dedicated projection (`SeqData`), eliminating the need to load all sequence data into memory at once.
- **Offset Tracking**: `SeqData` will include a `SeqDataOffset` attribute that indicates the PLog partition offset for which the stored sequence data is valid, enabling precise recovery and synchronization.
- **MRU Cache Implementation**: Sequence data will be accessed through a Most Recently Used (MRU) cache that prioritizes frequently accessed sequences while allowing less active ones to be evicted from memory.
- **Background Updates**: As new events are written to the PLog, sequence data will be updated in the background, ensuring that the system maintains current sequence values without blocking operations.
- **Batched Writes**: Sequence updates will be collected and written in batches to reduce I/O operations and improve throughput.
- **Optimized Actualization**: The actualization process will use the stored `SeqDataOffset` to process only events since the last known valid state, dramatically reducing startup times.

This approach decouples memory usage from the total number of workspaces and transforms the recovery process from a linear operation dependent on total event count to one that only needs to process recent events since the last checkpoint.

## Definitions

**APs**: Applcation Partitions

**SequencesTrustLevel**:

The `SequencesTrustLevel` setting determines how events and table records are written.

| Level | Events            | Table Records     |
|-------|-------------------|-------------------|
| 0     | InsertIfNotExists | InsertIfNotExists |
| 1     | InsertIfNotExists | Put               |
| 2     | Put               | Put               |

## Functional design: Use cases

### VVMHost: Configure TrustedSequences mode for VVM

`~tuc.VVMConfig.ConfigureTrustedSequences~`

- Data
  - VVMConfig.TrustedSequences

### CP: Handling SequencesTrustLevel for Events

`~tuc.PLogSequencesTrustLevel~`

- ???

### CP: Handling SequencesTrustLevel for Table Records

`~tuc.TableSequencesTrustLevel~`

- ???

### CP: Command processing

`~tuc.StartSequencesGeneration~`

- When: CP starts processing a request
- Flow:
  - `partitionID` is calculated using request WSID and amount of partitions declared in AppDeploymentDescriptor [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/vvm/impl_requesthandler.go#L61)
  - sequencer, err := IAppPartition.Sequencer(PartitionID) err
  - nextPLogOffest, ok, err := sequencer.Start(wsKind, WSID)
    - if !ok
      - Actualization is in progress
      - Flushing queue is full
      - Returns 503: "server is busy"

`~tuc.GetNextSequenceNumber~`

- Flow
  - sequencer.Next(sequenceId)
- Previous flow
  - recovery on the first request into the workspace
    - CP creates new `istructs.IIDGenerator` instance [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/processors/command/impl.go#L136)
    - the `istructs.IIDGenerator` instance is kept for the WSID
    - `istructs.IIDGenerator` instance is tuned with the data from the each event of the PLog:
   	  - for each CUD:
   	    - CUD.ID is set as the current RecordID
          - `IIDGenerator.UpdateOnSync` is called [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/processors/command/impl.go#L253)
  - save the event after cmd exec:
    - `istructs.IIDGenerator` instance is provided to `IEvents.PutPlog()` [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/processors/command/impl.go#L307)
    - `istructs.IIDGenerator.Next()` is called to convert rawID->realID for ODoc in arguments and each resulting CUD [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/istructsmem/event-types.go#L189)

`~tuc.FlushSequenceNumbers~`

- When: After CP saves the PLog record successfully
  - sequencer.Flush()

`~tuc.ReactualizeSequences~`

- When: After CP fails to save the PLog record
- Flow
  - sequencer.Actualize()

### APs: Application deployment: Use cases

`~tuc.InstantiateSequencer~`

- When: Partition with the `partitionID` is deployed
- Flow:
  - Instantiate the implementation of the `isequencer.ISeqStorage`: `seqStorage isequencer.ISeqStorage`
  - Instantiate `sequencer := isequencer.New(*isequencer.Params)`
  - Save `sequencer` to some `map[partitionID]isequencer.Sequencer`

## Functional design: pkg/isequencer

### interface.go

```go
/*
 * Copyright (c) 2025-present unTill Software Development Group B. V.
 * @author Maxim Geraskin
 */

package isequencer

import (
	"context"
	"time"
)

type SeqID      uint16
type WSKind     uint16
type WSID       uint64
type Number     uint64
type PLogOffset uint64

type NumberKey struct {
	WSID  WSID
	SeqID SeqID
}

type SeqValue struct {
	Key    NumberKey
	Value  Number
}

// To be injected into the ISequencer implementation.
type ISeqStorage interface {

  // If number is not found, returns 0
	ReadNumbers(WSID, []SeqID) ([]Numbers, error)

	// IDs in batch.Values are unique
  // len(batch) may be 0
	WriteValues(batch []SeqValue) error

  // Next offset to be used
	WriteNextPLogOffset(offset PLogOffset) error
	ReadNextPLogOffset() (PLogOffset, error)

	// ActualizeSequencesFromPLog scans PLog from the given offset and send values to the batcher.
	// Values are sent per event, unordered, ISeqValue.Keys are not unique.
	ActualizeSequencesFromPLog(ctx context.Context, offset PLogOffset, batcher func(batch []SeqValue, offset PLogOffset) error) error
}

// ISequencer defines the interface for working with sequences.
// ISequencer methods must not be called concurrently.
// Use: { Start {Next} ( Flush | Actualize ) }
//
// Definitions
// - Sequencing Transaction: Start -> Next -> (Flush | Actualize)
// - Actualization: Making the persistent state of the sequences consistent with the PLog.
// - Flushing: Writing the accumulated sequence values to the storage.
// - LRU: Least Recently Used cache that keep the most recent next sequence values in memory.
type ISequencer interface {

  // Start starts Sequencing Transaction for the given WSID.
  // Marks Sequencing Transaction as in progress.
  // Panics if Sequencing Transaction is already started.
  // Normally returns the next PLogOffset, true
  // Returns `0, false` if:
  // - Actualization is in progress
  // - The number of unflushed values exceeds the maximum threshold
  // If ok is true, the caller must call Flush() or Actualize() to complete the Sequencing Transaction.
  Start(wsKind WSKind, wsID WSID) (plogOffset PLogOffset, ok bool)

  // Next returns the next sequence number for the given SeqID.
  // Panics if Sequencing Transaction is not in progress.
  // err: ErrUnknownSeqID if the sequence is not defined in Params.SeqTypes.
  Next(seqID SeqID) (num Number, err error)

  // Flush completes Sequencing Transaction.
  // Panics if Sequencing Transaction is not in progress.
  Flush()

  // Actualize cancels Sequencing Transaction and starts the Actualization process.
  // Panics if Actualization is already in progress.
  // Panics if Sequencing Transaction is not in progress.
  // Flow:
  // - Mark Sequencing Transaction as not in progress
  // - Cancel and wait Flushing
  // - Empty LRU
  // - Do Actualization process
  // - Write next PLogOffset
  Actualize()

}

// Params for the ISequencer implementation.
type Params struct {

	// Sequences and their initial values.
	// Only these sequences are managed by the sequencer (ref. ErrUnknownSeqID).
	SeqTypes map[WSKind]map[SeqID]Number

	SeqStorage ISeqStorage

	MaxNumUnflushedValues int           // 500
	MaxFlushingInterval   time.Duration // 500 * time.Millisecond
	// Size of the LRU cache, NumberKey -> Number.
	LRUCacheSize int // 100_000
}
```

### Implementation requirements

```go
// filepath: pkg/isequencer: impl.go

import (
  "context"
  "time"

  "github.com/hashicorp/golang-lru/v2"
)

// Implements isequencer.ISequencer
// Keeps next (not current) values in LRU and type ISeqStorage interface
type sequencer struct {
  params *Params

  actualizerInProgress atomic.Bool
  // actualizerCtxCancel is used by cleanup() function
  actualizerCtxCancel context.CancelFunc
  actualizerWG  *sync.WaitGroup


  lru *lru.Cache

  // Initialized by Start()
  // Example:
  // - 4 is the offset ofthe last event in the PLog
  // - nextOffset keeps 5
  // - Start() returns 5 and increments nextOffset to 6
  nextOffset PLogOffset

  // If Sequencing Transaction is in progress then currentWSID has non-zero value.
  currentWSID   WSID
  currentWSKind WSKind

  // Closed when flusher needs to be stopped
  flusherCtxCancel context.CancelFunc
  // Used to wait for flusher goroutine to exit
  // Set to nil when flusher is not running
  // Is not accessed concurrently since 
  // - Is accessed by actualizer() and cleanup()
  // - cleanup() first shutdowns the actualizer() then flusher()
  flusherWG  *sync.WaitGroup
  // Buffered channel [1] to signal flusher to flush
  // Written (non-blocking) by Flush()
  flusherSig chan struct{}

  // To be flushed
  toBeFlushed map[NumberKey]Number
  // Will be 6 if the offset of the last processed event is 4
  toBeFlushedOffset PLogOffset
  // Protects toBeFlushed and toBeFlushedOffset
  toBeFlushedMu sync.RWMutex

  // Written by Next()
  inproc map[NumberKey]Number

}

// New creates a new instance of the Sequencer type.
// Instance has actualizer() goroutine started.
// cleanup: function to stop the actualizer.
func New(*isequencer.Params) (isequencer.ISequencer, cleanup func(), error) {
  // ...
}

// Flush implements isequencer.ISequencer.Flush.
// Flow:
//   Copy s.inproc and s.nextOffset to s.toBeFlushed and s.toBeFlushedOffset
//   Clear s.inproc
//   Increase s.nextOffset
//   Non-blocking write to s.flusherSig
func (s *sequencer) Flush() {
  // ...
}

// Next implements isequencer.ISequencer.Next.
// It ensures thread-safe access to sequence values and handles various caching layers.
// 
// Flow:
// - Validate equencing Transaction status
// - Get initialValue from s.params.SeqTypes and ensure that SeqID is known
// - Try to obtain the next value using:
//   - Try s.lru (can be evicted)
//   - Try s.inproc
//   - Try s.toBeFlushed (use s.toBeFlushedMu to synchronize)
//   - Try s.params.SeqStorage.ReadNumber()
//      - Read all known numbers for wsKind, wsID
//        - If number is 0 then initial value is used
//      - Write all numbers to s.lru
// - Write value+1 to s.lru
// - Write value+1 to s.inproc
// - Return value
func (s *sequencer) Next(seqID SeqID) (num Number, err error) {
  // ...
}

// batcher processes a batch of sequence values and writes maximum values to storage.
// Flow:
// - Copy offset to s.nextOffset
// - Store maxValues in s.toBeFlushed: max Number for each SeqValue.Key
// - If s.params.MaxNumUnflushedValues is reached
//   - Flush s.toBeFlushed using s.params.SeqStorage.WriteValues()
//   - s.params.SeqStorage.WriteNextPLogOffset(s.nextOffset + 1)
//   - Clean s.toBeFlushed
func (s *sequencer) batcher(values []SeqValue, offset PLogOffset) (err error) {
  // ...
}

// Actualize implements isequencer.ISequencer.Actualize.
// Flow:
// - Validate Sequencing Transaction status (s.currentWSID != 0)
// - Validate Actualization status (s.actualizerInProgress is false)
// - Set s.actualizerInProgress to true
// - Clean s.lru, s.nextOffset, s.currentWSID, s.currentWSKind, s.toBeFlushed, s.inproc, s.toBeFlushedOffset
// - Start the actualizer() goroutine
func (s *sequencer) Actualize() {
  // ...
}

// actualizer is started in goroutine by Actualize().
// Flow:
// - if s.flusherWG is not nil
//   - s.cancelFlusherCtx()
//   - Wait for s.flusherWG
//   - s.flusherWG = nil
// - Read nextPLogOffset from s.params.SeqStorage.ReadNextPLogOffset()
// - Use s.params.SeqStorage.ActualizeSequencesFromPLog() and s.batcher()
// - Increment s.nextOffset
// - If s.toBeFlushed is not empty
//   - Write toBeFlushed using s.params.SeqStorage.WriteValues()
//   - s.params.SeqStorage.WriteNextPLogOffset(s.nextOffset)
//   - Clean s.toBeFlushed
// - s.flusherWG, s.flusherCtxCancel + start flusher() goroutine
//
// Error handling:
// -  Handle errors with retry mechanism (500ms wait)
// ctx handling:
// - if ctx is closed exit
func (s *sequencer) actualizer(ctx context.Context) {
  // ...
}

// flusher is started in goroutine by actualizer().
// Flow:
// - Wait for s.flusherSig
// - Lock s.toBeFlushedMu
// - Copy s.toBeFlushedOffset to flushOffset (local variable)
// - Copy s.toBeFlushed to flushValues []SeqValue (local variable)
// - Unlock s.toBeFlushedMu
// - s.params.SeqStorage.WriteValues(flushValues)
// - s.params.SeqStorage.WriteNextPLogOffset(flushOffset)
// - Lock s.toBeFlushedMu
// - for each fv in flushValues
//   - if s.toBeFlushed[fv.Key] == fv.Value
//     - delete(s.toBeFlushed, fv.Key)
// - Unlock s.toBeFlushedMu
// Error handling:
// -  Handle errors with retry mechanism (500ms wait)
// ctx handling:
// - if ctx is closed exit
func (s *sequencer) flusher(ctx context.Context) {
  // ...
}

// cleanup stops the actualizer() and flusher() goroutines.
// Flow:
// - if s.actualizerInProgress
//   - s.cancelActualizerCtx()
//   - Wait for s.actualizerWG
// - if s.flusherWG is not nil
//   - s.cancelFlusherCtx()
//   - Wait for s.flusherWG
//   - s.flusherWG = nil
func (s *sequencer) cleanup() {
  // ...
}

```

## Technical design

### Components

`~cmp.IAppPartition.Sequencer~`

- Returns `isequencer.Sequencer` for the given `partitionID`

## Test design

### isequencer

- `~test.isequencer.mockISeqStorage~`
  - Mock implementation of `isequencer.ISeqStorage` for testing purposes

Edge cases:

- `~test.isequencer.LongRecovery~`
  - Params.MaxNumUnflushedValues = 5 // Just a guess
  - For numOfEvents in [0, 10*Params.MaxNumUnflushedValues]
    - Create a new ISequencer instance
    - Check that Next() returns correct values after recovery
- `~test.isequencer.MultipleActualizes~`
  - Repeat { Start {Next} randomly( Flush | Actualize ) } cycle 100 times
  - Check that the system recovers well
  
### SequencesTrustLevel mode: Tests

Method:

- Test for Record
  - Create a new VIT instance on an owned config with `VVMConfig.TrustedSequences = false`
  - Insert a doc to get the last recordID: simply exec `c.sys.CUD` and get the ID of the new record
  - Corrupt the storage: Insert a conflicting key that will be used on creating the next record:
    - `VIT.IAppStorageProvider.AppStorage(test1/app1).Put()`
   	- Build `pKey`, `cCols` for the record, use just inserted recordID+1
   	- Value does not matter, let it be `[]byte{1}`
  - Try to insert one more record using `c.sys.CUD`
  - Expect panic
- Test for PLog, WLog offsets - the same tests but sabotage the storage building keys for the event

System tests:

- `~syst.SequencesTrustLevel0~`
- `~syst.SequencesTrustLevel1~`
- `~syst.SequencesTrustLevel2~`

## References

### Addressed issues

- [Original Issue #3215: Sequences](https://github.com/voedger/voedger/issues/3215) - Initial requirements and discussion

### Design process

- [Voedger Sequence Management Design (Claude 3.7 Sonnet, March 1, 2025)](https://claude.ai/chat/f1a8492a-8e8a-4229-ac79-ecc3655732d3)

### History

- [Initial design](https://github.com/voedger/voedger-internals/blob/2475814f7caa1d2d400a62a788ceda9b16d8de2a/server/design/sequences.md)
