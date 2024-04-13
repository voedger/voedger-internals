## Motivation
As a Developer I want to have scheduled jobs (required by sigma)

## Functional Design

VSQL:
```sql
ALTER WORKSPACE sys.AppWorkspaceWS (
	VIEW test(
		i int32,
		PRIMARY KEY(i)
	) AS RESULT OF ScheduledProjector;

	EXTENSION ENGINE BUILTIN (
		PROJECTOR ScheduledProjector CRON '1 0 * * *' INTENTS (View(test));
	);
);
```
- Only sys.AppWorkspaceWS is allowed for now

Projector context:
- Event is generated for every application partition
- Application workspace is used as an event workspace
  -  BaseWSID = FirstBaseAppWSID + PartitionNum % DefaultAppWSAmount

## Tech Design
- parser analyser validates the cron schedule
- cron schedule is saved as string in the appdef
- ...

## Context
- https://www.ibm.com/docs/en/db2oc?topic=task-unix-cron-format
- https://github.com/robfig/cron/blob/master/parser.go
