---
reqmd.package: server.n10n
---

# Create channel, subscribe and start watching

## Motivation

As a client, I want to create a channel and subscribe to it, so that I can receive notifications about changes in view(s).

## Functional Design

- The client initiates an SSE connection by making POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/notifications` with tha payload containing the list of views to subscribe to.
- The connection is then kept open, allowing the server to stream events continuously.
- Client receives events, see [Result](#result)

### Request headers

| Key | Value |
| --- | --- |
| Content-Type | application/json |
| Accept | text/event-stream |
| Authorization | Bearer {PrincipalToken} |

### Request body

JSON object:

```json
{
  "Views": [{views}]
  "ExpiresIn": 100, // optional, default is 3600 seconds
}
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| **Path** | | |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| **Headers** | | |
| PrincipalToken | string | Token returned by [login](../apiv2/login.md) |
| **Body** | | |
| views | array of strings | list of views to subscribe to. <br>Example: `"sys.CollectionView", "air.SalesMetrics"` |

### Result

When the connection is established, the server responds with:

```plaintext
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

Then it starts sending events to the client. Each event is formatted as follows:

```plaintext
event: {event-name}
data: {event-data}
```

The `{event-data}` is an UTF-8 encoded text. Each event ends with a double newline (\n\n)

The first event contains the channel ID. The following events contain the updates in the subscribed views.

In case of an error, the server responds with an HTTP error:

| Code | Description | Body |
| --- | --- | --- |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components
