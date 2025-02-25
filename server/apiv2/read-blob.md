# Read/download the BLOB 
## Motivation
Retrieve the BLOB data or metadata using API

## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`

### Headers
| Key | Value | Description
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | The token obtained during the authentication process |
| Accept | application/json | To retrieve the metadata |
| Accept | \*/\* | To retrieve the BLOB data |

### Response Headers
| Key | Value | Description
| --- | --- | --- |
| Content-type | application/json | To retrieve the metadata |
| Content-type | {storedContentType} | To retrieve the BLOB data |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | BLOB metadata or binary data |
| 404 | Not Found | [error object](conventions.md#errors) |
| 400 | Bad Request | [error object](conventions.md#errors) |

