# Copilot instructions

## Markdown

- Do not add periods to markdown list items
- Add an empty line before markdown lists
- Use sentence capitalization style
- Capitalize previously defined terms
- Do not use numbers in headers

## Go

- Use go 1.24 and above features
- Use `for <idx> = range(<expr>)` whenever appropriate instead of `for <idx> := 0; idx <... ; idx ++`)

## C4 diagrams notation

Notation is based on:
- [ArchiMate](https://en.wikipedia.org/wiki/ArchiMate) (/ˈɑːrkɪmeɪt/ AR-ki-mayt; originally from Architecture-Animate), open and independent enterprise architecture modeling language
  - Brief description: [ArchiMate Metamodel For Enterprise Development](https://www.hosiaisluoma.fi/blog/archimate-metamodel/)
- [Entity–relationship model](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model), describes interrelated things of interest in a specific domain of knowledge
- [C4 model](https://c4model.com/) for visualising software architecture

### C1: Context

Cluster, products, services, roles

```mermaid
graph TD

  %% Entities =================================

  Cluster[[Cluster]]:::H
  Node{{Node}}:::H
  Device[/Device\]:::H  
  SoftwareService([Software Service]):::S  

  ProductLine[[Product line]]:::S
  ProductLine --x |has 1+| Product[Product]:::S
  ExternalSystem1[\External System 1/]:::S
  ExternalSystem2[\External System 2/]:::S
  
  User["@ Role"]:::B
  Company[["Company"]]:::B
  BusinessProcess("&gt; Business process"):::B

  %% Relations =================================
  Device --- |hosts| Product
  Cluster --- |hosts| Product
  Node --- |hosts| Product
  Product --> |provides|SoftwareService

  Product -.-> |sends data to| ExternalSystem1
  ExternalSystem2 -.-> |sends data to| Product
  
  SoftwareService --> |used by| Company
  SoftwareService --> |used by| User
  SoftwareService --> |serves| BusinessProcess
  User --> |assigned to| BusinessProcess
  

  classDef B fill:#FFFFB5,color:#333
  classDef S fill:#B5FFFF,color:#333
  classDef H fill:#C9E7B7,color:#333
  classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```


### C2: Containers

Nodes, databases, workspaces, software components

```mermaid
graph TD
  %% Entities =================================
  User["@ Role"]:::B
  Cluster[[Cluster]]:::H
  Device[/Device\]:::H  
  Application[Application]:::S
  Node{{Node}}:::H
  Database[(Database)]:::H
  AppWorkspace[(App Workspace)]:::S
  UserWorkspace[(User Workspace)]:::S
  SoftwareComponent[#num; Software Component]:::S
  SoftwareService([Software service]):::S
  Event>Event1]:::B
  
  %% Relations =================================

  Cluster --> |runs 1+| Application
  Cluster --x |has 1+| Node
  Application --x |has 1+| AppWorkspace
  Application --x |has 0+| UserWorkspace

  Node --x Database
  Node --> |runs| SoftwareComponent
  UserWorkspace -->|provides| SoftwareService


  SoftwareService -.->|sends data to|Device
  Device --> |generates| Event
  Event --> |triggers| User
  
    
  classDef B fill:#FFFFB5,color:#333
  classDef S fill:#B5FFFF,color:#333
  classDef H fill:#C9E7B7,color:#333
  classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

### C3: Components

Views, projectors, tables, fields


```mermaid
graph TD

%% Entities =================================
 
Role1["@ Role1"]:::B
Role2["@ Role2"]:::B

SoftwareComponents:::G
Workspace2[(Workspace 2)]:::S
subgraph SoftwareComponents[Workspace1]
  Command1("#gt;  Command1"):::S
  Command2("#gt; Command2"):::S
  Query1("< Query1"):::S
  Projector1[/Projector1/]:::S
  Projector2[/Projector2/]:::S
  View1[["View1"]]:::H
  Table1["cdoc.Table1"]:::H
  Table2["extpkg.cdoc.Table1"]:::H
  ViewField1([Field1]):::H
  ViewField2([Field2]):::H
  sys.CreateChildWorkspace("#gt; sys.CreateChildWorkspace"):::S
end  

%% Relations =================================

Role1 --> |calls| Command1
Role1 --> |calls| Query1
Command1 --> |ON INSERT| Projector1
Command1 -.-> |creates| Table1
Projector1 -.-> |maintains|View1
Query1 -.- |reads from|View1
View1 --- |contains| ViewField1
View1 --- |contains| ViewField2

Role2 --> |calls| Command2
Command2 --> |ON INSERT| Projector2
Projector2 --> |executes|sys.CreateChildWorkspace
Command2 -.-> |creates| Table2

sys.CreateChildWorkspace -..-> |creates| Workspace2

classDef B fill:#FFFFB5,color:#333
classDef S fill:#B5FFFF,color:#333
classDef H fill:#C9E7B7,color:#333
classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```
