# Invites

Invite Users/Devices to Workspaces

## Overview

Roles and permissions:

- `WorkspaceOwner`: Highest level role, automatically has admin privileges
- `WorkspaceAdmin`: Can manage invites and user access

Key documents:

- `Invite`: Tracks invitation status and metadata
- `Subject`: Represents an invited user/device in the workspace
- `JoinedWorkspace`: Records workspace membership details
- `Login`: Manages user authentication and access

Invitation management:

- `c.InitiateInvitationByEmail`: Creates new invitation
  - Requires WorkspaceAdmin role
  - Includes email, roles, expiration, and email template
- `c.InitiateJoinWorkspace`: Processes invite acceptance
  - Requires verification code
  - Creates necessary workspace access records

Role management:

- `c.InitiateUpdateInviteRoles`: Updates member permissions
  - Available for joined members only
  - Includes email notification

Membership termination:

- `c.InitiateCancelAcceptedInvite`: Admin removes member
- `c.InitiateLeaveWorkspace`: Member voluntarily leaves
- `c.CancelSentInvite`: Cancels pending invitation

## Motivation

- [Air: Reseller Portal: Invite unTill Payments Users](625718)
- As a workspace owner I want to invite users into workspace with specified roles, so that if they accept it, they are granted to access my workspace\\
- As a workspace owner I want to change invited user's roles
- As a user, I want to see the list of my workspaces and roles, so that I know what am I available to work with
- As a user, I want to be able to leave the workspace I'm invited to
- As a workspace owner I want to ban user to he doesn't have access to my workspace anymore
- [Resellers Portal](https://github.com/untillpro/airs-design/blob/master/resellerportal/usersmgmt.md) 
- [invites.md](https://github.com/heeus/heeus-design/blob/d9b14d105ef443a2f70cc6fc8530ab42f36a6f5d/workspaces/invites.md)
- https://github.com/heeus/heeus-design/blob/main/workspaces/invites.md

## Concepts

```mermaid
    flowchart TD

    WorkspaceOwner["role.sys.WorkspaceOwner"]:::B
    WorkspaceAdmin["role.sys.WorkspaceAdmin"]:::B
    SubjectRole["role.sys.Subject"]:::B
    Inviter["Inviter"]:::B
    Invitee["Invitee"]:::B


    registry[(registry)]:::H
        Login["cdoc.Login"]:::H

    InviteeProfile[(InviteeProfile)]:::H
    JoinedWorkspace["cdoc.sys.JoinedWorkspace"]:::H


    InvitingWorkspace[(InvitingWorkspace)]:::H
        InvitingWorkspace --x Invite["cdoc.sys.Invite"]:::H
        Invite --- State(["State"]):::H
        Invite --- InviteRoles(["Roles"]):::H
        InvitingWorkspace --x Subject["cdoc.sys.Subject"]:::H

    InvitesService([InvitesService]):::S

    Subject -.- Invite
    Subject -.- |gives| SubjectRole

    InviteeProfile --- JoinedWorkspace

    InvitesService -.- |creates| Subject
    InvitesService -.- |reads| Invite
    InvitesService -.- |can create| Login
    InvitesService -.- |creates| JoinedWorkspace

    Inviter -.- |creates, updates| Invite
    Inviter -.- |must be| WorkspaceAdmin

    WorkspaceOwner -.- |is| WorkspaceAdmin

    registry --x Login

    Invitee x-.- |joins WS using| Invite
    Invitee --- InviteeProfile

    JoinedWorkspace -.-x InvitingWorkspace


    classDef G fill:#FFFFFF,color:#333,stroke:#000000, stroke-width:1px, stroke-dasharray: 5 5
    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333

```
## Invite state diagram

### Main sequence
```mermaid
stateDiagram-v2

    [*] --> ToBeInvited : c.sys.InitiateInvitationByEMail() by Inviter
    ToBeInvited --> Invited: ap.sys.ApplyInvitation() // send EMail

    Invited --> ToBeInvited: c.sys.InitiateInvitationByEMail() by Inviter
    Invited --> ToBeJoined: c.sys.InitiateJoinWorkspace() by Invitee
    Invited --> Cancelled: c.sys.CancelSentInvite() by Inviter

    ToBeJoined --> Joined: ap.sys.ApplyJoinWorkspace()

    Joined --> ToBeCancelled: c.sys.InitiateCancelAcceptedInvite() by Inviter
    Joined --> ToBeLeft: c.sys.InitiateLeaveWorkspace() by Invitee
    Joined --> ToUpdateRoles: c.sys.InitiateUpdateInviteRoles() by Inviter

    ToUpdateRoles --> Joined: ap.sys.ApplyUpdateInviteRoles()

    ToBeLeft --> Left: ap.sys.ApplyLeaveWorkspace()

    ToBeCancelled --> Cancelled: ap.sys.ApplyCancelAcceptedInvite()
```

### Extra

```mermaid
stateDiagram-v2
    Cancelled --> ToBeInvited: c.sys.InitiateInvitationByEMail() by Inviter
    Left --> ToBeInvited: c.sys.InitiateInvitationByEMail() by Inviter
```

## C4 specification

- [C4: Invites](../arch/sys/c4.invites.md)