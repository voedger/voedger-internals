---
reqmd.package: server.n10n.heartbeats
---

# Heartbeats

## Functional design

- Client subscribes to the sys.Workspace.table.Heartbeat30
- Server sends a heartbeat every 30 seconds
- It is not necessary to insert a record to the Heartbeat30

## Technical design

- `~cmp.wsingleton.sys.Workspace.Heartbeat30~`covrd[^1]❓
- `~it.TestHeartbeat30~`uncvrd[^2]❓

[^1]: `[~server.n10n.heartbeats/cmp.wsingleton.sys.Workspace.Heartbeat30~impl]`
[^2]: `[~server.n10n.heartbeats/it.TestHeartbeat30~impl]`
