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

- `~wdoc.sys.Workspace.BLOB~`uncvrd[^1]❓: WDoc for storing BLOB metadata
  - This is the only WRecord that can be referenced from CDocs
  - CDocs reference BLOBs by fields of the `blob` type
  - `blob` type is implemented as a ref to WDoc record
- `~tuc.HandleBLOBReferences~`uncvrd[^2]❓: Handling fields of the `blob` type by command processor

### CP: tuc.HandleBLOBReferences

- Validate that every modified record its `blob` fields satisifies the following conditions:
  - `~err.BLOBOwnerRecordIDMustBeEmpty~`uncvrd[^3]❓: Target BLOB.OwnerRecordID must be empty
  - `~err.BLOBOwnerRecordMismatch~`uncvrd[^4]❓: BLOB.OwnerRecord does not match the record QName
  - `~err.BLOBOwnerRecordFieldMismatch~`uncvrd[^5]❓: BLOB.OwnerRecordField does not match the record field name
  - `~err.DuplicateBLOBReference~`uncvrd[^6]❓: Multiple records in CUD collection cannot refer to the same BLOB
- `~cmp.UpdateBLOBOwnership~`uncvrd[^7]❓: Operator of the CP that updates the BLOB.OwnerRecordID and BLOB.OwnerRecordField fields in the BLOB table

[^1]: `[~server.blobs/wdoc.sys.Workspace.BLOB~impl]`
[^2]: `[~server.blobs/tuc.HandleBLOBReferences~impl]`
[^3]: `[~server.blobs/err.BLOBOwnerRecordIDMustBeEmpty~impl]`
[^4]: `[~server.blobs/err.BLOBOwnerRecordMismatch~impl]`
[^5]: `[~server.blobs/err.BLOBOwnerRecordFieldMismatch~impl]`
[^6]: `[~server.blobs/err.DuplicateBLOBReference~impl]`
[^7]: `[~server.blobs/cmp.UpdateBLOBOwnership~impl]`
