---
reqmd.package: server.apiv2.blobs
---

# Create/upload a new BLOB

## Motivation

Creates a new BLOB with the uploaded binary data

## Functional design

- POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs`
Creates a new BLOB with the uploaded binary data and metadata. The SUUID of the BLOB is returned in the response and can be used to write the BLOB to field of a document or record when creating or updating record.

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
    "SUUID": "fnB6fRCHrPqStSXYEs7W73", 
    "ContentType": "image/jpeg",
    "Size": 524288,  
    "URL": "https://federation.example.com/api/v2/apps/untill/airsbp3/workspaces/12344566789/blobs/1010231232123123"
}
```

### Perimssions

- Execution of this function is granted to role `sys.BLOBUploader` which is by default granted to `sys.WorkspaceOwner`.

## Technical design

### Components  

- pkg/router
  - `~cmp.routerBlobsCreatePathHandler~` uncvrd[^1]❓: Create BLOB path handler
pkg/processors/query2
  - `~cmp.qpv2ReplaceBLOBSUUIDs~`uncvrd[^3]❓ Replace BLOB SUIDs with IDs in query arguments
pkg/processors/command
  - `~cmp.cpv2ReplaceBLOBSUUIDs~`uncvrd[^4]❓ Replace BLOB SUIDs with IDs in command arguments and CUD operations
  - pkg/sys/it
  - `~it.TestBlobsCreate~`uncvrd[^2]: integration test for creating BLOBs  

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsCreatePathHandler~impl]`
[^2]: `[~server.apiv2.blobs/it.TestBlobsCreate~impl]`
[^3]: `[~server.apiv2.blobs/cmp.qpv2ReplaceBLOBSUUIDs~impl]`
[^4]: `[~server.apiv2.blobs/cmp.cpv2ReplaceBLOBSUUIDs~impl]`
