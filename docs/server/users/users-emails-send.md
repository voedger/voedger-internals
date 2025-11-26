---
reqmd.package: server.users
---
# Send Email

As Application, I want to send an Email to a User.

## c.SendEmailToUser

- `~c.SendEmailToUser~`uncvrd[^1]❓: Initiate sending an email to a user
- Workspace: `sys.UserProfileWS`
- AuthZ: `role.Application`
- Params
  - To: Email address of the user
  - Subject
  - Body
  - BodyMime: MIME type of the body, e.g. `text/plain`, `text/html`
- Errors
  - `~err.EmailMalformed~`uncvrd[^2]❓: Email is malformed
  - `~err.InvalidMimeType~`uncvrd[^3]❓: Invalid MIME type for the body
- Behavior:
  - The first non-empty value is used as email address:
    - `descr.sys.UserProfileWS.UserProfile.Email` field
    - User's login
  - Triggers `ap.sys.UserProfileWS.ApplySendEmail` to send an email to the user using an appropriate storage

## ap.ApplySendEmail

- `~ap.ApplySendEmail~`uncvrd[^4]❓: Send an email to a user
- Workspace: `sys.UserProfileWS`
- Triggered by: `c.SendEmailToUser`
- Behavior:
  - Sends an email to the user using an appropriate storage based on the command parameters
  - ??? What if the storage fails permanently?

[^1]: `[~server.users/c.SendEmailToUser~impl]`
[^2]: `[~server.users/err.EmailMalformed~impl]`
[^3]: `[~server.users/err.InvalidMimeType~impl]`
[^4]: `[~server.users/ap.ApplySendEmail~impl]`
