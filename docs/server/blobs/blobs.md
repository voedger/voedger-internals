---
reqmd.package: server.blobs
---

# BLOBS

Working with BLOBs (Binary Large Objects)

##

## Use cases

- [Read BLOB](../apiv2/read-blob.md)
- [Create BLOB](../apiv2/create-blob.md)

## Technical design

### Definitions

- BLOB.OwnerRecord: QName of the record that owns the BLOB
- BLOB.OwnerRecordField: Name of the field that owns the BLOB
- CUD collection: Collection of CUDs (Create, Update, Deactivate) that are executed in the same transaction

### Components overview

- `~wdoc.sys.Workspace.BLOB~`covrd[^1]✅: WDoc for storing BLOB metadata
  - This is the only WRecord that can be referenced from CDocs
  - CDocs reference BLOBs by fields of the `blob` type
  - `blob` type is implemented as a ref to WDoc record
- `~tuc.HandleBLOBReferences~`covrd[^2]✅: Handling fields of the `blob` type by command processor

### CP: tuc.HandleBLOBReferences

- Validate that every modified record its `blob` fields satisifies the following conditions:
  - `~err.BLOBOwnerRecordIDMustBeEmpty~`covrd[^3]✅: Target BLOB.OwnerRecordID must be empty
  - `~err.BLOBOwnerRecordMismatch~`covrd[^4]✅: BLOB.OwnerRecord does not match the record QName
  - `~err.BLOBOwnerRecordFieldMismatch~`covrd[^5]✅: BLOB.OwnerRecordField does not match the record field name
  - `~err.DuplicateBLOBReference~`covrd[^6]✅: Multiple records in CUD collection cannot refer to the same BLOB
- `~cmp.UpdateBLOBOwnership~`covrd[^7]✅: Operator of the CP that updates the BLOB.OwnerRecordID and BLOB.OwnerRecordField fields in the BLOB table

[^1]: `[~server.blobs/wdoc.sys.Workspace.BLOB~impl]` [pkg/sys/sys.vsql:63:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/sys.vsql#L63)
[^2]: `[~server.blobs/tuc.HandleBLOBReferences~impl]` [pkg/processors/command/impl.go:538:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/command/impl.go#L538), [pkg/sys/blobber/provide.go:27:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/blobber/provide.go#L27)
[^3]: `[~server.blobs/err.BLOBOwnerRecordIDMustBeEmpty~impl]` [pkg/sys/blobber/provide.go:55:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/blobber/provide.go#L55)
[^4]: `[~server.blobs/err.BLOBOwnerRecordMismatch~impl]` [pkg/sys/blobber/provide.go:68:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/blobber/provide.go#L68)
[^5]: `[~server.blobs/err.BLOBOwnerRecordFieldMismatch~impl]` [pkg/sys/blobber/provide.go:69:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/blobber/provide.go#L69)
[^6]: `[~server.blobs/err.DuplicateBLOBReference~impl]` [pkg/sys/blobber/provide.go:61:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/blobber/provide.go#L61)
[^7]: `[~server.blobs/cmp.UpdateBLOBOwnership~impl]` [pkg/processors/command/impl.go:537:impl](https://github.com/voedger/voedger/blob/main/pkg/processors/command/impl.go#L537)
