---
reqmd.package: server.n10n
---

# Subscribe to an extra view

## Motivation

As a client, I want to add a subscription to a channel, so that I can receive notifications when a specified view changes.

## Functional Design

- The client initiates PUT `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/notifications/{channelId}/subscriptions/{pkg}.{view}`
- The subscription is added to the channel in addition to existing subscriptions, the client starts receiving notifications about changes in the specified view.
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
| pkg | string | package name |
| view | string | view name to receive update notifications from |
| **Headers** | | |
| PrincipalToken | string | Token returned by [login](../apiv2/login.md) |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Channel subscription added |
| 400 | Bad Request | [error object](errors.md) |
| 404 | Not Found | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components
