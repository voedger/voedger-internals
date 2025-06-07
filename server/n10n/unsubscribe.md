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
