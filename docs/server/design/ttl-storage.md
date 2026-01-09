# TTL Storage

## Architecture overview

The TTL Storage system in Voedger is built on a multi-layered architecture that supports TTL (time-to-live) based data expiration across different storage backends.

```text
┌─────────────────────────────────────────────────────────┐
│ Application layer                                       │
│  - Temporary BLOB storage (iblobstorage)               │
│  - VVM TTL storage (pkg/vvm/storage)                   │
│    - Elections storage (leader election)               │
│    - Sequencer storage (sequence numbers)              │
└────────────────────────┬────────────────────────────────┘
                         │ uses
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Storage abstraction layer (istorage)                    │
│  - IAppStorage interface                                │
│  - IAppStorageFactory interface                         │
└────────────────────────┬────────────────────────────────┘
                         │ implemented by
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Backend implementations                                 │
│  - Memory storage (mem)                                 │
│  - Cassandra storage (cas)                              │
│  - BBolt storage (bbolt)                                │
│  - Amazon DynamoDB storage (amazondb)                   │
└─────────────────────────────────────────────────────────┘
```

**Example flow** (leader elections):

1. `ielections` package needs to store leader state with TTL
2. Calls `ISysVvmStorage.InsertIfNotExists(pKey, cCols, value, ttlSeconds)`
3. `ISysVvmStorage` adds prefix `pKeyPrefix_VVMLeader = 1` to the key
4. Calls `IAppStorage.InsertIfNotExists(pKey, cCols, value, ttlSeconds)`
5. Backend (Cassandra/BBolt/Memory) executes the operation

## Core components

### Storage factory configuration (cmd/voedger/voedgerimpl)

**Location**: `cmd/voedger/voedgerimpl/provide.go`

**Purpose**: Provides storage backend selection and initialization

**Key features**:

- Supports three storage types via CLI parameter:
  - `cas1`: Single-node Cassandra (SimpleStrategy, replication_factor=1)
  - `cas3`: Multi-node Cassandra (NetworkTopologyStrategy, dc1=2, dc2=1)
  - `mem`: In-memory storage (for testing)
- Default storage: `cas3`
- Configurable via environment variable `VOEDGER_STORAGE_TYPE`

**Configuration**:

```go
const (
    storageTypeCas1         string = "cas1"
    storageTypeCas3         string = "cas3"
    storageTypeMem          string = "mem"
    cas1ReplicationStrategy string = "{'class': 'SimpleStrategy', 'replication_factor': '1'}"
    cas3ReplicationStrategy string = "{ 'class': 'NetworkTopologyStrategy', 'dc1': 2, 'dc2': 1}"
)
```

### Storage interface layer (pkg/istorage)

**Core interface**: `IAppStorage`

**TTL operations**:

- `InsertIfNotExists(pKey, cCols, value, ttlSeconds)` - Atomic conditional insert with TTL
- `CompareAndSwap(pKey, cCols, oldValue, newValue, ttlSeconds)` - Atomic CAS with TTL update
- `CompareAndDelete(pKey, cCols, expectedValue)` - Atomic conditional delete
- `TTLGet(pKey, cCols, data)` - Retrieve TTL-enabled records
- `TTLRead(ctx, pKey, startCCols, finishCCols, cb)` - Range read of TTL records
- `QueryTTL(pKey, cCols)` - Query remaining TTL in seconds

**Data structure**:

```go
type DataWithExpiration struct {
    ExpireAt int64  // Unix milliseconds, 0 means no expiration
    Data     []byte
}
```

### Storage backend implementations

#### Memory storage (pkg/istorage/mem)

**Characteristics**:

- In-memory map-based storage
- Thread-safe with RWMutex
- Lazy expiration (checked on access)
- No background cleanup
- Shared lock between VVM instances to prevent race conditions

**Key design**:

```go
type storageWithLock struct {
    data map[string]map[string]istorage.DataWithExpiration
    lock sync.RWMutex
}
```

#### BBolt storage (pkg/istorage/bbolt)

**Characteristics**:

- File-based embedded database
- Two-bucket architecture:
  - **Data bucket**: Stores actual key-value pairs with expiration metadata
  - **TTL index bucket**: Sorted index by expiration time for efficient cleanup
- Active background cleanup goroutine
- Cleanup interval: 1 hour

**TTL index key structure**:

```text
[8 bytes: expireAt] + [8 bytes: pKey length] + [pKey bytes] + [cCols bytes]
```

**Background cleanup**:

```go
func (s *appStorageType) backgroundCleaner(ctx context.Context, wg *sync.WaitGroup) {
    for ctx.Err() == nil {
        timerCh := s.iTime.NewTimerChan(cleanupInterval) // 1 hour
        // ... scans TTL bucket and removes expired records
    }
}
```

#### Cassandra storage (pkg/istorage/cas)

**Characteristics**:

- Native TTL support via Cassandra's built-in TTL mechanism
- Automatic expiration handled by Cassandra
- No application-level cleanup required
- Uses `TTL(value)` function for querying remaining TTL

### VVM system storage (pkg/vvm/storage)

**Purpose**: Provides TTL storage adapter for VVM-specific use cases

