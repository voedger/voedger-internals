# Users.C3

## Database

[sys.UserProfile](https://github.com/voedger/voedger/blob/ecb97b1f282e2b1d4e19b1ab0394fa4eacafcbdd/pkg/sys/userprofile.vsql#L4)
```sql
ALTERABLE WORKSPACE UserProfileWS INHERITS sys.ProfileWS (
	DESCRIPTOR UserProfile (
		DisplayName varchar,
        Email varchar,
	);
    ...
```    

[registry.Login](https://github.com/voedger/voedger/blob/ecb97b1f282e2b1d4e19b1ab0394fa4eacafcbdd/pkg/registry/appws.vsql#L6)
```
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