# Update document or record
## Motivation
Update a CDoc, WDoc, CRecord or WRecord using API

## Functional Design
PATCH `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | application/json |

### Body
CDoc/WDoc/CRecord/WRecord (fields to be updated)

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset and the new IDs, see below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](#errors) |
| 401 | Unauthorized | [error object](#errors) |
| 403 | Forbidden | [error object](#errors) |
| 404 | Table Not Found | [error object](#errors) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](#errors) |

Example Result 200:
```json
{
    "CurrentWLogOffset":114,
    "NewIDs": {
        "1":322685000131212
    }
}
```
