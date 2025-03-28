---
reqmd.package: server.apiv2.docs
---

# Read document or record
## Motivation
Read CDoc/WDoc/CRecord/WRecord using API

## Functional design
GET `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}`

### Parameters
The following [query constraints](query-constraints.md) can be used:
- include
- keys

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

### Result
| Code | Description | Body 
| --- | --- | --- |
| 200 | OK | CDoc/WDoc/CRecord/WRecord object |
| 400 | Bad requeset | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 404 | Document not found | [error object](conventions.md#errors) |

## Technical design

### Components

- pkg/processors/query2
    - `IApiPathHandler` implementation for handling `ApiPath_Docs`
        - `~docsHandler~`
    - `newQueryProcessorPipeline`: provide API handler for `ApiPath_Docs`
        - `~provideDocsHandler~`
- pkg/sys/it
    - integration test for /docs/
        - `~TestQueryProcessor2_Docs~`