# Structured storage

## Overview

Structured storage is Voedger's abstraction layer for persisting and retrieving structured data. It provides a unified interface for storing records, views, and event logs (PLog/WLog) across different storage backends (Cassandra, ScyllaDB, BoltDB, in-memory, DynamoDB).

The storage model is inspired by Apache Cassandra's data model with partition keys and clustering columns, enabling efficient data distribution and range queries.

## Architecture

### Component hierarchy

```text
Application Layer
    |
    v
IAppStructs (pkg/istructs)
    |
    +-- IRecords (Records storage)
    +-- IViewRecords (View records storage)
    +-- IEvents (PLog/WLog storage)
    |
    v
IAppStorage (pkg/istorage)
    |
    +-- IAppStorageProvider (caching, lifecycle)
    +-- IAppStorageFactory (driver-specific)
    |
    v
Storage Backends
    +-- Cassandra/ScyllaDB (cas)
    +-- BoltDB (bbolt)
    +-- In-Memory (mem)
    +-- DynamoDB (amazondb)
```

## Data layout

All data in Voedger storage is organized using a two-level key structure:

1. **Partition key (pKey)** - Determines data distribution across nodes
2. **Clustering columns (cCols)** - Determines sorting within a partition

### Key characteristics

1. **All multi-byte integers use BigEndian encoding**
2. **Fields are written left-to-right** in the order defined
3. **Partition key fields must all be specified**
4. **Clustering columns can be partially specified** for range queries
5. **Variable-size fields (string, bytes) are written last** in clustering columns for efficient range queries
6. **System view IDs (16-22) occupy first 2 bytes** of partition key to distinguish data types
7. **QNames are stored as 2-byte QNameIDs**, not as strings
8. **RecordID and Offset are split** into Hi/Lo parts for efficient partitioning

This layout enables:

- Efficient partitioning across storage nodes (via partition key)
- Sorted storage within partitions (via clustering columns)
- Range queries (by partially specifying clustering columns)
- Type discrimination (via system view ID prefix)
- Compact storage (QNameID vs full QName strings)
- Fast lookups (integer comparisons vs string comparisons)

### System views

Voedger uses predefined system view IDs for internal data structures:

```text
ID    Name                Purpose
16    SysView_Versions    System view versions
17    SysView_QNames      Application QNames mapping
18    SysView_Containers  Application container names
19    SysView_Records     Application Records (CDoc, WDoc, etc.)
20    SysView_PLog        Partition Event Log
21    SysView_WLog        Workspace Event Log
22    SysView_SingletonIDs Application singletons IDs
```

### QName to QNameID mapping

**QName (Qualified Name)** is a two-part identifier: `<package>.<entity>`

- Examples: `"air.Restaurant"`, `"sys.CDoc"`, `"myapp.Order"`

QNames are **NOT stored as strings** in storage keys. Instead, they are mapped to **QNameID** (uint16):

```text
Type:        QNameID = uint16
Size:        2 bytes
Encoding:    BigEndian
Range:       0 - 65535 (0xFFFF)
```

**QNameID ranges:**

```text
Range           Purpose                      Examples
0               NullQNameID                  (null/empty)
1-5             System QNames (hardcoded)    Error, CUD, etc.
6-255           Reserved (QNameIDSysLast)    System use
256-65535       User-defined QNames          Application types
```

**Hardcoded system QNameIDs:**
```text
0    NullQNameID
1    QNameIDForError
2    QNameIDCommandCUD
3    QNameIDForCorruptedData
4    QNameIDWLogOffsetSequence
5    QNameIDRecordIDSequence
...
255  QNameIDSysLast (boundary)
```

**QName mapping storage:**

The QName ↔ QNameID mapping is stored in SysView_QNames (ID=17):

```text
Partition Key:
[0-1]    uint16   SysView_QNames (constant = 17)
[2-3]    uint16   Version (ver01)

Clustering Columns:
[0...]   string   QName as string (e.g., "myapp.Order")

Value:
[0-1]    uint16   QNameID (e.g., 1000)
```

