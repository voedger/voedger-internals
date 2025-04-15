---
reqmd.package: server.apiv2.auth
---
# Refresh principal token

## Motivation

Refreshes a valid principal token

## Functional design

POST `/api/v2/apps/{owner}/{app}/auth/refresh`

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

### Result

| Code | Description | Body
| --- | --- | --- |
| 200 | OK | Returns an updated access token, see below |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
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
  - URL path handler `~cmp.routerRefreshHandler~`covered[^1]✅
- pkg/processors/query2
  - `IApiPathHandler` implementation for handling `APIPath_Auth_Refresh`
    - `~cmp.authRefreshHandler~`covered[^2]✅
    - handler extracts profile WSID from token and replaces it in the request
      - `~cmp.authRefreshHandler.WSID~`covered[^5]✅
  - `newQueryProcessorPipeline`: provide API handler for `APIPath_Auth_Refresh`
    - `~cmp.provideAuthRefreshHandler~`covered[^3]✅
- pkg/sys/it
  - integration test for /refresh
    - `~it.TestRefresh~`covered[^4]✅

[^1]: `[~server.apiv2.auth/cmp.routerRefreshHandler~impl]` [server/apiv2/refresh.md:66:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/refresh.md#L66)
[^2]: `[~server.apiv2.auth/cmp.authRefreshHandler~impl]` [server/apiv2/refresh.md:67:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/refresh.md#L67)
[^3]: `[~server.apiv2.auth/cmp.provideAuthRefreshHandler~impl]` [server/apiv2/refresh.md:68:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/refresh.md#L68)
[^4]: `[~server.apiv2.auth/it.TestRefresh~impl]` [server/apiv2/refresh.md:69:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/refresh.md#L69)
[^5]: `[~server.apiv2.auth/cmp.authRefreshHandler.WSID~impl]` [server/apiv2/refresh.md:70:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/refresh.md#L70)
