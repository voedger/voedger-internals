# Deactivate document or record

## Motivation
Deactivate CDoc/WDoc/CRecord/WRecord using API

## Functional Design
DELETE `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| pkg, table | string | identifies a table (document or record) |
| id | int64 | ID of a document or record |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset, see example below |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 404 | Table Not Found | [error object](errors.md) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](errors.md) |

Example Result 200:
```json
{
    "currentWLogOffset":114,
}
```
