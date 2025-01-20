## c.sys.InitiateInvitationByEMail()

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
    - State not in (None, Cancelled, Left, Invited)
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