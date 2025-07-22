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
    * Initialize `AppStorageBlobber` (IAppStorage), `AppStorageRouter` (IAppStorage)
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

- AuthN
  - System
- Params
  - AppQName
  - AppDeploymentDescriptor // cluster.AppDeploymentDescriptor
- Flow
  - Idempotent
  - Check application compatibility (409)
  - Create storage if not exists
  - Initialize appstructs data
  - Initialize App Workspaces

### apppartsctrl.New(...): Get rid of builtInApps

* Get rid of builtInApps

---

### Cluster App Database Schema

The cluster app uses workspace `sys.AppWorkspaceWS` and stores this data persistently. During validation, the system reads from this `App` table to compare the previously deployed `NumPartitions` with the new deployment request, which is how it detects and prevents partition count changes.

This persistent storage in the cluster app's database is the authoritative source for checking partition counts during subsequent deployments.

pkg/cluster/appws.vsql mode=EXCERPT:
````sql
TABLE App INHERITS sys.WDoc (
    AppQName varchar NOT NULL,
    NumPartitions int32 NOT NULL,
    NumAppWorkspaces int32 NOT NULL,
    UNIQUE (AppQName)
);
````

### Deployment Process

When an app is deployed, the `DeployApp` command stores the partition information:

pkg/cluster/appws.vsql mode=EXCERPT:
```sql
TYPE AppDeploymentDescriptor (
    AppQName varchar NOT NULL,
    NumPartitions int32 NOT NULL,
    NumAppWorkspaces int32 NOT NULL
);

EXTENSION ENGINE BUILTIN (
    COMMAND DeployApp(AppDeploymentDescriptor);
);
```
