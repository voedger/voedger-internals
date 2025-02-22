# Published Roles
## Requirement
As an app developer, I want to provide API schemas of certain workspaces, completely or partially, to 3rd parties, so they can integrate with my app

## Functional Design
When a role marked as published, resources available to this role are visible to the users in the [API schemas](../apiv2/list-ws-roles.md).

```sql
PUBLISHED ROLE ThirdPartyApp;
GRANT SELECT ON ALL TABLES WITH TAG TagThirdPartyApp TO ThirdPartyApp;
```

## Technical Design
- Support for `PUBLISHED ROLE` in parser and appdef
- See also: API paths
    - [List app workspaces](../apiv2/list-app-workspaces.md)
    - [List workspace roles](../apiv2/list-ws-roles.md)
    - [Read workspace role schema](../apiv2/read-ws-role-schema.md)
