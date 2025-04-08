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
  "VerifiedEmailToken": "token",
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
#### pkg/registry
 
1) `CreateEmailLogin` function:
```sql
TYPE CreateEmailLoginParams (
  Email varchar VERIFIABLE,
  AppName text NOT NULL,
  SubjectKind int32 NOT NULL,
  WSKindInitializationData text(1024) NOT NULL,
  ProfileCluster int32 NOT NULL
);

COMMAND CreateEmailLogin (CreateEmailLoginParams, UNLOGGED CreateLoginUnloggedParams);
GRANT EXECUTE ON COMMAND CreateEmailLogin TO sys.Anonymous;
```

- declaration in VSQL: `~cmp.registry.CreateEmailLogin.vsql~`uncvrd[^1]❓
- the extension code: `~cmp.registry.CreateEmailLogin.go~`uncvrd[^2]❓


2) Mark `CreateLogin` as deprecated `~cmp.registry.CreateLogin.vsql~`uncvrd[^3]❓

#### pkg/router
- URL path handler `~cmp.router.UsersCreatePathHandler~`uncvrd[^4]❓:
  - parses the request Body and URL parameters; calculates pseudo-wsid;
  - makes federation query to `registry` app by calling `CreateEmailLogin` function;
  - returns the result, or error, to the client.

#### pkg/sys/it
- integration test for /users
    - `~it.TestUsersCreate~`uncvrd[^5]❓

[^1]: `[~server.apiv2.users/cmp.registry.CreateEmailLogin.vsql~impl]`
[^2]: `[~server.apiv2.users/cmp.registry.CreateEmailLogin.go~impl]`
[^3]: `[~server.apiv2.users/cmp.registry.CreateLogin.vsql~impl]`
[^4]: `[~server.apiv2.users/cmp.router.UsersCreatePathHandler~impl]`
[^5]: `[~server.apiv2.users/it.TestUsersCreate~impl]`
