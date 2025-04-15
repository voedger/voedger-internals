---
reqmd.package: server.design.orch
---

# VVM Orchestration Design

## Overview

**Orchestration** in the context of clusters refers to the automated coordination, scheduling, and management of distributed workloads to optimize resource utilization, ensure reliability, and maintain desired state across multiple computing units.

## Problem Statement

Design reliable orchestration mechanism for VVM (Voedger Virtual Machine) that ensures:

- VVM goroutines work only if leadership is acquired and held
- Clean termination of all goroutines
- Concurrent-safe error handling
- Graceful shutdown capabilities

---

## Functional design

### Actors

- VVMHost: Application that starts and manages VVM
- VVM

### Use VVM

VVMHost creates a VVM instance and launches it. VVM acquires leadership and starts services. VVMHost waits for vvmProblemCtx and shuts down VVM.

```go

  // Create VVM instance
  myVVM := vvm.Provide(...)

  // Launch VVM
  vvmProblemCtx := myVVM.Launch(leadershipDurationSecods, leadershipAcquisitionDuration)

  // Wait for `problemCtx` and optionally for other events like os.Interrupt, syscall.SIGTERM, syscall.SIGINT
  ...

  // Shutdown VVM
  // Might be called immediately after myVVM.Launch()
  err := VVM.Shutdown()

```

---

## Technical design

### Implementation requirements

- Clear ownership and cleanup responsibilities
- All error reporting must use `VVM.updateProblem`
- All algorithms must be finite
- No active goroutines should remain after VVM.Shutdown (except killerRoutine)
- No data races
- Each channel shall be closed exactly once
- Predictable error propagation
- No goroutine leaks (except the intentional killerRoutine)

### Components

- **pkg/vvm**

  - `~VVMConfig.Orch~`covered[^1]✅
  ```golang
  type NumVVM uint32
  type VVMConfig {
    ...
    NumVVM NumVVM // amount of VVMs in the cluster. Default 1
    IP     net.IP // current IP of the VVM. Used as the value for leaderhsip elections
  }
  ```

- **pkg/ielections**
  - Purpose: Describe and implement the interface to acquire and manage leadership for a given key
  - `~IElections~`covered[^2]✅
  - `~ITTLStorage~`covered[^3]✅
    - Interface with methods InsertIfNotExist(), CompareAndSwap(), CompareAndDelete(). To be injected into IElection implementation.
  - `~elections~`covered[^4]✅
    - Implementation of IElections
  - `~ElectionsTestSuite~`covered[^5]✅
    - Single test function that runs multiple tests against `IElections`
    - It will be used from the components that provide ITTLStorage (pkg/vvm/storage)
  - `~ttlStorageMock~`covered[^26]✅
    - Mock implementation of ITTLStorage
  - `~ElectionsTest~`covered[^6]✅
    - Test that uses `ElectionsTestSuite` and ttlStorageMock to test `elections`
- **pkg/vvm/storage**
  - `~ISysVvmStorage~`covered[^7]✅
    - Interface to work with sysvvm keyspace
  - `~TTLStorageTest~`covered[^28]✅
    - Test ITTLStorage using mem provider for IAppStorage
  - `~NewElectionsTTLStorage~`covered[^8]✅
    - Implementation of ITTLStorage
    - `NewElectionsTTLStorage(ISysVvmStorage) elections.ITTLStorage[TTLStorageImplKey, string]`
    - uses `keyspace(sysvvm)` and keys prefixed with `pKeyPrefix_VVMLeader = 1`
  - Incapsulates possible values of `pKeyPrefix`
  - `~ElectionsByDriverTests~`covered[^9]✅
    - Test IELections using TTLStorage backed by different IAppStorage drivers
    - `ielections.ElectionsTestSuite`
    - `~VVM.test.TTLStorageMem~`covered[^20]✅
    - `~VVM.test.TTLStorageCas~`covered[^21]✅
    - `~VVM.test.TTLStorageDyn~`covered[^22]✅
    - `~VVM.test.TTLStorageBbolt~`covered[^23]✅
  - `~KeyPrefix_VVMLeader~`covered[^10]✅
    - Prefix to store leadership data in keyspace(sysvvm)
- **pkg/vvm/impl_orch.go**, **pkg/vvm/impl_orch_test.go**
  - orchestration implementation and tests

---

### VVM

VVM:

- `problemCtx`. Closed by `VVM.updateProblem(err)` (e.g. leadership loss or service failure)
- `problemErrCh`. Channel that receives the error describing the problem, written only once. Content is returned on `Shutdown()`
- `problemErrOnce sync.Once` to ensure `problemErrCh` is written only once
- `vvmShutCtx`. Closed when VVM should be stopped (`Shutdown()` is called outside)
- `servicesShutCtx`. Closed when VVM services should be stopped (but `LeadershipMonitor`) (that should be context for services: `servicesShutCtx` closed -> services pipeline is stopped. Closed when `Shutdown()` is called outside)
- `monitorShutCtx`. Closed after all services are stopped and `LeadershipMonitor` should be stopped
- `shutdownedCtx`. Closed after all (services and `LeadershipMonitor`) is stopped
- `leadershipCtx`. Context for watching leadership. Closed when leadership is lost.
- `numVVM`. Number of VVMs in the cluster
- `ip`. IP address of the VVM

