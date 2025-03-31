# Delete the existing BLOB
DELETE `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`

Deletes the BLOB and its metadata

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| blobId | int64 | ID of a BLOB

## Result
| Code | Description | Body |
| --- | --- | --- |
| 204 | No Content |  |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 404 | Not Found | [error object](conventions.md#errors) |
