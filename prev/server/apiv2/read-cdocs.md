---
reqmd.package: server.apiv2.docs
---

# Read from CDoc collection

## Motivation

Read CDoc collection using API

## Functional design

GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/cdocs/{pkg}.{table}`

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

Also supports [Query constraints](query-constraints.md)

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | JSON object that contains a `results` field with a JSON array that lists the objects, [example](query-constraints.md#response). When the error happens during the read, the [error](errors.md) property is added in the response |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 404 | Table Not Found | [error object](errors.md) |

## Technical design

### Components

- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `ApiPath_CDocs`
    - `~cmp.cdocsHandler~`covrd[^1]✅
  - `newQueryProcessorPipeline`: provide API handler for `ApiPath_CDocs`
    - `~cmp.provideCDocsHandler~`covrd[^2]✅
  - check ACL when including referenced objects and/or containers (same as for [/docs](./read-doc.md#components))
- pkg/sys/it
  - integration test for /cdocs/
    - `~it.TestQueryProcessor2_CDocs~`covrd[^3]✅

[^1]: `[~server.apiv2.docs/cmp.cdocsHandler~impl]` [pkg/processors/query2/impl_cdocs_handler.go:23:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_cdocs_handler.go#L23)
[^2]: `[~server.apiv2.docs/cmp.provideCDocsHandler~impl]` [pkg/processors/query2/impl.go:139:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl.go#L139)
[^3]: `[~server.apiv2.docs/it.TestQueryProcessor2_CDocs~impl]` [pkg/sys/it/impl_qpv2_test.go:2502:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_qpv2_test.go#L2502)
