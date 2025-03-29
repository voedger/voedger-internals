# Create document or record
## Motivation
Refreshes a valid principal token

## Functional Design
POST `/api/v2/users/{owner}/apps/{app}/auth/refresh`

### Headers
| Key | Value |
| --- | --- |
| Content-type | application/json |
| Authorization | Bearer {PrincipalToken} |

### Parameters
| Parameter | Type | Description |
| --- | --- | --- |
| owner | string | name of a user who owns the application |
| app | string | name of an application |

### Result
| Code | Description | Body
| --- | --- | --- |
| 200 | OK | Returns an updated access token, see below |
| 400 | Bad Request | [error object](conventions.md#errors) |
| 401 | Unauthorized | [error object](conventions.md#errors) |
| 403 | Forbidden | [error object](conventions.md#errors) |
| 429 | Too may requests, rate limiting | [error object](conventions.md#errors) |
| 500+ | Server errors / service unavailable | [error object](conventions.md#errors) |
 
Example result 200:
```json
{
  "token": "abc.def.ghi",
  "expires_in": 3600
}
```