This mapping is:

- Loaded at application startup
- Cached in memory (pkg/istructsmem/internal/qnames)
- Persisted to storage when new QNames are added
- Immutable once assigned (QNameID never changes for a given QName)

### Field serialization rules

When fields are serialized in partition keys and clustering columns:

**Fixed-size types (BigEndian):**
```text
int8      -> 1 byte
int16     -> 2 bytes (BigEndian)
int32     -> 4 bytes (BigEndian)
int64     -> 8 bytes (BigEndian)
uint16    -> 2 bytes (BigEndian)
uint32    -> 4 bytes (BigEndian)
uint64    -> 8 bytes (BigEndian)
float32   -> 4 bytes (BigEndian, IEEE 754 bits)
float64   -> 8 bytes (BigEndian, IEEE 754 bits)
bool      -> 1 byte (0x00=false, 0x01=true)
QName     -> 2 bytes (BigEndian QNameID)
RecordID  -> 8 bytes (BigEndian)
```

**Variable-size types:**
```text
string    -> Written as-is (UTF-8 bytes)
bytes     -> Written as-is (raw bytes)
```

**Note:** Variable-size fields (string, bytes) should be placed last in clustering columns for efficient range queries.

## SysView_Versions

SysView_Versions (ID=16) is a system view that tracks the schema version of other system views in Voedger's storage layer. It acts as a version registry for internal data structures, enabling schema evolution and backward compatibility.

### Purpose

SysView_Versions solves the schema evolution problem for system views. When Voedger's internal storage format changes (e.g., how QNames are stored, how containers are organized), this view tracks which version of each system view's schema is currently in use.

### Data structure

**Partition key:**

```text
[0-1]    uint16   SysView_Versions (constant = 16)
```

**Clustering columns:**

```text
[0-1]    uint16   VersionKey (identifies which system view)
```

**Value:**

```text
[0-1]    uint16   VersionValue (the version number)
```

### Version keys

The system tracks versions for these internal views:

```text
VersionKey    System view           Purpose
1             SysQNamesVersion      QName to QNameID mapping format
2             SysContainersVersion  Container names format
3             SysSingletonsVersion  Singleton IDs format
4             SysUniquesVersion     Uniques format (deprecated)
```

### How it works

**On application startup:**

```go
// Load all version information from storage
versions := vers.New()
err := versions.Prepare(storage)

// This reads all entries from SysView_Versions into memory
// Partition Key: [16]
// Reads all clustering columns and values
```

**When loading a system view (e.g., QNames):**

```go
// Check what version of QNames view is stored
ver := versions.Get(vers.SysQNamesVersion)

switch ver {
case vers.UnknownVersion:
    // No data exists yet - first time initialization
    return nil
case ver01:
    // Load using version 1 format
    return names.load01(storage)
default:
    // Unknown version - error
    return ErrorInvalidVersion
}
```

**When storing a system view:**

```go
// After storing QNames data, update the version
if ver := versions.Get(vers.SysQNamesVersion); ver != latestVersion {
    err = versions.Put(vers.SysQNamesVersion, latestVersion)
}

// This writes to SysView_Versions:
// Partition Key: [16]
// Clustering Columns: [1] (SysQNamesVersion)
// Value: [latestVersion]
```

### Storage example

If an application has QNames, Containers, and Singletons system views all at version 1:

```text
Partition Key: [0x00][0x10]  (SysView_Versions = 16)

Entry 1:
  Clustering Columns: [0x00][0x01]  (SysQNamesVersion = 1)
  Value: [0x00][0x01]               (version 1)

Entry 2:
  Clustering Columns: [0x00][0x02]  (SysContainersVersion = 2)
  Value: [0x00][0x01]               (version 1)

Entry 3:
  Clustering Columns: [0x00][0x03]  (SysSingletonsVersion = 3)
  Value: [0x00][0x01]               (version 1)
```

### Schema evolution

When Voedger's internal storage format needs to change:

