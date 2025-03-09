# Read from View
## Motivation
Read from a view using API

## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/views/{pkg}.{view}`

### Parameters
- [Query constraints](request.md)

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
| pkg, view | string | identifies a view |

### Limitations
-  "where" must contain "eq" or "in" condition for PK fields

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | SON object that contains a `results` field with a JSON array that lists the objects, [example](query-constraints.md#response). When the error happens during the read, the [error](conventions.md#errors) property is added in the response |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 404 | View Not Found | [error object](conventions.md#errors) |

### Example
`GET /api/v2/users/untill/apps/airs-bp3/workspaces/12313123123/views/air.SalesMetrics?where={"Year":2024, "Month":{"$in":[1,2,3]}}`
