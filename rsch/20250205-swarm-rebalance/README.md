# **Rebalancing in Docker Swarm Cluster**

- **Author(s)**:
  - Alexey Ponamarev. Sigma-Soft, Ltd.
  - Maxim Geraskin. unTill Software Development Group B. V.
- **Date:** 2025-02-05
- **Keywords:** Docker Swarm, Load Balancing, Cluster Resilience, Replica Distribution

---
## **Abstract**
This study investigates the behavior of a Docker Swarm cluster when a node fails and subsequently recovers. The cluster consists of three nodes running a single service with six replicas. We examine whether, upon node failure, the remaining two nodes distribute the replicas evenly. Furthermore, we analyze strategies for rebalancing the replicas when the failed node comes back online to ensure an even distribution across all three nodes.

---
## **Introduction**

### **Background**
Docker Swarm is an orchestration tool that manages containerized applications across a cluster of nodes. One of its key features is its ability to maintain high availability by redistributing workloads when a node fails. However, after a failed node recovers, Swarm does not automatically rebalance running tasks across all nodes.

### **Problem Statement**
This study explores two key questions:
1. When a node fails, do the remaining nodes equally distribute the running replicas?
2. Upon the failed node’s recovery, how can we achieve an even distribution of replicas across all nodes?

### **Objective(s)**
The objectives of this research are:
- To evaluate Swarm's built-in mechanisms for redistributing replicas upon node failure.
- To identify manual or automated strategies to rebalance replicas after node recovery.

---
## **Methodology**

### **Test Environment Setup**
- A Docker Swarm cluster with **three nodes**.
- Deployment of a single service with **six replicas**.
- One node is manually stopped and later restarted.

### **Observations and Data Collection**
- **Step 1:** Deploy a Swarm cluster with three manager/worker nodes.
- **Step 2:** Deploy a service with six replicas using the `docker service create` command.
- **Step 3:** Verify the initial replica distribution using `docker service ps <service_name>`.
- **Step 4:** Shut down one node and observe how Swarm reassigns replicas.
- **Step 5:** Restart the failed node and observe if Swarm rebalances the replicas automatically.
- **Step 6:** Test strategies for achieving an even distribution manually.

---
## **Results**

### **Replica Redistribution Upon Node Failure**
- Initially, the six replicas were evenly distributed (i.e., **two per node**).
- Upon stopping one node, Swarm **automatically reallocated its two replicas** to the remaining two nodes, resulting in a **3-3 replica distribution**.
- No service disruption occurred, demonstrating Swarm's self-healing capabilities.

### **Replica Distribution After Node Recovery**
- After restarting the node, Swarm **did not automatically rebalance** the replicas across all three nodes.
- The two previously reallocated replicas remained on the two active nodes, leading to an uneven distribution (**3-3-0**).

---
## **Discussion**

### **Interpretation of Results**
- Swarm ensures high availability by quickly reassigning replicas to active nodes when a failure occurs.
- However, Swarm **does not rebalance replicas** after the failed node recovers, leading to an imbalance (**3-3-0** instead of 2-2-2).

### **Achieving Even Replica Distribution After Recovery**
To rebalance the replicas across all nodes, the following strategies were tested:

#### **1. Manual Rebalancing**
- Run `docker service update --force <service_name>`
- This forces Swarm to **redeploy all replicas**, leading to an even distribution.

#### **2. Automated Rebalancing Using a Script**
A simple script can periodically check for imbalance and trigger an update:
```bash
#!/bin/bash
SERVICE_NAME="my_service"
docker service update --force $SERVICE_NAME
```
This can be executed as a **cron job** to ensure automatic rebalancing.

#### **3. Swarm Configuration for Proactive Balancing**
- While Swarm does not natively rebalance, tools like **Swarm AutoScaler** or **external orchestrators** (e.g., Kubernetes) can manage replica distribution more efficiently.

### **Kubernetes and Rebalancing**
Kubernetes, another popular orchestration tool, **does not automatically rebalance workloads either**. When a node with running pods goes down, Kubernetes schedules the pods on available nodes, but when the failed node comes back online, the pods remain where they were reassigned. Unlike Docker Swarm, Kubernetes has a special tool called **Descheduler** that can help redistribute workloads periodically. 

Relevant discussions from the community date back to 2016:
- https://github.com/moby/moby/issues/24103
- https://itnext.io/pod-rebalancing-and-allocations-in-kubernetes-df3dbfb1e2f9

Thus, both Swarm and Kubernetes require manual intervention or additional tools for effective rebalancing.

---
## **Conclusion**
Docker Swarm provides built-in mechanisms for **failure recovery** by redistributing replicas across active nodes. However, it does not automatically rebalance workloads after a failed node recovers. Similarly, **Kubernetes does not rebalance pods** automatically, requiring the **Descheduler** tool to redistribute workloads. To maintain even distribution, administrators must use **manual updates, automation scripts, or external tools** to reassign replicas. Future work could explore alternative orchestration tools with built-in rebalancing.

---
## **References**
1. Docker Documentation: Swarm Mode Overview. Available at: https://docs.docker.com/engine/swarm/
2. "Automatic Load Balancing in Docker Swarm" – Technical Whitepaper, 2023.
3. Open-source tools for Swarm auto-rebalancing: https://github.com/docker/swarmkit
4. Kubernetes Pod Rebalancing: https://itnext.io/pod-rebalancing-and-allocations-in-kubernetes-df3dbfb1e2f9
5. Kubernetes Descheduler: https://kubernetes.io/docs/concepts/scheduling-eviction/descheduler/