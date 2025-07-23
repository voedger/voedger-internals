---
reqmd.package: server.users
---

# Login Alias

## Background

Best practices

- Instagram allows users to change their username multiple times

## Principles

- 🏡Instead of changing the login we are creating an alias, so old login is kept and can be used to log in
  - Rationale: Login value is used extensively in the data, so it is hard to change the value
- 🏡Login table keeps workspace ID of the aliased login in the AliasedLoginWSID field
  - Rationale: This is the only way to route the request from the Alias workspace to the Login workspace since we do not keep actual Login value, only hash
- Alias can be changed
  - Previous alias is deactivated and can be re-used

## Architecture

### Create Login Alias

- User calls `c.CreateLoginAlias` in registry.AppWorkspaceWS[Alias] to create an alias for their Login
- `c.CreateLoginAlias` inserts a record into `cdoc.Login`, setting the `AliasedLoginWSID`, `AliasedLoginHash` fields
  - Update of the `cdoc.Login.AliasedLoginWSID` triggers `ap.ApplyCreateLoginAlias`
- `ap.ApplyCreateLoginAlias`
  - Invokes `c.RegisterCreatedAlias` in registry.AppWorkspaceWS[Login]
- `c.RegisterCreatedAlias` updates `cdoc.Login` table, setting the `AliasWSID` and `AliasHash` fields
  - Update of the `cdoc.Login.Alias*` fields triggers `ap.RegisterCreatedAlias`
  - calls `c.DeactivateAlias` in registry.AppWorkspaceWS[OldLoginAlias]
  - calls `c.CreateAlias` in registry.AppWorkspaceWS[NewLoginAlias]
- User calls `q.IssuePrincipalToken` in registry.AppWorkspaceWS[Alias] multiple times until it succeeds
- q.IssuePrincipalToken in registry.AppWorkspaceWS[Alias]
  - Reads `cdoc.Login` and routes the request to the q.IssuePrincipalToken in registry.AppWorkspaceWS[Login]

- User calls `c.CreateLoginAlias` in registry.AppWorkspaceWS[Login] to create an alias for their Login
- `c.CreateLoginAlias` inserts a record into `cdoc.Login` setting the `AliasedLoginWSID` field
- Update of the `cdoc.Login` triggers `ap.ApplyCreateLoginAlias`
- `ap.ApplyCreateLoginAlias`
  - calls `c.DeactivateAlias` in registry.AppWorkspaceWS[OldLoginAlias]
  - calls `c.CreateAlias` in registry.AppWorkspaceWS[NewLoginAlias]
- User calls `q.IssuePrincipalToken` in registry.AppWorkspaceWS[Alias] multiple times until it succeeds
- q.IssuePrincipalToken in registry.AppWorkspaceWS[Alias]
  - Reads `cdoc.Login` and routes the request to the q.IssuePrincipalToken in registry.AppWorkspaceWS[Login]

```mermaid
sequenceDiagram
    actor User
    participant LoginWS as registry.AppWorkspaceWS[Login]
    participant NewAliasWS as registry.AppWorkspaceWS[NewLoginAlias]
    participant OldAliasWS as registry.AppWorkspaceWS[OldLoginAlias]
    
    User->>LoginWS: c.CreateLoginAlias()
    Note over LoginWS: Update cdoc.Login.Alias field
    LoginWS->>LoginWS: Trigger ap.ApplyCreateLoginAlias
    
    LoginWS->>OldAliasWS: c.DeactivateAlias()
    Note over OldAliasWS: Deactivate previous alias if exists
    OldAliasWS-->>LoginWS: Alias deactivated
    
    LoginWS->>NewAliasWS: c.CreateAlias()
    Note over NewAliasWS: Create new alias for Login
    NewAliasWS-->>LoginWS: Alias created
    
    LoginWS-->>User: Login alias updated
    
    User->>NewAliasWS: q.IssuePrincipalToken()
    Note over NewAliasWS: Verify alias is active
    NewAliasWS-->>User: PrincipalToken
```

### IssuePrincipalToken for Alias

- User calls `q.IssuePrincipalToken` in registry.AppWorkspaceWS[Alias]
- `q.IssuePrincipalToken` reads `cdoc.LoginAlias` and routes the request to the Login workspace

## Components

## cdoc.LoginAlias

- `cdoc.LoginAlias`: Keeps the alias for the Login
- Fields:
  - `Login`: the Login of the user
  - `Alias`: the alias for the Login
  - `PreviousAlias`: the previous alias, if exists
  - `CreatedAt`: timestamp when the alias was created
  - `ExpiresAt`: timestamp when the alias expires (if applicable)

## c.IssueCreateAliasToken

- `c.IssueCreateAliasToken`: Called by the user to issue a CreateAliasToken
- Workspace: registry.AppWorkspaceWS[Login]
- AuthZ: ??? How to name the role for authenticated user
- Parameters:
  - LoginAsEmail: verified, must match the Login
  - Alias: the new alias to be created
- Errors:
  - LoginAsEmail does not match the Login
  - Workspace is not the Login workspace
- Behavior:
  - Creates a `cmp.LoginAliasToken` with TTL of 1 minute
  - PreviousAlias (may be empty)
  - NewAlias

registry.AppWorkspaceWS:

- `~c.IssueCreateAliasToken~`uncvrd[^1]❓: Called by the user to issue a CreateAliasToken
  - AuthZ: ??? How to name the role for authenticated user
  - Parameters:
    - LoginAsEmail: verified, must match the Login
    - Alias: the new alias to be created
  - `cmp.LoginAliasToken`:
    - TTL is 1 minute
    - PreviousAlias (may be empty)
    - NewAlias
- `c.CreateAlias`: Called by the user to create an alias for their Login
  - Workspace: Alias pseudo-workspace
  - Bevarior:
    - Creates an alias for the Login
    - Triggers ap.ApplyCreateAlias
- `ap.ApplyCreateAlias`: Triggered by CreateAlias
  - Workspace: same as CreateAlias
  - Invokes DeactivateAlias in the workspace of the PreviousAlias
- `c.DeactivateAlias`: Invoked by ApplyCreateAlias
  - Called by the system only to deactivate the alias

## Related work

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

[^1]: `[~server.users/c.IssueCreateAliasToken~impl]`
