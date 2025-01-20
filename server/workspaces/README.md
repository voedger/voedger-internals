# Workspaces

## Principles

- Workspace can be AppWorkspace, ProfileWorkspace or ChildWorkspace
- Number of AppWorkspaces is fixed during application deployment and can not be changed
- ProfileWorkspace keeps Subject data, including list of ChildWorkspace-s
  - `sys.UserProfile`, `sys.DeviceProfile`
- ChildWorkspace: `air.Restaurant` etc.
  - ChildWorkspace keeps list of other ChildWorkspaces  
- Workspace has the OwningDocument
- OwningDocument: a document whose fields {WSID, wsError} will be updated when workspace will be ready
- Currently, OwningDocument kinds: `cdoc.registry.Login`, `cdoc.sys.ChildWorkspace`
- // TODO: Clearing the owner.error causes the workspace to be regenerated
- OwningDocument.error must NOT be published to CUD function (only System can update)

## Concepts

### Workspace Kinds

| English     | Russian     |
| ----------- | ----------- |
| Workspace| Рабочая область       |
| App Workspace   |Рабочая область приложения|
| Profile Workspace   | Профиль        |
| Child Workspace (can be also called `User Workspace`)   |Дочерняя рабочая область|

```mermaid
erDiagram
  Workspace||--|| AppWorkspace: "can be"
  Workspace||--|| ProfileWorkspace: "can be"
  Workspace||--|| ChildWorkspace: "can be"

  AppWorkspace ||--|{ cdoc_sys_Login: "e.g. can keep"
  AppWorkspace ||--|{ cdoc_sys_WorkspaceID: "e.g. can keep"

  ProfileWorkspace ||--|{ UserProfile: "can be"
  ProfileWorkspace ||--|{ DeviceProfile: "can be"

  ChildWorkspace ||--|{ air_Restaurant: "e.g. can be"
  ChildWorkspace ||--|{ slack_Organization: "e.g. can be"
```

### Owning Document

> "Doc from App owns Workspace" means that
Workspace.Docs[sys.WorkspaceDescriptor].OwnerID = Doc.ID AND Workspace.Docs[sys.WorkspaceDescriptor].App = Doc.App

```mermaid
erDiagram


  app_sys_registry ||--|{ app_sys_registry_AppWorkspace: "has (10)"

  app_sys_registry_AppWorkspace ||--|| AppWorkspace: "is"

  app_sys_registry_AppWorkspace ||--|{ cdoc_sys_Login: "has"
  cdoc_sys_Login ||--|| ProfileWorkspace: "owns"
  UserApp ||--|| Cluster: "running one per"
  UserApp ||--|{ ProfileWorkspace: "has"

  ProfileWorkspace ||--|{ cdoc_ChildWorkspace: "has"
  cdoc_ChildWorkspace ||--|| ChildWorkspace: "owns"
  AppWorkspace||--|| Workspace: "is"
  ProfileWorkspace||--|| Workspace: "is"
  ChildWorkspace||--|| Workspace: "is"

  Workspace||--|| cdoc_sys_WorkspaceDescriptor: "has"

  cdoc_sys_WorkspaceDescriptor{
    OwnerApp AppQName
    OwnerID RecordID "Owner fields {WSID, WorkspaceError} will be updated by workspace creation proc"
    OwnerWSID WSID
    OwnerQName QName
    CreatedAtMs  int64
    InitStartedAtMs int64
    InitCompletedAtMs int64 "will be updated by workspace creation proc"
    CreateError string "e.g. wrong workspace init data"
    InitError string "will be updated by workspace creation proc"
    WSName string
    WSKind  QName
    WSKindInitializationData string "json"
    TemplateName string
    TemplateParams string
    WSID WSID "current WSID"
  }
```

### Workspace-related tables

```mermaid
erDiagram


  ProfileWorkspace ||--o{ cdoc_sys_JoinedWorkspace: "has"
  ProfileWorkspace || -- || Workspace: is

  cdoc_sys_JoinedWorkspace ||--|| cdoc_sys_WorkspaceDescriptor: "refers to another WS"

  AppWorkspace || -- || Workspace: is
  %% ??? one-to-one
  AppWorkspace ||--|{ cdoc_sys_WorkspaceID: "has"


  Workspace || -- || AppWorkspaceDescriptorCDoc: has
  Workspace || -- || cdoc_sys_WorkspaceDescriptor: has
  Workspace || -- |{ cdoc_sys_Subject: has
  Workspace || -- |{ cdoc_sys_ChildWorkspace: has



  AppWorkspaceDescriptorCDoc ||--|| cdoc_sys_UserProfile: "can be"
  AppWorkspaceDescriptorCDoc ||--|| cdoc_sys_DeviceProfile: "can be"
  AppWorkspaceDescriptorCDoc ||--|| AnyCustomCDoc: "can be"

  cdoc_sys_WorkspaceDescriptor ||--|| cdoc_sys_ChildWorkspace: "refers to parent WS"

  Workspace || -- || WSID: "addressed by"

  WSID || -- || cdoc_sys_WorkspaceID: "Normally taken from of WSID field of"
  WSID || -- || istructs_consts: "for AppWorkspace taken from"
```

### Child Workspaces

```mermaid
    flowchart TD

    %% Entities ===============================================================

    registry[(sys.registry)]:::H
    ParentWorkspace[(ParentWorkspace)]:::H
    ParentWorkspaceDescriptor[single.sys.WorkspaceDescriptor]:::H
    ParentSubject[cdoc.sys.Subject]:::H

    IAuthenticator["IAuthenticator"]:::S

    cdoc_ChildWorkspace[cdoc.sys.ChildWorkspace]:::H
    ChildWorkspace[(ChildWorkspace)]:::H
    ChildWorkspaceDescriptor[single.sys.WorkspaceDescriptor]:::H
    SomeFunction["SomeFunction()"]:::S
    OwnerWSID([OwnerWSID]):::H
    aproj.sys.CreateWorkspace:::H

    PrincipalToken[PrincipalToken]:::H
    EnrichedPrincipalToken[Enriched PrincipalToken]:::H

    q.EnrichPrincipalToken["q.sys.EnrichPrincipalToken()"]:::S

    %% Relations ===============================================================



    ParentWorkspace --x cdoc_ChildWorkspace
    ParentWorkspace --x ParentSubject
    ParentWorkspace --- ParentWorkspaceDescriptor

    cdoc_ChildWorkspace -.- OwnerWSID

    ChildWorkspace --- ChildWorkspaceDescriptor
    ChildWorkspaceDescriptor --- OwnerWSID
    ChildWorkspace -.- |provides| SomeFunction
    ChildWorkspace --- |created by| aproj.sys.CreateWorkspace
    aproj.sys.CreateWorkspace --- |eventually triggered by| cdoc_ChildWorkspace

    ParentWorkspaceDescriptor -.-> IAuthenticator
    ParentSubject -.-> IAuthenticator

    IAuthenticator -.-> |Subject workspace principals| q.EnrichPrincipalToken

    PrincipalToken -.-> q.EnrichPrincipalToken
    %% PrincipalToken -.- |taken from| registry
    registry -.- |used to issue| PrincipalToken


    q.EnrichPrincipalToken -.-> EnrichedPrincipalToken

    EnrichedPrincipalToken -.-> SomeFunction


    classDef G fill:#FFFFFF,color:#333,stroke:#000000, stroke-width:1px, stroke-dasharray: 5 5
    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333

```

