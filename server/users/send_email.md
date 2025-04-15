---
reqmd.package: server.users
---
# Send Email

As Application, I want to send an Email to a User.

`~aaaaa~`uncvrd[^~aaaaa~]❓

## Technical design

## sys.UserProfileWS.SendEmailToUser

- `~SendEMail.SendEmailToUser~`uncvrd[^~SendEMail.SendEmailToUser~]❓
- AuthZ: role.sys.Workspace.ProfileOwner
- Params
  - NewEMail
- Errors
  - Email is mailformed // See similar message

**Behavior:**
    - Update UserProfileWS.UserProfile.Email

[^~SendEMail.SendEmailToUser~]: `[~server.users/SendEMail.SendEmailToUser~impl]`
[^~aaaaa~]: `[~server.users/aaaaa~impl]`
