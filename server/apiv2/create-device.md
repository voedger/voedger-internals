---
reqmd.package: server.apiv2.devices
---

# Create device
## Motivation
Create(register) a new device
## Functional design
POST `/api/v2/apps/{owner}/{app}/devices`

### Headers
| Key | Value |
| --- | --- |
| Content-type | application/json |
| Authorization | Bearer {PrincipalToken} |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Body
JSON object: 
```json
{
  "DisplayName": "name"
}
```

### Result
| Code | Description | Body
| --- | --- | --- |
| 201 | Created, see response below  |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 429 | Too may requests, rate limiting | [error object](conventions.md#errors) |
| 500+ | Server errors / service unavailable | [error object](conventions.md#errors) |
 
 Response example 201:
```json
{
  "Login": "generated-login",
  "Password": "generated-password",
}
```

## Technical design
### Components
- pkg/router
  - URL path handler `~cmp.routerDevicesCreatePathHandler~`uncvrd[^1]❓:
    - parses the request Body and URL parameters; generates login and password; calculates pseudo-wsid;
    - makes federation query to `registry` app by calling `CreateLogin` function;
    - returns the result, or error, to the client.

- pkg/sys/it
    - integration test for /users
        - `~it.TestDevicesCreate~`uncvrd[^2]❓

[^1]: `[~server.apiv2.devices/cmp.routerDevicesCreatePathHandler~impl]`
[^2]: `[~server.apiv2.devices/it.TestDevicesCreate~impl]`
