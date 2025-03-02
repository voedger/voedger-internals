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

The proposed redesign tackles these issues through intelligent caching, background updates, and optimized storage mechanisms that maintain sequence integrity while dramatically improving resource utilization and responsiveness.

## Solution overview

The proposed approach implements a more efficient and scalable sequence management system through the following key components:

- **Projection-Based Storage**: Each application partition will maintain sequence data in a dedicated projection (`SeqData`), eliminating the need to load all sequence data into memory at once.
- **Offset Tracking**: `SeqData` will include a `SeqDataOffset` attribute that indicates the PLog partition offset for which the stored sequence data is valid, enabling precise recovery and synchronization.
- **MRU Cache Implementation**: Sequence data will be accessed through a Most Recently Used (MRU) cache that prioritizes frequently accessed sequences while allowing less active ones to be evicted from memory.
- **Background Updates**: As new events are written to the PLog, sequence data will be updated in the background, ensuring that the system maintains current sequence values without blocking operations.
- **Batched Writes**: Sequence updates will be collected and written in batches to reduce I/O operations and improve throughput.
- **Optimized Actualization**: The actualization process will use the stored `SeqDataOffset` to only process events since the last known valid state, dramatically reducing startup times.

This approach decouples memory usage from the total number of workspaces and transforms the recovery process from a linear operation dependent on total event count to one that only needs to process recent events since the last checkpoint.

## Functional design

### Command processing

Actors

- Command Processor (CP)

### Command processing: Use cases

`~StartSequencesGeneration~`

- When: CP starts processing a request
- Flow:
  - partitionID := ???
  - sequencer, err := IAppPartition.Sequencer(PartitionID) err
  - nextPLogOffest, ok, err := sequencer.Start(WSID)
    - if !ok
      - Actualization is in progress
      - Flushing queue is full
      - Returns 503: "server is busy"

`~GetNextSequenceNumber~`

- ??? When it happens now?
-Flow
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
  - Instantiate the implementation of the isequencer.ISeqStorage: `seqStorage isequencer.ISeqStorage`
  - Instantiate `sequencer := isequencer.New(partitionID, seqStorage)`
  - Save `sequencer` to some `map[partitionID]isequencer.Sequencer`

### pkg/isequences

```go

type SeqID = istructs.QNameID
type Number = istructs.IDType
type Offset = istructs.Offset

type SeqValue struct {
  ID    SeqID
  Value Number
}

type SeqBatch struct {
  Values []SeqValue // Normally unordered, IDs are not unique.
  Offset Offset
}

type ISeqStorage interface {
  ReadNumber(SeqID) (SeqNumber, error)

  // ID in batch.Values are unique
  // Values must be written first, then Offset
  WriteValues(batch SeqBatch) error
  
  // Last offset successfully written by WriteValues
  ReadLastOffset() (Offset, error)

  // Scan PLog from the given offset and send values to the batcher.
  // Values are sent per event, unordered, IDs are not unique.
  // Batcher is responsible for batching, ordering and uniqueness and uses ISeqStorage.WriteValues.
  // Batcher can block the execution for some time but it terminates if the ctx is done.
  // If ctx is done, the function must return immediately.
  ActualizePLog(ctx, offset Offset, batcher func(ctx, batch SeqBatch) error) error
}

type ISequencer interface {

  // Starts new sequences generation for the given WSID.
  // Normal flow: increase the current value of the PLogOffset, return it and `true`.
  // If generation is already in progress, returns `false`.
  // If actualization is in progress, returns `false`.
  // If the flushing queue is full, returns `false`.
  Start(WSID) (plogOffset Offset, ok bool, err error)

  // Returns the next sequence number for the given SeqID.
  // If seqID is unknown, panics.
  Next(seqID SeqID) (Number)

  // Sends the current batch to the flushing queue and closes generation.
  Flush()

  // Closes generation and starts actualization process.
  Actualize()
}
```

## Technical design

`~IAppPartition.Sequencer`~

- Returns `isequencer.Sequencer` for the given `partitionID`

`~ISequencer.Start.impl~`

- Signature: ISequencer.Start(WSID) (nextPLogOffest Offset, ok bool, err error)
- Flow:
  - If actualization is in progress, return `false`
  - If flushing queue is full, return `false`
  - If sequencer.WSID !=0
  - Increase the current value of the PLogOffset, return it and `true`

`~ISequencer.Next~`

`~ISequencer.Next~`

- If actualization is in progress, returns `false`

## References

### Addressed issues

- [Original Issue #3215: Sequences](https://github.com/voedger/voedger/issues/3215) - Initial requirements and discussion

### Design process

- [Voedger Sequence Management Design (Claude 3.7 Sonnet, March 1, 2025)](https://claude.ai/chat/f1a8492a-8e8a-4229-ac79-ecc3655732d3)
