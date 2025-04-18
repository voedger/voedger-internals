# Create document or record

## Motivation

Create a new CDoc, WDoc, CRecord or WRecord using API

## Functional Design

POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}`

### Headers

| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-Type | application/json |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| pkg, table | string | identifies a table (document or record) |

### Body

JSON object: CDoc/WDoc/CRecord/WRecord

### Result

| Code | Description | Body |
| --- | --- | --- |
| 201 | Created | current WLog offset and the new IDs, see below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 404 | Table Not Found | [error object](errors.md) |
| 405 | Method Not Allowed, table is an ODoc/ORecord | [error object](errors.md) |

Example result 201:

```json
{
    "CurrentWLogOffset":114,
    "NewIDs": {
        "1":322685000131212
    }
}
```
