# Jobs

- [github: Jobs](https://github.com/voedger/voedger/issues/1777)

## Motivation

SCADA, Supervisory Control and Data Acquisition

## Principles

- Job is triggered by time events
- Time events are not kept in logs (PLog, WLog)
- Job state scope is almost the same as the Projector scope
  - +JobContext
  - -Event  

## Functional design

VSQL:
```sql
ALTER WORKSPACE sys.AppWorkspaceWS (
	VIEW test(
		i int32,
		PRIMARY KEY(i)
	) AS RESULT OF ScheduledProjector;

	EXTENSION ENGINE BUILTIN (
		-- `CRON` token is not needed
		JOB Job1 '1 0 * * *';
	);
);
```
- Only sys.AppWorkspaceWS is allowed for now

Projector context:
- Event is generated for every application partition
- Application workspace is used as an event workspace
  -  BaseWSID = FirstBaseAppWSID + PartitionNum % DefaultAppWSAmount

## Tech design
- processors/schedulers/newSchedulers, similar to [newActualizers](https://github.com/voedger/voedger/blob/5cc5b443b1ba4969a521822dcf6f0474de80f767/pkg/projectors/actualizers.go#L30)
- appparts
```go
func New2(
	vvmCtx context.Context,
	structs istructs.IAppStructsProvider,
	syncAct SyncActualizerFactory,
	asyncActualizersRunner IProcessorRunner,
	jobSchedulerRunner IProcessorRunner, // <--------------- 
	eef iextengine.ExtensionEngineFactories,
) (ap IAppPartitions, cleanup func(), err error) {
	return newAppPartitions(vvmCtx, structs, syncAct, asyncActualizersRunner, jobSchedulerRunner, eef)
}
```



## Context

- https://www.ibm.com/docs/en/db2oc?topic=task-unix-cron-format
- https://github.com/robfig/cron/blob/master/parser.go
