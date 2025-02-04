# List app workspaces
GET `/api/v2/users/{owner}/apps/{app}/schemas`

Returns the hierarchy of non-abstract workspaces in the application with WSProfile as a root.
Only workspaces returned which have resources available to [published roles](../authnz/README.md#published-roles). 

## Headers
| Key | Value | Description |
| --- | --- | --- |
| Authorization | Bearer {PrincipalToken} | Principal Token |
| Accept | application/json | To get the response in JSON format |
| Accept | text/markdown | To get the response in Markdown format |

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | app workspaces hierarchy in the selected format |
| 400 | Bad Request | [error object](README.md#errors) |

## See Also
- [List workspace roles](list-ws-roles.md)
- [Read workspace role schema](read-ws-role-schema.md)
