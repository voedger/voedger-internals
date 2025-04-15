---
reqmd.package: server.users
---
# Send Email

As Application, I want to send an Email to a User.

`~aaaaa~`covered[^~aaaaa~]✅

## Technical design

## sys.UserProfileWS.SendEmailToUser

- `~SendEMail.SendEmailToUser~`covered[^~SendEMail.SendEmailToUser~]✅
- AuthZ: role.sys.Workspace.ProfileOwner
- Params
  - NewEMail
- Errors
  - Email is mailformed // See similar message

**Behavior:**
    - Update UserProfileWS.UserProfile.Email

[^~SendEMail.SendEmailToUser~]: `[~server.users/SendEMail.SendEmailToUser~impl]` [server/users/send_email.md:24:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/users/send_email.md#L24)
[^~aaaaa~]: `[~server.users/aaaaa~impl]` [server/users/send_email.md:25:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/users/send_email.md#L25)
