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

## Subject.Login usage

In  pkg\sys\invite\impl_applyviewsubjectsidx.go, the applyViewSubjectsIdxProjector function uses the login from a subject:
actualLogin := cdocSubject.AsString(Field_Login) // cdoc.sys.Subject.Login <- cdoc.sys.Invite.ActualLogin by ap.sys.ApplyJoinWorkspace

In  pkg\sys\it\impl_invite_test.go, there's a function that queries subjects by login:
findCDocSubjectByLogin := func(login string) []interface{} {
    return vit.PostWS(ws, "q.sys.Collection", fmt.Sprintf(
        {"args":{"Schema":"sys.Subject"},
        "elements":[{"fields":[
            "Login",
            "SubjectKind",
            "Roles",
            "sys.ID",

In  pkg\vit\impl.go, the createSubjects function creates subjects with login:
body := fmt.Sprintf({"cuds":[{"fields":{"sys.ID":1,"sys.QName":"sys.Subject","Login":"%s","Roles":"%s","SubjectKind":%d,"ProfileWSID":%d}}]}`,
    subject.login, roles, subject.subjectKind, vit.principals[appQName][subject.login].ProfileWSID)

In  pkg\sys\it\impl_childworkspace_test.go, a subject is created with login:

In  pkg\vvm\provide.go and  pkg\vvm\wire_gen.go, the provideSubjectGetterFunc uses login to query subjects:

In  pkg\sys\invite\utils.go, the GetSubjectIdxViewKeyBuilder and SubjectExistsByLogin functions use login to build keys for subject lookups:

These usages show that Subject.Login is a key field used for:

- Creating and identifying subjects
- Querying subjects by login
- Building indexes for subject lookups
- Associating subjects with profiles and workspaces
- The field is defined in the sys.vsql file as a non-null varchar field with a unique constraint

##

# Subject.Login Field References

## Definition in sys.vsql
TABLE Subject INHERITS sys.CDoc (
    Login varchar NOT NULL,
    SubjectKind int32 NOT NULL,
    Roles varchar(1024) NOT NULL,
    ProfileWSID int64 NOT NULL,
    UNIQUEFIELD Login
) WITH Tags=(WorkspaceOwnerTableTag);

## Usage in pkg\sys\invite\impl_applyviewsubjectsidx.go
actualLogin := cdocSubject.AsString(Field_Login) // cdoc.sys.Subject.Login <- cdoc.sys.Invite.ActualLogin by ap.sys.ApplyJoinWorkspace

## Usage in pkg\sys\invite\utils.go
func GetSubjectIdxViewKeyBuilder(login string, s istructs.IState) (istructs.IStateKeyBuilder, error) {
    skbViewSubjectsIdx, err := s.KeyBuilder(sys.Storage_View, QNameViewSubjectsIdx)
    if err != nil {
        // notest
        return nil, err
    }
    skbViewSubjectsIdx.PutInt64(Field_LoginHash, coreutils.LoginHash(login))
    skbViewSubjectsIdx.PutString(Field_Login, login)
    return skbViewSubjectsIdx, nil
}

func SubjectExistsByLogin(login string, state istructs.IState) (existingSubjectID istructs.RecordID, err error) {
    skbViewSubjectsIdx, err := GetSubjectIdxViewKeyBuilder(login, state)
    if err != nil {
        // notest
        return 0, err
    }
    val, ok, err := state.CanExist(skbViewSubjectsIdx)
    if ok {
        existingSubjectID = val.AsRecordID("SubjectID")
    }
    return existingSubjectID, err
}

## Usage in pkg\vvm\provide.go
func provideSubjectGetterFunc() iauthnzimpl.SubjectGetterFunc {
    return func(requestContext context.Context, name string, as istructs.IAppStructs, wsid istructs.WSID) ([]appdef.QName, error) {
        kb := as.ViewRecords().KeyBuilder(invite.QNameViewSubjectsIdx)
        kb.PutInt64(invite.Field_LoginHash, coreutils.LoginHash(name))
        kb.PutString(invite.Field_Login, name)
        subjectsIdx, err := as.ViewRecords().Get(wsid, kb)
        // ...
    }
}

## Related View Definition in sys.vsql
VIEW ViewSubjectsIdx (
    LoginHash int64 NOT NULL,
    Login text NOT NULL,
    SubjectID ref NOT NULL,
    PRIMARY KEY ((LoginHash), Login)
) AS RESULT OF ApplyViewSubjectsIdx WITH Tags=(WorkspaceOwnerTableTag);