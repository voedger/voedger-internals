# VSQL: SELECT, UPDATE

* [github: vSQL: SELECT, UPDATE](https://github.com/voedger/voedger/issues/1811)

## Motivation

- login failed on Live Cluster again, it is necessary to fix things "manually".

## Functional design

### Definitions

- `<WSID> = NUMBER  | 'a'NUMBER | '"'string_to_hash'"'`
  - `SELECT FROM owner.app.123.mypkg.MyView WHERE ...` // Select from the workspace with WSID == 123
  - `SELECT FROM owner.app.a1.mypkg.MyView WHERE ...` // Select from the second app workspace
  - `SELECT FROM owner.app."mylogin".mypkg.MyView WHERE ...` // Select from the app workspace using hash("mylogin")

### c.cluster.VSqlUpdate

- Handles `UPDATE`, `INSERT`, `UNLOGGED INSERT`, `UNLOGGED UPDATE`, `UPDATE CORRUPTED`
- Returns `NewID` field on insert table
- `UNLOGGED INSERT owner.app.{WSID}.mypkg.{view} SET col1=val1, col2=val2, col3=val3, col4=val4`
  - Allowed for view only because it is impossible to generate recordID to insert a record
  - Event in target WS is NOT created
  - Projectors are not triggered
  - The record exists already with the same key -> error
- `UNLOGGED UPDATE owner.app.{WSID}.mypkg.{viewOrdDoc} SET col1=val1 col2=val2 WHERE col3=val2 AND col4=col4`
  - Event in target WS is NOT created
  - Projectors are not triggered
  - The record does not exist by the provided criteria or exists >1 record (not complete key is provided) -> error
- For tables only
  - `UPDATE owner.app.6789.mypkg.MyTable.<ID> SET col1=val1 col2=val2`
  - `INSERT owner.app.6789.mypkg.MyTable SET col1=val1 col2=val2`
  - Invoke CUD in the target workspace (yes, "command from command" exceptional case)
  - Projectors are triggered
  - `where` clause is not allowed
- `UPDATE CORRUPTED`: Mark PLog/WLog event corrupted
  - `UPDATE CORRUPTED owner.app.<partitionID>.sys.PLog.12344`
  - `UPDATE CORRUPTED owner.app.<WSID>.sys.WLog.12344`

### q.sys.SqlQuery

- `q.sys.SqlQuery`
  - `SELECT FROM owner.app.<partitionID>.PLog WHERE Offset=123 ...`
  - `SELECT FROM PLog WHERE Offset=123 ...` // Current workspace PLog
  - `SELECT FROM owner.app.<WSID>.mypkg.MyView WHERE ...` // Arbitrary workspace
  - `SELECT FROM mypkg.MyView WHERE ...` // Current workspace
  - catch panic
    - data["!!!Panic"]
- See [test](https://github.com/voedger/voedger/blob/1ccf301409746083bd3bf6ddd24512d7c2ec0721/pkg/sys/it/impl_sqlquery_test.go#L502)

## Technical design

- istructs.IRecords.PutJSon()
- istructs.IViewRecords.PutJSon()
- the engine extracts `owner.app.6789` from the sql query: `SELECT FROM owner.app.6789.mypkg.MyView WHERE ..` and replaces it to  `SELECT FROM mypkg.MyView WHERE..`
- `UPDATE CORRUPTED owner.app.<WSID>.sys.WLog.12344`
  - `IDbEvent.Bytes() []byte`
  - Event
    - QName: ~consts.QNameForError~ consts.QNameForCorruptedData `(SysPackage, "Corrupted")`
    - IEvents.GetSyncRawEventBuilder()
    - GenericRawEventBuilderParams.EventBytes = invalid event bytes
    - GenericRawEventBuilderParams.QName = consts.QNameForCorruptedData
- Skip consts.QNameForCorruptedData in actualizers

## Addressed issues

- https://github.com/voedger/voedger/issues/1811
