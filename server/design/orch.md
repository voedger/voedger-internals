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
  vvmProblemCtx := myVVM.Launch(leadershipAcquisitionDuration)
  
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

  ```golang
  type VVMConfig {
    ...
    ClusterSize int // amount of VVMs in the cluster. Default 1
  }
  ```

- **pkg/elections**
  - Purpose: Describe and implement the interface to acquire and manage leadership for a given key
  - `IELections`
    - Purpose: Describe the interface to acquire and manage leadership for a given key
  - `elections`
    - Purpose: Implementation of IELections
  - `ITTLStorage`
    - Purpose: interface with methods InsertIfNotExist(), CompareAndSwap(), CompareAndDelete() used to persist `view.cluster.VVMLeader`
- **keyspace(sysvvm).VVMLeaderPrefix**
  - Key prefix `VVMLeaderPrefix` to keep data for elections
- **pkg/vvm/ttlstorage**
  - Implementation of `ITTLStorage` interface that uses `keyspace(vvmdata)` and keys prefixed with keyspace(sysvvm).VVMLeaderPrefix
  - Like we had here `~VVMLeader.def~`uncvrd[^~VVMLeader.def~]❓

---

### VVM

VVM:

- elections IElections: Interface to acquire and manage leadership for a given key
- problemCtx. Closed by VVM.updateProblem(err) (e.g. leadership loss or service failure)
- problemErrCh. Channel that receives the error describing the problem, written only once. Content is returned on Shutdown()
- problemErrOnce. `sync.Once` to ensure problemErrCh is written only once
- vvmShutCtx. Closed when VVM should be stopped (`Shutdown()` is called outside)
- servicesShutCtx. Closed when VVM services should be stopped (but LeadershipMonitor) (that should be context for services: servicesShutCtx closed -> services pipeline is stopped. Closed when `Shutdown()` is called outside)
- monitorShutCtx. Closed after all services are stopped and LeadershipMonitor should be stopped
- shutdownedCtx. Closed after all (services and LeadershipMonitor) is stopped
- leadershipCtx. Context for watching leadership. Closed when leadership is lost.
- numVVM. Number of VVMs in the cluster
- ip. IP address of the VVM

The error propagation follows these principles:

- Single error channel (`problemErrCh`) for reporting critical issues
- Write-once semantics using `sync.Once`
- Non-blocking error reads during shutdown
- Thread-safe error updates via `updateProblem()`

Goroutine hierarchy:

- Main (VVMHost)
  - Launcher
    - LeadershipMonitor
    - ServicePipeline
  - Shutdowner

Each goroutine's lifecycle is controlled by dedicated context cancellation.

#### VVM.Provide()

- `~VVM.Provide~`uncvrd[^~VVM.Provide~]❓
- Construct vvm.elections

#### VVM.Shutdown()

- `~VVM.Shutdown~`uncvrd[^~VVM.Shutdown~]❓
- close(VVM.vvmShutCtx)
- Wait for `VVM.shutdownedCtx`
- Return error from `VVM.problemErrCh`, non-blocking.

#### VVM.LaunchVVM() problemCtx

- `~VVM.LaunchVVM~`uncvrd[^~VVM.LaunchVVM~]❓
- vvmProblemCtx := VVM.Launch(leadershipAcquisitionDuration)
  - err := tryToAcquireLeadership()
  - if err != nil
    - call `VVM.updateProblem(err)`
    - return VVM.problemCtx
  - pipelineErr := servicePipeline
    - If pipelineErr != nil call `VVM.updateProblem(pipelineErr)`
    - return VVM.problemCtx
  - go Shutdowner
  - Return VVM.problemCtx

#### Shutdowner: go VVM.shutdowner()

- `~VVM.Shutdowner~`uncvrd[^~VVM.Shutdowner~]❓
- Wait for `VVM.vvmShutCtx`
- Shutdown everything but `LeadershipMonitor` and `elections`
  - close `VVM.servicesShutCtx` and wait for services to stop
- Shutdown `LeadershipMonitor` (close `VVM.monitorShutCtx` and wait for `LeadershipMonitor` to stop)
- Cleanup `elections`
  - // Note: all goroutines will be stopped and leaderships will be released
- Close `VVM.shutdownedCtx`

#### LeadershipMonitor: go VVM.leadershipMonitor()

- `~LeadershipMonitor~`uncvrd[^~LeadershipMonitor~]❓
- wait for any of:
  - `VVM.leadershipCtx` (leadership loss)
    - go `killerRoutine`
      - After `leadershipDuration/4` seconds kills the process
      - // Never stoped, process must exit and goroutine must die
      - // Yes, this is the anti-patterm "Goroutine/Task/Thread Leak"
    - `VVM.updateProblem(leadershipLostErr)`
    - break
  - `VVM.monitorShutCtx`
    - break

#### VVM.tryToAcquireLeadership()

- `~VVM.tryToAcquireLeadership~`uncvrd[^~VVM.tryToAcquireLeadership~]❓
- Try to acquire leadership in loop.Wait
  - Exit if `leadershipDuration` expired
  - Exit if `VVM.servicesShutCtx` closed
  - Leadership key is choosen in the [1, VVM.numVVM] interval
  - Leadership value is VVM.ip
  - Do not wait for servicesShutCtx because Launch is blocking method
  - During leadershipAcquisitionDuration
- If leadership is acquired
  - Set VVM.leadershipCtx
  - go LeadershipMonitor
- Else return leadershipAcquisitionErr

#### VVM.updateProblem(err)

- `~VVM.updateProblem~`uncvrd[^~VVM.updateProblem~]❓
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
  - `~VVM.test.Basic~`uncvrd[^~VVM.test.Basic~]❓
  - provide and laucnh VVM1
  - wait for successful VVM1 start
  - provide and launch VVM2
  - wait for VVM2 start failure
- Automatic shutdown on leadership loss
  - `~VVM.test.Shutdown~`uncvrd[^~VVM.test.Shutdown~]❓
  - provide and launch a VVM
  - update `view.cluster.VVMLeader`: modify the single value
  - bump mock time
  - expect the VVM shutdown
- Cancel the leadership on manual shutdown
  - `~VVM.test.CancelLeadership~`uncvrd[^~VVM.test.CancelLeadership~]❓
  - provide and launch a VVM
  - shut it down on the launcher side
  - expect that the leadership in canceled

### Manual

- docker container:
  - scylla db
  - 2 VVMs services
- `docker compse up -d`
- expect 1 of 2 VVMs services are failed to start

[^~LeadershipMonitor~]: `[~server.design.orch/LeadershipMonitor~impl]`
[^~VVM.tryToAcquireLeadership~]: `[~server.design.orch/VVM.tryToAcquireLeadership~impl]`
[^~VVM.updateProblem~]: `[~server.design.orch/VVM.updateProblem~impl]`
[^~VVMLeader.def~]: `[~server.design.orch/VVMLeader.def~impl]`
[^~VVM.Shutdown~]: `[~server.design.orch/VVM.Shutdown~impl]`
[^~VVM.test.Shutdown~]: `[~server.design.orch/VVM.test.Shutdown~impl]`
[^~VVM.Provide~]: `[~server.design.orch/VVM.Provide~impl]`
[^~VVM.test.CancelLeadership~]: `[~server.design.orch/VVM.test.CancelLeadership~impl]`
[^~VVM.LaunchVVM~]: `[~server.design.orch/VVM.LaunchVVM~impl]`
[^~VVM.test.Basic~]: `[~server.design.orch/VVM.test.Basic~impl]`
[^~VVM.Shutdowner~]: `[~server.design.orch/VVM.Shutdowner~impl]`
