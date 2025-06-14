---
reqmd.package: server.devices
---

# Invite device to workspace

## Motivation

As a Workspace Owner I want to invite a [registered device](./create-device.md) to a workspace with specified roles, so that if it accepts the invitation, it can access the workspace with those roles.

## Components

- `~q.sys.Workspace.IssueInviteToken~`
- `~c.sys.Workspace.AcceptInviteToken~`
- `~ap.sys.Workspace.ApplyAcceptInviteToken~`
- `~c.sys.Workspace.CreateSubject~`

### q.sys.IssueInviteToken

- AuthNZ: `role.sys.WorkspaceAdmin`
- Params:
  - `AllowedSubjectKind int` (0-any)
  - `Roles string`
  - `ExpireDatetime timestamp`

#### Behavior

```mermaid
sequenceDiagram
    actor Inviter
    participant InvitingWorkspace
    actor Invitee

    Inviter->>InvitingWorkspace: q.sys.IssueInviteToken()
    activate InvitingWorkspace
      InvitingWorkspace-->>Inviter: InviteToken
    deactivate InvitingWorkspace

    Inviter-->>Invitee: InviteToken   
```

### c.sys.AcceptInviteToken

- AuthNZ: `role.sys.AuthenticatedUser` + InviteToken
- Params:
  - `InviteToken string`

```mermaid
sequenceDiagram
    actor Invitee
    participant InviteeProfileWSID
    participant InvitingWorkspace

    Invitee->>InviteeProfileWSID: c.sys.AcceptInviteToken(InviteToken)
    activate InviteeProfileWSID
      InviteeProfileWSID-->>Invitee: OK
    deactivate InviteeProfileWSID

    note over InviteeProfileWSID: ap.sys.ApplyAcceptInviteToken
    activate InviteeProfileWSID
      InviteeProfileWSID ->> InvitingWorkspace: c.sys.CreateSubject()
      activate InvitingWorkspace
        InvitingWorkspace->>InvitingWorkspace: create sys.Subject if not exists
        InvitingWorkspace-->>InviteeProfileWSID: OK
      deactivate InvitingWorkspace
      InviteeProfileWSID ->> InviteeProfileWSID: create sys.JoinedWorkspace
    deactivate InviteeProfileWSID
    
```
