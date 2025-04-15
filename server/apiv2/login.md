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
  - URL path handler `~cmp.routerLoginPathHandler~`covered[^1]✅:
    - parses the request Body and URL parameters; calculates pseudo-wsid;
      - `~cmp.routerLoginPathHandler.pseudoWSID~`covered[^5]✅
    - sends request to `registry` app by calling IssuePrincipalToken function;
- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `APIPath_Auth_Login`
    - `~cmp.authLoginHandler~`covered[^3]✅
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Login`
    - `~cmp.provideAuthLoginHandler~`covered[^4]✅
  - openapi:
    - add `/auth/login` to the list of API paths; `~cmp.provideAuthLoginPath~`covered[^6]✅
    - add PrincipalToken component schema; `~cmp.principalTokenSchema~`covered[^7]✅
- pkg/sys/it
  - integration test for /login
    - `~it.TestLogin~`covered[^2]✅

[^1]: `[~server.apiv2.auth/cmp.routerLoginPathHandler~impl]` [server/apiv2/login.md:78:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L78)
[^2]: `[~server.apiv2.auth/it.TestLogin~impl]` [server/apiv2/login.md:79:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L79)
[^3]: `[~server.apiv2.auth/cmp.authLoginHandler~impl]` [server/apiv2/login.md:80:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L80)
[^4]: `[~server.apiv2.auth/cmp.provideAuthLoginHandler~impl]` [server/apiv2/login.md:81:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L81)
[^5]: `[~server.apiv2.auth/cmp.routerLoginPathHandler.pseudoWSID~impl]` [server/apiv2/login.md:82:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L82)
[^6]: `[~server.apiv2.auth/cmp.provideAuthLoginPath~impl]` [server/apiv2/login.md:83:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L83)
[^7]: `[~server.apiv2.auth/cmp.principalTokenSchema~impl]` [server/apiv2/login.md:84:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/login.md#L84)
