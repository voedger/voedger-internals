---
reqmd.package: server.apiv2.auth
---

# Issue Principal Token (Login)

## Motivation

Issue (create) a new principal token in exchange for valid credentials.

## Functional Design

POST `/api/v2/apps/{owner}/{app}/auth/login`

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
  "Login": "login",
  "Password": "password"
}
```

### Result

| Code | Description | Body
| --- | --- | --- |
| 200 | OK | Returns an access token, see below |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 429 | Too may requests, rate limiting | [error object](conventions.md#errors) |
| 500+ | Server errors / service unavailable | [error object](conventions.md#errors) |

Example result 200:
```json
{
  "PrincipalToken": "abc.def.ghi",
  "ExpiresIn": 3600, // seconds
  "WSID": 1234567890
}
```

## Technical design

### Components

- pkg/router
  - URL path handler `~cmp.routerLoginPathHandler~`uncvrd[^1]❓:
    - parses the request Body and URL parameters; calculates pseudo-wsid;
      - `~cmp.routerLoginPathHandler.pseudoWSID~`uncvrd[^5]❓
    - sends request to `registry` app by calling IssuePrincipalToken function;
- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `APIPath_Auth_Login`
    - `~cmp.authLoginHandler~`uncvrd[^3]❓
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Login`
    - `~cmp.provideAuthLoginHandler~`uncvrd[^4]❓
- pkg/sys/it
  - integration test for /login
    - `~it.TestLogin~`uncvrd[^2]❓

[^1]: `[~server.apiv2.auth/cmp.routerLoginPathHandler~impl]`
[^2]: `[~server.apiv2.auth/it.TestLogin~impl]`
[^3]: `[~server.apiv2.auth/cmp.authLoginHandler~impl]`
[^4]: `[~server.apiv2.auth/cmp.provideAuthLoginHandler~impl]`
[^5]: `[~server.apiv2.auth/cmp.routerLoginPathHandler.pseudoWSID~impl]`
