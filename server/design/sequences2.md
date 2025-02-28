---
reqmd.package: server.design.sequences
---
# Sequences

This document describes sequence mechanisms in the Voedger platform.

## Overview

Sequence is a monotonic increasing list of numbers.

We need to implement the following sequences:

- PLogOffsetSequence
- WLogOffsetSequence
- CRecordIDSequence
- OWRecordDSequence

## Motivation

- Currently data for all sequences is loaded into memory for all workspaces
- Sequences data is loaded during the so called "recovery process" when the command processor is started
- "Recovery process" is a time consuming operation since the whole PLog is read and processed to identify the last used sequence numbers

The following flaws shall be addressed:

- Uncontrollable memory usage (proportional to the number of workspaces)
- Long recovery time (proportional to the number of events in the PLog)

## Solution overview

- For each application partition keeps sequences data in the projection (`SeqData`)
- `SeqData` has `SeqDataOffset` attribute that specifies the offset in the PLog partion for which SeqData is actual
- This `SeqData` is read though the MRU cache and actualized in the background when new events are saved to the PLog

## Issues

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
