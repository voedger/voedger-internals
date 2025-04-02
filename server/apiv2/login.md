# Create document or record
## Motivation
Issue (create) a new token in exchange for valid credentials.

## Functional Design
POST `/api/v2/apps/{owner}/{app}/auth/login`

### Headers
| Key | Value |
| --- | --- |
| Content-type | application/json |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Body
JSON object: 
```json
{
  "login": "login",
  "password": "password"
}
```

### Result
| Code | Description | Body
| --- | --- | --- |
| 200 | OK | Returns an access token, see below |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 429 | Too may requests, rate limiting | [error object](conventions.md#errors) |
| 500+ | Server errors / service unavailable | [error object](conventions.md#errors) |
 
Example result 200:
```json
{
  "principal_token": "abc.def.ghi",
  "expires_in": 3600,
  "wsid": 1234567890
}
```

