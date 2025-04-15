---
reqmd.package: server.apiv2.blobs
---

# Delete the existing BLOB

## Functional design
DELETE `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`

Deletes the BLOB

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| blobId | int64 | ID of a BLOB

### Result
| Code | Description | Body |
| --- | --- | --- |
| 204 | No Content |  |
| 401 | Unauthorized | [error object](errors.md) |
| 404 | Not Found | [error object](errors.md) |

## Technical design
### Components
- pkg/router
  - URL path handler `~cmp.routerBlobsDeletePathHandler~`uncvrd[^1]❓:
- pkg/sys/it
    - integration test for deleting BLOBs
        - `~it.TestBlobsDelete~`uncvrd[^2]❓

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsDeletePathHandler~impl]`
[^2]: `[~server.apiv2.blobs/it.TestBlobsDelete~impl]`
