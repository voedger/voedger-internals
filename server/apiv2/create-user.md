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
| 400 | Bad Request | [error object](errors.md) |
| 401 | Unauthorized | [error object](errors.md) |
| 403 | Forbidden | [error object](errors.md) |
| 429 | Too may requests, rate limiting | [error object](errors.md) |
| 500+ | Server errors / service unavailable | [error object](errors.md) |
 

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

- declaration in VSQL: `~cmp.registry.CreateEmailLogin.vsql~`covered[^1]✅
- the extension code: `~cmp.registry.CreateEmailLogin.go~`covered[^2]✅


2) Mark `CreateLogin` as deprecated `~cmp.registry.CreateLogin.vsql~`covered[^3]✅

#### pkg/router

- URL path handler `~cmp.router.UsersCreatePathHandler~`covered[^4]✅:
  - parses the request Body and URL parameters; calculates pseudo-wsid;
  - makes federation query to `registry` app by calling `CreateEmailLogin` function;
  - returns the result, or error, to the client.

#### pkg/sys/it

- integration test for /users
  - `~it.TestUsersCreate~`covered[^5]✅

[^1]: `[~server.apiv2.users/cmp.registry.CreateEmailLogin.vsql~impl]` [server/apiv2/create-user.md:77:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-user.md#L77)
[^2]: `[~server.apiv2.users/cmp.registry.CreateEmailLogin.go~impl]` [server/apiv2/create-user.md:78:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-user.md#L78)
[^3]: `[~server.apiv2.users/cmp.registry.CreateLogin.vsql~impl]` [server/apiv2/create-user.md:79:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-user.md#L79)
[^4]: `[~server.apiv2.users/cmp.router.UsersCreatePathHandler~impl]` [server/apiv2/create-user.md:80:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-user.md#L80)
[^5]: `[~server.apiv2.users/it.TestUsersCreate~impl]` [server/apiv2/create-user.md:81:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/apiv2/create-user.md#L81)
