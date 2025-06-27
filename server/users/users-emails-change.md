# Change Email

As sys.Workspace.ProfileOwner I want to change my Email.

## c.sys.ChangeUserEmail()

- AuthZ: role.sys.Workspace.ProfileOwner
- Params
  - NewEMail
- Errors
  - Email is mailformed // See similar message

**Flow**:

- Update UserProfileWS.UserProfile.Email

## Background

### Overview by Copilot

1. **Email Sending:**

- The `impl_applyinvitation.go` file contains code to send invitation emails using SMTP configuration: [impl_applyinvitation.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/invite/impl_applyinvitation.go#L33-L109).
- [invite/impl_applyupdateinviteroles.go](https://github.com/voedger/voedger/blob/90c38e54b2e52fb9514d9a371a99ef645dc0968c/pkg/sys/invite/impl_applyupdateinviteroles.go#L86)
- The `impl.go` file in the `verifier` package sends email verification codes: [impl.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/verifier/impl.go#L45-L104).

2. **SMTP Configuration:**

- The `smtp` package defines the SMTP configuration in `types.go`: [types.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/smtp/types.go#L1-L13).
- Functions related to SMTP configuration are in `impl.go`: [impl.go](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/smtp/impl.go#L1-L15).

3. **Email Verification Tokens:**

- The `userprofile.vsql` file includes commands for sending email verification codes: [userprofile.vsql](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/userprofile.vsql#L1-L67).

4. **The implementation of `Storage_SendMail`:**

- Can be found in the `pkg/sys/storages/impl_send_mail_storage.go` file. You can view the implementation [here](https://github.com/voedger/voedger/blob/5935d2eaefc92dad72dbaab94a33e47d16d2264a/pkg/sys/storages/impl_send_mail_storage.go#L1-L126).
