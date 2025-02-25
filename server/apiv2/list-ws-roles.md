# List workspace roles
## Motivation
Return the list of [published roles](../authnz/published-roles.md) in the workspace, using API

## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/schemas/{pkg}.{workspace}/roles`

### Headers
| Key | Value | Description |
| --- | --- | --- |
| Accept | text/html | To get the response in HTML format (default) |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | roles in the selected format |
| 400 | Bad Request | [error object](conventions.md#errors) |

## See Also
- [Read workspace role schema](read-ws-role-schema.md)
- [List app workspaces](list-app-workspaces.md)