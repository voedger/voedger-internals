---
reqmd.package: server.invites.invite
---

# Invite to Workspace

- As a Workspace Owner I want to invite users into workspace with specified roles, so that if they accept it, they are granted to access my workspace

## Components

- `~c.sys.Workspace.InitiateInvitationByEMail~`covrd[^2]✅
- `~ap.sys.Workspace.ApplyInvitation~`covrd[^3]✅
- `~it~`covrd[^4]✅

## c.sys.Workspace.InitiateInvitationByEMail()

- AuthZ: role.sys.WorkspaceAdmin
- Params
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
- Errors
  - `~err.State~`covrd[^1]✅: State not in (None, Cancelled, Left, ToBeInvited)
  - invalid argument EmailTemplate
- //TODO: EMail => Login must be implemented, currently it is supposed that EMail == Login

**Behavior:**

```mermaid
sequenceDiagram

actor Inviter
participant workspace as InvitingWorkspace
actor user as Invitee

Inviter ->> workspace: c.sys.InitiateInvitationByEMail()
activate workspace
  opt cdoc.sys.Subject exists by login && cdoc.sys.Invite.State is !Cancelled & !Left (allow re-invite otherwise)
    workspace -->> Inviter: subject already exists
  end
  workspace ->> workspace: Create/Update cdoc.Invite, State=ToBeInvited, Login=args.Email, Email, Roles, ExpireDatetime
  note over workspace: Update if exists cdoc.Invite where Login == args.EMail
  workspace -->> Inviter: OK
deactivate workspace

Inviter ->> Inviter: Wait for State = Invited

note over workspace: ap.sys.ApplyInvitation()
activate workspace
  workspace ->> workspace: Prepare Email
  workspace -->> user: Send invitation Email
  workspace ->> workspace: Update cdoc.Invite State=Invited
deactivate workspace
```

[^1]: `[~server.invites.invite/err.State~impl]` [pkg/sys/invite/errors.go:18:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/invite/errors.go#L18)
[^2]: `[~server.invites.invite/c.sys.Workspace.InitiateInvitationByEMail~impl]` [pkg/sys/invite/impl_initiateinvitationbyemail.go:27:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/invite/impl_initiateinvitationbyemail.go#L27)
[^3]: `[~server.invites.invite/ap.sys.Workspace.ApplyInvitation~impl]` [pkg/sys/invite/impl_applyinvitation.go:32:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/invite/impl_applyinvitation.go#L32)
[^4]: `[~server.invites.invite/it~impl]` [pkg/sys/it/impl_invite_test.go:36:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_invite_test.go#L36)
