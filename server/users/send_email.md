# Send Email

As Application, I want to send an Email to a User.

## sys.UserProfileWS.SendEmailToUser

- AuthZ: role.sys.Workspace.ProfileOwner
- Params
  - NewEMail
- Errors
  - Email is mailformed // See similar message

**Behavior:**
    - Update UserProfileWS.UserProfile.Email
