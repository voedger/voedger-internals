---
reqmd.package: server.apiv2.users
---

# Change password

## Motivation

Change password of an existing user

## Functional design

POST `/api/v2/apps/{owner}/{app}/users/change-password`

### Headers

| Key | Value |
| --- | --- |
| Content-type | application/json |
| Authorization | Bearer {PrincipalToken} |

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Body

JSON object:
```json
{
  "Login": "login",
  "OldPassword": "old",
  "NewPassword": "new",
}
```

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

[^1]: `[~server.apiv2.users/cmp.routerUsersChangePasswordPathHandler~impl]`
[^2]: `[~server.apiv2.users/it.TestQueryProcessor2_UsersChangePassword~impl]`
