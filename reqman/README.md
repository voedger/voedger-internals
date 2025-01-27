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

    reqs:::G
    subgraph reqs[Requirements]
        nfr:::S
        ad:::S
        tdsn:::S
        fdsn:::S
        feat:::S

        nfr --x ad
        ad --x tdsn

        feat --x fdsn
        feat --x tdsn        
    end

    src:::G
    subgraph src[Source code]
        impl:::S
        test:::S
        itest:::S
    end

    reqs --x src
    
    classDef B fill:#FFFFB5,color:#333
    classDef S fill:#B5FFFF,color:#333
    classDef H fill:#C9E7B7,color:#333
    classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5    
```

Requirements
- `nfr`: Non-functional Requirement
- `ad`: Architectural Decision
- `tdsn`: Technical Design
- `fdsn`: Functional Design
- `feat`: Feature

Source Code
    - `impl`: Implementation
    - `test`: Unit Test
    - `itest`: Integration Test

## History

- [adsn, story...]https://github.com/voedger/voedger-internals/blob/4379075396a1fd50275c7eaf7877eb1cb23ab265/reqman/README.md#L26