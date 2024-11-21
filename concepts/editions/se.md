# Standart Edition (SE)

TOC

- [Principles](#principles)
- [Nodes & Swarm Services](#nodes--swarm-services)
- [grafana Service](#grafana-service)

## Principles

- Node must be a clean Ubuntu node
  - Reason: We believe it will avoid possible conflicts between installed software and reduce operation costs
- Cloud Service Provider Balancer is needed (e.g.  https://www.hetzner.com/cloud/load-balancer)
- Orchestrator: swarm
  - Every node is a manager


## Nodes & Swarm Services

```mermaid
  graph TD


  %% Entities

  SECluster[[SE Cluster]]:::H
  Node1{{"node-1"}}:::H
  Node2{{"node-2"}}:::H
  Node3{{"node-3"}}:::H

  Ports1(("80, 443")):::G

  Node1Services:::G
  subgraph Node1Services[node-1 services]

    subgraph bal
      nginx1("nginx-1"):::S
    end
    subgraph mon
      grafana1("grafana-1"):::S
      prometheus1("prometheus1-1"):::S
    end
    subgraph app
      voedger11("voedger-11"):::S
      voedger12("voedger-12"):::S
    end
    subgraph db
      scylla1("scylla-1"):::S
    end
    bal --> mon
    bal --> app
    app --> db
  end

  %% Relations

  Ports1  --> bal


  SECluster --> Node1
  SECluster --> Node2
  SECluster --> Node3

  Node1 --> Ports1

  classDef B fill:#FFFFB5,color:#333
  classDef S fill:#B5FFFF,color:#333
  classDef H fill:#C9E7B7,color:#333
  classDef G fill:#ffffff15, stroke:#999, stroke-width:2px, stroke-dasharray: 5 5
```

```mermaid
flowchart TD

