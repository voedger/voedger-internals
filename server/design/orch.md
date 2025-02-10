# VVM Orchestration Design

## Overview

**Orchestration** in the context of clusters refers to the automated coordination, scheduling, and management of distributed workloads to optimize resource utilization, ensure reliability, and maintain desired state across multiple computing units.

## Problem Statement

Design reliable orchestration mechanism for VVM (Voedger Virtual Machine) that ensures:

- VVM goroutines work only if leadership is acquired
- Clean termination of all goroutines
- Concurrent-safe error handling
- Graceful shutdown capabilities

## Technical Design

### Core Components

- VVMHost: Application that starts and manages VVM
- VVM
  - problemCtx. Closed when some problem occurs, VVM terminates itself due to leadership loss or problems with the launching
  - problemErrCh. Channel that receives the error describing the problem, written only once
  - problemErrOnce. `sync.Once` to ensure problemErrCh is written only once
  - vvmShutCtx. Closed when VVM should be stopped
  - vvmShutCtxOnce. `sync.Once` to close `vvmShutCtx` only once
  - servicesShutCtx. Closed when VVM services should be stopped (but LeadershipMonitor)
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

#### VVMHost: Launch VVM

- When: After `Create VVM`
- Flow:
  - vvmProblemCtx := VVM.Launch()
    - go Launcher
    - go Shutdowner
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
  - Wait for leadership or `VVM.servicesShutCtx`
  - If leadership is acquired
    - go LeadershipMonitor
    - pipelineErr := servicePipeline
    - If pipelineErr != nil call `VVM.updateProblem(pipelineErr)`
        - synchronized via `VVM.problemErrOnce`
            - Close `VVM.problemCtx`
            - Write error to `VVM.problemErrCh` using `VVM.problemErrOnce`

#### Shutdowner

- Flow:
  - Wait for `VVM.vvmShutCtx`
  - Shutdown everything but `LeadershipMonitor` (close `VVM.servicesShutCtx` and wait for services to stop)
  - Shutdown `LeadershipMonitor` (close `VVM.monitorShutCtx` and wait for `LeadershipMonitor` to stop)
  - Close `VVM.shutdownedCtx`

#### LeadershipMonitor

- Flow:
  - Loop
    - If leadership lost
        - go `killerRoutine` 
            - After 30 seconds kills the process
            - // Never stoped, process must exit and goroutine must die
            - // Yes, this is the anti-patterm "Goroutine/Task/Thread Leak"
        - `VVM.updateProblem(leadershipLostErr)`
    - Wait for timer (30 seconds) or `VVM.monitorShutCtx`
    - If `VVM.monitorShutCtx` is closed - break

## Implementation requirements

- Clear ownership and cleanup responsibilities
- All error reporting must use `VVM.updateProblem`
- All algorithms are be finite
- No active goroutines after VVM.Shutdown (except killerRoutine)
- No data races
- No multiple channel closes
- Predictable error propagation
- No goroutine leaks (except intentional killerRoutine)

## Experiments with LLMs

- Claude
  - [Flowchart](https://claude.site/artifacts/ccefba09-b102-4179-ab59-184a7fc99122)
  - Prompt: Prepare mermad flowchart diagram. Each goroutine shall be a separate subgraph. The whole private chat is [here](https://claude.ai/chat/3f7c98c6-bee3-4e57-a1b0-c9ee27dd02e4).
