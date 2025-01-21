## Functional design

~story.srv.users.SendEmail~

Application calls `sys.AppWorkspaceWS.SendEmailToUser` to send an Email to a User.

## Technical design

### sys.AppWorkspaceWS.SendEmailToUser

`c3~srv.sys.AppWorkspaceWS.c.SendEmailToUser~1`

- AuthZ: Workspace.Application
- Params
  - Subject
  - Text
- Errors

**Behavior:**

- If UserProfile.Email is not empty, use it.
- Else, use Login as Email.