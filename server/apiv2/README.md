# APIv2

# Motivation
- [API Gateway (APIv2) #1162](https://github.com/voedger/voedger/issues/1162)
- We need good REST API for Voedger
- Old API must still be available until the new one is fully developed, so we can continue with AIR

# Functional Design
## API Conventions
- see: [API URL](conventions.md)

## REST API Paths
| Action                                                    | REST API Path                                                                |
|-----------------------------------------------------------|------------------------------------------------------------------------------|
| **Authentication** |
| [Creates a new principal token](login.md)                 | `POST /api/v2/apps/{owner}/{app}/auth/login` |
| [Refreshes a valid principal token](refresh.md)           | `POST /api/v2/apps/{owner}/{app}/auth/refresh` |
| **Logins** |
| [Create(register) a new user](create-user.md)             | `POST /api/v2/apps/{owner}/{app}/users` |
| [Change user password](change-password.md)                | `POST /api/v2/apps/{owner}/{app}/users/change-password` |
| **Devices** |
| [Create(register) a new device](create-device.md)         | `POST /api/v2/apps/{owner}/{app}/devices`                               |
| **Docs and records** |
| [Create document or record](create-doc.md)                | `POST /api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}`      |
| [Update document or record](update-doc.md)                | `PATCH /api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}` |
| [Deactivate document or record](deactivate-doc.md)        | `DELETE /api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}` |
| [Read document or record](read-doc.md)                    | `GET /api/v2/apps/{owner}/{app}/workspaces/{wsid}/docs/{pkg}.{table}/{id}` |
| [Read from CDoc Collection](read-cdocs.md)                | `GET /api/v2/apps/{owner}/{app}/workspaces/{wsid}/cdocs/{pkg}.{table}`     |
| **Extensions** |
| [Execute Command](execute-command.md)                     | `POST /api/v2/apps/{owner}/{app}/workspaces/{wsid}/commands/{pkg}.{command}`|
| [Read from Query](read-from-query.md)                     | `GET /api/v2/apps/{owner}/{app}/workspaces/{wsid}/queries/{pkg}.{query}`   |
| **Views** |
| [Read from View](read-from-view.md)                       | `GET /api/v2/apps/{owner}/{app}/workspaces/{wsid}/views/{pkg}.{view}`      |
| **BLOBs**
| [Create/upload a new BLOB](create-blob.md)                | `POST /api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs`                   |
| [Retrieve/download the BLOB](read-blob.md)                | `GET /api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| [Replace an existing BLOB](replace-blob.md)               | `PUT /api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| [Delete a BLOB](delete-blob.md)                           | `DELETE /api/v2/apps/{owner}/{app}/workspaces/{wsid}/blobs/{blobId}`          |
| **Schemas**
| [List app workspaces](list-app-workspaces.md)             | `GET /api/v2/apps/{owner}/{app}/schemas`                                      | 
| [List workspace roles](list-ws-roles.md)                  | `GET /api/v2/apps/{owner}/{app}/schemas/{pkg}.{workspace}/roles`              |
| [Read workspace role schema](read-ws-role-schema.md)      | `GET /api/v2/apps/{owner}/{app}/schemas/{pkg}.{workspace}/roles/{pkg}.{role}` |

# Limitations
- sys.CUD function cannot be called directly

# See Also
- [Query Processor](/server/design/qp.md)
- [API Gateway Implementation](/server/design/agw.md)
