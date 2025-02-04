# Replace an existing BLOB
PUT `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`

Replaces the binary data of the BLOB and optionally metadata

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | multipart/form-data |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | the BLOB metadata |
| 400 | Bad Request | [error object](README.md#errors) |
| 404 | Not Found | [error object](README.md#errors) |
| 413 | Payload Too Large | [error object](README.md#errors) |
| 415 | Unsupported Media Type | [error object](README.md#errors) |
