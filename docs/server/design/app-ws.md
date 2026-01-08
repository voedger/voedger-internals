# App Workspaces design

## Principles

- **Pseudo WSIDs** are calculated using CRC16 hash of login/workspace name for deterministic routing
- **App WSIDs** distribute pseudo WSIDs across a fixed number of application workspaces using modulo
- **Partitioning** uses simple modulo operation: `PartitionID = WSID % NumPartitions`
- **Router** automatically converts pseudo WSIDs to app WSIDs during request validation
- **User WSIDs** are allocated sequentially from a view-based counter starting at `0x20000`

This design allows consistent routing of requests to the same partition while supporting both temporary (pseudo) and permanent (user) workspaces.

## WSID Structure (64-bit)

```go
// pkg/istructs/utils.go
//	        clusterID shifted here on <<               zeroed on <<
//	63      62 61 60 59 58 57 ........ 47 46 45 44 43 ..................... 1 0
//
// always 0 └─── ClusterID (16 bits) ───┘ └─────── BaseWSID (47 bits) ────────┘
func NewWSID(cluster ClusterID, baseWSID WSID) WSID {
	return WSID(cluster)<<WSIDClusterLShift + baseWSID
}
```

## BaseWSID Ranges

1. **Pseudo WSIDs**: `0x0000 - 0xFFFF` (0-65,535) - Temporary IDs calculated from login/workspace name
2. **App WSIDs**: `0x10000 - 0x17FFF` (65,536-98,303) - Fixed application workspaces
3. **Reserved WSIDs**: `0x18000 - 0x1FFFF` (98,304-131,071) - System reserved
4. **User WSIDs**: `0x20000+` (131,072+) - Sequentially allocated user workspaces

## Calculation Process

### 1. Pseudo WSID Generation

```go
// pkg/coreutils/appwsid.go
func GetPseudoWSID(ownerWSID istructs.WSID, entity string, clusterID istructs.ClusterID) istructs.WSID {
	if ownerWSID != 0 {
		entity = fmt.Sprint(ownerWSID) + "/" + entity
	}
	crc16 := CRC16([]byte(entity))
	return istructs.NewWSID(clusterID, istructs.WSID(crc16))
}
```

### 2. Pseudo to App WSID Conversion

```go
// pkg/coreutils/appwsid.go
func PseudoWSIDToAppWSID(wsid istructs.WSID, numAppWorkspaces istructs.NumAppWorkspaces) istructs.WSID {
	baseAppWSID := istructs.FirstBaseAppWSID + istructs.WSID(AppWSNumber(wsid, numAppWorkspaces))
	return istructs.NewWSID(istructs.CurrentClusterID(), baseAppWSID)
}

func AppWSNumber(appWSID istructs.WSID, numAppWorkspaces istructs.NumAppWorkspaces) uint32 {
	return uint32(appWSID.BaseWSID() % istructs.WSID(numAppWorkspaces))
}
```

## Routing Process

### 1. HTTP Request Validation

```go
// pkg/router/impl_validation.go mode=EXCERPT
func validateRequest(req *http.Request, rw http.ResponseWriter, numsAppsWorkspaces map[appdef.AppQName]istructs.NumAppWorkspaces) (validatedData, bool) {
	// ... parse WSID from URL ...
	if numAppWorkspaces, ok := numsAppsWorkspaces[appQName]; ok {
		baseWSID := wsid.BaseWSID()
		if baseWSID <= istructs.MaxPseudoBaseWSID {
			wsid = coreutils.PseudoWSIDToAppWSID(wsid, numAppWorkspaces)
		}
	}
	// ...
}
```

### 2. Partition Calculation

```go
// pkg/coreutils/appwsid.go mode=EXCERPT
func AppPartitionID(wsid istructs.WSID, numAppPartitions istructs.NumAppPartitions) istructs.PartitionID {
	return istructs.PartitionID(wsid % istructs.WSID(numAppPartitions))
}
```

### 3. Partition Borrowing

```go
// path=pkg/appparts/impl.go mode=EXCERPT
func (aps *apps) AppWorkspacePartitionID(name appdef.AppQName, ws istructs.WSID) (istructs.PartitionID, error) {
	pc, err := aps.AppPartsCount(name)
	if err != nil {
		return 0, err
	}
	return coreutils.AppPartitionID(ws, pc), nil
}
```
