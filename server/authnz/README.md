# AuthNZ

Authorization and authentication.


## Concepts (Основные понятия)

### Naming

Naming based on [Stidy existing AuthNZ concepts](../../rsch/20221105-authnz/README.md).

- **Subject**: An entity that can make a request - User/Device/Service
- **Login**: Represents a subject which can log in (synonym: sign in), user/device
- **Profile**: Linked to login, personal data and other application specific information
- **Principal**: An unique key which can be used in ACL (список управления доступом)
  - Login | Group | Role
- **Role (Роль)**. A schema-level principal (predefined group)
  - Allows to create predefined ACLs
  - Examples
    - unTill: Waiter, Waiter+, Manager
    - PK: Executor, Executor+, Manager
- **Group (Группа)**: A workspace-level principal
- **PrincipalToken**: A token which authenticates principals.
  - Login + Role memberships
- **ACL**: Acces Control List (список управления доступом)
  - Currently we use predefined ACLs only (предопределенные списки управления доступом)
    - ACL managements too complicated
  - Users can only manage groups and roles membership
  - Permissions for Hosts can be manages by
    - GRANT ROLE ChargeBee TO ADDRESS <ip>

### ACL Rules

- “Principal P from Workspace W is [Allowed/Denied] Operation O on Resources matching ResourcePattern RP”.
  - Principal
  - Policy (Allow/Deny)
  - Operation
  - ResourcePattern
  - MembershipInheritance (00, 10, 11, 01)

### Query AuthNZ process

|Step   |Actor      | Served by   |
|-      |---------- | ----------  |
|Send a request to the QueryProcessor |Subject |
|Authenticate Principal|QueryProcessor |IAuthenticator.Authenticate()
|Authorize EXECUTE operation|QueryProcessor |IAuthorizer.Authorize()
|Opt: Authorize READ operation|QueryProcessor|IAuthorizer.Authorize()

### Command AuthNZ process

|Step|Actor|Served by|
|-|-|-|
|Send a request to the CommandProcessor|Subject |
|Authenticate Principal|CommandProcessor |IAuthenticator.Authenticate()
|Authorize EXECUTE operation|CommandProcessor |IAuthorizer.Authorize()
|Authorize fields CREATE/UPDATE|CommandProcessor |IAuthenticator.Authorize() 

### Roles (by Copilot)

Here are some vsql files where ROLE is used in the voedger/voedger repository:

1. **sys.vsql**
   - [sys.vsql](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/sys.vsql#L426-L500)
   - Everyone, Anonymous, AuthenticatedUser, System, ProfileOwner, WorkspaceDevice, RoleWorkspaceOwner, WorkspaceOwner, ClusterAdmin, WorkspaceAdmin

3. **appws.vsql**
   - [appws.vsql](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/cluster/appws.vsql#L1-L36)
   - ClusterAdmin
