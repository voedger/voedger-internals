# Deactivate document or record
DELETE `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

Deactivates CDoc/WDoc/CRecord/WRecord

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset, see example below |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 404 | Table Not Found | [error object](conventions.md#errors) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](conventions.md#errors) |

Example Result 200:
```json
{
    "CurrentWLogOffset":114,
}
```
