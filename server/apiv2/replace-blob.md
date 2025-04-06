---
reqmd.package: server.apiv2.blobs
---

# Replace an existing BLOB
## Motivation
Replace the binary data of the BLOB using API

## Functional Design
PUT `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | BLOB content type |

### Body
BLOB data

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| blobId | int64 | ID of a BLOB |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | see example below |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 413 | Payload Too Large | [error object](conventions.md#errors) |
| 415 | Unsupported Media Type | [error object](conventions.md#errors) |
| 429 | Too Many Requests | [error object](conventions.md#errors) |
| 500 | Internal Server Error | [error object](conventions.md#errors) |
| 503 | Service Unavailable | [error object](conventions.md#errors) |

Example response 200:
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
  - URL path handler `~cmp.routerBlobsReplacePathHandler~`uncvrd[^1]❓:

- pkg/sys/it
    - integration test for replacing BLOBs
        - `~it.TestBlobsReplace~`uncvrd[^2]❓

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsReplacePathHandler~impl]`
[^2]: `[~server.apiv2.blobs/it.TestBlobsReplace~impl]`
