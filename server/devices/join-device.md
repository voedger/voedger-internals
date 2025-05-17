---
reqmd.package: server.devices
---

# Join device to workspace

## Motivation

Joins a device to a workspace. The device must be [created](./create-device.md) before it could be joined to a workspace.

## Functional design

- POST `/api/v2/apps/{owner}/{app}/workspaces/{wsid}/commands/sys.JoinDevice`

### Headers

| Key | Value |
| --- | --- |
| Authorization | Bearer {PrincipalToken} |
| Content-Type | application/json |

### Body

```json
{
  "args": {
    "ProfileWSID": {profile-wsid},
    "Roles": "{roles}"
  }
}
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| **Query** | | |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| wsid | int64 | the ID of workspace |
| **Headers** | | |
| PrincipalToken | string | Token returned by [login](../apiv2/login.md) |
| **Body** | | |
| profile-wsid | int64 | profile WSID of the [registered device](./create-device.md) |
| roles  | string | comma-separated roles to assign to device within the workspace |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK | Device joined |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too Many Requests | [error object](errors.md) |
| 500 | Internal Server Error | [error object](errors.md) |
| 503 | Service Unavailable | [error object](errors.md) |

### Perimssions

- By default granted to `sys.WorkspaceOwner`

## Technical design

### Components

- pkg/sys
- `~cmp.sysJoinDevice~`uncvrd[^1]❓ command which joins a device to a workspace
  - `Roles varchar(1024) NOT NULL`
  - `ProfileWSID int64 NOT NULL`
  - Grant execution `sys.JoinDevice` to `sys.WorkspaceOwner` role
- pkg/sys/it
  - `~it.TestJoinDevice~`uncvrd[^2]❓: integration test for joining device to workspace

[^1]: `[~server.devices/cmp.sysJoinDevice~impl]`
[^2]: `[~server.devices/it.TestJoinDevice~impl]`
