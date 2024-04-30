# Development Services

```mermaid
    graph TD

    %% Entities ====================

    Developer[Developer]:::B

    vsqlddl[\VSQL DDL/]:::H  
    pkg.exttinygo:::S
    cmd.vpm:::S

    ExtDevelopment([Extensions Development]):::S
    Development([Application Development]):::B


    %% Relations ====================

    pkg.exttinygo --> ExtDevelopment
    cmd.vpm --> ExtDevelopment
    Developer --> Development
    vsqlddl -.- Development

    ExtDevelopment --- Development


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

- Function `main()` and module `main` is a must, ref. https://github.com/tinygo-org/tinygo/issues/2703
