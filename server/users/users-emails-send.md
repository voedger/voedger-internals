---
reqmd.package: server.users
---
# Send Email

As Application, I want to send an Email to a User

## Related work

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)

## q.sys.UserProfileWS.SendEmailToUser

- `~q.sys.UserProfileWS.SendEmailToUser~`uncvrd[^1]❓: Send an email to a user
- AuthZ: role.Application
- Params
  - To: Email address of the user
  - Subject: Email subject
  - Body: Email body
  - BodyMime: MIME type of the body, e.g. `text/plain`, `text/html`
- Errors
  - `~err.EmailMalformed~`: Email is malformed
  - `~err.InvalidMimeType~`: Invalid MIME type for the body

Behavior:

- Updates cdoc.UserProfileWS.UserProfile.Email

[^1]: `[~server.users.SendEMail/SendEmailToUser~impl]`
