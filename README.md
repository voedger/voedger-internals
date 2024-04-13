# Introduction

This documentation provides a detailed overview of the internal design and architecture of the Voedger platform.

For user-focused documentation and guidance on using the Voedger platform, please visit [here](https://docs.voedger.io/).


## Roles & Services

### Development Services

```mermaid
    graph TD

    %% Entities ====================

    Developer[Developer]:::B

    vsqlddl[\VSQL DDL/]:::H  
    mod.exttinygo:::S
    cmd.vpm:::S

    Development([Development]):::S


    %% Relations ====================

    mod.exttinygo --> Development
    cmd.vpm --> Development
    Development --> Developer
    vsqlddl --> Development


    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333
    classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```


### Operation Services

```mermaid
    graph TD

    %% Entities ====================

    Admin[Admin]:::B
    User[User]:::B

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
- *extsoft*: external software