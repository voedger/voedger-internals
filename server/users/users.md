# Users

The Users feature provides core user management functionality in the Voedger system. It handles user registration, profile management, and password operations.

---

## Architecture

### Core tables

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

### Related tables, invites

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

---

## Background

**Email Sending**:

- The `impl_applyinvitation.go` file contains code to send invitation emails using SMTP configuration: [impl_applyinvitation.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/invite/impl_applyinvitation.go#L33-L109).
- [invite/impl_applyupdateinviteroles.go](https://github.com/voedger/voedger/blob/90c38e54b2e52fb9514d9a371a99ef645dc0968c/pkg/sys/invite/impl_applyupdateinviteroles.go#L86)
- The `impl.go` file in the `verifier` package sends email verification codes: [impl.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/verifier/impl.go#L45-L104).

**SMTP Configuration**:

- The `smtp` package defines the SMTP configuration in `types.go`: [types.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/smtp/types.go#L1-L13).
- Functions related to SMTP configuration are in `impl.go`: [impl.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/smtp/impl.go#L1-L15).

**Email Verification Tokens**:

- The `userprofile.vsql` file includes commands for sending email verification codes: [userprofile.vsql](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/userprofile.vsql#L1-L67).

**The implementation of `Storage_SendMail`**:

- Can be found in the `pkg/sys/storages/impl_send_mail_storage.go` file. You can view the [implementation](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/storages/impl_send_mail_storage.go#L1-L126).
