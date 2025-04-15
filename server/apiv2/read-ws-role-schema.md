---
reqmd.package: server.apiv2.role
---

# Get workspace role schema
## Motivation
Return the schema of the resources, available to specified role in a given workspace.

## Functional Design
GET `/api/v2/apps/{owner}/{app}/schemas/{pkg}.{workspace}/roles/{pkg}.{role}`

If [non-published role](../authnz/published-roles.md) is specified, the user must have `sys.Developer` role in the workspace to see the schema.

### Headers
| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | optional |
| Accept | application/json | To get the response in OpenAPI format (default) |
| Accept | text/html | Shows schema in Swagger UI |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| pkg.workspace | string | identifies a workspace |
| pkg.role | string | identifies a published role |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | role schema in the selected format |
| 400 | Bad Request | [error object](conventions.md#errors) |

## Technical Design
- WorkspaceQName and QName of the role are provided to QPv2 in [QueryMessage](../design/qp.md#qpMessage)
- QPv2 reads the schema of the resources available to the role and generates OpenAPI schema for this role
```mermaid
flowchart
qpMessage>Query Message]:::G
qp[Query Processor]:::G
queryData:::S
appdef[[appdef/acl]]:::S
object[Object]:::S
CreateOpenApiSchema:::S
subgraph qp
    queryData[IApiPathHandler.Exec]:::S
end
qpMessage --> |has to specify role|QName:::S
qpMessage --> |has to specify workspace|WorkspaceQName:::S
QName --> |used by|queryData
WorkspaceQName --> |used by|queryData
queryData --> CreateOpenApiSchema
CreateOpenApiSchema -.-> |"calls PublishedTypes(ws,role)"| appdef
appdef -.-> |types in callback|CreateOpenApiSchema
queryData --> |JSON or HTML, depending on Accept header|object
CreateOpenApiSchema -.-> |OpenAPI json|queryData


%% Styles ====================
classDef B fill:#FFFFB5,color:#333
classDef S fill:#B5FFFF,color:#333
classDef H fill:#C9E7B7,color:#333
classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```
### Components
#### pkg/appdef/acl
New function `PublishedTypes` `~cmp.publishedTypes~`covered[^1]✅
```go
/*
    PublishedTypes lists the resources allowed to the published role in the workspace and ancestors (including resources available to non-authenticated requests):
    - Documents
    - Views
    - Commands
    - Queries

    When fieldNames is empty, it means all fields are allowed
*/
func PublishedTypes(ws appdef.IWorkspace, role appdef.QName) iter.Seq2[appdef.IType,
  iter.Seq2[appdef.OperationKind, *[]appdef.FieldName]] {
…
}
```

Usage:
```go
import "github.com/voedger/voedger/pkg/appdef/acl"

for t, ops := range acl.PublishedTypes(ws, role) {
  for op, fields := range ops {
    if fields == nil {
      fmt.Println(t, op, "all fields")
    } else {
      fmt.Println(t, op, *fields...)
    }
  }
}
```
#### pkg/processors/query2
##### 1. `IApiPathHandler` implementation for handling `ApiPath_Schemas_WorkspaceRole`
`~cmp.schemasRoleHandler~`covered[^2]✅

##### 2. `newQueryProcessorPipeline`: provide API handler for `ApiPath_Schemas_WorkspaceRole`
`~cmp.provideSchemasRoleHandler~`covered[^3]✅

##### 3. New function `CreateOpenApiSchema` 
```go
type SchemaMeta struct {
    schemaTitle string
    schemaVerstion string
}

type PublishedTypesFunc func(ws appdef.IWorkspace, role appdef.QName) iter.Seq2[appdef.IType,
  iter.Seq2[appdef.OperationKind, *[]appdef.FieldName]]

func CreateOpenApiSchema(writer io.Wrter, ws appdef.IWorkspace, role appdef.QName, 
      pubTypesFunc PublishedTypesFunc, meta SchemaMeta) error
```
`~cmp.CreateOpenApiSchema~`covered[^4]✅

##### 4. pkg/sys/it
integration test `~it.TestQueryProcessor2_SchemasRole~`covered[^5]✅

## See Also
- [design: QPv2](../design/qp.md#query-processor-v2-apiv2)
- [List workspace roles](list-ws-roles.md)
- [List app workspaces](list-app-workspaces.md)

[^1]: `[~server.apiv2.role/cmp.publishedTypes~impl]` [server/apiv2/read-ws-role-schema.md:129:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-ws-role-schema.md#L129)
[^2]: `[~server.apiv2.role/cmp.schemasRoleHandler~impl]` [server/apiv2/read-ws-role-schema.md:130:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-ws-role-schema.md#L130)
[^3]: `[~server.apiv2.role/cmp.provideSchemasRoleHandler~impl]` [server/apiv2/read-ws-role-schema.md:131:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-ws-role-schema.md#L131)
[^4]: `[~server.apiv2.role/cmp.CreateOpenApiSchema~impl]` [server/apiv2/read-ws-role-schema.md:132:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-ws-role-schema.md#L132)
[^5]: `[~server.apiv2.role/it.TestQueryProcessor2_SchemasRole~impl]` [server/apiv2/read-ws-role-schema.md:133:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/read-ws-role-schema.md#L133)
