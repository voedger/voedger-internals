# API Gateway implementation
Design of the implementation of the API Gateway.

# Motivation
[API Gateway (APIv2)](https://github.com/voedger/voedger/issues/1162)

# Context
```mermaid
flowchart
qp1[/Query Processor v1/]:::S
qp2[/Query Processor v2/]:::S
cp[/Command Processor/]:::S
vvm[[vvm]]:::S
rh1[Request Handler /api/]:::S
rh2[Request Handler /api/v2/]:::S

%% Relations ======================
vvm --- |has one|rh1
vvm --- |has one|rh2
vvm --x |has many|qp1
vvm --x |has many|qp2
vvm --x |has many|cp

rh1 -.-> |serves|qp1
rh1 -.-> |serves|cp
rh2 -.-> |serves|qp2
rh2 -.-> |serves|cp



%% Styles ====================
classDef B fill:#FFFFB5,color:#333
classDef S fill:#B5FFFF,color:#333
classDef H fill:#C9E7B7,color:#333
classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

# Components
- Command Processor: `processors/command`
- Query Processor 1: `processors/query`
- Query Processor 2: `processors/query2`
- Request Handler `vvm/impl_requesthandler.go`

# Request dispatching
```mermaid
flowchart
qpMessage1>Query Message v1]:::S
qpMessage2>Query Message v2]:::S
cpMessage1>Command Message v1]:::S
cpMessage2>Command Message v2]:::S
qp1[/Query Processor v1/]:::S
qp2[/Query Processor v2/]:::S
cp[/Command Processor/]:::S
rh1[Request Handler /api/]:::S
rh2[Request Handler /api/v2/]:::S

%% Relations ======================

rh1 -.-x |for &quot;q&quot; prefix sends to bus|qpMessage1
rh1 -.-x |for &quot;c&quot; prefix sends to bus|cpMessage1

rh2 -.-x |HTTP GET|qpMessage2
rh2 -.-x |HTTP PUT,POST,PATCH|cpMessage2

qpMessage1 -.-x |handled by|qp1
cpMessage1 -.-x |handled by|cp

qpMessage2 -.-x |handled by|qp2
cpMessage2 -.-x |handled by|cp


%% Styles ====================
classDef B fill:#FFFFB5,color:#333
classDef S fill:#B5FFFF,color:#333
classDef H fill:#C9E7B7,color:#333
classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

# See Also
- [Design: Query Processor](/server/design/qp.md)
- [Design: API v2](/server/apiv2/README.md)

