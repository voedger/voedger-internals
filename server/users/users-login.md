---
reqmd.package: server.users
---

# Operations with logins

## Principles

Change login -> Create an alias

- User can create an alias
- Only one alias can be created by the user (to prevent abuse)
  - Previous aliases are deactivated

## Architecture

- `c.SendEmailToUser` is used to initialize the email sending process

## Related work

- [20250617-change-email/README.md](../../rsch/20250617-change-email/README.md)