The error propagation follows these principles:

- Single error channel (`problemErrCh`) for reporting critical issues
- Write-once semantics using `sync.Once`
- Non-blocking error reads during shutdown
- Thread-safe error updates via `updateProblem()`

Goroutine hierarchy:

- Main (VVMHost)
  - Launcher
    - LeadershipMonitor
      - KillerRoutine
    - ServicePipeline
  - Shutdowner

Each goroutine's lifecycle is controlled by dedicated context cancellation. (except `killerRoutine`)

#### VVM.Provide()

- `~VVM.Provide~`covered[^11]✅
- wire `vvm.VVM`: consturct apps, interfaces, Service Pipeline. Do not launch anything

#### VVM.Shutdown()

- `~VVM.Shutdown~`covered[^12]✅
- not launched -> panic
- close(VVM.vvmShutCtx)
- Wait for `VVM.shutdownedCtx`
- Return error from `VVM.problemErrCh`, non-blocking.

#### VVM.Launch() problemCtx

- `~VVM.LaunchVVM~`covered[^13]✅
- launched already -> panic
- vvmProblemCtx := VVM.Launch(leadershipAcquisitionDuration)
  - go Shutdowner
  - err := tryToAcquireLeadership()
    - construct `IElections` and store `electionsCleanup()` in VVM
    - use `IElections`
  - if err == nil
    - err = servicePipeline
  - if err != nil
    - call `VVM.updateProblem(err)`
  - return VVM.problemCtx

#### Shutdowner: go VVM.shutdowner()

- `~VVM.Shutdowner~`covered[^14]✅
- Wait for `VVM.vvmShutCtx`
- Shutdown everything but `LeadershipMonitor` and `elections`
  - close `VVM.servicesShutCtx` and wait for services to stop
- Shutdown `LeadershipMonitor` (close `VVM.monitorShutCtx` and wait for `LeadershipMonitor` to stop)
- Cleanup `elections`
  - `VVM.electionsCleanup()`
  - // Note: all goroutines will be stopped and leaderships will be released
- Close `VVM.shutdownedCtx`

#### LeadershipMonitor: go VVM.leadershipMonitor()

- `~LeadershipMonitor~`covered[^15]✅
- wait for any of:
  - `VVM.leadershipCtx` (leadership loss)
    - go `killerRoutine`
      - `~processKillThreshold~`covered[^16]✅: leadershipDurationSecods/4
      - After `processKillThreshold` seconds kills the process
      - // Never stoped, process must exit and goroutine must die
      - // Yes, this is the anti-patterm "Goroutine/Task/Thread Leak"
    - `VVM.updateProblem(leadershipLostErr)`
    - break
  - `VVM.monitorShutCtx`
    - break

#### VVM.tryToAcquireLeadership(leadershipDurationSecods, leadershipAquisitionDuration)

- `~VVM.tryToAcquireLeadership~`covered[^17]✅
- Try to acquire leadership during `leadershipAcquisitionDuration`
  - obtain an instance of `elections.IElections`: Interface to acquire and manage leadership for a given key
    - store `VVM.electionsCleanup`
  - Leadership key is choosen in the [1, `VVM.numVVM`] interval
  - Leadership value is `VVM.ip`
  - Do not wait for `servicesShutCtx` because Launch is blocking method

- If leadership is acquired
  - Set `VVM.leadershipCtx`
  - go `LeadershipMonitor`
- Else return `leadershipAcquisitionErr`

#### VVM.updateProblem(err)

- `~VVM.updateProblem~`covered[^18]✅
- synchronized via `VVM.problemErrOnce`
  - Close `VVM.problemCtx`
  - Write error to `VVM.problemErrCh` using `VVM.problemErrOnce`

---

## Experiments with LLMs

