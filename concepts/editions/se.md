# Standart Edition (SE)

## Motivation

- [Peer-to-peer cluster](https://github.com/voedger/voedger/issues/1891)
  - 5 nodes, one application server, 3 database servers. The load is unevenly distributed, one app node is idle.
  - 3 nodes, one application server, 3 database servers. The load is unevenly distributed, one node can be overloaded.

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

  Node1:::G
  Node2:::G
  Node3:::G

  subgraph Node1
    direction LR
    vvm12[vvm1, vvm2]:::S
    prometheus1:::S
    scylla1:::S
  end

  subgraph Node2
    direction LR
    vvm34[vvm3, vvm4]:::S
    prometheus2:::S
    scylla2:::S
    grafana
  end

  subgraph Node3
    direction LR
    vvm56[vvm5, vvm6]:::S
    prometheus3:::S
    scylla3:::S
  end

  %% Relations

  SECluster --- Node1
  SECluster --- Node2
  SECluster --- Node3

  classDef B fill:#FFFFB5,color:#333
  classDef S fill:#B5FFFF,color:#333
  classDef H fill:#C9E7B7,color:#333
  classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5  
  
```  