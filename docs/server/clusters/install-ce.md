# Install CE

- GitHub: [Install CE](https://github.com/voedger/voedger/issues/1775)

## Requirements

- 1 node
- db: scylla

## Functional design

- `ctool init CE <local-node-address>`
  - `<local-node-address>` is a must since the node can have few network interfaces and the local one must be used
- `ctool upgrade`
- `ctool backup *`
- `ctool restore *`

## Technical design

Principles
- One compose file
- Services names
  - voedeger_voedger
  - voedeger_grafana
  - voedeger_prometheus
  - voedeger_alertmanager
  - voedeger_scylla
- `VOEDGER_STORAGE_TYPE=cas1 | cas3`