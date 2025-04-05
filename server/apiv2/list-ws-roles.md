# List workspace roles
## Motivation
Return the list of roles in the workspace, using API

## Functional Design
GET `/api/v2/apps/{owner}/{app}/schemas/{pkg}.{workspace}/roles`

If Authorization header is provided, and user has `sys.Developer` role, the list of all roles in the workspace is returned.
Otherwise, only [published roles](../authnz/published-roles.md) are returned.

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
| pkg.workspace | string | identifies a workspace |

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | roles in the selected format |
| 400 | Bad Request | [error object](conventions.md#errors) |

## See Also
- [Read workspace role schema](read-ws-role-schema.md)
- [List app workspaces](list-app-workspaces.md)