---
reqmd.package: server.n10n.heartbeats
---

# Heartbeats

## Functional design

- Client subscribes to the `cmp.wsingleton.Heartbeat30` table in any workspace
  - `~freq.Interval30Seconds~`: Server sends heartbeat every 30 seconds
  - `~freq.ZeroKey~`uncvrd[^4]❓:  Heartbeat is generated for `AppQName{}` and `NullWSID`
  - `~freq.SingleNotification~`: If the client subscribes to `cmp.wsingleton.Heartbeat30` in multiple workspaces, the server sends only one heartbeat per 30 seconds to the client
- It is not necessary to insert a record to the `Heartbeat30` singleton

## Technical design

- `~cmp.wsingleton.Heartbeat30~`uncvrd[^1]❓
  - No ACL
- The IN10nBroker interface and implementation are modified according to the functional requirements
- `~it.TestHeartbeat30~`uncvrd[^2]❓