**Interface**: `ISysVvmStorage`

**Operations**:

- `InsertIfNotExists(pKey, cCols, value, ttlSeconds)`
- `CompareAndSwap(pKey, cCols, oldValue, newValue, ttlSeconds)`
- `CompareAndDelete(pKey, cCols, expectedValue)`
- `Get(pKey, cCols, data)`
- `Put(pKey, cCols, value)`
- `PutBatch(batch)`

**Key prefixes** (for namespace isolation):

- `pKeyPrefix_VVMLeader = 1` - Leader election data
- `pKeyPrefix_SeqStorage_Part = 2` - Partition sequence storage
- `pKeyPrefix_SeqStorage_WS = 3` - Workspace sequence storage

**Use cases**:

1. **Leader elections** (`impl_elections.go`):
   - Stores leader election state with TTL
   - Uses `ITTLStorage[TTLStorageImplKey, string]` interface
   - Key serialization: uint32 -> big-endian bytes

2. **Sequence storage** (`impl_seqstorage.go`):
   - Stores sequence numbers for workspaces
   - Stores PLog offsets for partitions
   - Batch operations for performance

### Temporary BLOB storage (pkg/iblobstorage)

**Purpose**: Store temporary binary large objects with automatic expiration

**Key types**:

```go
type TempBLOBKeyType struct {
    ClusterAppID istructs.ClusterAppID
    WSID         istructs.WSID
    SUUID        SUUID  // String-based unique identifier
}

type DurationType int  // DurationType^2 = days to store
```

**Duration constants**:

- `DurationType_1Day = 1` -> 1 day (86400 seconds)

**API endpoints**:

- Upload: `POST /api/v2/apps/{owner}/{app}/workspaces/{wsid}/tblobs`
  - Header: `TTL: 1d`
  - Returns: `blobSUUID`
- Download: `GET /api/v2/apps/{owner}/{app}/workspaces/{wsid}/tblobs/{suuid}`

**Storage strategy**:

- Uses `InsertIfNotExists` for atomic BLOB creation
- Stores BLOB in chunks with state metadata
- Each chunk and state record has TTL applied
- BLOB key format: `[prefix:8][appID:4][wsid:8][suuid:variable]`

**Implementation** (`pkg/iblobstoragestg`):

```go
func (b *bStorageType) WriteTempBLOB(ctx context.Context, key iblobstorage.TempBLOBKeyType,
    descr iblobstorage.DescrType, reader io.Reader, limiter iblobstorage.WLimiterType,
    duration iblobstorage.DurationType) (uploadedSize uint64, err error) {
    inserter := func(pKey, cCols, val []byte, duration iblobstorage.DurationType, _ []byte) error {
        ok, err := (*(b.blobStorage)).InsertIfNotExists(pKey, cCols, val, duration.Seconds())
        // ...
    }
    // ...
}
```

## Data flow

### Temporary BLOB upload flow

```text
1. Client -> HTTP POST /api/v2/.../tblobs (with TTL header)
2. Router -> BlobProcessor.HandleWriteTemp_V2()
3. BlobProcessor -> Generate SUUID
4. BlobProcessor -> IBLOBStorage.WriteTempBLOB()
5. IBLOBStorage -> Split into chunks
6. For each chunk:
   - IAppStorage.InsertIfNotExists(chunk_key, chunk_data, ttl_seconds)
7. IAppStorage -> Backend-specific storage (Cassandra/BBolt/Mem)
8. Return SUUID to client
```

### TTL expiration flow

**Cassandra**:

```text
1. Record written with TTL
2. Cassandra native TTL mechanism handles expiration
3. Tombstone created after TTL expires
4. Compaction removes tombstones
```

**BBolt**:

```text
1. Record written to Data bucket with expireAt
2. TTL index entry created in TTL bucket (sorted by expireAt)
3. Background cleaner runs every hour
4. Cleaner scans TTL bucket from start
5. Removes expired entries from both buckets
6. Stops when encountering non-expired entry
```

**Memory**:

```text
1. Record written with expireAt timestamp
2. Lazy expiration on access
3. IsExpired() check during Get/Read operations
4. No background cleanup (suitable for testing only)
```

## Key design patterns

### Atomic operations with TTL

All TTL operations are atomic to prevent race conditions:

- `InsertIfNotExists`: Prevents duplicate creation
- `CompareAndSwap`: Ensures consistent updates
- `CompareAndDelete`: Safe deletion with value verification

### Time abstraction

Uses `timeu.ITime` interface for testability:

- Production: Real time
- Testing: Mock time with controllable advancement

### Dependency injection

Wire-based dependency injection in `cmd/voedger/wire.go`:

- Storage factory selection
- Provider chain construction
- Service wiring

## Configuration and deployment

### Docker configuration

```dockerfile
ENV VOEDGER_HTTP_PORT 443
ENV VOEDGER_ACME_DOMAINS ""
ENV VOEDGER_STORAGE_TYPE cas3
```

### Entrypoint script

```bash
storage_type="${VOEDGER_STORAGE_TYPE:-cas3}"
cmd_args=("--ihttp.Port=$VOEDGER_HTTP_PORT" "--storage" "$storage_type")
```
