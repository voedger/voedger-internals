# bootstrap

- https://github.com/voedger/voedger/issues/1890

## Motivation

Unclear how to initialize AppWorkspaces for built-in applications

## Analysis

cluster.AppWorkspace initialization:

- F: *AppWorkspace* is initialized as a result of calling `cluster.c.DeployApp()`
- C: cluster application shall be initialized internally (not using `cluster.c.DeployApp()`)

Bootstrap Leader

- F: `cluster.c.DeployApp()` is idempotent
- C: Built-in Applications can be deployed multiple times
- C: All nodes can deploy (in cluster) Built-in Applications
- F: It has to be decided which node runs `cluster` partition (Bootstrap Leader)
- C: Since we have a **leader**, **it can deploy** all Built-in Applications

Built-in Application Deployment

- F: All Built-in Applications partitions assignments (to VVMs) are known in advance
- F: `IAppPartitions.DeployApp()` and `DeployAppPartitions()` shall be called after `cluster` application is started

## Technical Design

**Overview**

- Wire service pipeline
  - Last operator is **vvm.provideBootstrapOperator()**, calls btstrp.Bootstrap(...)
- Start pipeline
- If DoSync returns error => shutdown

**pkg/btstrp.Bootstrap(bus IBus, IAppStructsProvider, appparts, clusterApp ClusterBuiltInApp, otherApps []BuiltInApp) error**

- Initialize `cluster` application workspace, if needed, using IAppStructsProvider
  - All ID must be predefined
- appparts: deploy single clusterApp partition
   - Note for the future: Must be scheduled to the Bootstrap Leader
- For each app in otherApps
  - **q.cluster.QueryApp**(app) + check app compatibility + if needed **c.cluster.DeployApp(app)**
    - Use bus to send requests
    - Check app compatibility: NumPartitions, NumAppWorkspaces 
    - Read/write to the table `App` + some views
- For each app builtInApps
  - appparts: DeployApp
  - appparts: DeployAppPartition
 
**c.cluster.DeployApp(app)**
AuthN
- System
Params
- AppQName
- AppDeploymentDescriptor // cluster.AppDeploymentDescriptor
  
**apppartsctrl.New(...): Get rid of builtInApps**

- Get rid of builtInApps
