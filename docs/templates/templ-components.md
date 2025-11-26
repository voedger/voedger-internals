# Components design template

## c.sys.Workspace.TemplateInitiateInvitationByEMail()

- AuthZ: role.sys.WorkspaceAdmin
- Params:
  - Email
  - Roles
  - ExpireDatetime
  - EmailTemplate // Must be prefixed with 'text:' or 'resource:'
    - Placeholders:
      - ${VerificationCode}
      - ${InviteID}
      - ${WSID} - Inviting Workspace ID
      - ${WSName} - Inviting Workspace Name
      - ${Email} - Invitee Email
  - EmailSubject
- Errors:
  - `~err.State~`covrd[^1]✅: State not in (None, Cancelled, Left, ToBeInvited)
  - invalid argument EmailTemplate
  