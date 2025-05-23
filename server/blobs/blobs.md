---
reqmd.package: server.blobs
---

# BLOBS

Working with BLOBs (Binary Large Objects).

## Use cases

- [Read BLOB](../apiv2/read-blob.md)
- [Create BLOB](../apiv2/create-blob.md)

## Technical design

### Definitions

- BLOB.OwnerRecord: QName of the record that owns the BLOB
- BLOB.OwnerRecordField: Name of the field that owns the BLOB
- CUD collection: Collection of CUDs (Create, Update, Deactivate) that are executed in the same transaction


### Components overview

- `~wdoc.sys.Workspace.BLOB~`uncvrd[^1]❓
- `~tuc.HandleBLOBReferences~`uncvrd[^2]❓: Handling references to blob by Command Processor

### CP: tuc.HandleBLOBReferences

- Validate that every modified record its `blob` fields satisifies the following conditions:
  - `~err.BLOBOwnerRecordIDMustBeEmpty~`: Target BLOB.OwnerRecordID must be empty
  - `~err.BLOBOwnershipMismatch~`: BLOB.OwnerRecord and BLOB.OwnerRecordField must match the record QName and the field
  - `~err.DuplicateBLOBReference~`: Multiple records in CUD collection cannot refer to the same BLOB
- `~cmp.UpdateBLOBOwnership~`: Operator of the CP that updates the BLOB.OwnerRecordID and BLOB.OwnerRecordField fields in the BLOB table

[^1]: `[~server.blobs/wdoc.sys.Workspace.Blob~impl]`
[^2]: `[~server.blobs/tuc.CPHandleBlobs~impl]`
