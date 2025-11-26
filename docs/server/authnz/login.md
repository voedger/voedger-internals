---
reqmd.package: server.authnz
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
  "login": "login",
  "password": "password"
}
```

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Returns an access token, see below |
| 400 | Bad Request | [error object](../apiv2/errors.md) |
| 401 | Unauthorized | [error object](../apiv2/errors.md) |
| 409 | the profile workspace is not yet ready, repeat the request | [error object](../apiv2/errors.md) |
| 429 | Too may requests, rate limiting | [error object](../apiv2/errors.md) |
| 500+ | Server errors / service unavailable | [error object](../apiv2/errors.md) |

Example result 200:

```json
{
  "principalToken": "abc.def.ghi",
  "expiresInSeconds": 3600, // seconds
  "profileWSID": 1234567890
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
    - `~cmp.authLoginHandler~`covrd[^2]✅
      1) using login from the argument, generates pseudo-WSID
      2) makes federation post to registry to issue a token
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Login`
    - `~cmp.provideAuthLoginHandler~`covrd[^3]✅
  - openapi:
    - add `/auth/login` to the list of API paths; `~cmp.provideAuthLoginPath~`covrd[^4]✅
    - add PrincipalToken component schema; `~cmp.principalTokenSchema~`covrd[^5]✅
- pkg/sys/it
  - integration test for /login
    - `~it.TestLogin~`covrd[^6]✅

[^1]: `[~server.authnz/cmp.routerLoginPathHandler~impl]` [pkg/router/impl_apiv2.go:459:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L459)
[^2]: `[~server.authnz/cmp.authLoginHandler~impl]` [pkg/processors/query2/impl_auth_login_handler.go:20:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_auth_login_handler.go#L20)
[^3]: `[~server.authnz/cmp.provideAuthLoginHandler~impl]` [pkg/processors/query2/impl.go:142:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl.go#L142)
[^4]: `[~server.authnz/cmp.provideAuthLoginPath~impl]` [pkg/processors/query2/impl_openapi.go:419:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_openapi.go#L419)
[^5]: `[~server.authnz/cmp.principalTokenSchema~impl]` [pkg/processors/query2/impl_openapi.go:154:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_openapi.go#L154)
[^6]: `[~server.authnz/it.TestLogin~impl]` [pkg/sys/it/impl_qpv2_test.go:2539:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_qpv2_test.go#L2539)
