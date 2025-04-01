# Read/download the BLOB 
## Motivation
Retrieve the BLOB data or metadata using API

## Functional Design
GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`

### Headers
| Key | Value | Description
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | The token obtained during the authentication process |
| Accept | application/json | To retrieve the metadata |
| Accept | \*/\* | To retrieve the BLOB data |

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
| Content-type | application/json | To retrieve the metadata |
| Content-type | {storedContentType} | To retrieve the BLOB data |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | BLOB metadata or binary data |
| 404 | Not Found | [error object](conventions.md#errors) |
| 400 | Bad Request | [error object](conventions.md#errors) |

