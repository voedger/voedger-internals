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
| Content-Type | BLOB content type |
| Blob-Name | BLOB name, optional |

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
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 413 | Payload Too Large | [error object](errors.md) |
| 415 | Unsupported Media Type | [error object](errors.md) |
| 429 | Too Many Requests | [error object](errors.md) |
| 500 | Internal Server Error | [error object](errors.md) |
| 503 | Service Unavailable | [error object](errors.md) |

Example response 200:

```json
{
    "BlobID": "1010231232123123",
    "ContentType": "image/jpeg",
    "Size": 524288,  
    "URL": "https://federation.example.com/api/v2/apps/untill/airsbp3/workspaces/12344566789/blobs/1010231232123123"
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
