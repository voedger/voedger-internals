---
reqmd.package: server.authnz.groles
---

# Global Roles

## Abstract

This document outlines the design for Global Roles in the authentication and authorization system, enabling roles that apply across all workspaces.

## Motivation

- Administrators currently need to assign the same roles repeatedly in multiple workspaces
- Need for a mechanism to assign roles at the system level that apply globally
- Simplify permission management for system administrators
- Reduce the risk of permission inconsistencies across workspaces

## Introduction

**Global Role**: A system-level role assigned to users that will be included in all PrincipalTokens and participate in authorization regardless of which workspace is being accessed. This design addresses the need for consistent role assignment across the system while maintaining compatibility with the existing authorization model.

## Concepts

```mermaid
flowchart TD
    Login[cdoc.sys.Login]:::H
    GlobalRoles([GlobalRoles]):::H
    login[login]:::S
    PrincipalToken[PrincipalToken]:::H
    Authorization(Authorization):::S
    
    Login ---> |has field| GlobalRoles
    GlobalRoles --> |used by| login
    login --> |issues| PrincipalToken
    PrincipalToken --> |used in| Authorization
    
    classDef H fill:#C9E7B7,color:#333
    classDef S fill:#B5FFFF,color:#333
```

---

## Functional design

### ClusterAdmin: Update Global Roles

```mermaid
sequenceDiagram
    actor Admin as ClusterAdmin
    participant cmd as c.sys.UpdateGlobalRoles
    participant login as cdoc.Login
    
    Admin->>cmd: Execute(login, roles)
    cmd->>login: Update GlobalRoles field
    cmd->>Admin: Success
```
---

## Technical design

- `~cmp.c.registry.UpdateGlobalRoles~`covrd[^1]✅
  - AuthZ: System

```sql
TYPE UpdateGlobalRolesParams (
  Login text NOT NULL,
  AppName text NOT NULL,
  GlobalRoles text(1024)
);
COMMAND UpdateGlobalRoles (UpdateGlobalRolesParams);
```

- `~cmp.cdoc.registry.Login.GlobalRoles~`covrd[^2]✅: New field in the `Login` table

```sql
ALTER WORKSPACE sys.AppWorkspaceWS (
    TABLE Login INHERITS sys.CDoc (
        -- ... existing fields ...
        GlobalRoles varchar(1024)    -- Comma-separated list of global roles
    );
);
```

- `~cmp.c.registry.IssuePrincipalToken~`covrd[^4]✅
  - Include `GlobalRoles` in the PrincipalToken
- `~tuc.UseGlobalRolesInAuthz~`covrd[^3]✅
  - Include principals according to PrincipalToken.GlobalRoles
- `~it.TestGlobalRoles~`covrd[^5]✅
  - Integration test to verify Global Roles functionality

[^1]: `[~server.authnz.groles/cmp.c.registry.UpdateGlobalRoles~impl]` [pkg/registry/appws.vsql:106:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/appws.vsql#L106), [pkg/registry/appws.vsql:118:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/appws.vsql#L118), [pkg/registry/impl_updateglobalroles.go:26:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/impl_updateglobalroles.go#L26)
[^2]: `[~server.authnz.groles/cmp.cdoc.registry.Login.GlobalRoles~impl]` [pkg/registry/appws.vsql:17:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/appws.vsql#L17)
[^3]: `[~server.authnz.groles/tuc.UseGlobalRolesInAuthz~impl]` [pkg/iauthnzimpl/impl.go:77:impl](https://github.com/voedger/voedger/blob/main/pkg/iauthnzimpl/impl.go#L77)
[^4]: `[~server.authnz.groles/cmp.c.registry.IssuePrincipalToken~impl]` [pkg/registry/impl_issueprincipaltoken.go:98:impl](https://github.com/voedger/voedger/blob/main/pkg/registry/impl_issueprincipaltoken.go#L98)
[^5]: `[~server.authnz.groles/it.TestGlobalRoles~impl]` [pkg/sys/it/impl_signupin_test.go:273:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_signupin_test.go#L273)
