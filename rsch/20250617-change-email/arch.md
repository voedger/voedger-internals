# Architecture

## Schema

[ws.sys.UserProfileWS.UserProfile](https://github.com/voedger/voedger/blob/ecb97b1f282e2b1d4e19b1ab0394fa4eacafcbdd/pkg/sys/userprofile.vsql#L4)
```sql
ALTERABLE WORKSPACE UserProfileWS INHERITS sys.ProfileWS (
	DESCRIPTOR UserProfile (
		DisplayName varchar,
	);
    ...
```

[cdoc.registry.AppWorkspaceWS.Login](https://github.com/voedger/voedger/blob/ecb97b1f282e2b1d4e19b1ab0394fa4eacafcbdd/pkg/registry/appws.vsql#L6)
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

[cdoc.sys.Workspace.Invite](https://github.com/voedger/voedger/blob/b1a796a9d8479f4a1ed9d30f21ed7a27a523d60a/pkg/sys/sys.vsql#L81)
```sql
	TABLE Invite INHERITS sys.CDoc (
		SubjectKind int32,
		Login varchar NOT NULL, <--
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
```

## sys.Storage_SendMail usage

- [applyInvitationProjector](https://github.com/voedger/voedger/blob/b9e97fd068d0e2e7ea8be662cf8818ac49e7fb50/pkg/sys/invite/impl_applyinvitation.go#L32)
- [applyUpdateInviteRolesProjector](https://github.com/maxim-ge/voedger/blob/e96006f1760fdff7573a46c234d8b20d47d6e885/pkg/sys/invite/impl_applyupdateinviteroles.go#L29)
- [applySendEmailVerificationCode](https://github.com/maxim-ge/voedger/blob/e96006f1760fdff7573a46c234d8b20d47d6e885/pkg/sys/verifier/impl.go#L84)

---

## Subject.Login Usage

The `Subject.Login` field is a critical component in the Voedger authentication and authorization system. This section documents its usage patterns across the codebase and demonstrates how it serves as a unique identifier for subjects within the system.

### Overview

The `Subject.Login` field serves as the primary identifier for subjects and is used extensively throughout the system for:

- **Subject Creation and Identification**: Creating new subjects and uniquely identifying existing ones
- **Query Operations**: Retrieving subjects based on their login credentials
- **Index Management**: Building and maintaining lookup indexes for efficient subject retrieval
- **Workspace Association**: Linking subjects to their respective profiles and workspaces

### Key Usage Patterns

#### 1. Subject Identification and Retrieval

**Location**: `pkg/sys/invite/impl_applyviewsubjectsidx.go`
```go
// Extract login from subject document
actualLogin := cdocSubject.AsString(Field_Login)
// Maps cdoc.sys.Subject.Login <- cdoc.sys.Invite.ActualLogin by ap.sys.ApplyJoinWorkspace
```

#### 2. Subject Query Operations

**Location**: `pkg/sys/it/impl_invite_test.go`
```go
// Function to query subjects by login
findCDocSubjectByLogin := func(login string) []interface{} {
    return vit.PostWS(ws, "q.sys.Collection", fmt.Sprintf(
        `{"args":{"Schema":"sys.Subject"},
        "elements":[{"fields":[
            "Login",
            "SubjectKind",
            "Roles",
            "sys.ID"
        ]}]}`
    ))
}
```

#### 3. Subject Creation

**Location**: `pkg/vit/impl.go`
```go
// Create subjects with login field
body := fmt.Sprintf(`{"cuds":[{"fields":{"sys.ID":1,"sys.QName":"sys.Subject","Login":"%s","Roles":"%s","SubjectKind":%d,"ProfileWSID":%d}}]}`,
    subject.login, roles, subject.subjectKind, vit.principals[appQName][subject.login].ProfileWSID)
```

#### 4. Subject Lookup and Authentication

**Location**: `pkg/vvm/provide.go`
```go
// Provider function for subject retrieval by login
func provideSubjectGetterFunc() iauthnzimpl.SubjectGetterFunc {
    return func(requestContext context.Context, name string, as istructs.IAppStructs, wsid istructs.WSID) ([]appdef.QName, error) {
        kb := as.ViewRecords().KeyBuilder(invite.QNameViewSubjectsIdx)
        kb.PutInt64(invite.Field_LoginHash, coreutils.LoginHash(name))
        kb.PutString(invite.Field_Login, name)
        subjectsIdx, err := as.ViewRecords().Get(wsid, kb)
        if err == istructs.ErrRecordNotFound {
            return nil, nil
        }
        if err != nil {
            return nil, err
        }
        res := []appdef.QName{}
        subjectID := subjectsIdx.AsRecordID(invite.Field_SubjectID)
        cdocSubject, err := as.Records().Get(wsid, true, istructs.RecordID(subjectID))
        if err != nil {
            return nil, err
        }
        if !cdocSubject.AsBool(appdef.SystemField_IsActive) {
            return nil, nil
        }
        roles := strings.Split(cdocSubject.AsString(invite.Field_Roles), ",")
        for _, role := range roles {
            roleQName, err := appdef.ParseQName(role)
            if err != nil {
                return nil, err
            }
            res = append(res, roleQName)
        }
        return res, nil
    }
}
```

### Implementation Details

The `Subject.Login` field is implemented with the following characteristics:

- **Data Type**: `varchar` (variable-length character string)
- **Constraints**: `NOT NULL` and `UNIQUEFIELD` (ensures uniqueness across the system)
- **Indexing**: Used in `ViewSubjectsIdx` for efficient lookup operations
- **Hashing**: Login values are hashed using `coreutils.LoginHash()` for index optimization

---

### Database Schema Definition

The `Subject.Login` field is defined in the system schema as follows:

```sql
TABLE Subject INHERITS sys.CDoc (
    Login varchar NOT NULL,
    SubjectKind int32 NOT NULL,
    Roles varchar(1024) NOT NULL,
    ProfileWSID int64 NOT NULL,
    UNIQUEFIELD Login
) WITH Tags=(WorkspaceOwnerTableTag);
```

### Index Management Functions

**Location**: `pkg/sys/invite/utils.go`

The system provides utility functions for efficient subject lookup operations:

```go
// Build key for subject index lookup
func GetSubjectIdxViewKeyBuilder(login string, s istructs.IState) (istructs.IStateKeyBuilder, error) {
    skbViewSubjectsIdx, err := s.KeyBuilder(sys.Storage_View, QNameViewSubjectsIdx)
    if err != nil {
        return nil, err
    }
    skbViewSubjectsIdx.PutInt64(Field_LoginHash, coreutils.LoginHash(login))
    skbViewSubjectsIdx.PutString(Field_Login, login)
    return skbViewSubjectsIdx, nil
}

// Check if subject exists by login
func SubjectExistsByLogin(login string, state istructs.IState) (existingSubjectID istructs.RecordID, err error) {
    skbViewSubjectsIdx, err := GetSubjectIdxViewKeyBuilder(login, state)
    if err != nil {
        return 0, err
    }
    val, ok, err := state.CanExist(skbViewSubjectsIdx)
    if ok {
        existingSubjectID = val.AsRecordID("SubjectID")
    }
    return existingSubjectID, err
}
```

### Supporting View Schema

The system maintains an optimized view for subject lookups:

```sql
VIEW ViewSubjectsIdx (
    LoginHash int64 NOT NULL,
    Login text NOT NULL,
    SubjectID ref NOT NULL,
    PRIMARY KEY ((LoginHash), Login)
) AS RESULT OF ApplyViewSubjectsIdx WITH Tags=(WorkspaceOwnerTableTag);
```

This view enables efficient subject retrieval by combining login hashing with direct login string matching, providing both performance optimization and exact match capabilities.