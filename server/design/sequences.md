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
- When: CP needs to process an request
- Flow:
    - `Status[PartitionID] == Clean && !IsRecoveryRunning(PartitionID)`):
        - Set `Status[PartitionID]` to `Dirty`
        - Return NextPLogOffset
    - `IsRecoveryRunning(PartitionID)`: 
        - Wait for duration
        - If wait fails return 0. 
        - Repeat Flow.
    - `Status[PartitionID] == Dirty`: panic

### NextInSequence(PartitionID, WSID, QName) ID

- Actor: CP
- When: CP needs the next number in a sequence.
- Flow:
    - `Status[PartitionID] == Dirty`: 
        - Generate the next ID
    - panic

### Flush(PartitionID) IDBatch

- Actor: CP
- When: After CP saves the PLog record successfully
- Flow
    - `Status[PartitionID] == Dirty`:
        - Include all generated IDs into IDBatch and send it to the flusher routine for FlushBatch
        - `Status[PartitionID] = Clean`
    - panic

### Invalidate(PartitionID) IDBatch

- Actor: CP
- When: After CP fails to save the PLog record
- Flow
    - `Status[PartitionID] == Dirty`:
        - Include all generated IDs into IDBatch and send it to the flusher routine for InvalidateBatch
        - `Status[PartitionID] = Clean`
    - panic
  - Flow: startRecovery(PartitionID)`

- `startRecovery(PartitionID)`
  - When: Partition is deployed or invalidated
  - Only one routine per PartitionID
  - Read recovery plog position (recoveryOffset)
  - Run ???projector starting from recoveryOffset
  - Start rproutine
