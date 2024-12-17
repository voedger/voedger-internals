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
    adsn:::S
    fdsn:::S
    tdsn:::S
    story:::S
    src:::S

    feat --x adsn
    feat --x story
    adsn --x src
    story --x fdsn
    story --x tdsn
    tdsn --x src
    fdsn --x src
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

- feat: Feature
- story: User Story
- fdsn: Functional Design
- tdsn: Technical Design
- adsn: Architectural Design
- src: Source Code
    - impl: Implementation
    - test: Unit Test
    - itest: Integration Test

