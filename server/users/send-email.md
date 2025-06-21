---
reqmd.package: server.users.SendEMail
---
# Send Email

As Application, I want to send an Email to a User.

## Technical design

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
