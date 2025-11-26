# Consistency Coordinator

## Overview

**Consistency Coordinator** is a component that coordinates consistency checks for [sync views](../views/sync-views.md) and records across different processors within the app partition.

## Technical design

### Principles

```mermaid
flowchart TD

AppPartition[App Partition]:::H
cp[Command Processor]:::S
actualizer[Actualizer]:::S
anyProcessor[Any Processor]:::G
syncviewActualizer[Actualizer for SYNC VIEWs]:::S
recordsActualizer[Records Actualizer]:::S
coordinator[ConsistencyCoordinator]:::S
   
AppPartition --> |has one| cp
AppPartition --> |has many| actualizer
AppPartition --> |has one| coordinator
actualizer --> |many of them may be| syncviewActualizer
actualizer --> |one of them is| recordsActualizer

cp -.-> |reports offset and <br>record cache consistency|coordinator
syncviewActualizer -.-> |reports view cache  & storage consistency|coordinator
recordsActualizer -.-> |reports records <br>storage consistency|coordinator

coordinator -.-> |used to check <br>view/record consistency by| anyProcessor


classDef B fill:#FFFFB5,color:#333
classDef S fill:#B5FFFF,color:#333
classDef H fill:#C9E7B7,color:#333
classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

#### Interface

`~cmp.IConsistencyCoordinator~`: interface

```go
type IConsistencyCoordinator interface {

  // CommitCacheConsistency commits view or record cache consistency
  CommitCacheConsistency(entity appdef.QName, offs appdef.Offset)

  // CommitStorageConsistency commits view or record storage consistency
  CommitStorageConsistency(entity appdef.QName, offs appdef.Offset)

  // EntityConsistency returns the cache and storage consistency for the given entity (view or record)
  EntityConsistency(entity appdef.QName) (cache appdef.Offset, storage appdef.Offset)

  // CommitCpOffset is called by the Processor to commit the offset of the last processed event
  CommitCpOffset(offs appdef.Offset)

  // GetCpOffset returns the last committed offset of the Command Processor
  CpOffset() appdef.Offset
}
```

#### Implementation

`~cmp.ConsistencyCoordinator~`: implementation

## See also

- [Sync Views](../views/sync-views.md)
