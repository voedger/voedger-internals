---
reqmd.package: server.users
---

# Email operations

## Email operations: Architecture

### Email field

- `~field.Email~`uncvrd[^1]❓: is used to store the user's email address

```sql
ALTERABLE WORKSPACE UserProfileWS INHERITS sys.ProfileWS (
	DESCRIPTOR UserProfile (
		DisplayName varchar,
    Email varchar, -- <-- New field for storing user's email>
	);
  ...
```

### Send email

- `c.sys.UserProfileWS.SendEmail` is used to initialize the email sending process
  - The first non-empty value is used as email address:
    - `descr.sys.UserProfileWS.UserProfile.Email` field
    - User's login
- `ap.sys.UserProfileWS.ApplySendEmail` is triggered by the SendEmail command and sends an email to the user using an appropriate storage

## See also

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

[^1]: `[~server.users/field.Email~impl]`
