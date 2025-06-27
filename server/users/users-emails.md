# Email operations

- `q.sys.UserProfileWS.SendEmail` is used to send an email to the user
  - The first non-empty value is used as Email address:
    - `s.sys.UserProfileWS.UserProfile.Email` field
    - User's login
- `c.sys.UserProfileWS.ChangeEmail` command is used to change the s.sys.UserProfileWS.UserProfile.Email
