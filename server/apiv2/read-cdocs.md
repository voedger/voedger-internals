# Read from CDoc collection
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}`

Reads CDoc collection

## Parameters
See: [Query constraints](query-constraints.md)

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | JSON object that contains a `results` field with a JSON array that lists the objects, [example](query-constraints.md#response). When the error happens during the read, the [error](README.md#errors) property is added in the response |
| 401 | Unauthorized | [error object](README.md#errors) |
| 403 | Forbidden | [error object](README.md#errors) |
| 404 | Table Not Found | [error object](README.md#errors) |