1. New code can read old format (backward compatibility)
2. New code can write new format
3. Version number indicates which format is in use
4. Migration can be performed incrementally

**Example scenario:**

```go
// Old code stored QNames with version 1 format
// New code needs to support both version 1 and version 2

func (names *QNames) load(storage, versions) error {
    ver := versions.Get(vers.SysQNamesVersion)

    switch ver {
    case vers.UnknownVersion:
        return nil  // No data yet
    case ver01:
        return names.load01(storage)  // Old format
    case ver02:
        return names.load02(storage)  // New format
    default:
        return ErrorInvalidVersion
    }
}
```

### Implementation characteristics

- Centralized version tracking - All system view versions in one place
- Lazy loading - Loaded once at startup, cached in memory
- Atomic updates - Version updated when system view data is written
- Backward compatibility - Enables reading old formats
- Migration support - Can detect when migration is needed

## Key structure by data type

### 1. Records (CDoc, WDoc, GDoc, CRecord, WRecord, GRecord)

**Partition key (18 bytes total):**
```text
Byte Position:  [0-1]    [2-9]      [10-17]
Data Type:      uint16   uint64     uint64
Content:        19       WSID       RecordID_Hi
Encoding:       BigEndian BigEndian BigEndian
Description:    SysView_Records constant
```

**Clustering columns (2 bytes total):**
```text
Byte Position:  [0-1]
Data Type:      uint16
Content:        RecordID_Lo
Encoding:       BigEndian
```

**RecordID splitting:**

RecordID is a 64-bit unsigned integer split into Hi (upper 48 bits) and Lo (lower 16 bits):

- Formula: `Hi = RecordID >> 16`, `Lo = RecordID & 0xFFFF`
- This creates partitions of 65,536 records each
- Constant: `partitionBits = 16`

**Example:**
```text
RecordID = 131072 (0x20000)
Hi = 131072 >> 16 = 2
Lo = 131072 & 0xFFFF = 0

For WSID=1000, RecordID=131072:

Partition Key (18 bytes):
[0x00][0x13][0x00][0x00][0x00][0x00][0x00][0x00][0x03][0xE8][0x00][0x00][0x00][0x00][0x00][0x00][0x00][0x02]
  19 (SysView_Records)    WSID=1000                           RecordID_Hi=2

Clustering Columns (2 bytes):
[0x00][0x00]
  RecordID_Lo=0
```

**Value:** Serialized record data (dynobuffer format)

### 2. PLog (Partition Event Log)

**Partition Key (12 bytes total):**
```text
Byte Position:  [0-1]    [2-3]         [4-11]
Data Type:      uint16   uint16        uint64
Content:        20       PartitionID   Offset_Hi
Encoding:       BigEndian BigEndian    BigEndian
Description:    SysView_PLog constant
```

**Clustering Columns (2 bytes total):**
```text
Byte Position:  [0-1]
Data Type:      uint16
Content:        Offset_Lo
Encoding:       BigEndian
```

**Offset Splitting:**

Similar to RecordID, Offset is split into Hi (upper 48 bits) and Lo (lower 16 bits):

- Formula: `Hi = Offset >> 16`, `Lo = Offset & 0xFFFF`

**Value:** Serialized event data

### 3. WLog (Workspace Event Log)

**Partition Key (18 bytes total):**
```text
Byte Position:  [0-1]    [2-9]      [10-17]
Data Type:      uint16   uint64     uint64
Content:        21       WSID       Offset_Hi
Encoding:       BigEndian BigEndian BigEndian
Description:    SysView_WLog constant
```

**Clustering Columns (2 bytes total):**
```text
Byte Position:  [0-1]
Data Type:      uint16
Content:        Offset_Lo
Encoding:       BigEndian
```

**Value:** Serialized event data

### 4. User-Defined Views

**Partition Key (variable length):**
```text
Byte Position:  [0-1]         [2-9]      [10...]
Data Type:      uint16        uint64     variable
Content:        ViewQNameID   WSID       User partition key fields
Encoding:       BigEndian     BigEndian  Field-specific
```

