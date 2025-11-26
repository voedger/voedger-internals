# **Rebalancing in Docker Swarm Cluster**

- **Author(s)**:
  - Alexey Ponomarev. Sigma-Soft, Ltd.
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
  - Use cluster configuration from [Swarm replica addressability Study](../20250205-swarm-replica-addressability/README.md)  
- Deployment of a single service with **six replicas**.
  - Use service deployment configuration from [Swarm replica addressability Study](../20250205-swarm-replica-addressability/README.md) 
- One node is manually stopped and later restarted.

### **Observations and Data Collection**
- **Step 1:** Deploy a Swarm cluster with three manager/worker nodes.
```shell
ubuntu@node-1:~$ docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
k5jzdim4ok3fw2b6vwd0eg7f0 *   node-1     Ready     Active         Leader           20.10.23
paf2j73onn4x301qnbd6xm7fp     node-2     Ready     Active         Reachable        20.10.23
q7bzyhy48awgo9xmzxjqm0jeh     node-3     Ready     Active         Reachable        20.10.23
```
- **Step 2:** Deploy a service with six replicas using the [Swarm replica addressability Study](../20250205-swarm-replica-addressability/README.md) approach.
- **Step 3:** Verify the initial replica distribution 
```shell
ubuntu@node-1:~$ docker service ps SEDockerStack_vvm | grep Running
st21s0kjt4g2   SEDockerStack_vvm.1   voedger/paa:latest   node-3    Running         Running 12 seconds ago
hxzvmnwz2y38   SEDockerStack_vvm.2   voedger/paa:latest   node-2    Running         Running 12 seconds ago
2ilakl1ugqx2   SEDockerStack_vvm.3   voedger/paa:latest   node-1    Running         Running 12 seconds ago
my71hy8l1xj7   SEDockerStack_vvm.4   voedger/paa:latest   node-3    Running         Running 12 seconds ago
72e9lu0fbtxd   SEDockerStack_vvm.5   voedger/paa:latest   node-2    Running         Running 12 seconds ago
drp87pgo0k3i   SEDockerStack_vvm.6   voedger/paa:latest   node-1    Running         Running 12 seconds ago 
```
- **Step 4:** Shut down node-2 and observe how Swarm move replicas. 
  - all tasks are distributed equally between 2 nodes 
  - vvm.2 and vvm.5 moved to node-1 and node-3 respectively.
```shell
ubuntu@node-1:~$ docker node ls
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
k5jzdim4ok3fw2b6vwd0eg7f0 *   node-1     Ready     Active         Leader           20.10.23
paf2j73onn4x301qnbd6xm7fp     node-2     Down      Active         Unreachable      20.10.23
q7bzyhy48awgo9xmzxjqm0jeh     node-3     Ready     Active         Reachable        20.10.23
ubuntu@node-1:~$
ubuntu@node-1:~$ docker service ps SEDockerStack_vvm | grep Running
st21s0kjt4g2   SEDockerStack_vvm.1       voedger/paa:latest   node-3    Running         Running 2 minutes ago
oguyx3xdlual   SEDockerStack_vvm.2       voedger/paa:latest   node-1    Running         Running 4 seconds ago
hxzvmnwz2y38    \_ SEDockerStack_vvm.2   voedger/paa:latest   node-2    Shutdown        Running 2 minutes ago
2ilakl1ugqx2   SEDockerStack_vvm.3       voedger/paa:latest   node-1    Running         Running 2 minutes ago
my71hy8l1xj7   SEDockerStack_vvm.4       voedger/paa:latest   node-3    Running         Running 2 minutes ago
v6z5o8jaeemg   SEDockerStack_vvm.5       voedger/paa:latest   node-3    Running         Running 4 seconds ago
72e9lu0fbtxd    \_ SEDockerStack_vvm.5   voedger/paa:latest   node-2    Shutdown        Running 2 minutes ago
drp87pgo0k3i   SEDockerStack_vvm.6       voedger/paa:latest   node-1    Running         Running 2 minutes ago
```
- **Step 5:** Restart the failed node and observe if Swarm rebalances the replicas automatically.
  - node-2 not used for service SEDockerStack_vvm after recovery
