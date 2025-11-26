# **Investigating Replica Addressability in a Docker Swarm Cluster**

- **Author(s)**:
  - Alexey Ponomarev. Sigma-Soft, Ltd.
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
- All nodes Docker Swarm cluster was initialized as:
  - Swarm Manager
  - Worker Node

- The cluster was configured using the following commands:

```sh
ctool init SE --ssh-key <key> --skip-stack app -p 2214 10.0.0.11 10.0.0.12 10.0.0.13
```

### **Service Deployment**
A test service was deployed with six replicas using custom  Voedger-based container running a voedger server:

```yaml
version: '3.8'

services:

  vvm:
    image: voedger/paa
    networks:
      - voedger_net
    volumes:
      - /etc/hosts:/etc/hosts
    environment:
      - VOEDGER_HTTP_PORT=${VOEDGER_HTTP_PORT}
      - VOEDGER_ACME_DOMAINS=${VOEDGER_ACME_DOMAINS}
    deploy:
      restart_policy:
        condition: any
      replicas: 6
      endpoint_mode: dnsrr
      placement:
        preferences:
          - spread: node.id

networks:
  voedger_net:
    external: true
```
- Key Points docker-compose.yml: 
  - `endpoint_mode: dnsrr` was used to disable the default VIP-based load balancing.
    - Now every replica has its own IP address. 
  - `placement preferences` were set to spread replicas evenly across nodes.

- Internal Network 
  -  docker network create -d overlay --attachable --subnet 10.10.0.0/24 voedger_net
                  
Modify entrypoint.sh in Docker image
 ```sh
# Iterate over all container ip, if found ip in voedger network - store as VVM_IP
for ip in $(hostname -I); do
  case "$ip" in
    10.10.*)
      VVM_IP=$ip
      break
      ;;
  esac
done

# if VVM_IP empty - exit with error
if [ -z "$VVM_IP" ]; then
  echo "Cannot resolve IP in subnet 10.10.0.0/24" >&2
  exit 1
fi

export VVM_IP

echo "VVM IP: $VVM_IP"
```
- Key Points entrypoint.sh modification and docker image prepare:
  - Get all IPs assigned to the container, iterate over and select the one from the `voedger_net` subnet.
    - selected ip will be defined as VVM_IP. 
  - export VVM_IP to make it accessible from the container.
  - build and push the image to cluster node
```sh                               
    cd ~/voedger/cmd/voedger
    docker build -t voedger/paa:latest .
    docker save voedger/paa:latest | bzip2 | ssh -i ~/amazonKey.pem -p 2214  ubuntu@db-node-2 'bunzip2 | docker load'
```
- Deploy the service
  - 'docker stack deploy SEDockerStack --compose-file ~/docker-compose-vvm.yml' 



### **Replica Address Collection**
To examine replica addressability:
- Get ip address of each replica 
```shell
ubuntu@node-1:~$ docker service logs SEDockerStack_vvm -n 100 | grep "VVM IP"
SEDockerStack_vvm.6.p4qyjdpl893s@node-3    | VVM IP: 10.10.0.227
SEDockerStack_vvm.3.mocrhy4dv0dz@node-3    | VVM IP: 10.10.0.224
SEDockerStack_vvm.1.37hq4bkt3djs@node-2    | VVM IP: 10.10.0.222
SEDockerStack_vvm.4.4bq4eyrxzp5e@node-2    | VVM IP: 10.10.0.225
SEDockerStack_vvm.5.k3wvh30j1oaj@node-1    | VVM IP: 10.10.0.226
SEDockerStack_vvm.2.jwebapllaes9@node-1    | VVM IP: 10.10.0.223
```
- Check voedger service availability with curl 
  - return http code must be 200 - OK 
```shell
docker exec -it SEDockerStack_vvm.2.jwebapllaes9 bash
apt install curl
curl -s -o /dev/null  -w "%{http_code}\n" http://10.10.0.227/static/sys/monitor/site/hello
200
```
---

## **Results**

### **Address Retrieval**
- Each replica was able to retrieve an internal IP.
- IPs were dynamically assigned from the Swarm overlay network, that define by the `voedger_net` subnet. 

### **Observations**
- Swarm assigns an internal IP to each replica within the overlay network.
- The service VIP load-balances requests, making direct access unreliable.
- Using 'dnsrr' endpoint mode allows for per-replica addressing.

---

## **Discussion**

### **Interpretation of Results**
- Docker Swarm does not natively support direct access to specific replicas.
- Swarm's VIP endpoint mode enforces load balancing, preventing direct replica access.
- Workaround - use 'dnsrr' endpoint mode to bypass VIP-based load balancing.

### **Comparison with Kubernetes**
- Kubernetes allows replica differentiation via unique Pod IPs.
- Swarm's approach emphasizes service abstraction rather than individual container exposure.

### **Implications**
- Developers requiring per-replica access should consider alternative approaches, such as using 'dnsrr' endpoint mode.

---

## **Conclusion**
This research confirms that while each replica within a Docker Swarm service obtains an internal address, direct access to a specific replica is not possible through default networking configurations. Swarm’s design prioritizes service-level abstraction over container-level routing, enforcing load-balancing through a VIP endpoint mode. 

---

## **References**

1. Docker Documentation - Swarm Mode Networking: [https://docs.docker.com/engine/swarm/networking/](https://docs.docker.com/engine/swarm/networking/)
2. Kubernetes Networking Concepts: [https://kubernetes.io/docs/concepts/cluster-administration/networking/](https://kubernetes.io/docs/concepts/cluster-administration/networking/)
3. Overlay Networking in Docker Swarm: [https://docs.docker.com/network/overlay/](https://docs.docker.com/network/overlay/)