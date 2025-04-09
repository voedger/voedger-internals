# Execute Command

## Motivation
Execute a command using API

## Functional Design
POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/commands/{pkg}.{command}`

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
Command arguments in JSON format, with optional "args" and "unloggedArgs" fields:
```json
{
    "args": {
        "key1": "value1",
        "key2": "value2"
    },
    "unloggedArgs": {
        "password": "myPassword",
    }
}
```

### Result
| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | current WLog offset, see example below |
| 400 | Bad Request, e.g. Record requires sys.ParentID | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |

Example result 200:
```json
{
    "CurrentWLogOffset":114,
}
```
