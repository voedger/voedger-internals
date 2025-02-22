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
