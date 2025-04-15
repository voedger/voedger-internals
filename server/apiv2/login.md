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
    - reads Login and Password from the Body;
    - sends `APIPath_Auth_Login` request to QueryProcessor;
- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `APIPath_Auth_Login`
    - `~cmp.authLoginHandler~`covered[^3]✅
      1) using login from the argument, generates pseudo-WSID
      2) makes federation post to registry to issue a token
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Login`
    - `~cmp.provideAuthLoginHandler~`covered[^4]✅
  - openapi:
    - add `/auth/login` to the list of API paths; `~cmp.provideAuthLoginPath~`covered[^6]✅
    - add PrincipalToken component schema; `~cmp.principalTokenSchema~`covered[^7]✅
- pkg/sys/it
  - integration test for /login
    - `~it.TestLogin~`covered[^2]✅

[^1]: `[~server.apiv2.auth/cmp.routerLoginPathHandler~impl]` [pkg/router/impl_apiv2.go:95:impl](https://github.com/voedger/voedger/blob/014f9cafbf7184f24568d65b2e2fc05c3f8cb68f/pkg/router/impl_apiv2.go#L95)
[^2]: `[~server.apiv2.auth/it.TestLogin~impl]` [pkg/sys/it/impl_qpv2_test.go:2159:impl](https://github.com/voedger/voedger/blob/014f9cafbf7184f24568d65b2e2fc05c3f8cb68f/pkg/sys/it/impl_qpv2_test.go#L2159)
[^3]: `[~server.apiv2.auth/cmp.authLoginHandler~impl]` [pkg/processors/query2/impl_auth_login_handler.go:21:impl](https://github.com/voedger/voedger/blob/8579f87daebfb5c06216aa80eeec75d158bd7c99/pkg/processors/query2/impl_auth_login_handler.go#L21)
[^4]: `[~server.apiv2.auth/cmp.provideAuthLoginHandler~impl]` [pkg/processors/query2/impl.go:139:impl](https://github.com/voedger/voedger/blob/8579f87daebfb5c06216aa80eeec75d158bd7c99/pkg/processors/query2/impl.go#L139)
[^6]: `[~server.apiv2.auth/cmp.provideAuthLoginPath~impl]` [pkg/processors/query2/impl_openapi.go:231:impl](https://github.com/voedger/voedger/blob/014f9cafbf7184f24568d65b2e2fc05c3f8cb68f/pkg/processors/query2/impl_openapi.go#L231)
[^7]: `[~server.apiv2.auth/cmp.principalTokenSchema~impl]` [pkg/processors/query2/impl_openapi.go:129:impl](https://github.com/voedger/voedger/blob/014f9cafbf7184f24568d65b2e2fc05c3f8cb68f/pkg/processors/query2/impl_openapi.go#L129)
