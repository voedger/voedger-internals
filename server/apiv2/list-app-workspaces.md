---
reqmd.package: server.apiv2.schemas
---

# List app workspaces

## Motivation

List app workspaces, using API

## Functional Design

GET `/api/v2/apps/{owner}/{app}/schemas`

Returns the hierarchy of non-abstract workspaces in the application with WSProfile as a root.
If Authorization header is provided, and user has `sys.Developer` role, the hierarchy of all workspaces in the application is returned.
Otherwise, only workspaces returned which have resources available to [published roles](../authnz/published-roles.md).

### Headers

| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | optional |
| Accept | text/html | To get the response in HTML format (default) |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | app workspaces hierarchy in the selected format |
| 400 | Bad Request | [error object](errors.md) |

## See Also

- [List workspace roles](list-ws-roles.md)
- [Read workspace role schema](read-ws-role-schema.md)

## Technical design

### Components

#### pkg/processors/query2

##### `IApiPathHandler` implementation for handling `ApiPath_Schemas`

- `~cmp.schemasHandler~`uncvrd[^1]❓

##### `newQueryProcessorPipeline`: provide API handler for `ApiPath_Schemas`

- `~cmp.provideSchemasHandler~

##### pkg/sys/it

- integration test `~it.TestQueryProcessor2_Schemas~`uncvrd[^2]❓

[^1]: `[~server.apiv2.schemas/cmp.schemasHandler~impl]`
[^2]: `[~server.apiv2.schemas/it.TestQueryProcessor2_Schemas~impl]`
