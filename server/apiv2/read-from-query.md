# Read from Query

## Motivation

Read from a query function using API

## Functional design

GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/queries/{pkg}.{query}`

### Headers

| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| **Query** | | |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| pkg, query | string | identifies a query |
| **Path** | | |
| [constraints](query-constraints.md) | | Optional query constraints |
| args | URL-encoded JSON-object | Optional query function arguments |
| **Headers** | | |
| PrincipalToken | string | Token returned by [login](../apiv2/login.md) |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | SON object that contains a `results` field with a JSON array that lists the objects. When the error happens during the read, the [error](errors.md) property is added in the response |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 404 | Query Function Not Found | [error object](errors.md) |

### Example

Example execution of the `sys.Echo` query function with arguments: `{"Text": "Hello world"}` :

```http
GET /api/v2/apps/test1/app1/workspaces/140737488486402/queries/sys.Echo?args=%7B%22Text%22%3A%22Hello+world%22%7D
```

Response:

```json
{ 
  "results": [
    {
      "Res":"Hello world",
      "sys.Container":"Hello world",
      "sys.QName":"sys.EchoResult" 
    }
  ]
}
```
