---
reqmd.package: server.users
---

# Change password

## Motivation

Change password of an existing user

## Functional design

POST `/api/v2/apps/{owner}/{app}/users/change-password`

### Headers

| Key | Value |
| --- | --- |
| Content-Type | application/json |
| Authorization | Bearer {PrincipalToken} |

### Body

JSON object:

```json
{
  "login": "{login}",
  "oldPassword": "{old-password}",
  "newPassword": "{new-password}",
}
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| **Path** | | |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| **Body** | | |
| login | string | login of the user |
| old-password | string | old password of the user |
| new-password | string | new password of the user |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 200 | OK  | |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design

### Components

- pkg/router
  - URL path handler `~cmp.routerUsersChangePasswordPathHandler~`uncvrd[^1]❓:
    - parses the request Body and URL parameters; calculates pseudo-wsid;
    - sends v2 request `c.registry.ChangePassword` to Command Processor

- pkg/sys/it
  - integration test for /users
    - `~it.TestQueryProcessor2_UsersChangePassword~`uncvrd[^2]❓

[^1]: `[~server.users/cmp.routerUsersChangePasswordPathHandler~impl]`
[^2]: `[~server.users/it.TestQueryProcessor2_UsersChangePassword~impl]`
