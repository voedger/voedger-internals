# Delete the existing BLOB
DELETE `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`

Deletes the BLOB and its metadata

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 204 | No Content |  |
| 401 | Unauthorized | [error object](#errors) |
| 404 | Not Found | [error object](#errors) |
