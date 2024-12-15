# Requirements Management

Requirements tracing using [OpenFastTrace (OFT)](https://github.com/itsallcode/openfasttrace/blob/main/doc/user_guide.md).

## Prerequisites

- bash
- Java 17.0+

## Use

- cd reqman
- bash ./trace.sh
- open .work/report.html

### Artifact types

```mermaid
flowchart TD

    feat:::S
    dsn:::S
    story:::S
    src:::S

    feat --> dsn
    feat --> story
    dsn --> src
    story --> src
    src:::G
    subgraph "src"
        impl:::S
        test:::S
        itest:::S     
    end
    
    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333
    classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5    
```