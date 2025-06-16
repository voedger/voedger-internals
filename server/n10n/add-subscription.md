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
| 400 | Bad Request | [error object](errors.md) |
| 403 | Forbidden, client has no permissions to read from view | [error object](errors.md) |
| 404 | Not Found | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components

#### pkg/router

url path handler

#### pkg/sys/it

integration tests
