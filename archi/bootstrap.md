# bootstrap

- https://github.com/voedger/voedger/issues/1890

## Motivation

Unclear how to initialize AppWorkspaces for built-in applications

## Analysis

cluster.AppWorkspace initialization:

- F: *AppWorkspace* is initialized as a result of calling `cluster.c.RegisterApp()`
- C: cluster application shall be initialized internally (not using `cluster.c.RegisterApp()`)

Bootstrap Leader

- F: `cluster.c.RegisterApp()` is idempotent
- C: Built-in Applications can be registered multiple times
- C: All nodes can register Built-in Applications
- F: It has to be decided which node runs `cluster` partition (Bootstrap Leader)
- C: Since we have a **leader**, **it can register** all Built-in Applications

Built-in Application Deployment

- F: All Built-in Applications partitions assignments (to VVMs) are known in advance
- F: `IAppPartitions.DeployApp()` and `DeployAppPartitions()` shall be called after `cluster` application is started

## Technical Design

**Algorythm**

- Wire service pipeline
  - Last operator calls btstrp.New(...)
  - vvm.NewBootstrapSyncOp()
- Start pipeline
- If DoSync returns error => shutdown

**pkg/btstrp.Bootstrap(bus IBus, IAppStructsProvider, appparts, clusterApp ClusterBuiltInApp, otherApps []BuiltInApp) error**

Service

- Initialize `cluster` application workspace, if needed, using IAppStructsProvider
  - All ID must be predefined
- appparts: deploy clusterApp
   - Note for the future: Must be scheduled to the Bootstrap Leader
- For each app in otherApps
  - q.cluster.QueryApp(app) + check apps compatibility + if needed c.cluster.DeployApp(app)
    - Use bus to send requests
    - Check: NumPartitions, NumAppWorkspaces, 
    - Read/write to the table `App` + some views
- For each app builtInApps
  - appparts: DeployApp
  - appparts: DeployAppPartition
  
**apppartsctrl.New(...): Get rid of builtInApps**

- Get rid of builtInApps

**vvm.**

- vvm.

- #techdept: 
