---
reqmd.package: server.n10n.heartbeats
---

# Heartbeats

## Functional design

- Client subscribes to the sys.Workspace.Heartbeat30 view
- Server sends a heartbeat every 30 seconds

## Technical design

- `~cmp.view.Heartbeat30~`
- `~it.TestHeartbeat30~`
