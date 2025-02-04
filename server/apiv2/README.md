# APIv2

# Motivation
- [API Gateway (APIv2) #1162](https://github.com/voedger/voedger/issues/1162)
- We need good REST API for Voedger
- Old API must still be available until the new one is fully developed, so we can continue with AIR

# Functional Design
## API Conventions
- see: [API URL](conventions.md)

## REST API Paths
| Action                                                                   | Method | REST API Path                                                                |
|--------------------------------------------------------------------------|--------|------------------------------------------------------------------------------|
| **Docs and records**
| [Create document or record](create-doc.md)                  | POST   | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}`      |
| [Update document or record](update-doc.md)                  | PATCH  | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}` |
| [Deactivate document or record](deactivate-doc.md)          | DELETE | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}` |
| [Read document or record](read-doc.md)                      | GET    | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}` |
| [Read from CDoc Collection](read-cdocs.md)                  | GET    | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/cdocs/{pkg}.{table}`     |
| **Extensions**
| [Execute Command](execute-command.md)                                      | POST   | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/commands/{pkg}.{command}`|
| [Read from Query](read-from-query.md)                                      | GET    | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/queries/{pkg}.{query}`   |
| **Views**
| [Read from View](read-from-view.md)                                        | GET    | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/views/{pkg}.{view}`      |
| **BLOBs**
| [Create/upload a new BLOB](create-blob.md)                     | POST   | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs`                   |
| [Retrieve/download the BLOB](read-blob.md)                 | GET    | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| [Update an existing BLOB's metadata](update-blob-meta.md) | PATCH  | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| [Replace an existing BLOB](replace-blob.md)                    | PUT    | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| [Delete a BLOB](delete-blob.md)                               | DELETE | `/api/v2/users/{owner}/apps/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| **Schemas**
| [List app workspaces](list-app-workspaces.md)    | GET    | `/api/v2/users/{owner}/apps/{app}/schemas`                                      | 
| [List workspace roles](list-ws-roles.md)   | GET    | `/api/v2/users/{owner}/apps/{app}/schemas/{pkg}.{workspace}/roles`              |
| [Read workspace role schema](read-ws-role-schema.md) | GET    | `/api/v2/users/{owner}/apps/{app}/schemas/{pkg}.{workspace}/roles/{pkg}.{role}` |

# Limitations
- sys.CUD function cannot be called directly

# See Also
- [Query Processor](/server/design/qp.md)
- [API Gateway Implementation](/server/design/agw.md)
