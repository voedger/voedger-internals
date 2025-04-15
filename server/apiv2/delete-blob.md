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
  - URL path handler `~cmp.routerBlobsDeletePathHandler~`covered[^1]✅:
- pkg/sys/it
  - integration test for deleting BLOBs
    - `~it.TestBlobsDelete~`covered[^2]✅

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsDeletePathHandler~impl]` [server/apiv2/delete-blob.md:40:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/delete-blob.md#L40)
[^2]: `[~server.apiv2.blobs/it.TestBlobsDelete~impl]` [server/apiv2/delete-blob.md:41:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/delete-blob.md#L41)
