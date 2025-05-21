---
reqmd.package: server.n10n
---

# Unsubscribe from a view

## Motivation

As a client, I want to remove a subscription to a view from a channel, so that I stop receiving notifications when a specified view changes.

## Functional Design

- The client initiates DELETE `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/notifications/{channelId}/subscriptions/{pkg}.{view}`
- The subscription is removed from the channel, the client stops receiving notifications about changes in the specified view.

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
| pkg | string | package name |
| view | string | view name to receive update notifications from |
| **Headers** | | |
| PrincipalToken | string | Token returned by [login](../apiv2/login.md) |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Channel subscription added |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 404 | Not Found | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components
