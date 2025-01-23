# Change Email

As sys.Workspace.ProfileOwner I want to change my Email.

## c.sys.ChangeUserEmail()

- AuthZ: role.sys.Workspace.ProfileOwner
- Params
    - NewEMail
- Errors
    - Email is mailformed // See similar message

**Behavior:**
    - Update UserProfileWS.UserProfile.Email
