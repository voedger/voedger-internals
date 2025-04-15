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
| Code | Description | Body
| --- | --- | --- |
| 200 | OK  |
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |

## Technical design
### Components
- pkg/router
  - URL path handler `~cmp.routerUsersChangePasswordPathHandler~`covered[^1]✅:
    - parses the request Body and URL parameters; calculates pseudo-wsid;
    - makes federation query to `registry` app by calling `ChangePassword` function;
    - returns the result, or error, to the client.

- pkg/sys/it
    - integration test for /users
        - `~it.TestQueryProcessor2_UsersChangePassword~`covered[^2]✅

[^1]: `[~server.apiv2.users/cmp.routerUsersChangePasswordPathHandler~impl]` [server/apiv2/change-password.md:55:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/change-password.md#L55)
[^2]: `[~server.apiv2.users/it.TestQueryProcessor2_UsersChangePassword~impl]` [server/apiv2/change-password.md:56:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/change-password.md#L56)
