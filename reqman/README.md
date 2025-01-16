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

    ad:::S
    feat:::S
    adsn[c2, c3]:::S
    story:::S
    src:::S

    ad --x adsn
    ad --x src
    feat --x adsn
    feat --x story
    adsn --x src
    story --x adsn
    src:::G
    subgraph src[Source code]
        impl:::S
        test:::S
        itest:::S
    end
    
    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333
    classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5    
```

- `ad`: Architectural Decision
- `feat`: Feature
- `story`: User Story
- `c2, c3`: [C2-](https://c4model.com/diagrams/container), [C3-level](https://c4model.com/diagrams/component) requirements (ref. [The C4 model for visualising software architecture](https://c4model.com/)).
- Source Code
    - `impl`: Implementation
    - `test`: Unit Test
    - `itest`: Integration Test

