---
reqmd.package: server.n10n
---

# Unsubscribe from a view

## Motivation

As a client, I want to remove a subscription from an existing channel, so that I stop receiving notifications when a specified entity.

## Functional Design

- The client initiates DELETE `/api/v2/apps/{owner}/{app}/notifications/{channelId}/workspaces/{wsid}/subscriptions/{entity}`
- The subscription is removed from the channel, the client stops receiving notifications about changes in the specified entity.

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

### Result

| Code | Description | Body |
| --- | --- | --- |
| 204 | Unsubscribed |  |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 404 | Not Found | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components

- `~cmp.routerUnsubscribeHandler~`covrd[^1]✅ function to handle the request in router
  - - `~err.routerUnsubscribeInvalidToken~`covrd[^3]✅

### Integration tests

- `~it.Unsubscribe~`covrd[^2]✅

[^1]: `[~server.n10n/cmp.routerUnsubscribeHandler~impl]` [pkg/router/impl_apiv2.go:163:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L163)
[^2]: `[~server.n10n/it.Unsubscribe~impl]` [pkg/sys/it/impl_n10n_test.go:91:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_n10n_test.go#L91)
[^3]: `[~server.n10n/err.routerUnsubscribeInvalidToken~impl]` [pkg/router/impl_apiv2.go:342:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L342)
