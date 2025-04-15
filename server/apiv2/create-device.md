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
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |
 
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
  - URL path handler `~cmp.routerDevicesCreatePathHandler~`covered[^1]✅:
    - parses the request Body and URL parameters; generates login and password; calculates pseudo-wsid;
    - makes federation query to `registry` app by calling `CreateLogin` function;
    - returns the result, or error, to the client.

- pkg/sys/it
  - integration test for /users
    - `~it.TestDevicesCreate~`covered[^2]✅

[^1]: `[~server.apiv2.devices/cmp.routerDevicesCreatePathHandler~impl]` [server/apiv2/create-device.md:60:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-device.md#L60)
[^2]: `[~server.apiv2.devices/it.TestDevicesCreate~impl]` [server/apiv2/create-device.md:61:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-device.md#L61)
