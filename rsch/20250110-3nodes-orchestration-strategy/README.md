# Orchestration strategy

In a cluster environment with three nodes and six peer processes, we need to determine the optimal orchestration strategy. We are considering two approaches:

## Option 1: Reserved node strategy
- Deploy 3 processes per node across 2 nodes
- Keep one node as a reserved failover node
- Total capacity: 6 processes (3 processes × 2 nodes)

## Option 2: Distributed strategy
- Deploy 2 processes per node across all 3 nodes
- During node failure, redistribute affected processes to healthy nodes
- Total capacity: 6 processes (2 processes × 3 nodes)

## Key considerations

- High availability requirements
- Resource utilization efficiency
- Industry best practices
- Operational complexity
- Failover performance

## Problem Statement

Which orchestration strategy better aligns with industry standards for distributed systems?

## Analysis

Strategy 1: 3 processes per node, one node reserved
- Using 2 nodes actively (3 processes each)
- 1 node completely idle as a spare
- Pros:
  - Simple failover - entire workload can move to the spare node
  - Clear separation between active and standby resources
- Cons:
  - 33% of hardware resources are always idle
  - Less efficient resource utilization
  - All processes must move during failover

Strategy 2: 2 processes per node, distributed failover
- Using all 3 nodes actively (2 processes each)
- Processes redistribute on failure
- Pros:
  - Better resource utilization - all nodes are active
  - More gradual degradation - only failed node's processes need to move
  - Aligned with industry best practices for distributed systems
  - Smaller blast radius during failures
- Cons:
  - Slightly more complex failover logic
  - Nodes need to handle additional load during failure scenarios

The second strategy (2 processes per node) is better aligned with modern industry practices because:

1. It follows the principle of distributed redundancy rather than standby redundancy
2. It makes better use of available resources during normal operation
3. It provides more flexible scaling options
4. It matches how modern orchestrators like Kubernetes handle workload distribution

Industry leaders like AWS, Google Cloud, and Azure all recommend distributed workload patterns over dedicated standby nodes for most use cases. This approach has become the de facto standard for cloud-native applications.

Here's a clear conclusion for the orchestration strategy analysis:

## Conclusion

Based on industry best practices and modern distributed systems architecture principles, the distributed strategy (Option 2) with 2 processes per node across all nodes is recommended. This approach offers:

**Key advantages**

- Optimal resource utilization during normal operations
- Reduced blast radius during failures
- Better alignment with cloud-native principles
- More flexible scaling capabilities

The strategy matches patterns used by leading cloud providers and orchestration platforms like Kubernetes, making it a future-proof choice for distributed systems. While it requires slightly more sophisticated failover logic, the benefits of improved resource utilization and graceful degradation outweigh this complexity.

For Voedger deployments, this approach ensures better reliability and efficiency, particularly important for applications requiring worldwide distribution and high availability.
