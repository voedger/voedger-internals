# Get workspace role schema
## Motivation
Returns the schema of the resources, available to specified [published role](../authnz/published-roles.md) in a given workspace.


## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/schemas/{pkg}.{workspace}/roles/{pkg}.{role}`

### Headers
| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | Principal Token |
| Accept | application/json | To get the response in OpenAPI format |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | role schema in the selected format |
| 400 | Bad Request | [error object](README.md#errors) |

## Technical Design
- WorkspaceQName and QName of the role are provided to QPv2 in [QueryMessage](../design/qp.md#qpMessage)
- QPv2 reads the schema of the resources available to the role and returns it in the OpenAPI format

## See Also
- [List workspace roles](list-ws-roles.md)
- [List app workspaces](list-app-workspaces.md)