**Clustering Columns (variable length):**
```text
Byte Position:  [0...]
Data Type:      variable
Content:        User clustering column fields
Encoding:       Field-specific
```

**Value:** Serialized view value data

**Example View with QName Field:**

Schema:
```sql
VIEW OrdersByStatus (
    Status qname,           -- Partition key (QName field!)
    OrderDate int64,        -- Clustering column
    OrderID int64           -- Clustering column
)
```

Data: Status = "myapp.Completed" (QNameID=750), OrderDate=1234567890, OrderID=200001

Partition Key (12 bytes):
```text
Byte Position:  [0-1]         [2-9]           [10-11]
Data:           ViewQNameID   WSID            Status QNameID
Value:          2500          1000            750
Hex:            [0x09][0xC4]  [WSID bytes]    [0x02][0xEE]
```

Clustering Columns (16 bytes):
```text
Byte Position:  [0-7]                    [8-15]
Data:           OrderDate                OrderID
Value:          1234567890               200001
Hex:            [OrderDate bytes]        [OrderID bytes]
```

## RecordID structure

RecordID is a 64-bit unsigned integer with specific ranges:

```text
Range                    Purpose
0                        NullRecordID
1 - 65535               Raw IDs (temporary, client-generated)
65536 - 66047           Singleton IDs
66048                   NonExistingRecordID (testing)
65536 - 200000          Reserved range
200001+                 User record IDs
```

**Splitting for Storage:**

- Partition bits: 16 (lower bits)
- Creates partitions of 65,536 records each
- Formula: `partitionBits = 16`
- Hi = upper 48 bits, Lo = lower 16 bits

## WSID (Workspace ID) structure

WSID is a 63-bit value (highest bit always 0):

```text
Bit:  63  62-47        46-0
      0   ClusterID    BaseWSID
```

- Bit 63: Always 0 (allows safe int64 casting)
- Bits 62-47: ClusterID (16 bits)
- Bits 46-0: BaseWSID (47 bits)

**Formula:**
```go
WSID = (ClusterID << 47) + BaseWSID
```

## Data flow

### Writing a View Record

```text
1. Application calls IViewRecords.Put(wsid, keyBuilder, valueBuilder)
   |
2. keyBuilder.ToBytes(wsid) generates:
   - Partition Key: [ViewQNameID][WSID][PartitionKeyFields]
   - Clustering Columns: [ClusteringColumnFields]
   |
3. valueBuilder.ToBytes() serializes value data
   |
4. IAppStorage.Put(pKey, cCols, value)
   |
5. Storage backend writes to underlying database
```

### Reading a View Record

```text
1. Application calls IViewRecords.Get(wsid, keyBuilder)
   |
2. keyBuilder.ToBytes(wsid) generates pKey and cCols
   |
3. IAppStorage.Get(pKey, cCols, &data)
   |
4. Storage backend retrieves from database
   |
5. Value deserialized from bytes to IValue
```

### Range Reading (Scan)

```text
1. Application calls IViewRecords.Read(ctx, wsid, keyBuilder, callback)
   |
2. keyBuilder.ToBytes(wsid) generates:
   - Partition Key: [ViewQNameID][WSID][PartitionKeyFields]
   - Start Clustering Columns: [SpecifiedFields]
   - Finish Clustering Columns: [SpecifiedFields + 0xFF...]
   |
3. IAppStorage.Read(ctx, pKey, startCCols, finishCCols, callback)
   |
4. Storage backend iterates over range
   |
5. For each record: callback(cCols, value)
   |
6. Deserialize and process each record
```

## Implementation details

### Translation layer (pkg/istructsmem)

The `istructsmem` package implements high-level `istructs` interfaces by translating them into low-level `IAppStorage` calls:

