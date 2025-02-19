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

## Functional design

### Actors

- VVMHost: Application that starts and manages VVM
- VVM
  - elections IElections: Interface to acquire and manage leadership for a given key
  - problemCtx. Closed with nil or with an error or nil when some problem occurs, VVM terminates itself due to leadership loss or problems with the launching
  - problemErrCh. Channel that receives the error describing the problem, written only once. Content is returned on Shutdown()
  - problemErrOnce. `sync.Once` to ensure problemErrCh is written only once
  - vvmShutCtx. Closed when VVM should be stopped (`Shutdown()` is called outside)
  - vvmShutCtxOnce. `sync.Once` to close `vvmShutCtx` only once
  - servicesShutCtx. Closed when VVM services should be stopped (but LeadershipMonitor) (that should be context for services: servicesShutCtx closed -> services pipeline is stopped. Closed when `Shutdown()` is called outside)
  - monitorShutCtx. Closed after all services are stopped and LeadershipMonitor should be stopped
  - shutdownedCtx. Closed after all (services and LeadershipMonitor) is stopped

### Error Handling

The error propagation follows these principles:

- Single error channel (`problemErrCh`) for reporting critical issues
- Write-once semantics using `sync.Once`
- Non-blocking error reads during shutdown
- Thread-safe error updates via `updateProblem()`

### Goroutine Management

Goroutine hierarchy:

1. Main (VVMHost)
   - Launcher
     - LeadershipMonitor
     - ServicePipeline
   - Shutdowner

Each goroutine's lifecycle is controlled by dedicated context cancellation.

### Use Cases

#### VVMHost: Create VVM

- Flow:
  - vvm.Provide()
    - Construct vvm.elections

#### VVMHost: Launch VVM

- When: After `Create VVM`
- Flow:
  - vvmProblemCtx := VVM.Launch(leadershipAcquisitionDuration)
    - go Launcher
    - go Shutdowner
    - wait for launcher finish (blocking)
    - Return VVM.problemCtx

#### VVMHost: Wait for signals

- When: After `Launch VVM`
- Flow
  - Wait for `problemCtx` and optionally for other events like os.Interrupt, syscall.SIGTERM, syscall.SIGINT

#### VVMHost: Shutdown VVM

- When: After `Wait for signals`
- Flow
  - err := VVM.Shutdown()
    - VVM.vvmShutCtxOnce.Do(func() { close(VVM.vvmShutCtx) })
    - Wait for `VVM.shutdownedCtx`
    - Return error from `VVM.problemErrCh`, non-blocking.

#### Launcher

- Flow:
  - Wait for leadership ~or `VVM.servicesShutCtx`~ (do not wait for servicesShutCtx because Launch is blocking method) during leadershipAcquisitionDuration
    - `leadershipDuration` default is 20 seconds
  - If leadership is acquired
    - go LeadershipMonitor
    - pipelineErr := servicePipeline
    - If pipelineErr != nil call `VVM.updateProblem(pipelineErr)`
      - synchronized via `VVM.problemErrOnce`
        - Close `VVM.problemCtx`
        - Write error to `VVM.problemErrCh` using `VVM.problemErrOnce`
  - Else call `VVM.updateProblem(leadershipAcquisitionErr)`

#### Shutdowner

- Flow:
  - Wait for `VVM.vvmShutCtx`
  - Shutdown everything but `LeadershipMonitor` and `elections`
    - close `VVM.servicesShutCtx` and wait for services to stop
  - Shutdown `LeadershipMonitor` (close `VVM.monitorShutCtx` and wait for `LeadershipMonitor` to stop)
  - Cleanup `elections`
  - Close `VVM.shutdownedCtx`

#### LeadershipMonitor

- Flow:
  - wait for any of:
    - leadership loss (watch over context got from AcquireLeadership (problemCtx))
      - go `killerRoutine`
        - After `leadershipDuration/4` seconds kills the process
        - // Never stoped, process must exit and goroutine must die
        - // Yes, this is the anti-patterm "Goroutine/Task/Thread Leak"
      - `VVM.updateProblem(leadershipLostErr)`
      - break
    - `VVM.monitorShutCtx`
      - break

## Technical design

### Implementation requirements

- Clear ownership and cleanup responsibilities
- All error reporting must use `VVM.updateProblem`
- All algorithms are be finite
- No active goroutines after VVM.Shutdown (except killerRoutine)
- No data races
- No multiple channel closes
- Predictable error propagation
- No goroutine leaks (except intentional killerRoutine)

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
  - Like we had here `~VVMLeader.def~`covered[^~VVMLeader.def~]✅

### Experiments with LLMs

- Claude
  - [Flowchart](https://claude.site/artifacts/ccefba09-b102-4179-ab59-184a7fc99122)
  - Prompt: Prepare mermad flowchart diagram. Each goroutine shall be a separate subgraph. The whole private chat is [here](https://claude.ai/chat/3f7c98c6-bee3-4e57-a1b0-c9ee27dd02e4).

## Test design

### Automatic

- Basic
  - provide and laucnh VVM1
  - wait for successful VVM1 start
  - provide and launch VVM2
  - wait for VVM2 start failure
- Automatic shutdown on leadership loss
  - provide and launch a VVM
  - update `view.cluster.VVMLeader`: modify the single value
  - bump mock time
  - expect the VVM shutdown
- Cancel the leadership on manual shutdown
  - provide and launch a VVM
  - shut it down on the launcher side
  - expect that the leadership in canceled

### Manual

- docker container:
  - scylla db
  - 2 VVMs services
- `docker compse up -d`
- expect 1 of 2 VVMs services are failed to start

[^~VVMLeader.def~]: `[~server.design.orch/VVMLeader.def~]`, [apps/app.go:80:impl](https://github.com/voedger/voedger/blob/67cb0d8e2960a0b09546bf86a986bc40a1f05584/pkg/appdef/internal/apps/app.go#L80)
