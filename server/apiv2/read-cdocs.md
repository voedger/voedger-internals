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
    - `~cmp.cdocsHandler~`covered[^1]✅
  - `newQueryProcessorPipeline`: provide API handler for `ApiPath_CDocs`
    - `~cmp.provideCDocsHandler~`covered[^2]✅
  - check ACL when including referenced objects and/or containers (same as for [/docs](./read-doc.md#components))
- pkg/sys/it
  - integration test for /cdocs/
    - `~it.TestQueryProcessor2_CDocs~`covered[^3]✅

[^1]: `[~server.apiv2.docs/cmp.cdocsHandler~impl]` [server/apiv2/read-cdocs.md:55:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-cdocs.md#L55)
[^2]: `[~server.apiv2.docs/cmp.provideCDocsHandler~impl]` [server/apiv2/read-cdocs.md:56:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-cdocs.md#L56)
[^3]: `[~server.apiv2.docs/it.TestQueryProcessor2_CDocs~impl]` [server/apiv2/read-cdocs.md:57:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-cdocs.md#L57)
