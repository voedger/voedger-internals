---
reqmd.package: server.apiv2.blobs
---

# Read/download the temporary BLOB

## Motivation

Retrieve the temporary BLOB

## Functional design

GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/tblobs/{suuid}`

### Headers

| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | The token obtained during the authentication process |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| suuid | string | SUUID of the BLOB |

### Response Headers

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | BLOB metadata| Returns the originally provided metadata |
| Blob-Name | BLOB name | Returns the originally provided name |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | BLOB binary data |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 404 | Not Found | [error object](errors.md) |
| 429 | Too Many Requests | [error object](errors.md) |
| 500 | Internal Server Error | [error object](errors.md) |
| 503 | Service Unavailable | [error object](errors.md) |

## Technical design

### Components  

- pkg/router
  - `~cmp.routerTBlobsReadPathHandler~`uncvrd[^1]❓: URL path handler
- pkg/sys/it
  - `~it.TestTBlobsRead~`uncvrd[^2]❓: integration test for reading BLOBs

[^1]: `[~server.apiv2.blobs/cmp.routerTBlobsReadPathHandler~impl]`
[^2]: `[~server.apiv2.blobs/it.TestTBlobsRead~impl]`
