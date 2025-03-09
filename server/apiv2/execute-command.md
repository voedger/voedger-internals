# Execute Command

## Motivation
Execute a command using API

## Functional Design
POST `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/commands/{pkg}.{command}`

### Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | application/json |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| pkg, command | string | identifies a command |

### Body
Command parameter or ODoc

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset, see example below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |

Example result 200:
```json
{
    "CurrentWLogOffset":114,
}
```
