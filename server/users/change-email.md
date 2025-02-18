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
