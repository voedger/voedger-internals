# Introduction

This documentation provides a detailed description of the design and architecture of the Voedger platform.  It serves as a reference for developers and includes the latest designs, which may still be not implemented.

For user-focused documentation and guidance on using the Voedger platform, please visit [here](https://docs.voedger.io/).

The documentation is written around the following concepts:
"The documentation is organized around the following key concepts:
- **Service**: Provided by Voedger.
    - There are Operation and Development services.
- **Role**: Which consumes the services.
- **Architecture**: The specific software architecture upon which Voedger is built.
- **Voedger Concepts**: Complex concepts that may not be designed and used as a part of the particular product service.


## Operation Services

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
    
    ClusterCfg([Cluster Configuration]):::S
    Monitoring([Monitoring]):::S
    Alerting([Alerting]):::S
    AppMgmt([Application Management]):::S  
    RunApp([Application Execution]):::S
    APIGateway([API Gateway]):::S

    %% Relations ====================

    scylla --> DBMS
    DBMS --> cmd.voedger

    cmd.ctool --> ClusterCfg
    ClusterCfg --> Admin
    ClusterCfg --> |configures| grafana
    ClusterCfg --> |configures| alertmanager

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


## Development Services

```mermaid
    graph TD

    %% Entities ====================

    Developer[Developer]:::B

    vsqlddl[\VSQL DDL/]:::H  
    pkg.exttinygo:::S
    cmd.vpm:::S

    CBD([Config, Build, Deploy]):::S
    Coding([Coding]):::S


    %% Relations ====================

    pkg.exttinygo --> Coding
    vsqlddl --> Coding
    
    cmd.vpm --> CBD

    Coding --> Developer
    CBD --> Developer

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