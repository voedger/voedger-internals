---
reqmd.package: server.apiv2.blobs
---

# Read/download the BLOB

## Motivation

Retrieve the BLOB from the field of a document or record, using API

## Functional design

GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}/blobs/{fieldName}`

### Headers / Cookies
Authorization is supported via Bearer token. The token can be passed in the `Authorization` header or as a cookie. The token is obtained during the authentication process.

| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | The token obtained during the authentication process |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| pkg, table | string | identifies a table (document or record) |
| id | int64 | ID of a document or record |
| fieldName | string | name of the field containing the BLOB |

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
  - URL path handler `~cmp.routerBlobsReadPathHandler~`uncvrd[^1]❓:

- pkg/sys/it
  - integration test for reading BLOBs
    - `~it.TestBlobsRead~`uncvrd[^2]❓

[^1]: `[~server.apiv2.blobs/cmp.routerBlobsReadPathHandler~impl]`
[^2]: `[~server.apiv2.blobs/it.TestBlobsRead~impl]`
