# Introduction

This documentation provides a detailed description of the internal design and architecture of the Voedger platform.  It serves as a base for the development and includes the latest designs, which may still be not implemented.

Voedger platform consists of **Voedger Framework** and **Voedger Server** that helps to develop and operate distributed applications.

For user-focused documentation and guidance on using the Voedger platform, please visit [here](https://docs.voedger.io/).

To read about the notation used visit [here](https://docs.voedger.io/concepts/notation).

## Voedger Server

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
    
    ClusterCfg([Cluster configuration]):::S
    Monitoring([Monitoring]):::S
    Alerting([Alerting]):::S
    AppMgmt([Application management]):::S  
    RunApp([Application execution]):::S
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


## Voedger Framework

```mermaid
    graph TD

    %% Entities ====================

    Developer[Developer]:::B
    DevelopTests([Develop tests]):::S
    DevelopApps([Develop applications]):::S

    vsqlddl[\VSQL DDL/]:::H  
    pkg.exttinygo:::S
    pkg.exttinygo.tests:::S
    cmd.vpm:::S

    CBD([Config, Build, Deploy]):::S


    %% Relations ====================

    pkg.exttinygo --> DevelopApps
    vsqlddl --> DevelopApps
    
    pkg.exttinygo.tests --> DevelopTests

    cmd.vpm --> CBD

    DevelopApps --> Developer
    CBD --> Developer
    DevelopTests --> Developer

    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333
    classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

Prefixes
- *cmd*: command line utility or server
- *mod*: Go module
- *pkg*: Go package
- *extsoft*: external software