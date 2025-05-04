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
| Content-Type | BLOB content type |
| Blob-Name | BLOB name, optional |
| TTL | Time to live, specify for temporary BLOB. Only "1d" is supported at the moment. If not specified, the BLOB is stored permanently (default) |

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

```json
{
    "BlobID": "1010231232123123", // Can be either a string (for temporary BLOBs) or an int64 (for permanent BLOBs)
    "ContentType": "image/jpeg",
    "Size": 524288,  
    "URL": "https://federation.example.com/api/v2/apps/untill/airsbp3/workspaces/12344566789/blobs/1010231232123123"
}
```

### Perimssions

By default, execution of this function is only granted to role `sys.WorkspaceOwner`.
To allow function for other roles, grant execute permission for command `sys.UploadBLOBHelper` to the role.

## Technical design

### Components  

- pkg/router
  - URL path handler `~cmp.routerBlobsCreatePathHandler~`uncvrd[^1]❓:

- pkg/sys/it
  - integration test for creating BLOBs
    - `~it.TestBlobsCreate~`uncvrd[^2]❓

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsCreatePathHandler~impl]`
[^2]: `[~server.apiv2.blobs/it.TestBlobsCreate~impl]`
