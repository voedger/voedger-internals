# HTTP Conventions
## Principles
- Response is always "application/json"
- `{ sys.Error{} }` field means error
  - `{"HTTPStatus":500,"QName": "air.ErrChargeBeeErr2", "Message": "", "Data":"<data from chargebee>"}`
  - "Data" is optional

## Request
- url: `<cluster-domain>/api/<appQName>/<wsid>/<{q,c}.funcQName>`
  - air.untill.com/api/air.bp3/123/q.LinkDevice
- Authorization could be Bearer or Basic:
  - `"Authorization"`: `"Bearer <principalToken>"`
  - `"Authorization"`: `"Basic <base64(userName:principalToken)>"`
    - userName is not checked for now
- body content is function-specific

## Query Response
- error occured before reading data
  - status >= 400
  - `"Content-Type"`: `"application/json"` header
  - `"Access-Control-Allow-Origin"`: `"*"` header
  - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
  - error message plain text in body
  - json: `{ sys.Error { HTTPStatus, QName, Message, Data} }`
- error occured during reading data
  - status < 400 (200)
  - `"Content-Type"`: `"application/json"` header
  - `"Access-Control-Allow-Origin"`: `"*"` header
  - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
  - body - valid JSON including top-level fields:
    - `sys.Error { HTTPStatus, QName, Message, Data}`
- no error, has data
  - status < 400
  - `"Content-Type"`: `"application/json"` header
  - `"Access-Control-Allow-Origin"`: `"*"` header
  - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
  - body: JSON:

```json
{
   "sections": [
      {
         "type": "",
         "elements": [
            [
               [
                  [
                     "hello, world"
                  ]
               ]
            ]
         ]
      }
   ]
}
```

- no error, no data so send -> do not transmit nothingness
  - status < 400
  - `"Access-Control-Allow-Origin"`: `"*"` header
  - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
  - body: `{}`

## Command Response
- any error
  - status >= 400
  - `"Content-Type"`: `"application/json"` header
  - `"Access-Control-Allow-Origin"`: `"*"` header
  - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
  - json: { sys.Error : { HTTPStatus, QName, Message, Data} }
- no error
  - 200 ok
  - `"Content-Type"`: `"application/json"` header
  - `"Access-Control-Allow-Origin"`: `"*"` header
  - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
  - body: `{"currentWLogOffset": <offset>, "newIDs": {"<rawID1>": <newID1>, ...}`
  - the command has result -> `"Result": "<resultJson>"` field is added to the body

## BLOB Write
- request, single BLOB mode
  - persistent BLOB url
    - `<cluster-domain>/blob/<appQName>/<wsid>?name=<blobName>test&mimeType=<blobMimeType>`
  - temporary BLOB url
    - `<cluster-domain>/blob/<appQName>/<wsid>?name=<blobName>test&mimeType=<blobMimeType>&ttl=1d`
	  - `1d` TTL is only supported for now
  - authorization should be done through headers or cookies:
    - `"Authorization"`: `"Bearer <principalToken>"`
    - cookie value could be both escaped and unescaped, i.e. `"Bearer%20<principalToken>"` could be specifed as well
  - `"Content-Type"`: `"application/x-www-form-urlencoded"` header
  - body - blob content
- request, multiple BLOB mode
  - temporary BLOBs are not supported
  - url: `<cluster-domain>/blob/<appQName>/<wsid>`
  - `"Content-Type"`: `"multipart/form-data; boundary=<boundary string>"` header
  - authorization should be done through headers or cookies as above
  - body:
```
<bondary string>
Content-Disposition: form-data; name="<blob1 name>"
Content-Type: <blob1 mimeType>

<blob1 binary content>
<bondary string>
Content-Disposition: form-data; name="<blob2 name>"
Content-Type: <blob2 mimeType>

<blob2 binary content>
<bondary string>
...
```
- response
  - success
    - 200ok
    - `"Content-Type"`: `"text/plain"` header
    - `"Access-Control-Allow-Origin"`: `"*"` header
    - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
    - body
	  - persistend BLOBs -> blobIDs comma-separated plain text
	  - temporary BLOBs -> single SUUID string
  - any error
    - non-200
    - `"Content-Type"`: `"text/plain" header`
    - `"Access-Control-Allow-Origin"`: `"*"` header
    - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
    - body - error message plain text

## BLOB Read
- request
  - url: `<cluster-domain>/blob/<appQName>/<wsid>/<blobIDOrSUUID>`
  - authorization should be done through headers or cookies:
    - `"Authorization"`: `"Bearer <principalToken>"`
  - empty body
- response
  - normal
    - 200 ok
    - `"Content-Disposition"`: `"attachment;filename=\"<blobName>\""` header
    - `"Content-Type"`: `"<blobMimeType>"` header
    - `"Access-Control-Allow-Origin"`: `"*"` header
    - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
    - body - binary BLOB content
  - not found, read error etc
    - non-200
    - `"Content-Type"`: `"text/plain" header`
    - `"Access-Control-Allow-Origin"`: `"*"` header
    - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
    - body - error message

## N10N
- request
  - `GET` method on url `<cluster-domain>/n10n/channel?<url-encoded JSON subscriptions params>`
    - [example](https://github.com/untillpro/airs-bp3/blob/main/packages/sys/it/impl_n10n_test.go#L46)
  - no headers
- response
  - normal
    - 200 ok
    - headers
      - `"Conten-Type"`: `"text/event-stream"`
      - `"Cache-Control"`: `"no-cache"`
      - `"Connection"`: `"keep-alive"`
      - `"Access-Control-Allow-Origin"`: `"*"`
      - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
    - events are long-polled from the body
  - any error before starting watching the channel
    - non-200
    - headers
      - `"Content-Type"`: `"text/plain; charset=utf-8"`
      - `"X-Content-Type-Options"`: `"nosniff"`
      - `"Access-Control-Allow-Origin"`: `"*"`
      - `"Access-Control-Allow-Headers"`: `"Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"` header
    - body - error message plain text
