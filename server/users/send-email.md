---
reqmd.package: server.users.SendEMail
---
# Send Email

As Application, I want to send an Email to a User

## Related work

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

## Functional design

## sys.UserProfileWS.SendEmailToUser

- `~SendEmailToUser~`uncvrd[^1]❓
- AuthZ: role.sys.Workspace.ProfileOwner
- Params
  - NewEMail
- Errors
  - Email is mailformed // See similar message

**Behavior:**
    - Update UserProfileWS.UserProfile.Email

[^1]: `[~server.users.SendEMail/SendEmailToUser~impl]`
