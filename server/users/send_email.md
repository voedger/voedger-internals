---
reqmd.package: server.users
---
# Send Email

As Application, I want to send an Email to a User.

`~aaaaa~`

## `~sys.UserProfileWS.SendEmailToUser~`

- AuthZ: role.sys.Workspace.ProfileOwner
- Params
  - NewEMail
- Errors
  - Email is mailformed // See similar message

**Behavior:**
    - Update UserProfileWS.UserProfile.Email

