---
reqmd.package: server.apiv2.docs
---

# Read from CDoc collection
## Motivation
Read CDoc collection using API

## Functional design
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/cdocs/{pkg}.{table}`

### Parameters
See: [Query constraints](query-constraints.md)

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
| pkg, table | string | identifies a table |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | JSON object that contains a `results` field with a JSON array that lists the objects, [example](query-constraints.md#response). When the error happens during the read, the [error](conventions.md#errors) property is added in the response |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 404 | Table Not Found | [error object](conventions.md#errors) |

## Technical design

### Components

- pkg/processors/query2
    - `IApiPathHandler` implementation for handling `ApiPath_CDocs`
        - `~cmp.cdocsHandler~`uncvrd[^1]❓
    - `newQueryProcessorPipeline`: provide API handler for `ApiPath_CDocs`
        - `~cmp.provideCDocsHandler~`uncvrd[^2]❓
- pkg/sys/it
    - integration test for /cdocs/
        - `~it.TestQueryProcessor2_CDocs~`uncvrd[^3]❓

[^1]: `[~server.apiv2.docs/cmp.cdocsHandler~impl]`
[^2]: `[~server.apiv2.docs/cmp.provideCDocsHandler~impl]`
[^3]: `[~server.apiv2.docs/it.TestQueryProcessor2_CDocs~impl]`
