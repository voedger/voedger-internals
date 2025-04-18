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

| Code | Description | Body |
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
  - URL path handler `~cmp.routerDevicesCreatePathHandler~`uncvrd[^1]❓:
    - parses the request Body
    - generates, login, password and pseudo-wsid
    - sends v2 request `c.registry.CreateLogin` to Command Processor
    - ??? handles the response and replies with the login and Password
- pkg/sys/it
  - integration test for /users
    - `~it.TestDevicesCreate~`uncvrd[^2]❓

[^1]: `[~server.apiv2.devices/cmp.routerDevicesCreatePathHandler~impl]`
[^2]: `[~server.apiv2.devices/it.TestDevicesCreate~impl]`
