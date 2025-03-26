---
reqmd.package: server.design.sequences
---

# Sequences

## Introduction

This document outlines the design for sequence number management within the Voedger platform.

A **Sequence** in Voedger is defined as a monotonically increasing series of numbers. The platform provides a unified mechanism for sequence generation that ensures reliable, ordered number production.

As of March 1, 2025, Voedger implements four specific sequence types using this mechanism:

- **PLogOffsetSequence**: Tracks write positions in the PLog
- **WLogOffsetSequence**: Manages offsets in the WLog
- **CRecordIDSequence**: Generates unique identifiers for CRecords
  - To read all CRecords by SELECT
- **OWRecordIDSequence**: Provides sequential IDs for O/W- Records
  - There are a potentially lot of such records, so it is not possible to use SELECT to read all of them

As the Voedger platform evolves, the number of sequence types is expected to expand. Future development will enable applications to define their own custom sequence types, extending the platform's flexibility to meet diverse business requirements beyond the initially implemented system sequences.

These sequences ensure consistent ordering of operations, proper transaction management, and unique identification across the platform's distributed architecture. The design prioritizes performance and scalability by implementing an efficient caching strategy and background updates that minimize memory usage and recovery time.

### Background

- [#688: record ID leads to different tables](https://github.com/voedger/voedger/issues/688)
- [VIEW RecordsRegistry](https://github.com/voedger/voedger/blob/ec85a5fed968e455eb98983cd12a0163effdc096/pkg/sys/sys.vsql#L260)
- [Singleton IDs]https://github.com/voedger/voedger/blob/ec85a5fed968e455eb98983cd12a0163effdc096/pkg/istructs/consts.go#L101

Existing design

- [cmdProc.appsPartitions ](https://github.com/voedger/voedger/blob/b7fa6fa9e260eac4f1de80312c14ad4250f400a3/pkg/processors/command/provide.go#L32)
- [command/impl.go/getIDGenerator](https://github.com/voedger/voedger/blob/b7fa6fa9e260eac4f1de80312c14ad4250f400a3/pkg/processors/command/impl.go#L299)
- [command/impl.go: Put IDs to response](https://github.com/voedger/voedger/blob/b7fa6fa9e260eac4f1de80312c14ad4250f400a3/pkg/processors/command/impl.go#L790)
- [command/impl.go: (idGen *implIDGenerator) NextID](https://github.com/voedger/voedger/blob/b7fa6fa9e260eac4f1de80312c14ad4250f400a3/pkg/processors/command/impl.go#L816)
- [istructmem/idgenerator.go: (g *implIIDGenerator) NextID](https://github.com/voedger/voedger/blob/b7fa6fa9e260eac4f1de80312c14ad4250f400a3/pkg/istructsmem/idgenerator.go#L32)
  - [onNewID???](https://github.com/voedger/voedger/blob/b7fa6fa9e260eac4f1de80312c14ad4250f400a3/pkg/istructsmem/idgenerator.go#L16)

## Motivation

As of March 1, 2025, the sequence implementation has several critical limitations that impact system performance and scalability:

- **Unbound Memory Growth**: Sequence data for all workspaces is loaded into memory simultaneously, creating a direct correlation between memory usage and the number of workspaces. This approach becomes unsustainable as applications scale.

- **Prolonged Startup Times**: During command processor initialization, a resource-intensive "recovery process" must read and process the entire PLog to determine the last used sequence numbers. This causes significant startup delays that worsen as event volume grows.

The proposed redesign addresses these issues through intelligent caching, background updates, and optimized storage mechanisms that maintain sequence integrity while dramatically improving resource utilization and responsiveness.

## Definitions

**APs**: Applcation Partitions

**SequencesTrustLevel**:

The `SequencesTrustLevel` setting determines how events and table records are written.

| Level | Events, write mode | Table Records, write mode |
|-------|--------------------|---------------------------|
| 0     | InsertIfNotExists  | InsertIfNotExists         |
| 1     | InsertIfNotExists  | Put                       |
| 2     | Put                | Put                       |

## Solution overview

The proposed approach implements a more efficient and scalable sequence management system through the following key components:

- **Projection-Based Storage**: Each application partition will maintain sequence data in a dedicated projection (`SeqData`), eliminating the need to load all sequence data into memory at once.
- **Offset Tracking**: `SeqData` will include a `SeqDataOffset` attribute that indicates the PLog partition offset for which the stored sequence data is valid, enabling precise recovery and synchronization.
- **MRU Cache Implementation**: Sequence data will be accessed through a Most Recently Used (MRU) cache that prioritizes frequently accessed sequences while allowing less active ones to be evicted from memory.
- **Background Updates**: As new events are written to the PLog, sequence data will be updated in the background, ensuring that the system maintains current sequence values without blocking operations.
- **Batched Writes**: Sequence updates will be collected and written in batches to reduce I/O operations and improve throughput.
- **Optimized Actualization**: The actualization process will use the stored `SeqDataOffset` to process only events since the last known valid state, dramatically reducing startup times.

This approach decouples memory usage from the total number of workspaces and transforms the recovery process from a linear operation dependent on total event count to one that only needs to process recent events since the last checkpoint.

## Use cases

### VVMHost: Configure SequencesTrustLevel mode for VVM

`~tuc.VVMConfig.ConfigureSequencesTrustLevel~`uncvrd[^1]❓

- Components:
  - `~cmp.VVMConfig.SequencesTrustLevel~`

### CP: Handling SequencesTrustLevel for Events

- `~tuc.SequencesTrustLevelForPLog~`uncvrd[^2]❓
  - When PLog is written SequencesTrustLevel is used to determine the write mode
- `~tuc.SequencesTrustLevelForWLog~`
  - When WLog is written SequencesTrustLevel is used to determine the write mode

### CP: Handling SequencesTrustLevel for Table Records

- `~tuc.SequencesTrustLevelForRecords~`uncvrd[^3]❓
  - When a record is inserted SequencesTrustLevel is used to determine the write mode
  - When a record is updated - nothing is done in connection with SequencesTrustLevel

### CP: Command processing: Start sequences generation

`~tuc.StartSequencesGeneration~`uncvrd[^4]❓

- When: CP starts processing a request
- Flow:
  - `partitionID` is calculated using request WSID and amount of partitions declared in AppDeploymentDescriptor [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/vvm/impl_requesthandler.go#L61)
  - sequencer, err := IAppPartition.Sequencer(PartitionID) err
  - nextPLogOffest, ok, err := sequencer.Start(wsKind, WSID)
    - if !ok
      - Actualization is in progress
      - Flushing queue is full
      - Returns 503: "server is busy"
- Components:
  - `~cmp.IAppPartition.Sequencer~`
    - Returns `isequencer.ISequencer` for the given `partitionID`
  - `~cmp.ISequencer.Start~`

### CP: Command processing: Next sequence number

`~tuc.GetNextSequenceNumber~`uncvrd[^5]❓

- Flow
  - sequencer.Next(sequenceId)

Components:

- `~cmp.ISequencer.Next~`

#### Previous flow

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

### CP: Command processing: Flush sequence numbers

`~tuc.FlushSequenceNumbers~`uncvrd[^6]❓

- When: After CP saves the PLog record successfully
  - sequencer.Flush()

`~tuc.ReactualizeSequences~`uncvrd[^7]❓

- When: After CP fails to save the PLog record
- Flow
  - sequencer.Actualize()

### AppParts: Application deployment: Use cases

`~tuc.InstantiateSequencer~`uncvrd[^8]❓

- When: Partition with the `partitionID` is deployed
- Flow:
  - Instantiate the implementation of the `isequencer.ISeqStorage` (internal.seqStorage, see below)
  - Instantiate `sequencer := isequencer.New(*isequencer.Params)`
  - Save `sequencer` to some `map[partitionID]isequencer.Sequencer`

Components:

- `~cmp.appparts.internal.seqStorage~`
  - `~cmp.appparts.internal.seqStorage.688~`
    - Handle [#688: record ID leads to different tables](https://github.com/voedger/voedger/issues/688)

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
// 
type ISeqStorage interface {

  // If number is not found, returns 0
	ReadNumbers(WSID, []SeqID) ([]Number, error)
  ReadNextPLogOffset() (PLogOffset, error)

	// IDs in batch.Values are unique
  // len(batch) may be 0
  // offset: Next offset to be used
  // batch MUST be written first, then offset
	WriteValuesAndOffset(batch []SeqValue, offset PLogOffset) error

  // ActualizeSequencesFromPLog scans PLog from the given offset and send values to the batcher.
	// Values are sent per event, unordered, ISeqValue.Keys are not unique.
  // err: ctx.Err() if ctx is closed
	ActualizeSequencesFromPLog(ctx context.Context, offset PLogOffset, batcher func(batch []SeqValue, offset PLogOffset) error) (err error)
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

  BatcherDelay time.Duration // 5 * time.Millisecond
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

  // Set by s.Actualize(), never cleared (zeroed).
  // Used by s.cleanup().
  actualizerCtxCancel context.CancelFunc
  actualizerWG  *sync.WaitGroup


  // Cleared by s.Actualize()
  lru *lru.Cache

  // Initialized by Start()
  // Example:
  // - 4 is the offset ofthe last event in the PLog
  // - nextOffset keeps 5
  // - Start() returns 5 and increments nextOffset to 6
  nextOffset PLogOffset

  // If Sequencing Transaction is in progress then currentWSID has non-zero value.
  // Cleared by s.Actualize()
  currentWSID   WSID
  currentWSKind WSKind

  // Set by s.actualizer()
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
// 
// Flow:
// - Wait until len(s.toBeFlushed) < s.params.MaxNumUnflushedValues
//   - Lock/Unlock
//   - Wait s.params.BatcherDelay
//   - check ctx (return ctx.Err())
// - s.nextOffset = offset + 1
// - Store maxValues in s.toBeFlushed: max Number for each SeqValue.Key
// - s.toBeFlushedOffset = offset + 1
// 
func (s *sequencer) batcher(ctx ctx.Context, values []SeqValue, offset PLogOffset) (err error) {
  // ...
}

// Actualize implements isequencer.ISequencer.Actualize.
// Flow:
// - Validate Sequencing Transaction status (s.currentWSID != 0)
// - Validate Actualization status (s.actualizerInProgress is false)
// - Set s.actualizerInProgress to true
// - Set s.actualizerCtxCancel, s.actualizerWG
// - Clean s.lru, s.nextOffset, s.currentWSID, s.currentWSKind, s.toBeFlushed, s.inproc, s.toBeFlushedOffset
// - Start the actualizer() goroutine
func (s *sequencer) Actualize() {
  // ...
}

/*
actualizer is started in goroutine by Actualize().

Flow:

- if s.flusherWG is not nil
  - s.cancelFlusherCtx()
  - Wait for s.flusherWG
  - s.flusherWG = nil
- Clean s.toBeFlushed, toBeFlushedOffset
- s.flusherWG, s.flusherCtxCancel + start flusher() goroutine
- Read nextPLogOffset from s.params.SeqStorage.ReadNextPLogOffset()
- Use s.params.SeqStorage.ActualizeSequencesFromPLog() and s.batcher()
ctx handling:
 - if ctx is closed exit

Error handling:
- Handle errors with retry mechanism (500ms wait)
- Retry mechanism must check `ctx` parameter, if exists 
*/
func (s *sequencer) actualizer(ctx context.Context) {
  // ...
}

/*
flusher is started in goroutine by actualizer().

Flow:

- Wait for ctx.Done() or s.flusherSig or s.params.MaxFlushingInterval
- if ctx.Done() exit
- Lock s.toBeFlushedMu
- Copy s.toBeFlushedOffset to flushOffset (local variable)
- Copy s.toBeFlushed to flushValues []SeqValue (local variable)
- Unlock s.toBeFlushedMu
- s.params.SeqStorage.WriteValues(flushValues, flushOffset)
- Lock s.toBeFlushedMu
- for each key in flushValues remove key from s.toBeFlushed if values are the same
- Unlock s.toBeFlushedMu

Error handling:

- Handle errors with retry mechanism (500ms wait)
- Retry mechanism must check `ctx` parameter, if exists 
*/
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

`~cmp.IAppPartition.Sequencer~`uncvrd[^9]❓

- Returns `isequencer.Sequencer` for the given `partitionID`

## Test design

### isequencer

- `~test.isequencer.mockISeqStorage~`uncvrd[^10]❓
  - Mock implementation of `isequencer.ISeqStorage` for testing purposes

Some core functionality tests:

- `~test.isequencer.FlushByTimer~`
- `~test.isequencer.FlushBySize~`

Some edge case tests:

- `~test.isequencer.LongRecovery~`uncvrd[^11]❓
  - Params.MaxNumUnflushedValues = 5 // Just a guess
  - For numOfEvents in [0, 10*Params.MaxNumUnflushedValues]
    - Create a new ISequencer instance
    - Check that Next() returns correct values after recovery
- `~test.isequencer.MultipleActualizes~`uncvrd[^12]❓
  - Repeat { Start {Next} randomly( Flush | Actualize ) } cycle 100 times
  - Check that the system recovers well
  - Check that the sequence values are increased monotonically
- `~test.isequencer.FlushPermanentlyFails~`
  - Recovery has worked but ISeqStorage.WriteValues() fails permanently so flusher() will be waiting
  
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

- `~it.SequencesTrustLevel0~`uncvrd[^13]❓
- `~it.SequencesTrustLevel1~`uncvrd[^14]❓
- `~it.SequencesTrustLevel2~`uncvrd[^15]❓

## Addressed issues

- [#3215: Sequences](https://github.com/voedger/voedger/issues/3215) - Initial requirements and discussion

## References

Design process:

- [Voedger Sequence Management Design (Claude 3.7 Sonnet, March 1, 2025)](https://claude.ai/chat/f1a8492a-8e8a-4229-ac79-ecc3655732d3)

History:

- [Initial design](https://github.com/voedger/voedger-internals/blob/2475814f7caa1d2d400a62a788ceda9b16d8de2a/server/design/sequences.md)

## Footnotes

[^1]: `[~server.design.sequences/tuc.VVMConfig.ConfigureTrustedSequences~impl]`
[^2]: `[~server.design.sequences/tuc.PLogSequencesTrustLevel~impl]`
[^3]: `[~server.design.sequences/tuc.TableSequencesTrustLevel~impl]`
[^4]: `[~server.design.sequences/tuc.StartSequencesGeneration~impl]`
[^5]: `[~server.design.sequences/tuc.GetNextSequenceNumber~impl]`
[^6]: `[~server.design.sequences/tuc.FlushSequenceNumbers~impl]`
[^7]: `[~server.design.sequences/tuc.ReactualizeSequences~impl]`
[^8]: `[~server.design.sequences/tuc.InstantiateSequencer~impl]`
[^9]: `[~server.design.sequences/cmp.IAppPartition.Sequencer~impl]`
[^10]: `[~server.design.sequences/test.isequencer.mockISeqStorage~impl]`
[^11]: `[~server.design.sequences/test.isequencer.LongRecovery~impl]`
[^12]: `[~server.design.sequences/test.isequencer.MultipleActualizes~impl]`
[^13]: `[~server.design.sequences/it.SequencesTrustLevel0~impl]`
[^14]: `[~server.design.sequences/it.SequencesTrustLevel1~impl]`
[^15]: `[~server.design.sequences/it.SequencesTrustLevel2~impl]`
