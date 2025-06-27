---
reqmd.package: server.users
---
# Send Email

As Application, I want to send an Email to a User

## Related work

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

## q.sys.UserProfileWS.SendEmailToUser

- `~q.SendEmailToUser~`uncvrd[^1]❓: Send an email to a user
- Workspace: `sys.UserProfileWS`
- AuthZ: role.Application
- Params
  - To: Email address of the user
  - Subject: Email subject
  - Body: Email body
  - BodyMime: MIME type of the body, e.g. `text/plain`, `text/html`
- Errors
  - `~err.EmailMalformed~`uncvrd[^2]❓: Email is malformed
  - `~err.InvalidMimeType~`uncvrd[^3]❓: Invalid MIME type for the body

Behavior:

- Updates cdoc.UserProfileWS.UserProfile.Email

[^1]: `[~server.users/q.SendEmailToUser~impl]`
[^2]: `[~server.users/err.EmailMalformed~impl]`
[^3]: `[~server.users/err.InvalidMimeType~impl]`
