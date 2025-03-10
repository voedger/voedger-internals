# Bootstrap

## Motivation

**Problem**: Applications and their partitions are deployed using `cluster` app, how to deploy the `cluster` application itself?

**Solution**: Bootstrap process. It "deploys" the `cluster` app and then uses this app to deploy built-in apps.

* https://github.com/voedger/voedger/issues/1890
* [refactor bootstrap, #2005](https://github.com/voedger/voedger/issues/2005)

## Technical design

### Overview

* [Wire service pipeline, provideServicePipeline()](https://github.com/voedger/voedger/blob/main/pkg/vvm/provide.go)
  - "internal services"
  - "admin endpoint", vvm.provideAdminEndpoint()
  - "bootstrap", vvm.provideBootstrapOperator()
    - calls btstrp.Bootstrap(...)
  - "public endpoint"
  - "async actualizers"
* Start pipeline
* If DoSync returns error => shutdown

### pkg/btstrp.Bootstrap(bus IBus, IAppStructsProvider, appparts, clusterApp ClusterBuiltInApp, otherApps \[]BuiltInApp) error

- [pkg/btstrp](https://github.com/voedger/voedger/tree/main/pkg/btstrp)

#### Params
- otherApps does NOT include `blobber`, `router`

#### Alg

* Deploy `cluster` app
  * Initialize `cluster` application workspace, if needed, using IAppStructsProvider
    * All ID must be predefined
  * Create `blobber` and `router` storages, if needed
    * Initialize `AppStorageBlobber` (* IAppStorage), `AppStorageRouter` (* IAppStorage)
    * sysmeta storage will be implicitly created, if needed
  * appparts: deploy single clusterApp partition
    * Note for the future: Must be scheduled to the Bootstrap Leader

* Deploy builtin apps
  * For each app in otherApps
    * **c.cluster.DeployApp(app)**
      * Use Admin Endpoint to send requests    
      * panic if not ok
      * Read/write to the table `App` + some views
   
* Deploy partitions of builtin apps
  * For each app builtInApps
    * appparts: DeployApp
    * appparts: DeployAppPartition

### c.cluster.DeployApp(app)

AuthN
- System

Params
- AppQName
- AppDeploymentDescriptor // cluster.AppDeploymentDescriptor

Alg
- Idempotent
- Check application compatibility (409)
- Create storage if not exists
- Initialize appstructs data
- Initialize App Workspaces

### apppartsctrl.New(...): Get rid of builtInApps

* Get rid of builtInApps
