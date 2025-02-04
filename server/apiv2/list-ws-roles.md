# List workspace roles

GET `/api/v2/users/{owner}/apps/{app}/schemas/{pkg}.{workspace}/roles`

Returns the list of [published roles](../authnz/README.md#published-roles) in the workspace.

## Headers
| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | Principal Token |
| Accept | application/json | To get the response in JSON format |
| Accept | text/markdown | To get the response in Markdown format |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | roles in the selected format |
| 400 | Bad Request | [error object](conventions.md#errors) |

## See Also
- [Read workspace role schema](read-ws-role-schema.md)
- [List app workspaces](list-app-workspaces.md)