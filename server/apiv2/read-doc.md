# Read document or record
## Motivation
Read CDoc/WDoc/CRecord/WRecord using API

## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

### Result
| Code | Description | Body 
| --- | --- | --- |
| 200 | OK | CDoc/WDoc/CRecord/WRecord object |
| 401 | Unauthorized | [error object](README.md#errors) |
| 403 | Forbidden | [error object](README.md#errors) |
| 404 | Table Not Found | [error object](README.md#errors) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](README.md#errors) |
