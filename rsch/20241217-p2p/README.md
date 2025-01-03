# Peer-to-Peer Cluster: Swarm Configuration and Go-Based Routing Architecture

This document outlines the requirements and considerations for establishing a peer-to-peer (P2P) cluster environment. The ultimate goal is to propose a suitable swarm configuration and provide guidance on developing a Go-based routing component.

## Requirements

- **Cluster Nodes:** 3 nodes  
- **Go Routers:** 3 instances  
- **VVM Instances:** 6 instances  
- **Prometheus Instances:** 3 instances  
- **Scylla Instances:** 3 instances  
- **Grafana Instances:** Variable number, as needed

## Objectives

1. **Swarm Configuration:**  
   Develop a recommended Docker Swarm configuration that efficiently manages deployment and fault tolerance across the distributed P2P cluster. This configuration should ensure seamless discovery, load balancing, and resilience of all services.

1. **Node failure/recovery:**  
   Simulate node failure/recovery. Recovery should ensure an even distribution of the load.

1. **Go-Router Prototype:**  
   Propose a high-level architectural design and code outline for a custom Go-based router. This component should handle routing  between services in the cluster.
