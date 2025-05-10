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
| Content-Type | application/json |

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

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Returns an access token, see below |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

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
  - URL path handler `~cmp.routerLoginPathHandler~`covrd[^1]✅:
    - reads Login and Password from the Body;
    - sends `APIPath_Auth_Login` request to QueryProcessor;
- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `APIPath_Auth_Login`
    - `~cmp.authLoginHandler~`covrd[^3]✅
      1) using login from the argument, generates pseudo-WSID
      2) makes federation post to registry to issue a token
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Login`
    - `~cmp.provideAuthLoginHandler~`covrd[^4]✅
  - openapi:
    - add `/auth/login` to the list of API paths; `~cmp.provideAuthLoginPath~`covrd[^6]✅
    - add PrincipalToken component schema; `~cmp.principalTokenSchema~`covrd[^7]✅
- pkg/sys/it
  - integration test for /login
    - `~it.TestLogin~`covrd[^2]✅

[^1]: `[~server.apiv2.auth/cmp.routerLoginPathHandler~impl]` [pkg/router/impl_apiv2.go:230:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L230)
[^2]: `[~server.apiv2.auth/it.TestLogin~impl]` [pkg/sys/it/impl_qpv2_test.go:2250:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_qpv2_test.go#L2250)
[^3]: `[~server.apiv2.auth/cmp.authLoginHandler~impl]` [pkg/processors/query2/impl_auth_login_handler.go:20:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_auth_login_handler.go#L20)
[^4]: `[~server.apiv2.auth/cmp.provideAuthLoginHandler~impl]` [pkg/processors/query2/impl.go:142:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl.go#L142)
[^6]: `[~server.apiv2.auth/cmp.provideAuthLoginPath~impl]` [pkg/processors/query2/impl_openapi.go:238:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_openapi.go#L238)
[^7]: `[~server.apiv2.auth/cmp.principalTokenSchema~impl]` [pkg/processors/query2/impl_openapi.go:131:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_openapi.go#L131)
