# VSQL ACL Rules

Issues
- [ACL Rules #394](https://github.com/voedger/voedger/issues/394)

## Functional design

### GRANT/REVOKE

```sql

    -- sys
    ROLE System;
    ROLE Admin;
    ROLE LocationUser;
    ROLE LocationManager;
    ROLE Application; -- Projector is executed with this role

    GRANT LocationUser TO LocationManager;
    // GRANT INHERIT ON LocationUser TO LocationManager;
    // https://stackoverflow.com/questions/12875545/how-to-grant-privileges-to-a-role-on-an-oracle-schema
    // https://www.ibm.com/docs/en/informix-servers/14.10?topic=name-granting-role-user-another-role
    // https://www.postgresql.org/docs/current/role-membership.html
    // GRANT ROLE LocationUser TO LocationManager;
    
    -- Grants declared only within workspace

    GRANT ALL ON ALL TABLES WITH TAG BackofficeTag TO LocationManager;
    GRANT INSERT,UPDATE ON ALL TABLES WITH TAG BackofficeTag TO LocationUser;

    GRANT SELECT ON TABLE Orders TO LocationUser;
    GRANT SELECT (Field1, Field2) ON TABLE MyTable TO LocationUser;

    GRANT EXECUTE ON COMMAND Orders TO LocationUser;
    GRANT EXECUTE ON QUERY Query1 TO LocationUser;
    GRANT EXECUTE ON ALL QUERIES WITH TAG PosTag TO LocationUser;

    GRANT UPDATE (CloseDatetime, Client, Name) ON TABLE Bill TO LocationUser;
    GRANT INSERT(Client, Name) ON  TABLE Bill TO LocationUser;

    GRANT INSERT ON WORKSPACE Workspace1 TO Role1; // Role1 is allowed to create instances of Workspace1

    REVOKE SELECT(Field1) ON TABLE Orders FROM LocationUser;

```

## Technical design: Principles

- Principals: Only roles
- IAppPartition.IsOperationAllowed()
  - Uses internal authorizer
  - Roles inheritance are handled automatically
- Rules
  - parser: Resource.ALL shall be expanded by parser
     - Only own workspace resources are used in  expansion (not inherited workspace resources)
   - parser: GRANT may not follow REVOKE
   - parser: Workspace rules in AppDef:
      - Inherited rules
      - Own GRANTs
      - Own REVOKEs
   - parser: Roles inheritance is not expanded
  