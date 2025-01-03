# Table of contents

- [Introduction](README.md)
- [Concepts](concepts/README.md)
  - [Event Sourcing & CQRS](concepts/evsrc/README.md)
  - [Editions (deprecated)](concepts/editions/README.md)
    - [Community Edition](concepts/editions/ce.md)
    - [Standart Edition](concepts/editions/se.md)
    - [Standart Edition (v1)](concepts/editions/se1.md)
- [Server](server/README.md)
  - Architecture
    - [N1 Cluster](server/arch/c2.n1.md)
    - [N3 Cluster](server/arch/c2.n3.md)
    - [N5 Cluster](server/arch/c2.n5.md)
    - [pkg.sys](server/arch/sys/README.md)
      - [Invites](server/arch/sys/c4.invites.md)
  - [API Gateway](server/api-gateway.md)
    - [API Conventions](server/api-conventions.md)
    - [AuthNZ](server/authnz/README.md)
    - [BLOBs](server/blobs.md)
  - [Admin Endpoint](server/admin-endpoint.md)
  - [Clusters](server/clusters/README.md)
    - [Bootstrap](server/clusters/bootstrap.md)
    - [Deploy Application](server/clusters/deploy-app.md)
    - [Monitoring](server/mon.md)
    - [Secure prometheus and grafana](server/secure-prometheus-grafana.md)
    - [Alerting](server/alerting.md)
  - [VVMs](server/vvms/README.md)
    - [Sidecar Applications](server/sidecarapps.md)
    - DMBS Drivers
      - [AmazonDB Driver](server/amazondb-driver.md)
  - [Workspaces](server/workspaces/README.md)
    - [Create Workspace](server/workspaces/create-workspace-v2.md)
    - [Child Workspaces](server/workspaces/child-workspaces.md)
    - [Deactivate Workspace](server/workspaces/deactivate-workspace.md)
  - [Invites](server/invites/invites.md)
  - VSQL
    - [VSQL Types](server/vsql/types.md)
    - [VSQL: SELECT, UPDATE](server/vsql/select-update.md)
    - [Uniques With Multiple Fields](server/vsql/uniques-multi.md)
    - [Verifiable Fields](server/vsql/ver-fields.md)
    - [Ephemeral Storage](server/ephemeral-storage.md)
    - [Jobs](server/jobs.md)
    - [Storage Extensions](server/storage-extensions.md)
- [Framework](framework/README.md)
  - [vpm](framework/vpm/README.md)
    - [vpm init](framework/vpm/init.md)
    - [vpm tidy](framework/vpm/tidy.md)
    - [vpm baseline](framework/vpm/baseline.md)
    - [vpm orm](framework/vpm/orm.md)
    - [vpm build](framework/vpm/build.md)
  - [API for testing](framework/api-testing.md)
- Development
  - [Requirements Management](reqman/README.md)