# Update document or record
## Motivation
Update a CDoc, WDoc, CRecord or WRecord using API

## Functional Design
PATCH `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

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
| pkg, table | string | identifies a table (document or record) |
| id | int64 | ID of a document or record |

### Body
CDoc/WDoc/CRecord/WRecord (fields to be updated)

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset and the new IDs, see below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 404 | Table Not Found | [error object](conventions.md#errors) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](conventions.md#errors) |

Example Result 200:
```json
{
    "CurrentWLogOffset":114,
    "NewIDs": {
        "1":322685000131212
    }
}
```
