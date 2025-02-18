# Table of contents

- [Introduction](README.md)

## 💡Concepts

- [Event Sourcing & CQRS](concepts/evsrc/README.md)
- [Editions (deprecated)](concepts/editions/README.md)
  - [Community Edition](concepts/editions/ce.md)
  - [Standart Edition](concepts/editions/se.md)
  - [Standart Edition (v1)](concepts/editions/se1.md)

## 🚀Server

- [Overview (Server)](server/README.md)
- Design
  - [Query Processor](server/design/qp.md)
  - [API Gateway implementation](server/design/agw.md)
  - [N1 Cluster](server/design/c2.n1.md)
  - [N3 Cluster](server/design/c2.n3.md)
  - [N5 Cluster](server/design/c2.n5.md)
  - [Orchestration](server/design/orch.md)
  - [Packages overview]
    - [sys](server/design/pkgsys.md)
    - [registry](server/design/pkgregistry.md)
- Features  
  - API Gateway
    - [API v2](server/apiv2/README.md)
      - [API conventions](server/apiv2/conventions.md)
      - [Create document or record](server/apiv2/create-doc.md)
      - [Update document or record](server/apiv2/update-doc.md)
      - [Deactivate document or record](server/apiv2/deactivate-doc.md)
      - [Read document or record](server/apiv2/read-doc.md)
      - [Read from CDoc collection](server/apiv2/read-cdocs.md)
      - [Read from query](server/apiv2/read-from-query.md)
      - [Read from view](server/apiv2/read-from-view.md)
      - [Query constraints](server/apiv2/query-constraints.md)
      - [Execute command](server/apiv2/execute-command.md)
      - [Create BLOB](server/apiv2/create-blob.md)
      - [Read BLOB](server/apiv2/read-blob.md)
      - [Update BLOB metadata](server/apiv2/update-blob-meta.md)
      - [Replace BLOB](server/apiv2/replace-blob.md)
      - [Delete BLOB](server/apiv2/delete-blob.md)
      - [List app workspaces](server/apiv2/list-app-workspaces.md)
      - [List workspace roles](server/apiv2/list-ws-roles.md)
      - [Read workspace role schema](server/apiv2/read-ws-role-schema.md)
    - [API v1](server/api-gateway.md)
      - [API Conventions](server/api-conventions.md)
      - [BLOBs](server/blobs.md)
  - [Admin Endpoint](server/admin-endpoint.md)
  - [Clusters](server/clusters/README.md)
    - [Bootstrap](server/clusters/bootstrap.md)
    - [Monitoring](server/mon.md)
    - [Secure prometheus and grafana](server/secure-prometheus-grafana.md)
    - [Alerting](server/alerting.md)
  - [VVMs](server/vvms/README.md)
  - [Applications](server/apps/README.md)
    - [Deploy Application](server/apps/deploy-app.md)
    - [Sidecar Applications](server/sidecarapps.md)
  - [Workspaces](server/workspaces/README.md)
    - [Create Workspace](server/workspaces/create-workspace-v2.md)
    - [Deactivate Workspace](server/workspaces/deactivate-workspace.md)
    - [See also (Workspaces)](server/workspaces/workspaces-seealso.md)
  - [Invites](server/invites/README.md)
    - [Invite to Workspace](server/invites/invite-to-ws.md)
    - [Join Workspace](server/invites/join-ws.md)
    - [Leave Workspace](server/invites/leave-ws.md)
    - [Cancel sent Invite](server/invites/cancel-sent-invite.md)
    - [Cancel accepted Invite](server/invites/cancel-accepted-invite.md)
    - [Update Invite roles](server/invites/update-invite-roles.md)
  - [AuthNZ](server/authnz/README.md)
    - [ACL Rules](server/authnz/aclrules.md)
    - [Enrich token](server/authnz/enrich-token.md)
  - [Users](server/users/README.md)
    - [Send Email](server/users/send_email.md)
    - [Reset password](server/users/reset-password.md)
  - [Emails](server/emails/README.md)
    - [Change Email](server/users/change-email.md)
  - [Emails](server/emails/README.md)
  - [Jobs](server/jobs.md)
  - VSQL DATA
    - [Types](server/vsql/types.md)
    - [SELECT, UPDATE](server/vsql/select-update.md)
    - [Uniques With Multiple Fields](server/vsql/uniques-multi.md)
    - [Verifiable Fields](server/vsql/ver-fields.md)
    - [See also (VSQL)](server/vsql/vsql-seealso.md)
  - DMBS Drivers
    - [AmazonDB Driver](server/amazondb-driver.md)
  - Frozen
    - [Ephemeral Storage](server/ephemeral-storage.md)
    - [Storage Extensions](server/storage-extensions.md)

## 🛠️Framework

- [Overview (Framework)](framework/README.md)
- Features
  - [vpm](framework/vpm/README.md)
  - [vpm init](framework/vpm/init.md)
  - [vpm tidy](framework/vpm/tidy.md)
  - [vpm baseline](framework/vpm/baseline.md)
  - [vpm orm](framework/vpm/orm.md)
  - [vpm build](framework/vpm/build.md)
  - [API for testing](framework/api-testing.md)

## Development

- [Requirements Management](reqman/README.md)
- [Requirements Management (Overview)](reqman/reqs-overview.md)
- [OpenFastTrace](reqman/oft.md)
- [Examples of the tracing](reqman/tracing-examples.md)
- [Examples of the tracing2](reqman/tracing-examples2.md)
