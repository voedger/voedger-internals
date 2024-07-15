# Deploy Application

- [github: Deploy Application](https://github.com/voedger/voedger/issues/1814)

## Motivation

- Air: login failed on live again

## Principles

- Pseudo app "cluster"
  - One partition
- `apppartsctrl` first deploy `cluster` app and then uses its structures to deploy other applications
  - cluster app is NOT in a built-in apps lists
- Keyspace "cluster"

## Functional design

- apppartsctl: read/write to "cluster", AppWorkspace[0]
- cluster.c.RegisterApp(descr AppDescriptor)
  - AppDescriptor{AppQName, NumPartitions}
- cluster.c.DeployAppImage(AppQName, image blob)

## Technical design

```sql
TABLE Application INHERITS CDoc(
  AppQName string -- cluster app won't be saved here
  AppID int
  NumPartitions int
)
```
