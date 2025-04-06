---
reqmd.package: server.apiv2.users
---

# Create user
## Motivation
Create(register) new user
## Functional design
POST `/api/v2/apps/{owner}/{app}/users`

### Headers
| Key | Value |
| --- | --- |
| Content-type | application/json |

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
  "Password": "password",
  "DisplayName": "name"
}
```

### Result
| Code | Description | Body
| --- | --- | --- |
| 201 | Created  |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 429 | Too may requests, rate limiting | [error object](conventions.md#errors) |
| 500+ | Server errors / service unavailable | [error object](conventions.md#errors) |
 

## Technical design
### Components
- pkg/router
  - URL path handler `~cmp.routerUsersCreatePathHandler~`uncvrd[^1]❓:
    - parses the request Body and URL parameters; calculates pseudo-wsid;
    - makes federation query to `registry` app by calling `CreateLogin` function;
    - returns the result, or error, to the client.

- pkg/sys/it
    - integration test for /users
        - `~it.TestUsersCreate~`uncvrd[^2]❓

[^1]: `[~server.apiv2.users/cmp.routerUsersCreatePathHandler~impl]`
[^2]: `[~server.apiv2.users/it.TestUsersCreate~impl]`
