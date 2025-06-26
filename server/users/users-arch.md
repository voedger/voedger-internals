---
reqmd.package: server.users
---

# Architecture

---

## Core tables

[sys.UserProfileWS.UserProfile](https://github.com/voedger/voedger/blob/ecb97b1f282e2b1d4e19b1ab0394fa4eacafcbdd/pkg/sys/userprofile.vsql#L4)
```sql
ALTERABLE WORKSPACE UserProfileWS INHERITS sys.ProfileWS (
	DESCRIPTOR UserProfile (
		DisplayName varchar,
	);
    ...
```

[registry.AppWorkspaceWS.Login](https://github.com/voedger/voedger/blob/ecb97b1f282e2b1d4e19b1ab0394fa4eacafcbdd/pkg/registry/appws.vsql#L6)
```sql
ALTER WORKSPACE sys.AppWorkspaceWS (
	TABLE Login INHERITS sys.CDoc (
		ProfileCluster int32 NOT NULL,
		PwdHash bytes NOT NULL,
		AppName varchar NOT NULL,
		SubjectKind int32,
		LoginHash varchar NOT NULL,
		WSID int64,                                     -- to be written after workspace init
		WSError varchar(1024),                          -- to be written after workspace init
		WSKindInitializationData varchar(1024) NOT NULL
	);
```
---

## Related tables, invites

[cdoc.sys.Workspace.Invite](https://github.com/voedger/voedger/blob/b1a796a9d8479f4a1ed9d30f21ed7a27a523d60a/pkg/sys/sys.vsql#L81)
```sql
	TABLE Invite INHERITS sys.CDoc (
		SubjectKind int32,
		Login varchar NOT NULL,
		Email varchar NOT NULL,
		Roles varchar(1024),
		ExpireDatetime int64,
		VerificationCode varchar,
		State int32 NOT NULL,
		Created int64,
		Updated int64 NOT NULL,
		SubjectID ref,
		InviteeProfileWSID int64,
		ActualLogin varchar,
		UNIQUEFIELD Email
	) WITH Tags=(WorkspaceOwnerTableTag);
```

[cdoc.sys.Workspace.Subject](https://github.com/voedger/voedger/blob/b1a796a9d8479f4a1ed9d30f21ed7a27a523d60a/pkg/sys/sys.vsql#L73)
```sql
	TABLE Subject INHERITS sys.CDoc (
		Login varchar NOT NULL, <--
		SubjectKind int32 NOT NULL,
		Roles varchar(1024) NOT NULL,
		ProfileWSID int64 NOT NULL,
		UNIQUEFIELD Login
	) WITH Tags=(WorkspaceOwnerTableTag);

	VIEW ViewSubjectsIdx (
		LoginHash int64 NOT NULL,
		Login text NOT NULL,
		SubjectID ref NOT NULL,
		PRIMARY KEY ((LoginHash), Login)
	) AS RESULT OF ApplyViewSubjectsIdx WITH Tags=(WorkspaceOwnerTableTag);
```

## Email operations

- `q.sys.UserProfileWS.SendEmail` is used to send an email to the user
  - The first non-empty value is used as Email address:
    - `s.sys.UserProfileWS.UserProfile.Email` field
    - User's login
- `c.sys.UserProfileWS.ChangeEmail` command is used to change the s.sys.UserProfileWS.UserProfile.Email
