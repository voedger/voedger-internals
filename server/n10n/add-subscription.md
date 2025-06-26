---
reqmd.package: server.n10n
---

# Subscribe to an extra view

## Motivation

As a client, I want to add a subscription to an existing channel

## Functional Design

- The client initiates PUT `/api/v2/apps/{owner}/{app}/notifications/{channelId}/workspaces/{wsid}/subscriptions/{entity}`
- The subscription is added to the channel in addition to existing subscriptions, the client starts receiving notifications about changes in the specified entity.
- If the subscription already exists, it does nothing

### Request headers

| Key | Value |
| --- | --- |
| Content-Type | application/json |
| Authorization | Bearer {PrincipalToken} |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| **Path** | | |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| channelId | string | the ID of the channel, returned by [create channel](./create-channel.md) |
| entity | string | Subscription entity, see [terms](./create-channel.md#terms) |
| **Headers** | | |
| PrincipalToken | string | Token returned by [login](../apiv2/login.md) |

### Authorization

- If entity refers to a view, the client must have `read` permission for that view in the specified workspace.

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Channel subscription added |
| 400 | Bad Request | [error object](../apiv2/errors.md) |
| 401 | Unauthorized | [error object](../apiv2/errors.md) |
| 403 | Forbidden, client has no permissions to read from view | [error object](../apiv2/errors.md) |
| 404 | Not Found | [error object](../apiv2/errors.md) |
| 429 | Too may requests, rate limiting | [error object](../apiv2/errors.md) |
| 500+ | Server errors / service unavailable | [error object](../apiv2/errors.md) |

## Technical design

### Components

- `~cmp.routerAddSubscriptionHandler~`covrd[^1]✅ function to handle the request in router
  - `~err.routerAddSubscriptionInvalidToken~`covrd[^3]✅ if the token is invalid or expired
  - `~err.routerAddSubscriptionNoPermissions~`uncvrd[^4]❓ if the client has no permissions to read from the specified view

### Integration tests

- `~it.AddSubscription~`covrd[^2]✅

[^1]: `[~server.n10n/cmp.routerAddSubscriptionHandler~impl]` [pkg/router/impl_apiv2.go:170:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L170)
[^2]: `[~server.n10n/it.AddSubscription~impl]` [pkg/sys/it/impl_n10n_test.go:414:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_n10n_test.go#L414)
[^3]: `[~server.n10n/err.routerAddSubscriptionInvalidToken~impl]` [pkg/router/impl_apiv2.go:341:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L341)
[^4]: `[~server.n10n/err.routerAddSubscriptionNoPermissions~impl]`
