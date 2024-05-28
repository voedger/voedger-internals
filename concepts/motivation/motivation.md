# Motivation

Here you will find - what is Voedger, how it helps us, how it can be used by you.

## Jump to the Clouds

Voedger was initially designed by unTill Software Development Group B.V. (unTill) in the early 2020s. At that time, unTill provided a mature "desktop" POS solution (unTill Prime) for the European market and sought to develop a cloud version and to expand into other markets.

Technical characteristics of unTill Prime:

- Over 1 million lines of code (including the "frontend")
- Database Management System: Firebird
- More than 400 tables
- Over 3000 lines of DDL code

## Requirements

Business (unTill company management) came up with the following requirements.

### Distributed data

- It shall be possible to create clusters to keep POS data and configuration all over the world.

### Federation

- Users shall be able to work with their data across clusters transparently.

**Example:**

- A Restaurant Owner shall be able to create a profile (Restaurant Owner Workspace) in any cluster, ideally one that is closer to the owner's location
- The Restaurant Owner shall also be able to create Restaurants (Restaurant Workspaces) in any cluster, ideally one that is closer to the restaurant's location, regardless of where the Restaurant Owner Workspace was initially created

### Fault Tolerance

- If a database node goes down, data shall NOT be lost

This requirement means that every piece of data must be stored in multiple copies, and only synchronous replication shall be used.

### Resilience

- If a datacenter goes down, clients shall not experience any downtime.
- If a database node goes down, clients shall not experience any downtime.
- If an application node goes down:
  - Clients shall experience downtime of less than 5 minutes.
  - Performance shall be fully restored within 10 minutes.

### Performance

- Each cluster shall support 10,000 restaurants.
- It is estimated that, on average, a restaurant generates 2,000 operations (orders, payments, etc.) per day.
- Therefore, a cluster must handle 20,000,000 operations per day, averaging 230 operations per second, with peaks up to 2,000 operations per second.

Additionally, the cost of the hardware must be reasonable. Although the cost will be included in the price of the POS system subscription, it is desirable to minimize infrastructure-related operation costs to remain competitive with other POS systems.

### Edge Computing

- The system shall be installable at the "edge" (e.g., in a restaurant) and able to synchronize with the cloud.
- If an Edge Device goes down, all other devices in the restaurant shall continue to work with the cloud.
- "Minor" data loss is acceptable for the Edge Device.
- For large restaurants, it shall be possible to build a Private Cloud (Cluster), meeting Fault Tolerance and Resilience requirements.

In practice, our cloud server software must run on typical, relatively weak POS hardware with Android OS.

### Event Sourcing

- All changes to the application state shall be stored as a sequence of events.
- In some cases, the sequence of events will be cryptographically signed to meet legal requirements.

This is a common requirement for POS systems as it provides a natural audit trail. While highly beneficial for applications across various domains, it adds extra complexity to the project. From our observations of other projects, this feature is often added in the later stages of development if the project succeeds.

## Analysis & research. Voedger comes to life

Analyzing the requirements, we identified the Modern Tech Stack:

![Modern Tech Stack](stack.png)

Using components from this stack, we could have built the system, but it would take man-years to develop. We agreed to invest these resources, as did our colleagues from other POS providers. However, during analysys and researching process, we got an idea that we could create a "generic engine" to handle the requirements above. This engine would not only enable us to build our POS system but also allow us to bring a new product to the market. This product would enable the development of systems with similar requirements in a significantly shorter time, potentially up to 10 times faster than using just the Modern Tech Stack.

We shared this idea with the colleagues from other companies, and they agreed to invest in the development of this engine.

This is how Voedger was born.

## Extra requriements

As we wanted to go public with Voedger, we needed to add some extra requirements.

### Development Simplicity: Coding

- It shall be extremely easy to develop Voedger applications.

The term "low-code" often has a bad reputation, but literally it precisely describes our goal: to develop applications with minimal coding. We want Voedger users to be free from any system-related development and focused solely on business logic.

What is still necessary to code:

- Develop schemas using Voedger DDL (similar to SQL DDL but with additional features).
- Develop business logic using the Go language, Go-files will be compiled to WASM-files and run in the Voedger Servers. We call a code that extends Voedger engines capabilities **Voedger Extension**.

For example, if you need to work with an entity such as Payment, you will need to:

- Define an SQL schema for it.
- Define validation rules, such as developing a function to check if a Visit (remember we are talking about restaurants) the Payment is related to is not paid yet.

What you do NOT need to do:

- Manage which cluster/node will process a particular Payment.
- Determine which nodes will be used to save a particular Payment.
- Handle synchronization of Payments between nodes to meet Fault Tolerance requirements.
- Manage how to save and process events related to operations with Payments.
- And much, much more...

### Development Simplicity: Testing

- It shall be extremely easy to test Voedger applications.

**Voedger Extensions** has a design that is somehow similar to the design of the Redux reducers.

- Extension receives `IState` and `IIntents` interfaces
- `IState` reflects the current state of the system and the Action (in terms of Redux)
- `IIntents` is used to say the system that we want to update or create a new record

This way extension can be considered as a "pure function" without side effects, state can be easily mocked and intents can be easily validated.

For unit testing there is no need to run the whole system, just the extension itself.

### Cloud Agnostic Design

- It shall be possible to run Voedger everywhere, including on your own infrastructure.

This is a direct result of the Edge Computing requirement—if we can run Voedger on a POS device, we can run it on any cloud provider.

### Operation Simplicity: DBMS

- It shall be easy for Admins to build a cluster and replace a failed node.

Voedger primarily uses Cassandra/Scylla as a database management system and is designed to be as transparent as possible for Developers and Admins. Developers are not aware of the underlying database system at all, note that Voedger can even run on a POS device with Android OS using bbolt key-value storage.

Admins should have an idea of what is going on in the system, but we have simplified the process as much as possible.

Voedger provides a special utility called `ctool`. It expects Admins to provide the addresses of the nodes, which should have a clean Ubuntu installation, and `ctool` will handle the rest.

- To create a cluster: `ctool init <node1-address> <node2-address> <node3-address>...`
- To replace a node: `ctool replace <old-node-address> <new-node-address>`

### Operation Simplicity: Monitoring and Alerting

- It shall be easy for Admins to monitor the system and receive alerts.

The `ctool` utility installs and configures Prometheus and Grafana on the nodes, providing comprehensive dashboards out of the box.