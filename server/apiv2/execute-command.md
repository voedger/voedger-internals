# Execute Command
POST `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/commands/{pkg}.{command}`

Executes a command 

## Headers
| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-type | application/json |

## Body
Command parameter or ODoc

## Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset, see example below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](README.md#errors) |
| 401 | Unauthorized | [error object](README.md#errors) |

Example result 200:
```json
{
    "CurrentWLogOffset":114,
}
```
