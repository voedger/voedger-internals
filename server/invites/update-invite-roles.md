# Update Invite Roles

## c.sys.InitiateUpdateInviteRoles()

- AuthZ: role.sys.WorkspaceAdmin
- Params
  - InviteID
  - Roles
  - EmailTemplate // Must be prefixed with 'text:' or 'resource:'
  - EmailSubject
- Errors
  - State not in (Joined)
  - invalid argument EmailTemplate

**Behavior:**

```mermaid
    sequenceDiagram

    actor inviter as Inviter
    participant workspace as TargetWorkspace
    participant profilews as InviteeProfile
    actor Invitee

    inviter ->> workspace: c.sys.InitiateUpdateInviteRoles()
    activate workspace
        workspace ->> workspace: Update cdoc.sys.Invite State=ToUpdateRoles
        workspace -->> inviter: OK
    deactivate workspace

    note over workspace: ap.sys.ApplyUpdateInviteRoles()
    activate workspace
        workspace ->> workspace: Update cdoc.sys.Subject.Roles
        workspace ->> profilews: sys.UpdateJoinedWorkspaceRoles(TargetWorkspaceWSID, Roles)
        profilews ->> profilews: Update cdoc.sys.JoinedWorkspace.Roles
        profilews -->> workspace: OK
        workspace -->> Invitee: "Your roles updated" Email
        workspace ->> workspace: Update cdoc.sys.Invite.State=Joined, Roles
    deactivate workspace

    inviter -->> workspace: Wait for  cdoc.sys.Invite.State == Joined
```
