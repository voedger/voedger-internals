# Components design template

## untill.airs-bp/workspace/c.sys.TemplateInitiateInvitationByEMail()

- AuthZ: role.sys.WorkspaceAdmin
- Input
  - Email
  - Roles
  - ExpireDatetime
  - EmailTemplate // Must be prefixed with 'text:' or 'resource:'
    - Placeholders
      - ${VerificationCode}
      - ${InviteID}
      - ${WSID} - Inviting Workspace ID
      - ${WSName} - Inviting Workspace Name
      - ${Email} - Invitee Email
  - EmailSubject
- Output
  - token
- Errors
  - `~err.State~`covrd[^1]✅: state not in (None, Cancelled, Left, ToBeInvited)
  - invalid argument EmailTemplate
- Behavior or Flow
  - Behavior uses present simple tense
  - Flow uses imperative mood
