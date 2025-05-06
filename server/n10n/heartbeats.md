---
reqmd.package: server.n10n.heartbeats
---

# Heartbeats

## Functional design

- Client subscribes to the `sys.Workspace.table.Heartbeat30` table
- It is not necessary to insert a record to the Heartbeat30
- Server sends a heartbeat every 30 seconds

## Technical design

- `~cmp.wsingleton.sys.Workspace.Heartbeat30~`uncvrd[^1]❓
- `~tuc.SimulateHeartbeat30Updates~`: Simulate Heartbeat30 updates in the notification interface implementation
- `~it.TestHeartbeat30~`uncvrd[^2]❓

[^1]: `[~server.n10n.heartbeats/cmp.wsingleton.sys.Workspace.Heartbeat30~impl]`
[^2]: `[~server.n10n.heartbeats/it.TestHeartbeat30~impl]`