```shell
ubuntu@node-1:~$ docker service ps SEDockerStack_vvm | grep Running
st21s0kjt4g2   SEDockerStack_vvm.1       voedger/paa:latest   node-3    Running         Running 21 minutes ago
oguyx3xdlual   SEDockerStack_vvm.2       voedger/paa:latest   node-1    Running         Running 19 minutes ago
2ilakl1ugqx2   SEDockerStack_vvm.3       voedger/paa:latest   node-1    Running         Running 21 minutes ago
my71hy8l1xj7   SEDockerStack_vvm.4       voedger/paa:latest   node-3    Running         Running 21 minutes ago
v6z5o8jaeemg   SEDockerStack_vvm.5       voedger/paa:latest   node-3    Running         Running 19 minutes ago
drp87pgo0k3i   SEDockerStack_vvm.6       voedger/paa:latest   node-1    Running         Running 21 minutes ago
```
- **Step 6:** Test strategies for achieving an even distribution manually.
  - For re-balance cluster will use DOWN/UP scale strategies for service 
  - Scale Down with: docker service scale SEDockerStack_vvm=4
    - ```shell
      ubuntu@node-1:~$ docker service ps SEDockerStack_vvm | grep Running
      st21s0kjt4g2   SEDockerStack_vvm.1       voedger/paa:latest   node-3    Running         Running 29 minutes ago
      oguyx3xdlual   SEDockerStack_vvm.2       voedger/paa:latest   node-1    Running         Running 26 minutes ago
      2ilakl1ugqx2   SEDockerStack_vvm.3       voedger/paa:latest   node-1    Running         Running 29 minutes ago
      my71hy8l1xj7   SEDockerStack_vvm.4       voedger/paa:latest   node-3    Running         Running 29 minutes ago
      ```
  - Scale UP with: docker service scale SEDockerStack_vvm=6
    - ```shell
      ubuntu@node-1:~$ docker service ps SEDockerStack_vvm | grep Running
      st21s0kjt4g2   SEDockerStack_vvm.1       voedger/paa:latest   node-3    Running         Running 30 minutes ago
      oguyx3xdlual   SEDockerStack_vvm.2       voedger/paa:latest   node-1    Running         Running 28 minutes ago
      2ilakl1ugqx2   SEDockerStack_vvm.3       voedger/paa:latest   node-1    Running         Running 30 minutes ago
      my71hy8l1xj7   SEDockerStack_vvm.4       voedger/paa:latest   node-3    Running         Running 30 minutes ago
      78odosts0ejy   SEDockerStack_vvm.5       voedger/paa:latest   node-2    Running         Running 8 seconds ago
      9rlubwlhprpr   SEDockerStack_vvm.6       voedger/paa:latest   node-2    Running         Running 8 seconds ago    
      ```
    - Now service has even distribution of replicas   
---
## **Results**

### **Replica Redistribution Upon Node Failure**
- Initially, the six replicas were evenly distributed (i.e., **two per node**).
- Upon stopping one node, Swarm **automatically reallocated its two replicas** to the remaining two nodes, resulting in a **3-3 replica distribution**.
- No service disruption occurred, demonstrating Swarm's self-healing capabilities.

### **Replica Distribution After Node Recovery**
- After restarting the node, Swarm **did not automatically rebalance** the replicas across all three nodes.
- The two previously reallocated replicas remained on the two active nodes, leading to an uneven distribution (**3-3-0**).
- After re-balance with scale approach service has even distribution of replicas (**2-2-2**).
---
## **Discussion**

### **Interpretation of Results**
- Swarm ensures high availability by quickly reassigning replicas to active nodes when a failure occurs.
- However, Swarm **does not rebalance replicas** after the failed node recovers, leading to an imbalance (**3-3-0** instead of 2-2-2).
- Manual intervention or automation is required to achieve an even distribution of replicas across all nodes after recovery.

### **Achieving Even Replica Distribution After Recovery**
To re-balance the replicas across all nodes, the following strategies were tested:

#### **1. Manual Re-balancing**
- Run `docker service scale SEDockerStack_vvm=4 && docker service scale SEDockerStack_vvm=6`
- This approach manually scales the service down and up to redistribute replicas evenly across all nodes.
- Possible another approach is to use `docker service update SEDockerStack_vvm --force` to force the service to re-balance replicas.
  - But this approach is not applicable for production environments as it definitely cause service downtime - all tasks will be recreated. 

### **Kubernetes and Re-balancing**
Kubernetes, another popular orchestration tool, **does not automatically re-balance workloads either**. When a node with running pods goes down, Kubernetes schedules the pods on available nodes, but when the failed node comes back online, the pods remain where they were reassigned. Unlike Docker Swarm, Kubernetes has a special tool called **Descheduler** that can help redistribute workloads periodically. 

Relevant discussions from the community date back to 2016:
- https://github.com/moby/moby/issues/24103
- https://itnext.io/pod-rebalancing-and-allocations-in-kubernetes-df3dbfb1e2f9

Thus, both Swarm and Kubernetes require manual intervention or additional tools for effective rebalancing.

---
## **Conclusion**
Docker Swarm provides built-in mechanisms for **failure recovery** by redistributing replicas across active nodes. However, it does not automatically re-balance workloads after a failed node recovers. Similarly, **Kubernetes does not re-balance pods** automatically, requiring the **de-scheduler** tool to redistribute workloads. To maintain even distribution, administrators must use **manual updates, automation scripts, or external tools** to reassign replicas.

---
## **References**
1. Docker Documentation: Swarm Mode Overview. Available at: https://docs.docker.com/engine/swarm/
2. "Automatic Load Balancing in Docker Swarm" – Technical Whitepaper, 2023.
3. Open-source tools for Swarm auto-rebalancing: https://github.com/docker/swarmkit
4. Kubernetes Pod Rebalancing: https://itnext.io/pod-rebalancing-and-allocations-in-kubernetes-df3dbfb1e2f9
5. Kubernetes Descheduler: https://kubernetes.io/docs/concepts/scheduling-eviction/descheduler/