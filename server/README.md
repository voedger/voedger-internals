# Voedger Server

```mermaid
    graph TD

    %% Entities ====================

    Admin[Admin]:::B
    User[Application User]:::B

    cmd.voedger:::S
    cmd.ctool:::S  
    grafana[extsoft.grafana]:::G
    alertmanager[extsoft.alertmanager]:::G
    scylla[extsoft.scylla]:::G

    DBMS([DBMS]):::S
    
    ClusterMgmt([Cluster Management]):::S
    Monitoring([Monitoring]):::S
    Alerting([Alerting]):::S
    AppMgmt([Application Management]):::S  
    RunApp([Application Execution]):::S
    APIGateway([API Gateway]):::S

    %% Relations ====================

    scylla --> DBMS
    DBMS --> cmd.voedger

    cmd.ctool --> ClusterMgmt
    ClusterMgmt --> Admin
    ClusterMgmt --> |configures| grafana
    ClusterMgmt --> |configures| alertmanager

    grafana --> Monitoring
    alertmanager --> Alerting
    Monitoring --> Admin
    Alerting --> Admin

    cmd.voedger --> AppMgmt
    AppMgmt --> Admin

    cmd.voedger --> RunApp
    RunApp -.- APIGateway

    cmd.voedger --> APIGateway
    APIGateway --> User

    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333
    classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

Prefixes
- *cmd*: command line utility
- *mod*: Go module
- *pkg*: Go package
- *extsoft*: external software

## Documentation structure

Documentation is organized as follows:

- Architecture folder contains the server and components architecture in C4 model notation
- Other folders contain the documentation about features and use cases