# BLOBs

## Upload BLOB

**POST**
- url: `<federation-domain>/blob/<app-name>/<wsid>`
  - `alpha.dev.mycompany.com/blob/mycompany/airs-bp/127889070?name=blob&mimeType=text/plain`
  - PrincipalToken: header `Authorization`: Bearer `<PrincipalToken>`

```mermaid
sequenceDiagram
    actor Subject
    participant BLOBber as Router.BLOBber
    participant cp as CP
    participant cdocBLOB as wdoc.sys.BLOB

    Subject ->> BLOBber: Upload BLOB
    BLOBber ->> cp: sys.UploadBLOBHelper()
    cp ->> cdocBLOB: create, status=0
    cp -->> BLOBber: AuthZ + BLOB ID
    BLOBber ->> BLOBber: Save BLOB stream using iblobstorage
    BLOBber ->> cp: BLOB.status=1
    cp ->> cdocBLOB: status=1
    BLOBber ->> Subject: Return BLOB ID
```

## Download BLOB

**GET**
- url: `<federation-domain>/blob/<app-name>/<wsid>/<blobid>`
  - PrincipalToken: cookies/header `Authorization`: Bearer `<PrincipalToken>`

```mermaid
sequenceDiagram
    actor Subject
    participant BLOBber as Router.BLOBber
    participant HVM
    participant qp as QP
    participant cdocBLOB as cdoc.sys.BLOB

    Subject ->> BLOBber: Download BLOB(blobID)
    BLOBber ->> qp: sys.DownloadBLOBAuthnz(blobID)
    qp ->> qp: AuthZ and check blobID
    cdocBLOB -->> qp: 
    qp -->> BLOBber: ok
    BLOBber ->> BLOBber: Read BLOB using iblobstorage
    BLOBber -->> Subject: Return BLOB stream

```

## Technical dept

- It is unclear how to AuthZ by blobID

## Related work

- [stackexchange.com: Why is 'Bearer' required before the token in 'Authorization' header in a HTTP request?](https://security.stackexchange.com/questions/108662/why-is-bearer-required-before-the-token-in-authorization-header-in-a-http-re)

### launchpad #!12652

![](../images/download-blob.png)

![](../images/upload-blob.png)
