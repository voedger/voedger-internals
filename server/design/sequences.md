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

## Functional design

### TrustedSequences mode

- If TrustedSequences then Put is used for new key/values pairs. Otherwise InsertIfNotExists is used to ensure that the sequence number is unique to avoid potential bugs.
  - Performance impact: InsertIfNotExists is a few times slower than Put.
- By default TrustedSequences is false

### TrustedSequences mode: Use cases

Actors:

- CP

`~VVMConfig.TrustedSequences~`

- VVMConfig.TrustedSequences

`~SavePLogInUntrustedMode~`

- ???

`~SaveWLogInUntrustedMode~`

- ???

`~SaveRecordInUntrustedMode~`

- ???

### Command processing

Actors

- Command Processor (CP)

### Command processing: Use cases

`~StartSequencesGeneration~`

- When: CP starts processing a request
- Flow:
  - `partitionID` is calculated using request WSID and amount of partitions declared in AppDeploymentDescriptor [here](https://github.com/voedger/voedger/blob/9d400d394607ef24012dead0d59d5b02e2766f7d/pkg/vvm/impl_requesthandler.go#L61)
  - sequencer, err := IAppPartition.Sequencer(PartitionID) err
  - nextPLogOffest, ok, err := sequencer.Start(wsKind, WSID)
    - if !ok
      - Actualization is in progress
      - Flushing queue is full
      - Returns 503: "server is busy"

`~GetNextSequenceNumber~`

- current ID generation flow
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

- Flow
  - sequencer.Next(sequenceId)

`~FlushSequenceNumbers~`

- When: After CP saves the PLog record successfully
  - sequencer.Flush()

`~ReactualizeSequences~`

- When: After CP fails to save the PLog record
- Flow
  - sequencer.Actualize()

### Application deployment

Actors

- IApplicationPartitions (AP)

#### Application deployment: Use cases

`~DeployPartition.InstantiateSequencer~`

- When: Partition with the `partitionID` is deployed
- Flow:
  - Instantiate the implementation of the `isequencer.ISeqStorage`: `seqStorage isequencer.ISeqStorage`
  - Instantiate `sequencer := isequencer.New(partitionID, seqStorage)`
  - Save `sequencer` to some `map[partitionID]isequencer.Sequencer`

### pkg/isequencer

#### interface.go

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

type SeqID uint16
type WSKind uint16
type WSID uint16
type Number uint64
type PLogOffset uint64

type NumberKey struct {
	WSID  WSID
	SeqID SeqID
}

type SeqValue struct {
	Key    NumberKey
	Value  Number
}

type ISeqStorage interface {

  // If number is not found, returns 0
	ReadNumbers(WSID, []SeqID) ([]Numbers, error)

	// IDs in batch.Values are unique
	// Values must be written first, then Offset
	WriteValues(batch []SeqValue) error

	WritePLogOffset(offset PLogOffset) error

	// Last offset successfully written by WriteValues
	ReadLastWrittenPLogOffset() (PLogOffset, error)

	// Scan PLog from the given offset and send values to the batcher.
	// Values are sent per event, unordered, IDs are not unique.
	// Batcher is responsible for batching, ordering, and ensuring uniqueness, and uses ISeqStorage.WriteValues.
	// Batcher can block the execution for some time, but it terminates if the ctx is done.
		ActualizePLog(ctx context.Context, offset PLogOffset, batcher func(batch []SeqValue, offset PLogOffset) error) error
}

// ISequencer methods must not be called concurrently.
// Use: { Start {Next} ( Flush | Actualize ) }
type ISequencer interface {

	// Starts event processing for the given WSID.
	// Normal flow: increments the current PLogOffset value and returns this value with `true`.
	// Panics if event processing is already started.
	// Returns `false` if:
	// - Actualization is in progress
	// - The number of unflushed values exceeds the maximum threshold
	// If ok is true, the caller must call Flush() or Actualize() to complete the event processing.
	Start(wsKind WSKind, wsID WSID) (plogOffset PLogOffset, ok bool)

	// Returns the next sequence number for the given SeqID.
	// If seqID is unknown, panics.
	// err: ErrUnknownSeqID
	Next(seqID SeqID) (num Number, err error)

	// Finishes event processing.
  // Panics if event processing is not in progress.
	// Sends the current batch to the flushing queue and completes the event processing.
	Flush()

	// Finishes event processing.
  // Panics if actualization is already in progress.
	// Panics if event processing is not in progress.
	// Completes event processing.
	// If flusher() is running, stops and waits for it.
	// Starts actualizer().
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

#### Implementation requirements

```go
// filepath: pkg/isequencer: impl.go

import (
	"context"
	"time"

	"github.com/hashicorp/golang-lru/v2"
)

type sequencer struct {
  params *Params

  cleanupCtx context.Context
  flusherCtx context.Context

  lru *lru.Cache

  // To be flushed
  toBeFlushed map[NumberKey]Number
  toBeFlushedOffset PLogOffset
  // Protects toBeFlushed and toBeFlushedOffset
  toBeFlushedMu sync.RWMutex

  // Written by Next()
  inproc map[NumberKey]Number
  inprocOffset PLogOffset

  // Initialized by Start()
  currentWSID   WSID
  currentWSKind WSKind
}

// Copies s.inproc to s.toBeFlushed and clears s.inproc.
func (s *sequencer) Flush() {
  // ...
}

// Flow:
// - Validate processing status
// - Get initialValue from s.params.SeqTypes and ensure that SeqID is known
// - Try to obtain next value using:
//   - Try s.lru (can be evicted)
//   - Try s.inproc
//   - Try s.toBeFlushed (use s.toBeFlushedMu to synchronize)
//   - Try s.params.SeqStorage.ReadNumber()
//      - Read all numbers for wsKind, wsID
//        - If number is 0 then initial value is used
//      - Write all numbers to s.lru
// - Write value+1 to s.lru
// - Write value+1 to s.inproc
func (s *sequencer) Next(seqID SeqID) (num Number, err error) {
  // ...
}

// Flow:
// - Build maxValues: max Number for each SeqValue.Key
// - Write maxValues using s.params.SeqStorage.WriteValues()
func (s *sequencer) batcher(values []SeqValue) (err error) {
  // ...
}

// Started in goroutine by Actualize()
// Uses s.params.SeqStorage.ActualizePLog() and s.batcher()
// If cleanupCtx is closed, stops the actualization process.
// Error handling: wait (500 ms) and loop
// When actualization is finished, starts flusher()
func (s *sequencer) actualize() {
  // ...
}

```

## Technical design

### Components

`~IAppPartition.Sequencer`~

- Returns `isequencer.Sequencer` for the given `partitionID`

## Test design

### isequencer

`~isequencer.test.mockISeqStorage~`

- Mock implementation of `isequencer.ISeqStorage` for testing purposes

### TrustedSequences mode: Tests

`~it.UntrustedSequences~`

- Test for Record
  - create a new VIT instance on an owned config with `VVMConfig.TrustedSequences = false`
  - insert a doc to get the last recordID: simply exec `c.sys.CUD` and get the ID of the new record
  - sabotage the storage: insert a key that would be used on creating the next record:
    - `VIT.IAppStorageProvider.AppStorage(test1/app1).Put()`
	  - manually build `pKey`, `cCols` for the record, use just inserted recordID+1
	  - value does not matter, let it be `[]byte{1}`
  - try to insert one more record using `c.sys.CUD`
  - expect panic
- Test for PLog, WLog offsets - the same tests but sabotage the storage building keys for the event

## References

### Addressed issues

- [Original Issue #3215: Sequences](https://github.com/voedger/voedger/issues/3215) - Initial requirements and discussion

### Design process

- [Voedger Sequence Management Design (Claude 3.7 Sonnet, March 1, 2025)](https://claude.ai/chat/f1a8492a-8e8a-4229-ac79-ecc3655732d3)

### History

- [Initial design](https://github.com/voedger/voedger-internals/blob/2475814f7caa1d2d400a62a788ceda9b16d8de2a/server/design/sequences.md)
