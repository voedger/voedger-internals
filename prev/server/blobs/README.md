# BLOBs (Binary Large Objects)

This folder contains documentation for the BLOB functionality in the Voedger platform, which enables handling of binary data such as files, images, documents, and other large objects within Voedger applications.

## Overview

BLOBs in Voedger are binary large objects that can be stored and retrieved through the platform's API. They are designed to handle file uploads, downloads, and management within the context of Voedger workspaces and applications.

### Key Features

- **Secure Upload/Download**: BLOBs are uploaded and downloaded with proper authentication and authorization
- **Workspace Integration**: BLOBs are associated with specific workspaces and applications
- **Metadata Management**: BLOBs store metadata including content type, name, and ownership information
- **Field Association**: BLOBs can be associated with specific fields in documents and records
- **Reference Integrity**: The system ensures proper ownership and reference management

## Documentation Structure

### Core Documentation

| File                                 | Description                                                                                                                        |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| [`blobs.md`](blobs.md)               | **Main technical design document** - Comprehensive overview of BLOB architecture, components, and technical implementation details |
| [`blobs0.md`](blobs0.md)             | **First implementation** - Initial implementation details with sequence diagrams for upload/download workflows                     |
| [`declare-blob.md`](declare-blob.md) | **BLOB Declaration** - Documentation on how to declare and configure BLOBs                                                         |

### Related API Documentation

The BLOB functionality is exposed through API v2. Related documentation can be found in the [`../apiv2/`](../apiv2/) folder:

| API Endpoint           | Documentation                                                                                              |
|------------------------|------------------------------------------------------------------------------------------------------------|
| **Create/Upload BLOB** | [`../apiv2/create-blob.md`](../apiv2/create-blob.md)                                                       |
| **Read/Download BLOB** | [`../apiv2/read-blob.md`](../apiv2/read-blob.md)                                                           |
| **Delete BLOB**        | [`../apiv2/delete-blob.md`](../apiv2/delete-blob.md)                                                       |
| **Temporary BLOBs**    | [`../apiv2/create-tblob.md`](../apiv2/create-tblob.md), [`../apiv2/read-tblob.md`](../apiv2/read-tblob.md) |

## Quick Start

1. **Understanding BLOBs**: Start with [`blobs.md`](blobs.md) for the complete technical overview
2. **Implementation Details**: Review [`blobs0.md`](blobs0.md) for sequence diagrams and workflow understanding
3. **API Usage**: Check the API documentation in [`../apiv2/`](../apiv2/) for practical implementation

## Key Concepts

### BLOB Ownership

- **OwnerRecord**: QName of the record that owns the BLOB
- **OwnerRecordField**: Name of the field that owns the BLOB
- **OwnerRecordID**: Reference to the specific record instance

### BLOB Types

- **Regular BLOBs**: Persistent binary objects associated with documents/records
- **Temporary BLOBs (TBLOBs)**: Short-lived binary objects for temporary use

### Security & Authorization

- BLOBs are protected by Voedger's authentication and authorization system
- Upload permissions are granted through the `sys.BLOBUploader` role
- Download access is controlled based on document/record permissions

## Technical Components

- **WDoc sys.Workspace.BLOB**: Workspace document for storing BLOB metadata
- **HandleBLOBReferences**: Command processor for handling BLOB field references
- **Router.BLOBber**: HTTP router component for BLOB upload/download endpoints
- **IBlobStorage**: Interface for underlying blob storage implementation

## See Also

- [API v2 Documentation](../apiv2/README.md) - Complete API reference
- [Voedger Framework](../../framework/README.md) - Platform framework documentation
- [Server Architecture](../README.md) - Overall server architecture