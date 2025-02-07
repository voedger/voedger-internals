# Orchestration

**Orchestration** in the context of clusters refers to the automated coordination, scheduling, and management of distributed workloads—including applications, services, or even threads within applications—to optimize resource utilization, ensure reliability, and maintain desired state across multiple computing units.

## Motivation

- [Design bp3 orchestration](https://github.com/voedger/voedger/issues/3231)

## Use Cases

### Concepts

- VVMHost: Application that starts and manages VVM
- VVM
  - problemCtx. Closed when some problem occurs, VVM terminates itself due to leadership loss or problems with the launching
  - problemErr. Error that describes the problem, see also problemCtx.
  - vvmShutCtx. Closed when VVM should be stopped.
  - vvmShutCtxOnce. `sync.Once` to close `vvmShutCtx` only once.
  - servicesShutCtx. Closed when VVM services should be stopped (but LeadershipMonitor)
  - monitorShutCtx. Closed after all services are stopped and LeadershipMonitor should be stopped
  - shutdownedCtx. Closed after all (services and LeadershipMonitor) is stopped

### VVMHost: Create VVM

- Flow:
  - vvm.Provide()

### VVMHost: Launch VVM

- When: After `Create VVM`
- Flow:
  - vvmProblemCtx := VVM.Launch() 
    - Start `Launcher`
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
    - Return `VVM.problemErr`

### Launcher

- Flow:
  - Wait for leadership or VVM.servicesShutCtx
  - If leadership is acquired 
    - Start LeadershipMonitor
    - Start servicePipeline
    - If servicePipeline returns error call VVM.updateProblem(problemErr)
        - synchronized
        - if `VVM.problemCtx` is already closed - exit
        - Close `VVM.problemCtx`
        - Update `VVM.problemErr`

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
        - Start killerRoutine
            - After 30 seconds kills the process
        - VVM.updateProblem(problemErr)
    - Wait for timer (30 seconds) or VVM.monitorShutCtx
    - If `VVM.monitorShutCtx` is closed - break
  - Cancel killerRoutine context and wait