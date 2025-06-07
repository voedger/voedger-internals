---
reqmd.package: server.authnz
---
# Refresh principal token

## Motivation

Refreshes a valid principal token

## Functional design

POST `/api/v2/apps/{owner}/{app}/auth/refresh`

### Headers

| Key | Value |
| --- | --- |
| Content-Type | application/json |
| Authorization | Bearer {PrincipalToken} |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Returns a refreshed principal token, see below |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

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
  - URL path handler `~cmp.routerRefreshHandler~`covrd[^1]✅
    - sends `APIPath_Auth_Refresh` request to QueryProcessor;
- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `APIPath_Auth_Refresh` in the AppWorkspace
    - `~cmp.authRefreshHandler~`covrd[^2]✅
      1) extracts profile WSID from token and makes federation post to refresh token:
      2) sends federation request to refresh token: `~cmp.authRefreshHandler.refreshToken~`uncvrd[^5]❓
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Refresh`
    - `~cmp.provideAuthRefreshHandler~`covrd[^3]✅
  - openapi:
    - add `/auth/refresh` to the list of API paths; `~cmp.provideAuthRefreshPath~`covrd[^6]✅
- pkg/sys/it
  - integration test for /refresh
    - `~it.TestRefresh~`covrd[^4]✅

[^1]: `[~server.authnz/cmp.routerRefreshHandler~impl]` [pkg/router/impl_apiv2.go:376:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L376)
[^2]: `[~server.authnz/cmp.authRefreshHandler~impl]` [pkg/processors/query2/impl_auth_refresh_handler.go:17:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_auth_refresh_handler.go#L17)
[^5]: `[~server.authnz/cmp.authRefreshHandler.refreshToken~impl]`
[^3]: `[~server.authnz/cmp.provideAuthRefreshHandler~impl]` [pkg/processors/query2/impl.go:145:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl.go#L145)
[^6]: `[~server.authnz/cmp.provideAuthRefreshPath~impl]` [pkg/processors/query2/impl_openapi.go:458:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/query2/impl_openapi.go#L458)
[^4]: `[~server.authnz/it.TestRefresh~impl]` [pkg/sys/it/impl_qpv2_test.go:2625:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_qpv2_test.go#L2625)
