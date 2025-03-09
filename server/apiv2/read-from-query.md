# Read from Query
## Motivation
Read from a query function using API

## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/queries/{pkg}.{query}`

### Parameters
- [Query constraints](query-constraints.md)
- Optional query function argument `&arg=...`

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
| pkg, query | string | identifies a query |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | SON object that contains a `results` field with a JSON array that lists the objects, [example](query-constraints.md#response). When the error happens during the read, the [error](conventions.md#errors) property is added in the response |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 404 | Query Function Not Found | [error object](conventions.md#errors) |


