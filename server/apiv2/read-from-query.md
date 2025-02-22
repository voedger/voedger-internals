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

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | SON object that contains a `results` field with a JSON array that lists the objects, [example](query-constraints.md#response). When the error happens during the read, the [error](README.md#errors) property is added in the response |
| 401 | Unauthorized | [error object](README.md#errors) |
| 403 | Forbidden | [error object](README.md#errors) |
| 404 | Query Function Not Found | [error object](README.md#errors) |


