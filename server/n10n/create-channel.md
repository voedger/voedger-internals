---
reqmd.package: server.n10n
---

# Create channel, subscribe and start watching

## Motivation

As a client, I want to create a channel and subscribe to it, so that I can receive notifications about changes in projections.

## Terms

```mermaid
graph TD
  Projection[Projection] --> |can be|View[View]
  Projection[Projection] --> |can be|Heartbeat[Heartbeat]
```

## Functional Design


- The client initiates an SSE connection by making POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/notifications` with tha payload containing the list of projections to subscribe to.
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
  "Projections": {projections},
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
| projections | array of strings | list of projections to subscribe to. Example: `"sys.CollectionView", "air.SalesMetrics"` |

### Heartbeat

When `sys.Heartbeat30` is specified as the name of the projection, the server will send [heartbeat](./heartbeats.md) events every 30 seconds.
Event for the heartbeat projection contains "." as the projection name, and zero as the workspace ID.

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

The first event is always a channel ID (uuid), which is used to identify the connection, example:

```plaintext
event: channelID
data: 123e4567-e89b-12d3-a456-426614174000
```

The subsequent events contain updates for the subscribed projections, where `{event-name}` is `update`, and `{event-data}` is the JSON object containing the details of the update. Example view update event:

```plaintext
event: update
data: {"App":"myapp", "Projection":"pkg.SalesView", "WS":0, "Offset": 0}

event: update
data: {"App":"myapp", "Projection":".", "WS":100341234143, "Offset": 1234567890}
```

The `{event-data}` is an UTF-8 encoded text. Each event ends with a double newline (\n\n)

In case of an error, the server responds with an HTTP error:

| Code | Description | Body |
| --- | --- | --- |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](cerrors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components
