# Storage Extensions

- https://github.com/voedger/voedger/issues/2366

We have a number of built-in storages but there should be a way to extend the storage capabilities.

## Analysis

Currently we can load storage as a Go plugin. There are two approaches:

1. Load plugins when Voedger starts (Sidecar Storage Extensions)
2. Load plugins as a part of the application (Per-app Storage Extensions)

| | Sidecar Storage Extensions| Per-app Storage Extensions|
|--------|--------|--------|
| More stable | Yes👍 | No |
| Can cause memory problems | No👍 | Yes |
| Upgradable| No| Yes👍|
| Easy to operate| No| Yes👍 |
| Easy to develop| No| Yes👍 |

We start with the Per-app Storage Extensions approach since it is easier to implement. Sidecar Storage Extensions advantages matter when we host a lot of applications and do not want them to provide their own storage extensions (storage extensions are unsafe).


## Principles

- Storage Extension deployed as a part of an application
- Storage Extension is a golang plugin
  - Plugins are currently supported only on Linux, FreeBSD, and macOS
  - If a Storage Extension is updated some resources related to the previous instance are wasted
  - Multiple versions of Storage Extension can be instantiated
  - Storage must have a `Free()` method that is called when a storage instance is not needed anymore
  - Storage must have a `ILogger` interface as an input parameter
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
  - `storages-$version.so` is copied (if needed) to some `storages` folder and loaded from there
- IAppPartition.Storage(FullQName) IStorage // QName ???
- pkg/iextstgengine
  - 📂goplugin
  - IStateStorage
- refactor current sources: pkg/sys/storages
- STATESTORAGE ENGINE BUILTIN
- STATESTORAGE ENGINE GOPLUGIN