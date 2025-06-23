---
reqmd.package: server.devices
---

# Create device

## Motivation

Create(register) a new device

## Functional design

POST `/api/v2/apps/{owner}/{app}/devices`

### Headers

| Key | Value |
| --- | --- |
| Authorization | Bearer {principalToken} |
| Content-Type | application/json |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 201 | Created, see response below  | |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

 Response example 201:

```json
{
  "login": "{generated-login}",
  "password": "{generated-password}"
}
```

To fetch the WSID of a profile, the caller should use the [/auth/login](../authnz/login.md) endpoint with the generated login and password.

## Technical design

### Components

- pkg/router
  - URL path handler `~cmp.routerDevicesCreatePathHandler~`covrd[^1]✅:
    - parses the request Body
    - generates, login, password and pseudo-wsid
    - sends v2 request `c.registry.CreateLogin` to Command Processor
    - handles the response and replies with the login and Password
- pkg/sys/it
  - integration test for /users
    - `~it.TestDevicesCreate~`covrd[^2]✅

[^1]: `[~server.devices/cmp.routerDevicesCreatePathHandler~impl]` [pkg/router/impl_apiv2.go:425:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L425)
[^2]: `[~server.devices/it.TestDevicesCreate~impl]` [pkg/sys/it/impl_signupin_test.go:201:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_signupin_test.go#L201)
