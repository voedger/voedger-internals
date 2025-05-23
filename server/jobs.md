# Jobs

- [github: Jobs](https://github.com/voedger/voedger/issues/1777)

## Motivation

- Import data periodically (SCADA, Supervisory Control and Data Acquisition)
- Export data periodically (e.g. to pass French certification for Air)

## Principles

- Job is triggered by time events.
- Jobs are controlled by Schedulers.
- Jobs are executed per ApplicationWorkspaces.
- Time events are not kept in logs (PLog, WLog).
- Job support the following intents:
	- Views
	- SendMail
- Job state scope is almost the same as the Projector scope.
  - +JobContext
  - -Event  

## Functional design

VSQL:
```sql
ALTER WORKSPACE sys.AppWorkspaceWS (
    VIEW JobStateView(
        Fixed int,
        Data bytes,
        PRIMARY KEY ((Fixed))
    ) AS RESULT OF TestJob1;

	EXTENSION ENGINE BUILTIN (
		-- `CRON` token is not needed
		JOB Job1 '1 0 * * *' INTENTS(View(JobStateView));
	);
);
```

```
 ┌───────────── minute (0 - 59)
 │ ┌───────────── hour (0 - 23)
 │ │  ┌───────────── day of the month (1 - 31)
 │ │  │  ┌───────────── month (1 - 12)
 │ │  │  │  ┌───────────── day of the week (0 - 6) (Sunday to Saturday, 0 is Sunday)
 │ │  │  │  │
 1 0  *  *  *
```

- Only sys.AppWorkspaceWS is allowed for now

## Tech design
- pkg/processors/schedulers/ProvideSchedulers(), similar to [ProvideActualizers](https://github.com/voedger/voedger/blob/5cc5b443b1ba4969a521822dcf6f0474de80f767/pkg/projectors/provide.go#L21)
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
