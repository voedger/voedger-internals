# Deploy Application

- [GitHub: Deploy Application](https://github.com/voedger/voedger/issues/1814)

## Motivation

- Air: Login failed on live again

## Principles

- Pseudo app "cluster"
  - One partition
- `apppartsctrl` first deploys the `cluster` app and then uses its structures to deploy other applications
  - The cluster app is NOT in the built-in apps list
- Keyspace "cluster"

## Functional Design

- `apppartsctl`: Read/write to "cluster", `AppWorkspace[0]`
- `cluster.c.RegisterApp(descr AppDescriptor)`
  - `AppDescriptor{AppQName, NumPartitions}`
- `cluster.c.DeployAppImage(AppQName, image blob)`

## Technical Design

```sql
TABLE Application INHERITS CDoc(
  AppQName string -- cluster app won't be saved here
  AppID int
  NumPartitions int
)
```