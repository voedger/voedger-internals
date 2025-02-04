# Sequences

Sequence is a monotonic increasing list of numbers.
- PLogOffsetSequence
- WLogOffsetSequence
- CDocIDSequence

## Motivation

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
        - Generate the next ID
    - panic

### Flush(PartitionID) IDBatch

- Actor: CP
- When: After CP saves the PLog record successfully
- Flow
    - `Status[PartitionID] == InProcess`:
        - Include all generated IDs into IDBatch and send it to the flusher routine for FlushBatch
        - `Status[PartitionID] = Clean`
    - panic

### Invalidate(PartitionID) IDBatch

- Actor: CP
- When: After CP fails to save the PLog record
- Flow:
    - `Status[PartitionID] == Dirty`:
        - ???
        - ???
    - panic
    - Flow: `startRecovery(PartitionID)`

### startRecovery(PartitionID)

???
- When: Partition is deployed or invalidated
- Only one routine per PartitionID is allowed
- Read recovery PLog position (recoveryOffset)
- Run projector starting from recoveryOffset
- Start rproutine

### recovery(PartitionID)

Flow:
  - ??? Should repeat

## Components

- pkg/isequencer
    - ISequencer
- pkg/isequencer/sequencer
    - provide: Factory(PartitionID) cleanup()
        - Start recovery
        - cleanup should stop flush/recovery and wait
- appparts.AppPartitions
    - IAppPqrtition.Sequencer() ISequencer
    - On deploy starts recovery
- QNames
    - appdef/sys

