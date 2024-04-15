# API for testing

## Motivation

- https://github.com/voedger/voedger/issues/1647

## Context

- https://github.com/voedger/voedger/blob/937875623f4291dd33eece8787a817cd71ac7019/pkg/iextenginewazero/impl_test.go#L37

## Proposal
```mermaid
flowchart TD
    State -.-> SafeState
    TestState -.-> SafeState
    TestState -.-> TestAPI
    TestAPI -.-> Tests
    SafeState -.-> SafeAPI
    SafeAPI -.-> pkg.exttinygo
```

packages
- state
  - safestate
  - teststate


## Functional Design

- https://github.com/michael-say/voedger/blob/1647-wasm-state-low-level-api-for-testing/pkg/iextengine/wazero/_testdata/basicusage/main_test.go


## Technical Design

### Principles
- Use events to prepare context CUDs and IArgumentObject data
- Use IAppStructs to prepare View context
- IEvents.PutWlog to prepare WLog context
- SafeStateAPI is a low-level API for State which implements the following principles:
    - used by extension engines
    - automatically converts package paths (extensions work with full paths)
    - Keys, Values, Key- and Value-Builders are represented with numbers, to be transferred between Host and Extension environments.

### Design

```mermaid
flowchart TD
    exttinygo:::G
    exttinygotests:::G
    state:::G
    isafeapi:::G
    safestate:::G
    teststate:::G
    iextengine:::G
    application:::G
    wazero:::G
    processors:::G
    subgraph exttinygo
        internal.State["var SafeStateAPI"]:::S
        hostAPI["hostSafeStateApi"]:::S
        clientStateAPI["Client State API"]:::S
        subgraph exttinygotests
            NewTestAPI["NewTestAPI(...)"]:::S
        end
    end
    subgraph state
        IState:::S
        subgraph isafeapi
            IStateSafeAPI["IStateSafeAPI"]:::S
        end
        subgraph teststate
            ITestState["ITestState"]:::S
            ITestAPI["ITestAPI"]:::S
        end
        subgraph safestate
            safestate.Provide["safestate.Provide(...)"]:::S
        end
    end
    subgraph application["application package"]
        Test:::S
        Extension:::S
    end
    subgraph iextengine
        subgraph wazero
            IExtensionEngineWazero["IExtensionEngineWazero"]:::S
        end

        IExtensionEngine["IExtensionEngine"]:::S
    end
    subgraph processors
        Processor:::S
    end
    
    internal.State -.-> |by default initialized with| hostAPI
    internal.State -.-> |of type| IStateSafeAPI
    internal.State -.-> |used by| clientStateAPI

    NewTestAPI -.-> |1. constructs| ITestState
    NewTestAPI -.-> |2. calls| safestate.Provide
    NewTestAPI -.-> |3. sets| internal.State
    ITestState -.-> |implements| ITestAPI
    ITestState -.-> |implements| IState
    
    ITestAPI -.-> |used by| Test
    safestate.Provide -.-> |to provide| IStateSafeAPI

    hostAPI -.-> |calls host functions| IExtensionEngineWazero
    IExtensionEngine -.-> |can be| IExtensionEngineWazero

    Processor --> |has| IState
    IState -.-> |passed to| safestate.Provide
    IState -.-> |"passed to Invoke(...)"| IExtensionEngine
    IExtensionEngineWazero -.-> |calls| safestate.Provide
    Test -.-> |calls| Extension
    clientStateAPI -.-> |used by|Extension

classDef B fill:#FFFFB5,color:#333
classDef S fill:#B5FFFF,color:#333
classDef H fill:#C9E7B7,color:#333
classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5

```

## Issues

- https://github.com/voedger/voedger/issues/1647
