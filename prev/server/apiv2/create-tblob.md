---
reqmd.package: server.apiv2.tblobs
---

# Create/upload a temporary BLOB

## Motivation

Creates a temporary BLOB with the uploaded binary data

## Functional design

- POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/tblobs`
Creates a temporary BLOB with the uploaded binary data. The SUUID of the BLOB is returned in the response and can be used to read the BLOB until it expires.

### Headers

| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-Type | BLOB content type |
| Blob-Name | BLOB name, optional |
| TTL | BLOB TTL in seconds, optional. Default is "1d" (other values not supported yet) |

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
| 201 | Created | blob SUUID, see example below |
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
    "blobSUUID": "cMyxY-HEQHmPnU0JG_UedQ", 
}
```

### Perimssions

- Execution of this function is granted to role `sys.BLOBUploader` which is by default granted to `sys.WorkspaceOwner`.

## Technical design

### Components  

- pkg/router
  - `~cmp.routerTBlobsCreatePathHandler~`covrd[^1]✅: Create temporary BLOB path handler
- pkg/sys/it
  - `~it.TestTBlobsCreate~`covrd[^2]✅: integration test for creating temporary BLOBs  

[^1]: `[~server.apiv2.tblobs/cmp.routerTBlobsCreatePathHandler~impl]` [pkg/router/impl_apiv2.go:142:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L142)
[^2]: `[~server.apiv2.tblobs/it.TestTBlobsCreate~impl]` [pkg/sys/it/impl_blob_test.go:287:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_blob_test.go#L287)
