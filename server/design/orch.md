# Orchestration

**Orchestration** in the context of clusters refers to the automated coordination, scheduling, and management of distributed workloads—including applications, services, or even threads within applications—to optimize resource utilization, ensure reliability, and maintain desired state across multiple computing units.

## Motivation

- [Design bp3 orchestration](https://github.com/voedger/voedger/issues/3231)

## Use Cases

### Concepts

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

### VVMHost: Create VVM

- Flow:
  - vvm.Provide()
    - go Shutdowner

### VVMHost: Launch VVM

- When: After `Create VVM`
- Flow:
  - vvmProblemCtx := VVM.Launch()
    - go Launcher
    - Return VVM.problemCtx

### VVMHost: Wait for signals

- When: After `Launch VVM`
- Flow
  - Wait for `problemCtx` and optionally for other events like os.Interrupt, syscall.SIGTERM, syscall.SIGINT

### VVMHost: Shutdown VVM

- When: After `Wait for signals`
- Flow
  - err := VVM.Shutdown() 
    - VVM.vvmShutCtxOnce.Do(func() { close(VVM.vvmShutCtx) })
    - Wait for `VVM.shutdownedCtx`
    - Return error from `VVM.problemErrCh`, non-blocking.

### Launcher

- Flow:
  - Wait for leadership or `VVM.servicesShutCtx`
  - If leadership is acquired
    - go LeadershipMonitor
    - servicePipeline
    - If servicePipeline returns error call `VVM.updateProblem(problemErr)`
        - synchronized via `VVM.problemErrOnce`
            - Close `VVM.problemCtx`
            - Write error to `VVM.problemErrCh` using problemErrOnce

### Shutdowner

- Flow:
  - Read from buffered `VVM.shutChannel`
  - Shutdown everything but `LeadershipMonitor` (close `VVM.servicesShutCtx` and wait for services to stop)
  - Shutdown `LeadershipMonitor` (close `VVM.monitorShutCtx` and wait for `LeadershipMonitor` to stop)
  - Close `VVM.shutdownedCtx`

### LeadershipMonitor

- Flow:
  - Loop
    - If leadership lost
        - tartgo killerRoutine
            - After 30 seconds kills the process
        - VVM.updateProblem(leadershipLostErr)
    - Wait for timer (30 seconds) or VVM.monitorShutCtx
    - If `VVM.monitorShutCtx` is closed - break
  - Cancel killerRoutine context and wait