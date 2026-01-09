# Server Design Documentation

## Architecture

- [VVM Architecture](vvm.md) - VVM processors and architecture overview
- [VVM Orchestration](orch.md) - Automated coordination and management of distributed workloads
- [App Workspaces](app-ws.md) - WSID structure, routing, and partitioning

## Consistency and storage

- [Consistency Coordinator](consistency-coordinator.md) - Coordinates consistency checks for sync views and records
- [Consistent Storage](consistent-storage.md) - Offset-consistency in app storage
- [TTL Storage](ttl-storage.md)
- [Sequences](sequences.md) - Sequence implementation and scalability improvements

## Core components

- [API Gateway](agw.md) - API Gateway implementation design
- [Query Processor](qp.md) - Component for querying data and returning it to clients
- [N10N Processor](n10n.md) - Middleware between IN10NBroker and router for SSE handling

## Cluster configurations

- [N1 Cluster](c2.n1.md) - Single-node cluster configuration
- [N3 Cluster](c2.n3.md) - Three-node cluster configuration
- [N5 Cluster](c2.n5.md) - Five-node cluster configuration (deprecated)

## Packages

- [Package sys](pkgsys.md) - Overview of the sys package
- [Package registry](pkgregistry.md) - Overview of the registry package

## Policies

- [HTTP Retry Policy](http-retry-policy.md) - Retry policies for HTTP clients and federation
