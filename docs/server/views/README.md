# Views

## Overview

**Views** in voedger are materialized data structures that provide a read-optimized representations of data derived from documents and/or commands.
Views are maintained by projectors that process events and update the view's contents.

Views differ from traditional SQL views in that they are always physically materialized and maintained through event processing rather than being computed on-demand.

### Key characteristics

* Materialized: Views store actual data, not just query definitions
* Key-Value Structure: Each view has a defined key (partition key + clustering columns) and value fields
* Maintained by Projectors: Views are populated and updated by projectors or jobs specified in the RESULT OF clause
* Read Optimization: Designed for efficient querying with specific key structures
* Event-Driven: Updated through event processing rather than real-time queries

### Example use cases

* Dashboard data aggregations (hourly sales, daily reports)
* Indexed lookups (category indexes, client listings)
* Denormalized data for fast retrieval

## Scenarios

- [Declare view](declare-view.md)
- [Populate view](populate-view.md)
- Read from view
  - [Read views using API](../apiv2/read-from-view.md)
  - [Read views in extensions](read-view.md)
- [Sync views](sync-views.md)
