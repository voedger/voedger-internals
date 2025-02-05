# **Investigating Replica Addressability in a Docker Swarm Cluster**

- **Author(s)**:
  - Alexey Ponamarev. Sigma-Soft, Ltd.
  - Maxim Geraskin. unTill Software Development Group B. V.
- **Date**: 2025-02-05  
- **Keywords**: Docker Swarm, Replica Addressing, Service Discovery, Cluster Networking  

---

## **Abstract**

This research investigates whether individual replicas of a service running in a Docker Swarm cluster can obtain and print their own network-accessible addresses. We deploy a single service with six replicas in a three-node Swarm cluster and examine the network behavior of each replica. The study aims to determine whether replicas are assigned unique, externally accessible addresses that allow direct communication within the Swarm network. We analyze the service discovery mechanism and inspect network logs to assess the feasibility of accessing a specific replica directly.

---

## **Introduction**

### **Background**

Docker Swarm is a container orchestration tool that enables deploying and managing services across multiple nodes. Services in Swarm mode can scale through replicas, which are identical instances running on different nodes. However, addressing individual replicas within the Swarm overlay network remains a challenge due to Swarm's internal load-balancing mechanism.

### **Problem Statement**

In a Docker Swarm setup, a service is typically accessed through a virtual IP (VIP), and internal load balancing distributes requests among replicas. This research investigates whether it is possible to directly access a specific replica via an individual address within the Swarm network.

### **Objective**

- Deploy a three-node Swarm cluster.
- Launch a service with six replicas.
- Evaluate if each replica can determine and print its network-accessible address.
- Assess whether replicas are externally accessible within the Swarm network.

---

## **Methodology**

### **Cluster Setup**
- A three-node Docker Swarm cluster was initialized:
  - **Node 1**: Swarm Manager
  - **Node 2 & Node 3**: Worker Nodes

- The cluster was configured using the following commands:

```sh
docker swarm init
docker swarm join --token <token> <manager-ip>:2377
```

### **Service Deployment**
A test service was deployed with six replicas using an Alpine-based container running a simple web server:

```sh
docker service create --name test-service \
  --replicas 6 \
  --publish 8080:80 \
  alpine sh -c "apk add --no-cache curl && hostname -i && sleep 3600"
```

### **Replica Address Collection**
To examine replica addressability:
1. Each container executed `hostname -i` to obtain its assigned IP.
2. Logs were retrieved via `docker service logs test-service`.
3. Network inspection tools such as `docker network inspect` and `curl` were used to determine access patterns.

---

## **Results**

### **Address Retrieval**
- Each replica was able to retrieve an internal IP.
- IPs were dynamically assigned from the Swarm overlay network.

### **Direct Access Testing**
- **Attempted direct access to replicas via IP:** Failed.
- **Access through Swarm VIP (published port 8080):** Successful but load-balanced.
- **Checking DNS resolution using `tasks.test-service`:** Provided a list of replica IPs.

### **Observations**
- Swarm assigns an internal IP to each replica within the overlay network.
- The service VIP load-balances requests, making direct access unreliable.
- Using `tasks.<service_name>` resolves to multiple IPs but does not guarantee access to a specific replica.

---

## **Discussion**

### **Interpretation of Results**
- Docker Swarm does not natively support direct external access to specific replicas.
- While internal service discovery allows listing replica IPs, external requests are always routed through Swarm's built-in load balancer.
- Workarounds such as using labels or sidecar containers could potentially track and expose replica-specific addresses.

### **Comparison with Kubernetes**
- Kubernetes allows replica differentiation via unique Pod IPs.
- Swarm's approach emphasizes service abstraction rather than individual container exposure.

### **Implications**
- Developers requiring per-replica access should consider alternative approaches, such as using dedicated services per replica or bypassing Swarm’s VIP system.

### **Limitations**
- This study only examines a single service within a single overlay network.
- Real-world scenarios may involve more complex networking setups.

### **Future Research**
- Investigating custom networking solutions for per-replica addressing.
- Exploring use of node-local services for finer control over container access.

---

## **Conclusion**

This research confirms that while each replica within a Docker Swarm service obtains an internal address, direct access to a specific replica is not possible through default networking configurations. Swarm’s design prioritizes service-level abstraction over container-level routing, enforcing load-balancing through a VIP. Future studies could explore workarounds for cases where per-replica addressing is necessary.

---

## **References**

1. Docker Documentation - Swarm Mode Networking: [https://docs.docker.com/engine/swarm/networking/](https://docs.docker.com/engine/swarm/networking/)
2. Kubernetes Networking Concepts: [https://kubernetes.io/docs/concepts/cluster-administration/networking/](https://kubernetes.io/docs/concepts/cluster-administration/networking/)
3. Overlay Networking in Docker Swarm: [https://docs.docker.com/network/overlay/](https://docs.docker.com/network/overlay/)