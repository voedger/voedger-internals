---
reqmd.package: server.n10n.heartbeats
---

# Heartbeats

## Functional design

- Client subscribes to the `sys.Heartbeat` table in any Workspace
  - `~freq.Interval30Seconds~`covrd[^1]✅: Server sends heartbeat every 30 seconds
  - `~freq.ZeroKey~`covrd[^2]✅:  Heartbeat is generated for `AppQName{}` and `NullWSID`
  - `~freq.SingleNotification~`covrd[^4]✅: If the client subscribes to `sys.Heartbeat` in multiple workspaces, the server sends only one heartbeat per 30 seconds to the client
- It is not necessary to insert a record to the `Heartbeat30` singleton

## Technical design

- `~cmp.wsingleton.Heartbeat30~`covrd[^5]✅
  - No ACL
- The IN10nBroker interface and implementation are modified according to the functional requirements
- `~it.Heartbeat30~`covrd[^6]✅

[^1]: `[~server.n10n.heartbeats/freq.Interval30Seconds~impl]` [pkg/in10n/interface.go:31:doc](https://github.com/voedger/voedger/blob/main/pkg/in10n/interface.go#L31), [pkg/in10nmem/impl.go:114:doc](https://github.com/voedger/voedger/blob/main/pkg/in10nmem/impl.go#L114), [pkg/in10nmem/impl.go:406:impl](https://github.com/voedger/voedger/blob/main/pkg/in10nmem/impl.go#L406)
[^2]: `[~server.n10n.heartbeats/freq.ZeroKey~impl]` [pkg/in10n/interface.go:26:doc](https://github.com/voedger/voedger/blob/main/pkg/in10n/interface.go#L26), [pkg/in10nmem/impl.go:109:doc](https://github.com/voedger/voedger/blob/main/pkg/in10nmem/impl.go#L109), [pkg/in10n/consts.go:20:impl](https://github.com/voedger/voedger/blob/main/pkg/in10n/consts.go#L20), [pkg/in10nmem/impl.go:137:impl](https://github.com/voedger/voedger/blob/main/pkg/in10nmem/impl.go#L137)
[^4]: `[~server.n10n.heartbeats/freq.SingleNotification~impl]` [pkg/in10nmem/impl.go:138:impl](https://github.com/voedger/voedger/blob/main/pkg/in10nmem/impl.go#L138)
[^5]: `[~server.n10n.heartbeats/cmp.wsingleton.Heartbeat30~impl]` [pkg/sys/sys.vsql:95:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/sys.vsql#L95)
[^6]: `[~server.n10n.heartbeats/it.Heartbeat30~impl]` [pkg/sys/it/impl_n10n_test.go:45:impl](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_n10n_test.go#L45)
