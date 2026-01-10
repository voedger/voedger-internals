
# VVM Architecture

## Processors

```mermaid
    erDiagram

    %% Entities

    %% Relations

    VVM ||--|{ Processor : "has"

    Processor ||--|| CommandProcessor : "can be"
    Processor ||--|| QueryProcessor : "can be"
    Processor ||--|| Actualizer : "can be"

    CommandProcessor ||..|| "Invoke(extName, extIO)": "executes Extension using"
    QueryProcessor ||..|| "Invoke(extName, extIO)": "executes Extension using"
    Actualizer ||..|| "Invoke(extName, extIO)": "executes Extension using"

    "Invoke(extName, extIO)" ||..|| IAppPartition: "method of"


    IAppPartition ||..|| IAppPartitions: "borrowed from"
```

## IAppPartition

```go
type IAppPartitions interface {
    ...
    Borrow(qpp AppQName, part PartitionID, procKind ProcessorKind) (IAppPartition, error)
    ...
}
```

```mermaid
    erDiagram

    IAppPartitions ||--|{ appRT : "has"

    appRT ||--|{ appPartitionRT : "has"

    appRT ||--|| latestVersion : "has"
    appPartitionRT ||--|| partitionCache : "has as appRT.parts map"

    latestVersion ||--|| AppDef : "has"
    latestVersion  ||--|{ commandsExEnginePool : "has one per EngineKind"
    latestVersion  ||--|{ queryExEnginePool : "has one per EngineKind"
    latestVersion  ||--|{ projectionExEnginePool : "has one per EngineKind"


    AppDef ||--|{ appdef_IPackage : "has"
    appdef_IPackage ||..|{ appdef_IEngine: "extensions instantiated by"

    appdef_IEngine ||..|| "IAppPartitions_Borrow()": "copied by ref by"

    commandsExEnginePool ||..|{ "appdef_IEngine": "provides pool of"
    queryExEnginePool ||..|{ "appdef_IEngine": "provides pool of"
    projectionExEnginePool ||..|{ "appdef_IEngine": "provides pool of"
    partitionCache ||..|| "IAppPartitions_Borrow()": "copied by ref by"

    "IAppPartitions_Borrow()" ||..|| "IAppPartition": "returns"

    IAppPartition ||--|{ "Invoke()" : "may invoke extensions with method"
```

## Partition Actualizers and Schedulers Orchestration Diagram

```mermaid
erDiagram
    apps ||--|| IAppPartiton : implements
    apps ||--|| DeployAppPartitions: "has method"
    DeployAppPartitions ||--|| appPartitionRT : "creates via newAppPartitionRT()"
    appPartitionRT ||--|| PartitionActualizers : "creates via actualizers.New()"
    appPartitionRT ||--|| PartitionSchedulers : "creates via schedulers.New()"

    PartitionActualizers ||--|| Deploy_Act: "has method"
    PartitionSchedulers ||--|| Deploy_Sch: "has method"

    apps ||--|| Deploy_Act : "calls providing IActualizerRunner.NewAndRun"
    apps ||--|| Deploy_Sch : "calls providing ISchedulerRunner.NewAndRun"

    PartitionSchedulers ||--o{ runtime_scheduler : has
    PartitionActualizers ||--o{ runtime_actualizer : has

    Deploy_Act ||--|| asyncActualizer : "creates via provided NewAndRun()"
    asyncActualizer ||--|| runtime_actualizer:"uses ctx from"
    Deploy_Act ||--o{ runtime_actualizer: "cancels ctx"
    Deploy_Act ||--o{ runtime_actualizer: "creates new ctx"
    Deploy_Sch ||--|| scheduler : "creates via provided NewAndRun()"
    scheduler ||--||runtime_scheduler:"uses ctx from"
    Deploy_Sch ||--o{ runtime_scheduler: "cancels ctx"
    Deploy_Sch ||--o{ runtime_scheduler: "creates new ctx"
```
