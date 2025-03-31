# Update BLOB metadata
## Motivation
Update the metadata of the BLOB data using API

## Functional Design
PATCH `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | application/json |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| blobId | int64 | ID of a BLOB |

### Body
The new metadata

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | the BLOB metadata |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 404 | Not Found | [error object](conventions.md#errors) |
| 415 | Unsupported Media Type | [error object](conventions.md#errors) |

