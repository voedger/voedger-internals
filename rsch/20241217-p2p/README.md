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

# Discovery results: Why You Can’t Evenly Distribute 6 Services Across 3 Nodes in a Docker Swarm Cluster (with Automatic Rebalancing)

The main reason you cannot achieve a **perfectly even** distribution of services (as opposed to tasks) across three nodes and have them automatically return to that even distribution when a node recovers lies in how Docker Swarm’s scheduler works:

---

## 1. Swarm Schedules Tasks, Not Entire Services

- When we talk about having “6 services,” in Swarm, that means we have six different **service definitions** (Service 1, Service 2, …, Service 6). Each service definition describes one or more **tasks**, depending on the `replicas` configuration.  
- If each service runs a single replica (one task per service), Swarm schedules these 6 tasks based on your constraints (e.g., `placement constraints`, `affinity`, etc.).  
- There is no built-in mechanism to **strictly** maintain exactly “2 tasks per node,” especially if you want Swarm to automatically rebalance them after a node failure.

---

## 2. No Built-In “Auto-Rebalance” on Node Recovery

- When a node goes down, Swarm will **automatically recreate** any lost tasks on the remaining healthy nodes. For instance, if you have a cluster with three nodes (N1, N2, N3) running 6 tasks (one per service), and N1 fails, then N2 and N3 will host those tasks from N1. In that scenario, you might end up with N2 running 3 tasks and N3 running 3 tasks.  
- However, when the failed node (N1) recovers and rejoins the cluster, Swarm **does not** move tasks back to that node automatically. By default, if tasks are already running successfully on N2 and N3, Swarm sees no need to redistribute them; it is solely concerned with availability, not perfect balance.

---

## 3. Impossible to Enforce “Strict Equality” of Services per Node

- Swarm’s features allow you to specify:
  - `replicas=N` (the number of tasks for a service),  
  - `global` (one task per node),  
  - `placement preferences` (e.g., spreading tasks across nodes),  
  - …but none of these guarantees that once tasks have been scheduled, they’ll be **automatically** moved back to a recovered node to maintain a strict **2-2-2** layout.  
- Even if you try using constraints such as (Service A → Node1, Service B → Node2, etc.), when a node fails, those tasks may end up on any remaining nodes. After the failed node recovers, Swarm still won’t switch them back automatically.

---

## Key Takeaway

Docker Swarm is designed to ensure **high availability**, not perfect balance. It does not provide mechanisms to:

1. Guarantee exactly two services per node if each service has one replica,  
2. Evenly move tasks across the remaining nodes **and** then  
3. Automatically shuffle tasks back when a previously failed node recovers.

To implement such rebalancing, you must either:

- Manually **redeploy** services (e.g., through CI/CD pipelines or custom scripts) after the node recovers, or  
- Use an additional layer of orchestration/automation that monitors the cluster and **forces** tasks to move for the sake of load balancing.

Out of the box, Swarm focuses on ensuring that all service tasks are **running** and **highly available**. It does not strive to maintain or restore a perfectly even distribution once a node is back online.
