# List app workspaces
## Motivation
List app workspaces having published roles, using API

## Functional Design
GET `/api/v2/users/{owner}/apps/{app}/schemas`

Returns the hierarchy of non-abstract workspaces in the application with WSProfile as a root.
Only workspaces returned which have resources available to [published roles](../authnz/published-roles.md). 

### Headers
| Key | Value | Description |
| --- | --- | --- |
| Accept | text/html | To get the response in HTML format (default) |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | app workspaces hierarchy in the selected format |
| 400 | Bad Request | [error object](conventions.md#errors) |

## See Also
- [List workspace roles](list-ws-roles.md)
- [Read workspace role schema](read-ws-role-schema.md)
