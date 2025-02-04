
# Create document or record
POST `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}`

Creates CDoc, WDoc, CRecord or WRecord

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | application/json |

## Request
JSON of the CDoc/WDoc/CRecord/WRecord


## Result
| Code | Description | Body
| --- | --- | --- |
| 201 | Created | current WLog offset and the new IDs, see below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](README.md#errors) |
| 401 | Unauthorized | [error object](README.md#errors) |
| 403 | Forbidden | [error object](README.md#errors) |
| 404 | Table Not Found | [error object](README.md#errors) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](README.md#errors) |
 
Example result 201:
```json
{
    "CurrentWLogOffset":114,
    "NewIDs": {
        "1":322685000131212
    }
}
```
