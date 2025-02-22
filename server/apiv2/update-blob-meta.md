# Update BLOB metadata
## Motivation
Update the metadata of the BLOB data using API

## Functional Design
PATCH `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | application/json |

### Body
The new metadata

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | the BLOB metadata |
| 400 | Bad Request | [error object](README.md#errors) |
| 404 | Not Found | [error object](README.md#errors) |
| 415 | Unsupported Media Type | [error object](README.md#errors) |

