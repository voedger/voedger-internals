# Standart Edition (SE)

## Motivation

- [Peer-to-peer cluster](https://github.com/voedger/voedger/issues/1891)
  - 5 nodes, one application server, 3 database servers. The load is unevenly distributed, one app node is idle.
  - 3 nodes, one application server, 3 database servers. The load is unevenly distributed, one node can be overloaded.
- Failed: [Design "peer nodes" ctool principles](https://github.com/voedger/voedger/issues/2550)

## Principles

- 3 nodes.
- Node must be a clean Ubuntu node.
  - Reason: We believe it will avoid possible conflicts between installed software and reduce operation costs.
- Cloud Service Provider Balancer is needed (e.g.  https://www.hetzner.com/cloud/load-balancer)
- Orchestrator: swarm
  - Every node is a manager
- Number of VVMs
  - 6 or 1 (3-node cluster: 2 per node).
  - Fixed, can not be changed yet.
- Monitoring
  - 3 prometheus.
  - 1  grafana, always use "local" prometheus. If it starts on node1 use prometheus1, If it starts on node2 use prometheus2 etc.
- Always stretched cluster.
- nginx is not used yet.
  - Too difficult to develop and maintain, maybe in the future.

## Nodes & Swarm Services

```mermaid
  graph TD

  %% Entities

  SECluster[[SE Cluster]]:::H

  Node1["Node${n}"]:::G

  subgraph Node1["node$n"]
    router1["router${n}"]:::S
    vvm12["vvm${n\*2-1}, vvm${n\*2}"]:::S
    prometheus1["prometheus${n}"]:::S
    scylla1["scylla${n}"]:::S
    grafana1["grafana${n}"]:::S
    router1 --- vvm12
    router1 --- prometheus1
    router1 --- grafana1
    vvm12 --- scylla1
  end

  %% Relations

  SECluster --x |has nodes 1-3| Node1


  classDef B fill:#FFFFB5,color:#333
  classDef S fill:#B5FFFF,color:#333
  classDef H fill:#C9E7B7,color:#333
  classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```  