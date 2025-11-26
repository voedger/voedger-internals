---
reqmd.package: server.apiv2.docs
---

# Read document or record

## Motivation

Read CDoc/WDoc/CRecord/WRecord using API

## Functional design

GET `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

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

The following [query constraints](query-constraints.md) can be used:

- include (respects permission on reading from the table or a container)
- keys

### Result

| Code | Description | Body 
| --- | --- | --- |
| 200 | OK | CDoc/WDoc/CRecord/WRecord object |
| 400 | Bad requeset | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 404 | Document not found | [error object](errors.md) |

## Technical design

### Components

- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `ApiPath_Docs`
    - `~cmp.docsHandler~`covrd[^1]✅
  - `newQueryProcessorPipeline`: provide API handler for `ApiPath_Docs`
    - `~cmp.provideDocsHandler~`covrd[^2]✅
  - check ACL when including referenced objects and/or containers `~cmp.includeCheckACL~`uncvrd[^4]❓
- pkg/sys/it
  - integration test for /docs/
    - `~it.TestQueryProcessor2_Docs~`covrd[^3]✅

[^1]: `[~server.apiv2.docs/cmp.docsHandler~impl]` [pkg/processors/query2/impl_docs_handler.go:20:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_docs_handler.go#L20)
[^2]: `[~server.apiv2.docs/cmp.provideDocsHandler~impl]` [pkg/processors/query2/impl.go:129:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl.go#L129)
[^3]: `[~server.apiv2.docs/it.TestQueryProcessor2_Docs~impl]` [pkg/sys/it/impl_qpv2_test.go:2410:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_qpv2_test.go#L2410)
[^4]: `[~server.apiv2.docs/cmp.includeCheckACL~impl]`
