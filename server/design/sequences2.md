---
reqmd.package: server.design.sequences
---

# Sequences

This document outlines the design for sequence number management within the Voedger platform.

## Overview

A sequence is defined as a monotonically increasing series of numbers.

The following sequence types are to be implemented in the beginning:

- PLog Offset Sequence
- WLog Offset Sequence
- CRecord ID Sequence
- OWRecord ID Sequence

## Motivation

The current implementation has the following drawbacks:

- Sequence data for all workspaces is loaded into memory, leading to potentially high memory consumption.
- Sequence data is loaded during the "recovery process" at command processor startup.
- The "recovery process" can be time-consuming, as it involves reading and processing the entire PLog to determine the last used sequence numbers.

The following issues must be addressed:

- Uncontrolled memory usage that scales with the number of workspaces.
- Long recovery times that scale with the number of events in the PLog.

## Solution overview

- Each application partition will maintain sequence data in a projection (`SeqData`).
- `SeqData` will include a `SeqDataOffset` attribute, indicating the PLog partition offset for which the `SeqData` is valid.
- `SeqData` will be accessed through an MRU cache and updated in the background as new events are written to the PLog.

## Related Issues

This document addresses the following issues:

- [Sequences #3215](https://github.com/voedger/voedger/issues/3215)

## Use Cases

### Structs

- IDBatch
  - PLogOffset
  - `map[{WSID, QName}, istructs.RecordID]`

### NextPLogOffset(PartitionID, duration) Offset

- Actor: CP
- When: CP needs to process a request
- Flow:
  - `Status[PartitionID] == Clean && !IsRecoveryRunning(PartitionID)`):
    - Set `Status[PartitionID]` to `InProcess`
    - Return NextPLogOffset
  - `IsRecoveryRunning(PartitionID)`:
    - Wait for duration
    - If wait fails, return 0
    - Repeat Flow
  - `Status[PartitionID] == InProcess`: panic

### NextInSequence(PartitionID, WSID, QName) ID

- Actor: CP
- When: CP needs the next number in a sequence.
- Flow:
  - `Status[PartitionID] == InProcess`:
    - Generate the next ID. Read IDView (using reader) through (LRU cache + flushing queue).
  - panic

### Flush(PartitionID) IDBatch

- Actor: CP
- When: After CP saves the PLog record successfully
- Flow
  - Fails if there are too many records to flush
  - `Status[PartitionID] == InProcess`:
    - Include all generated IDs into IDBatch and send it to the flusher routine for FlushBatch
    - `Status[PartitionID] = Clean`
  - panic

### Invalidate(PartitionID)

- Actor: CP
- When
  - After CP fails to save the PLog record
  - After Flush() fails
- Flow:
  - `Status[PartitionID] == Dirty`:
    - ???
    - ???
  - panic
  - Flow: `startRecovery(PartitionID)`

### startRecovery(PartitionID)

- When: Partition is deployed or invalidated
- Only one routine per PartitionID is allowed
- Read recovery PLog position (recoveryOffset)
- Run projector starting from recoveryOffset
- Start rproutine

### Flusher routine

- Actor: flusher routine
- Flow:
  - Save IDBatch to IDView
  - Remove items from flushing queue

### recovery(PartitionID)

Flow:

- Should read last saved NextPLogOffset, read all events starting from this offset and update IDView

## Architecture

- pkg/isequencer
  - ISequencer
  - New(PartitionID???, reader ReadIDView, writer func(batch IDBatch), recoverer(offset, flusher func(ctx, b *IDBatch))) ISenquencer
    - Instantiated by appparts.AppPartitions when new partition is deployed
    - writer is used by flusher
    - Immediately starts recovery in a separate routine
      - flusher()
  - sequencer: implementation of ISequencer
- appparts.AppPartitions
  - IAppPartition.Sequencer(PartitionID) ISequencer
- QNames
  - appdef/sys