- Claude
  - [Flowchart](https://claude.site/artifacts/ccefba09-b102-4179-ab59-184a7fc99122)
  - Prompt: Prepare mermad flowchart diagram. Each goroutine shall be a separate subgraph. The whole private chat is [here](https://claude.ai/chat/3f7c98c6-bee3-4e57-a1b0-c9ee27dd02e4).

---

## Test design

### Automatic

- Basic
  - `~VVM.test.Basic~`covered[^19]✅
  - provide and launch VVM1
  - wait for successful VVM1 start
  - provide and launch VVM2
  - wait for VVM2 start failure
- Automatic shutdown on leadership loss
  - `~VVM.test.Shutdown~`covered[^24]✅
  - provide and launch a VVM
  - update ttlstorage modify the single value
  - bump mock time
  - expect the VVM shutdown
- Cancel the leadership on manual shutdown
  - `~VVM.test.CancelLeadership~`covered[^25]✅
  - provide and launch a VVM
  - shut it down on the launcher side
  - expect that the leadership in canceled

### Manual testing research

- airs-bp3/rsch/20250226-orch

Flow

- scylla.sh
  - Start scylla
- bp3_1.sh
  - Start the first bp3 instance, it takes the leadership
  - docker pull untillpro/airs-bp:alpha
- bp3_2.sh
  - Start the second bp3 instance, it waits for the leadership
- bp3_1_stop.sh
  - bp3_1 stops
  - bp3_2 takes the leadership
- bp3_1.sh
  - bp3_1 waits for the leadership
- bp3_2_stop.sh
  - bp3_2 stops
  - bp3_1 takes the leadership

## Footnotes

[^1]: `[~server.design.orch/VVMConfig.Orch~impl]` [server/design/orch.md:283:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L283)
[^2]: `[~server.design.orch/IElections~impl]` [server/design/orch.md:284:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L284)
[^3]: `[~server.design.orch/ITTLStorage~impl]` [server/design/orch.md:285:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L285)
[^4]: `[~server.design.orch/elections~impl]` [server/design/orch.md:286:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L286)
[^5]: `[~server.design.orch/ElectionsTestSuite~impl]` [server/design/orch.md:287:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L287)
[^6]: `[~server.design.orch/ElectionsTest~impl]` [server/design/orch.md:288:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L288)
[^7]: `[~server.design.orch/ISysVvmStorage~impl]` [server/design/orch.md:289:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L289)
[^8]: `[~server.design.orch/NewElectionsTTLStorage~impl]` [server/design/orch.md:290:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L290)
[^9]: `[~server.design.orch/ElectionsByDriverTests~impl]` [server/design/orch.md:291:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L291)
[^10]: `[~server.design.orch/KeyPrefix_VVMLeader~impl]` [server/design/orch.md:292:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L292)
[^11]: `[~server.design.orch/VVM.Provide~impl]` [pkg/vvm/wire_gen.go:250:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/wire_gen.go#L250), [server/design/orch.md:293:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L293)
[^12]: `[~server.design.orch/VVM.Shutdown~impl]` [pkg/vvm/impl_orch.go:39:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L39), [server/design/orch.md:294:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L294)
[^13]: `[~server.design.orch/VVM.LaunchVVM~impl]` [pkg/vvm/impl_orch.go:19:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L19), [server/design/orch.md:295:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L295)
[^14]: `[~server.design.orch/VVM.Shutdowner~impl]` [pkg/vvm/impl_orch.go:66:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L66), [server/design/orch.md:296:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L296)
[^15]: `[~server.design.orch/LeadershipMonitor~impl]` [pkg/vvm/impl_orch.go:94:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L94), [server/design/orch.md:297:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L297)
[^16]: `[~server.design.orch/processKillThreshold~impl]` [pkg/vvm/impl_orch.go:109:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L109), [server/design/orch.md:298:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L298)
[^17]: `[~server.design.orch/VVM.tryToAcquireLeadership~impl]` [pkg/vvm/impl_orch.go:118:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L118), [server/design/orch.md:299:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L299)
[^18]: `[~server.design.orch/VVM.updateProblem~impl]` [pkg/vvm/impl_orch.go:158:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/vvm/impl_orch.go#L158), [server/design/orch.md:300:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L300)
[^19]: `[~server.design.orch/VVM.test.Basic~impl]` [server/design/orch.md:301:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L301)
[^20]: `[~server.design.orch/VVM.test.TTLStorageMem~impl]` [server/design/orch.md:302:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L302)
[^21]: `[~server.design.orch/VVM.test.TTLStorageCas~impl]` [server/design/orch.md:303:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L303)
[^22]: `[~server.design.orch/VVM.test.TTLStorageDyn~impl]` [server/design/orch.md:304:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L304)
[^23]: `[~server.design.orch/VVM.test.TTLStorageBbolt~impl]` [server/design/orch.md:305:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L305)
[^24]: `[~server.design.orch/VVM.test.Shutdown~impl]` [server/design/orch.md:306:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L306)
[^25]: `[~server.design.orch/VVM.test.CancelLeadership~impl]` [server/design/orch.md:307:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L307)
[^26]: `[~server.design.orch/ttlStorageMock~impl]` [pkg/ielections/impl_mockstorage.go:17:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/ielections/impl_mockstorage.go#L17), [server/design/orch.md:308:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L308)
[^28]: `[~server.design.orch/TTLStorageTest~impl]` [server/design/orch.md:309:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/design/orch.md#L309)