```text
High Level (istructs)          Translation          Low Level (istorage)
IRecords.Get(wsid, id)    ->   recordKey()     ->   IAppStorage.Get(pKey, cCols)
IViewRecords.Put(...)     ->   storeToBytes()  ->   IAppStorage.Put(pKey, cCols, value)
IEvents.PutPlog(...)      ->   plogKey()       ->   IAppStorage.Put(pKey, cCols, data)
IEvents.ReadWLog(...)     ->   wlogKey()       ->   IAppStorage.Read(pKey, startCCols, finishCCols)
```

**Key Generation Functions (pkg/istructsmem/utils.go):**

- `recordKey(ws WSID, id RecordID) (pkey, ccols []byte)` - Generates keys for records
- `plogKey(partition PartitionID, offset Offset) (pkey, ccols []byte)` - Generates keys for PLog
- `wlogKey(ws WSID, offset Offset) (pkey, ccols []byte)` - Generates keys for WLog

**View Key Generation (pkg/istructsmem/viewrecords-dynobuf.go):**

- `storeViewPartKey(ws WSID) []byte` - Generates partition key for views
- `storeViewClustKey() []byte` - Generates clustering columns for views

### Caching layer

**istoragecache** (pkg/istoragecache) provides transparent caching:

```text
IAppStorage (cached)
    |
    +-- Cache (LRU)
    |
    +-- IAppStorage (underlying)
```

## Usage examples

### Example: Writing a Record

```go
// High-level API
err := appStructs.Records().PutJSON(wsid, map[string]interface{}{
    "sys.ID": 200001,
    "sys.QName": "myapp.Order",
    "CustomerName": "John Doe",
    "Amount": 100.50,
})

// Under the hood:
// 1. Build record from JSON
// 2. Generate keys: pk, cc := recordKey(wsid, 200001)
//    pk = [0x00][0x13][WSID bytes][RecordID_Hi bytes]
//    cc = [RecordID_Lo bytes]
// 3. Serialize record data
// 4. Call storage.Put(pk, cc, data)
```

### Example: Writing a View Record

```go
// Get view records interface
viewRecords := appStructs.ViewRecords()

// Build key
kb := viewRecords.KeyBuilder(viewQName)
kb.PartitionKey().PutInt64("partitionKey1", 1)
kb.ClusteringColumns().PutInt32("clusteringColumn1", 100)
kb.ClusteringColumns().PutString("clusteringColumn2", "test")

// Build value
vb := viewRecords.NewValueBuilder(viewQName)
vb.PutInt64("valueField1", 123)
vb.PutString("valueField2", "data")

// Store
err := viewRecords.Put(wsid, kb, vb)

// Under the hood:
// 1. kb.ToBytes(wsid) generates:
//    pk = [ViewQNameID][WSID][partitionKey1 bytes]
//    cc = [clusteringColumn1 bytes][clusteringColumn2 bytes]
// 2. vb.ToBytes() serializes value
// 3. Call storage.Put(pk, cc, value)
```

### Example: Reading a View Record

```go
// Build key
kb := viewRecords.KeyBuilder(viewQName)
kb.PartitionKey().PutInt64("partitionKey1", 1)
kb.ClusteringColumns().PutInt32("clusteringColumn1", 100)
kb.ClusteringColumns().PutString("clusteringColumn2", "test")

// Read
value, err := viewRecords.Get(wsid, kb)
if err != nil {
    // Handle error
}

// Access fields
field1 := value.AsInt64("valueField1")
field2 := value.AsString("valueField2")
```

### Example: Range Reading (Scan)

```go
// Build key with partial clustering columns
kb := viewRecords.KeyBuilder(viewQName)
kb.PartitionKey().PutInt64("partitionKey1", 1)
kb.ClusteringColumns().PutInt32("clusteringColumn1", 100)
// Note: clusteringColumn2 not specified - will scan all values

// Read range
err := viewRecords.Read(ctx, wsid, kb, func(key IKey, value IValue) error {
    // Process each record
    col1 := key.AsInt32("clusteringColumn1")
    col2 := key.AsString("clusteringColumn2")
    val1 := value.AsInt64("valueField1")
    return nil
})
```
