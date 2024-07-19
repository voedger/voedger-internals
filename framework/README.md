# Voedger Framework

Voedger Framework is a set of tools, libraries and conventions that enable developers to create and deploy Voedger applications.

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
- *cmd*: command line utility
- *mod*: Go module
- *pkg*: Go package
- *extsoft*: external software

## Principles

- Simplified validation (e.g. references, uniquess are not validated)

## Context

- geeksforgeeks.org: [What is a Framework?](https://www.geeksforgeeks.org/what-is-a-framework/) (Инструментарий для разработки)
- bocasay.com: [What is a development framework?](https://www.bocasay.com/what-is-development-framework)
