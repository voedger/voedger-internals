---
reqmd.package: server.users
---

# Create user

## Motivation

Create(register) new user

## Functional design

POST `/api/v2/apps/{owner}/{app}/users`

### Headers

| Key | Value |
| --- | --- |
| Content-Type | application/json |

### Body

JSON object:

```json
{
  "verifiedEmailToken": "{verified-email-token}",
  "password": "{password}",
  "displayName": "{display-name}"
}
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| **Path** | | |
| owner | string | name of a user who owns the application |
| app | string | name of an application |
| **Body** | | |
| verified-email-token | string | [verified value token](../vsql/ver-fields.md) for the email |
| password | string | password for the new user |
| display-name | string | display name for the new user |

### Result

| Code | Description | Body |
| --- | --- | --- |
| 201 | Created | |
| 400 | Bad Request | [error object](../apiv2/errors.md) |
| 401 | Unauthorized | [error object](../apiv2/errors.md) |
| 429 | Too may requests, rate limiting | [error object](../apiv2/errors.md) |
| 500+ | Server errors / service unavailable | [error object](../apiv2/errors.md) |

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

- declaration in VSQL: `~cmp.registry.CreateEmailLogin.vsql~`covrd[^1]✅
- the extension code: `~cmp.registry.CreateEmailLogin.go~`covrd[^2]✅

2) `CreateLogin` must only be allowed to system `~cmp.registry.CreateLogin.vsql~`uncvrd[^3]❓

#### pkg/router

- URL path handler `~cmp.router.UsersCreatePathHandler~`covrd[^4]✅:
  - parses the request Body; calculates pseudo-wsid;
  - sends v2 request `c.registry.CreateLogin` to Command Processor

#### pkg/sys/it

- integration test for /users
  - `~it.TestUsersCreate~`covrd[^5]✅

[^1]: `[~server.users/cmp.registry.CreateEmailLogin.vsql~impl]` [pkg/registry/appws.vsql:117:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/appws.vsql#L117)
[^2]: `[~server.users/cmp.registry.CreateEmailLogin.go~impl]` [pkg/registry/impl_createlogin.go:29:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/impl_createlogin.go#L29)
[^3]: `[~server.users/cmp.registry.CreateLogin.vsql~impl]`
[^4]: `[~server.users/cmp.router.UsersCreatePathHandler~impl]` [pkg/router/impl_apiv2.go:217:impl](https://github.com/voedger/voedger/blob/main/pkg/router/impl_apiv2.go#L217)
[^5]: `[~server.users/it.TestUsersCreate~impl]` [pkg/sys/it/impl_cpv2_test.go:368:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_cpv2_test.go#L368)
