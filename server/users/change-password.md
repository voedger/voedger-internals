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
  - URL path handler `~cmp.routerUsersChangePasswordPathHandler~`covrd[^1]✅:
    - parses the request Body and URL parameters; calculates pseudo-wsid;
    - sends v2 request `c.registry.ChangePassword` to Command Processor

- pkg/sys/it
  - integration test for /users
    - `~it.TestQueryProcessor2_UsersChangePassword~`covrd[^2]✅

[^1]: `[~server.users/cmp.routerUsersChangePasswordPathHandler~impl]` [pkg/router/impl_apiv2.go:114:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L114), [pkg/router/impl_apiv2.go:196:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L196)
[^2]: `[~server.users/it.TestQueryProcessor2_UsersChangePassword~impl]` [pkg/sys/it/impl_changepassword_test.go:39:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_changepassword_test.go#L39)
