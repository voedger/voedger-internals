# State Storage Extensions

- [GitHub Issue #2366](https://github.com/voedger/voedger/issues/2366)

We have a number of built-in state storages, but there should be a way to extend the state storage capabilities:
- [Ephemeral Storage](https://github.com/voedger/voedger-internals/blob/main/server/ephemeral-storage.md)

## Analysis

Currently, we can load storage as a Go plugin. There are two approaches:

1. Load plugins when Voedger starts (Sidecar Storage Extensions)
2. Load plugins as a part of the application (Per-app Storage Extensions)

|                             | Sidecar Storage Extensions | Per-app Storage Extensions |
|-----------------------------|----------------------------|----------------------------|
| More stable                 | Yes 👍                     | No                         |
| More memory problems        | No 👍                      | Yes                        |
| Upgradable                  | No                         | Yes 👍                     |
| Easy to operate             | No                         | Yes 👍                     |
| Easy to develop             | No                         | Yes 👍                     |

We will start with the Per-app Storage Extensions approach since it is easier to implement. Sidecar Storage Extensions' advantages matter when we host a lot of applications and do not want them to provide their own storage extensions (storage extensions are unsafe).

## Principles

- State Storage Extension is deployed as a part of an Application Image
- State Storage Extension is a Go plugin
  - Plugins are currently supported only on Linux, FreeBSD, and macOS
  - If a Storage Extension is updated, some resources related to the previous instance are wasted
  - Multiple versions of a Storage Extension can be instantiated
  - Storage must have a `Free()` method that is called when a storage instance is not needed anymore
  - Storage must have an `ILogger` interface as an input parameter
- Package, development structure:
  - 📂package folder
    - 📂wasm
      - .go files
    - 📂storages
      - .go files
    - .vsql files
- App Image structure:
  - 📂package folder
    - .vsql files
    - pkg.wasm
    - `storages-$version.so` // multiple storages
- App Partition deployment
  - `storages-$version.so` is copied (if needed) to some internal `storages` folder and loaded from there
- IAppPartition.Storage(FullQName) state.IStateStorage
  - // Created during app deployment from iextrowstorage.IRowStorage by appparts.NewIStateStorage(appdef IAppDef, iextrowstorage.IRowStorage)
  - // appdef is needed for typechecking
- pkg/iextsse // State Storage Extensions
  - 📂goplugin
  - IStateStorage

vsql:
```
STATESTORAGE ENGINE BUILTIN (
  Ephemeral (
    GET         SCOPE(COMMANDS, QUERIES, PROJECTORS, JOBS),
    GETBATCH    SCOPE(COMMANDS, QUERIES, PROJECTORS, JOBS),
    READ        SCOPE(QUERIES, PROJECTORS, JOBS),
    INSERT      SCOPE(PROJECTORS),
    UPDATE      SCOPE(PROJECTORS)    
  )
)

STATESTORAGE ENGINE GOPLUGIN (
    STORAGE Http (
        READ SCOPE(QUERIES, PROJECTORS, JOBS)
    );
)
```

## Functional design

### Ephemeral storage

vsql:
```
STATESTORAGE ENGINE BUILTIN (
  EphemeralBills
  
)
STATESTORAGE ENGINE GOPLUGIN (
    STORAGE Http (
        READ SCOPE(QUERIES, PROJECTORS, JOBS)
    );
)
```

Purpose. Store

- Developer prepares an app image with the storages-2.so
- DevOps deploys the image
- Server


## Technical design

- https://github.com/voedger/voedger/blob/main/pkg/iextsse/README.md

## Context

- [sys/sys.vsql](https://github.com/voedger/voedger/blob/d0431125a0aa7b42060fe85bf6aa21872cba4d26/pkg/sys/sys.vsql)
