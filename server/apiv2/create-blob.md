---
reqmd.package: server.apiv2.blobs
---

# Create/upload a new BLOB
## Motivation
Creates a new BLOB with the uploaded binary data 

## Functional design
POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs`

Creates a new BLOB with the uploaded binary data and metadata.

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | BLOB content type |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |

### Body
BLOB data.

### Result
| Code | Description | Body |
| --- | --- | --- |
| 201 | Created | blobId, see example below |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 413 | Payload Too Large | [error object](errors.md) |
| 415 | Unsupported Media Type | [error object](errors.md) |
| 429 | Too Many Requests | [error object](errors.md) |
| 500 | Internal Server Error | [error object](errors.md) |
| 503 | Service Unavailable | [error object](errors.md) |

Example response 201:
```
{
    "BlobId": "1010231232123123",
    "ContentType": "image/jpeg",
    "Size": 524288,  
    "Url": "https://federation.example.com/api/v2/apps/untill/airsbp3/workspaces/12344566789/blobs/1010231232123123"
}
```

## Technical design

### Components

- pkg/router
  - URL path handler `~cmp.routerBlobsCreatePathHandler~`covered[^1]✅:

- pkg/sys/it
  - integration test for creating BLOBs
    - `~it.TestBlobsCreate~`covered[^2]✅

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsCreatePathHandler~impl]` [server/apiv2/create-blob.md:62:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-blob.md#L62)
[^2]: `[~server.apiv2.blobs/it.TestBlobsCreate~impl]` [server/apiv2/create-blob.md:63:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-blob.md#L63)
