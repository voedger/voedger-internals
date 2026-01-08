# Offset-Consistency in App Storage

## Principles

* App-Storage supports cache-related operatinos: put, removing from cache and get, to support the 2-phase writes
* Responsibilities:
  * View actualizer: saving to cache and storage; reporting cache and storage offset consistency;
  * Records actualizer: saving to storage; reporting storage offset consistency;
  * Command Processor:
    * reporting offset of the last processed event;
    * saving to cache and reporting cache consistency of records;
  * ViewRecords, Records: offset-consistent reading

## Requirements

* 2-phase write: caching and flushing must be supported due to actualizers nature

## Terms

* **Offset-consistency read** - read operations that returns the data which is guaranteed to be consistent with the pecified offset.

## Scenarios

### Write Views

2-phase write is performed by the actualizer when it handles intents:

1. `IBundledHostState.ApplyIntents` -> commit key-values to App-Storage cache and update cache-consistency offset of the view
2. `IBundledHostState.FlushBundles` -> flush key-values from cache to App-Storage and remove from cache, update App-Storage consistency offset

### Offset-consistency read

1. Storage state can see if offset-consistent read is requested. For fully-specified key it reads from App Storage with offset-consistency.

## Technical design

### Components

TODO

### IAppStorage interface

 ```go
 type IAppStorage interface {
    ...
    PutCache(pKey []byte, cCols []byte, value []byte) (err error)
    RemoveFromCache(pKey []byte, cCols []byte) (err error)
    GetFromCache(pKey []byte, cCols []byte, data *[]byte) (ok bool, err error)
 }
 ```

 ### IRecords interface

```go
	// Apply all CUDs, ODocs and WDocs from the given IPLogEvent to the AppStorage cache.
   // Updates the cache offset consistency of the affected records.
	// @ConcurrentAccess RW
	// Panics if event is not valid
    ApplyToCache(event IPLogEvent) (err error)

	// Apply all CUDs, ODocs and WDocs from the given IPLogEvent to the AppStorage.
	// Removes item from the cache.
   // Updates the storage offset consistency of the affected records.
	// @ConcurrentAccess RW
	// Panics if event is not valid
	Apply(event IPLogEvent) (err error)   
   
   // highConsistency: if true, the read is performed with the offset consistency of the last processed event
   // First gets from cache, then from storage
	Get(workspace WSID, highConsistency bool, id RecordID) (record IRecord, err error)   

```

### IViewRecords

#### IViewRecords Principles

- Since we do not handle sync views, every view MUST contain a non-null "Offs" field in the value, to support idempotent writes.
- The "Offs" field is used to:
  - detect if the event was already applied to the view -- should we control it on the engine level?
  - report the view consistency offset to the consistency coordinator

#### IViewRecords interface

```go

   // puts to cacne
   PutToCache(workspace WSID, key IKeyBuilder, value IValueBuilder) (err error)

   // puts to cacne
	PutBatchToCache(workspace WSID, batch []ViewKV) (err error)

   // puts to storage, removes from cache
   Put(workspace WSID, key IKeyBuilder, value IValueBuilder) (err error)

   // puts to storage, removes from cache
	PutBatch(workspace WSID, batch []ViewKV) (err error)

   // TODO: offset-consistency GET operations

```
