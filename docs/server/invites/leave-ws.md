# Leave Workspace

## c.sys.InitiateLeaveWorkspace()

- AuthZ: role.sys.Subject
- Params
  - Token.Login is used to find Invite
- Errors
  - Invite not found
  - State not in (Joined)

**Behavior:**
```mermaid
sequenceDiagram

    actor Invitee
    participant workspace as TargetWorkspace
    participant profilews as InviteeProfile

    Invitee ->> workspace: c.sys.InitiateLeaveWorkspace()
    activate workspace
        workspace ->> workspace: Update cdoc.sys.Invite State=ToBeLeft
        workspace -->> Invitee: OK
    deactivate workspace

    note over workspace: ap.sys.ApplyLeaveWorkspace()
    activate workspace
        workspace ->> workspace: Update cdoc.sys.Subject IsActive=0
        workspace ->> profilews: sys.DeactivateJoinedWorkspace(InvitingWorkspaceWSID)
        profilews -->> workspace: OK
        workspace ->> workspace: Update cdoc.sys.Invite State=Left
    deactivate workspace

    Invitee -->> profilews: Wait for cdoc.JoinedWorkspace deactivation
```