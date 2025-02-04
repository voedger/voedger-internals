# Get workspace role schema
GET `/api/v2/users/{owner}/apps/{app}/schemas/{pkg}.{workspace}/roles/{pkg}.{role}`

Returns the schema of the resources, available to specified [published role](../authnz/README.md#published-roles) in a given workspace.

## Headers
| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | Principal Token |
| Accept | application/json | To get the response in OpenAPI format |
| Accept | text/markdown | To get the response in Markdown format |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | role schema in the selected format |
| 400 | Bad Request | [error object](README.md#errors) |

## See Also
- [List workspace roles](list-ws-roles.md)
- [List app workspaces](list-app-workspaces.md)