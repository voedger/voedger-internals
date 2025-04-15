---
reqmd.package: server.apiv2.blobs
---

# Read/download the BLOB 
## Motivation
Retrieve the BLOB data or metadata using API

## Functional design
GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`

### Headers
| Key | Value | Description
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | The token obtained during the authentication process |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| blobId | int64 | ID of a BLOB |

### Response Headers
| Key | Value | Description
| --- | --- | --- |
| Content-type | BLOB metadata| Returns the originally provided metadata |


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
