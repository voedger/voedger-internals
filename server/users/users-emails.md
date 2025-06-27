---
reqmd.package: server.users
---

# Email operations

## Email operations: Architecture

- `q.sys.UserProfileWS.SendEmail` is used to send an email to the user
  - The first non-empty value is used as email address:
    - `descr.sys.UserProfileWS.Email` field
    - User's login
- `c.sys.UserProfileWS.ChangeEmail` command is used to change the s.sys.UserProfileWS.UserProfile.Email

### User Email field

- `~field.Email~`uncvrd[^1]❓: is used to store the user's email address

```sql
ALTERABLE WORKSPACE UserProfileWS INHERITS sys.ProfileWS (
	DESCRIPTOR UserProfile (
		DisplayName varchar,
    Email varchar, -- <-- New field for storing user's email>
	);
  ...
```

## See also

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

[^1]: `[~server.users/field.Email~impl]`
