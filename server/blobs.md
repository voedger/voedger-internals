# BLOBs

## Upload BLOB

```mermaid
sequenceDiagram
    actor Subject
    participant BLOBber as Router.BLOBber
    participant HVM
    participant cp as CP
    participant cdocBLOB as cdoc.sys.BLOB

    Subject ->> BLOBber: Upload BLOB
    BLOBber ->> BLOBber: AuthZ + BLOB ID
    BLOBber ->> cp: sys.uploadBLOBHelper()
    cp ->> cdocBLOB: create, status=0
    cp -->> BLOBber: AuthZ + BLOB ID
    BLOBber ->> BLOBber: Save BLOB stream using iblobstorage
    BLOBber ->> cp: CUD (Update BLOB status)
    cp ->> cdocBLOB: status=1
    BLOBber ->> Subject: Return BLOB ID
```

**POST**
- url: `<federation-domain>/blob/<app-name>/<wsid>`
  - `alpha.dev.untill.com/blob/untill/airs-bp/127889070`
  - PrincipalToken: header `Authorization`: Bearer `<PrincipalToken>`


See also.
- [https://security.stackexchange.com/questions/108662/why-is-bearer-required-before-the-token-in-authorization-header-in-a-http-re](https://security.stackexchange.com/questions/108662/why-is-bearer-required-before-the-token-in-authorization-header-in-a-http-re)

## Download BLOB

```mermaid
sequenceDiagram
    actor Subject
    participant BLOBber as Router.BLOBber
    participant HVM
    participant qp as QP
    participant cdocBLOB as cdoc.sys.BLOB

    Subject ->> BLOBber: Download BLOB(blobID)
    BLOBber ->> qp: sys.downloadBLOBHelper(blobID)
    qp ->> qp: AuthZ and check blobID
    cdocBLOB -->> qp: 
    qp -->> BLOBber: ok
    BLOBber ->> BLOBber: Read BLOB using iblobstorage
    BLOBber -->> Subject: Return BLOB stream

```

**GET**
- url: `<federation-domain>/blob/<app-name>/<wsid>/<blobid>`
  - PrincipalToken: cookies/header `Authorization`: Bearer `<PrincipalToken>`

## Technical dept

- It is unclear how to AuthZ by blobID

## Related work

- [Design: BLOBs](https://dev.untill.com/launchpad/#!12652)

![](../images/download-blob.png)

![](../images/upload-blob.png)