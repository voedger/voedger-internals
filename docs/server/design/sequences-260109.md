# Actual Sequences design as of 26-01-09

## Architecture Overview

The system uses **in-memory per-workspace state** with **PLog-based recovery**. There are three main components:

1. **appPartition** - One per partition, tracks PLog offset
2. **workspace** - One per WSID, tracks WLog offset and ID generator
3. **IIDGenerator** - Simple incrementing ID generator per workspace

## Data Structures

````go path=pkg/processors/command/provide.go mode=EXCERPT
type appPartition struct {
	workspaces     map[istructs.WSID]*workspace
	nextPLogOffset istructs.Offset
}

type workspace struct {
	NextWLogOffset istructs.Offset
	idGenerator    istructs.IIDGenerator
}
````

## ID Generator Implementation

````go path=pkg/istructsmem/idgenerator.go mode=EXCERPT
type implIIDGenerator struct {
	nextRecordID istructs.RecordID
	onNewID      func(rawID, storageID istructs.RecordID) error
}

func (g *implIIDGenerator) NextID(rawID istructs.RecordID) (storageID istructs.RecordID, err error) {
	storageID = g.nextRecordID
	g.nextRecordID++
	// ...
}
````

## Initialization Flow

**On first access to a workspace:**

````go path=pkg/processors/command/impl.go mode=EXCERPT
func (ap *appPartition) getWorkspace(wsid istructs.WSID) *workspace {
	ws, ok := ap.workspaces[wsid]
	if !ok {
		ws = &workspace{
			NextWLogOffset: istructs.FirstOffset,
			idGenerator:    istructsmem.NewIDGenerator(),
		}
		ap.workspaces[wsid] = ws
	}
	return ws
}
````

Initial values:

- `NextWLogOffset = istructs.FirstOffset` (which is 1)
- `nextRecordID = istructs.FirstUserRecordID` (which is 200001)

## Recovery Flow

**On partition restart, the entire PLog is scanned:**

````go path=pkg/processors/command/impl.go mode=EXCERPT
cb := func(plogOffset istructs.Offset, event istructs.IPLogEvent) (err error) {
	ws := ap.getWorkspace(event.Workspace())

	for rec := range event.CUDs {
		if rec.IsNew() {
			ws.idGenerator.UpdateOnSync(rec.ID())
		}
	}
	// ... handle ODoc IDs ...
	ws.NextWLogOffset = event.WLogOffset() + 1
	ap.nextPLogOffset = plogOffset + 1
	// ...
}

err := cmd.appStructs.Events().ReadPLog(ctx, cmd.cmdMes.PartitionID(), 
	istructs.FirstOffset, istructs.ReadToTheEnd, cb)
````

The `UpdateOnSync` method updates the generator's next ID:

````go path=pkg/istructsmem/idgenerator.go mode=EXCERPT
func (g *implIIDGenerator) UpdateOnSync(syncID istructs.RecordID) {
	if syncID >= g.nextRecordID {
		g.nextRecordID = syncID + 1
	}
	// ...
}
````

## Command Processing Flow

**1. Get workspace:**
````go path=pkg/processors/command/impl.go mode=EXCERPT
func (cmdProc *cmdProc) getWorkspace(_ context.Context, cmd *cmdWorkpiece) (err error) {
	cmd.workspace = cmd.appPartition.getWorkspace(cmd.cmdMes.WSID())
	return nil
}
````

**2. Build raw event with current offsets:**
````go path=pkg/processors/command/impl.go mode=EXCERPT
func (cmdProc *cmdProc) getRawEventBuilder(_ context.Context, cmd *cmdWorkpiece) (err error) {
	grebp := istructs.GenericRawEventBuilderParams{
		HandlingPartition: cmd.cmdMes.PartitionID(),
		Workspace:         cmd.cmdMes.WSID(),
		QName:             cmd.cmdQName,
		RegisteredAt:      istructs.UnixMilli(cmdProc.time.Now().UnixMilli()),
		PLogOffset:        cmd.appPartition.nextPLogOffset,
		WLogOffset:        cmd.workspace.NextWLogOffset,
	}
	// ...
}
````

**3. Generate IDs for new records:**
````go path=pkg/istructsmem/event-types.go mode=EXCERPT
func (cud *cudType) regenerateIDsPlan(generator istructs.IIDGenerator) (newIDs newIDsPlanType, err error) {
	plan := make(newIDsPlanType)
	for _, rec := range cud.creates {
		id := rec.ID()
		if !id.IsRaw() {
			generator.UpdateOnSync(id)
			continue
		}

		var storeID istructs.RecordID

		if singleton, ok := rec.typ.(appdef.ISingleton); ok && singleton.Singleton() {
			storeID, err = cud.appCfg.singletons.ID(rec.QName())
		} else {
			storeID, err = generator.NextID(id)  // <-- Simple increment
		}
		// ...
	}
	return plan, nil
}
````

**4. Write to PLog and increment offset:**
````go path=pkg/processors/command/impl.go mode=EXCERPT
func (cmdProc *cmdProc) putPLog(_ context.Context, cmd *cmdWorkpiece) (err error) {
	if cmd.pLogEvent, err = cmd.appStructs.Events().PutPlog(cmd.rawEvent, nil, cmd.idGeneratorReporter); err != nil {
		cmd.appPartitionRestartScheduled = true
	} else {
		cmd.appPartition.nextPLogOffset++
	}
	return
}
````

**5. Write to WLog and increment offset:**
````go path=pkg/processors/command/provide.go mode=EXCERPT
err = cmd.appStructs.Events().PutWlog(cmd.pLogEvent)
if err != nil {
	cmd.appPartitionRestartScheduled = true
} else {
	cmd.workspace.NextWLogOffset++
}
````

## Key Constants

````go path=pkg/istructs/consts.go mode=EXCERPT
const NullRecordID = RecordID(0)
const MinRawRecordID = RecordID(1)
const MaxRawRecordID = RecordID(0xffff)  // 65535

const MinReservedRecordID = MaxRawRecordID + 1  // 65536
const MaxReservedRecordID = RecordID(200000)

const FirstSingletonID = MinReservedRecordID  // 65536
const MaxSingletonID = FirstSingletonID + 0x1ff  // 66047

const FirstUserRecordID = MaxReservedRecordID + 1  // 200001
````

## Summary

**Current design characteristics:**

- **All workspace state is in memory** (map of workspaces per partition)
- **Simple increment** for ID generation (no complex sequencer logic)
- **Full PLog scan on recovery** to rebuild all workspace states
- **No persistent sequence storage** - everything derived from PLog
- **No batching or caching** - direct increment per request
- **Memory grows** with number of active workspaces per partition
- **Recovery time grows** with PLog size

This is fundamentally different from the sequencer design documented in `sequences.md`, which was intended to solve these scalability issues but has not been integrated.
