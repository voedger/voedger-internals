# Allow users to update their login and email addresses

- **Author(s)**:
  - Maxim Geraskin. unTill Software Development Group B. V.
- **Date**: 2025-06-17
- **Keywords**: login, email, user

## Motivation

- [Allow users to update their login and email addresses](https://github.com/voedger/voedger/issues/3154)

## Goals

- Understand the architecture of the existing code
- Propose the draft solution for changing the login and email of the user

---

## Results

### Architecture

- [Architecture](arch.md)

### Analysis

- The `Login` field is used as a "weak" foreign key in the `Invite`, `Subject` tables
- Currently `Login` is considered as a Email, `fn execCmdInitiateInvitationByEMail()`:

```go
svbCDocInvite.PutString(Field_Login, args.ArgumentObject.AsString(field_Email))
svbCDocInvite.PutString(field_Email, args.ArgumentObject.AsString(field_Email))
```

- The `Email` value taken from the `Login` field is used to send email to the user
  - pkg\sys\invite\impl_applyupdateinviteroles.go:
  - pkg\sys\invite\impl_applyinvitation.go

- Login value is used (not exhaustive list):
  - pkg/sys/it/impl_invite_test.go (Subject.Login)
  - pkg/vit/impl.go (Subject.Login)
  - pkg/vvm/provide.go (ViewSubjectsIdx.Login)
    - The `provideSubjectGetterFunc()` function
  - Implicitely through the Email: pkg\sys\invite\impl_applyupdateinviteroles.go
  - pkg/vvm/provide
    - // Provider function for retrieving subject roles by login
    - func provideSubjectGetterFunc() iauthnzimpl.SubjectGetterFunc {

Key findings:

- Login value is used extensively in the data, so it is hard to change the value
- Login value is currently treated as a email but
  - This is subject to change
  - User may want to change the email
  - Changing login is very difficult, changing email is not

### Proposed solution

Change login -> Create an alias

- The User can create an alias
- Only one alias can be created by the user (to prevent abuse)
- Further aliases can be created by the Admin

Change email

- Actual Email is kept in the `cs.sys.UserProfileWS.UserProfile.Email` field
- `c.sys.UserProfileWS.ChangeEmail` command is used to change the user Email
- `q.sys.UserProfileWS.SendEmail` is used to send an Email to the user
