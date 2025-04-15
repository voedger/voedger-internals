---
reqmd.package: server.invites
---

# Join Workspace

## c.sys.InitiateJoinWorkspace()

- `~Join.InitiateJoinWorkspace~`covered[^~Join.InitiateJoinWorkspace~]✅
- AuthZ: PrincipalToken + VerificationCode
  - `~Join.InitiateJoinWorkspace.AuthZ~`covered[^~Join.InitiateJoinWorkspace.AuthZ~]✅
- Params
  - InviteID
  - VerificationCode
- Errors
  - Invite state is not in (Invited)
  - Invite does not exist
  - Invite expired
  - token login does not match invite login
  - wrong Verification Code

**Flow:**

```mermaid
    sequenceDiagram

    actor Invitee
    participant front as Frontend
    participant workspace as InvitingWorkspace
    participant profilews as InviteeProfile

    Invitee ->> front: Confirmation URL
    front ->> front: Sign in or CreateLogin

    front ->> workspace: sys.c.InitiateJoinWorkspace()
    activate workspace
        workspace ->> workspace: Verify VerificationCode
        workspace ->> workspace: Read InviteeProfileWSID, Login, SubjectKind from Token
        workspace ->> workspace: Assert that Token.Login mathes cdoc.Invite.Login
        workspace ->> workspace: Update cdoc.Invite: State=ToBeJoined, InviteeProfileWSID, SubjectKind
        workspace -->> front: OK
    deactivate workspace

    note over workspace: ap.sys.ApplyJoinWorkspace()
    activate workspace
        note over workspace: cdoc.sys.SubjectIdx exists by Invite.Login or by Invite.ActualLogin -> do nothing
        workspace ->> profilews: sys.CreateJoinedWorkspace()
        profilews ->> profilews: create cdoc.sys.JoinedWorkspace if not exists

        workspace ->> workspace: Create cdoc.sys.Subject If not exists
        workspace ->> workspace: Update cdoc.Invite
        workspace ->> workspace: ...State=Joined, SubjectID, Login

    deactivate workspace

    front -->> workspace: Wait for  cdoc.sys.Invite.State == Joined

```

## Footnotes

[^~Join.InitiateJoinWorkspace~]: `[~server.invites/Join.InitiateJoinWorkspace~impl]` [server/invites/join-ws.md:62:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/invites/join-ws.md#L62), [pkg/sys/it/impl_invite_test.go:172:itest](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/sys/it/impl_invite_test.go#L172)
[^~Join.InitiateJoinWorkspace.AuthZ~]: `[~server.invites/Join.InitiateJoinWorkspace.AuthZ~impl]` [server/invites/join-ws.md:63:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/invites/join-ws.md#L63)
