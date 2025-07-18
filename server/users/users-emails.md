---
reqmd.package: server.users
---

# Email operations

## Architecture

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

- AuthZ: UPDATE: `role.ProfileOwner`

### Commands

- `c.SendEmailToUser` is used to initialize the email sending process
  - The first non-empty value is used as email address:
    - `field.Email` field
    - User's login
- `ap.ApplySendEmail` is triggered by the SendEmail command and sends an email to the user using an appropriate storage

## Related work

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

[^1]: `[~server.users/field.Email~impl]`
