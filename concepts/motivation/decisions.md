# Key architectural and design decisions

Here you will find a description and discussion of the key architectural and design decisions that have been made in the development of the project, their pros and cons, and the rationale behind them. This is a living document that will be updated as the project evolves.

## Decisions

| Decision | Description | Advantages | Trade-offs | Can be improved
| ----------- | ----------- | ----------- | ----------- | ---- |
| Application Partitions | Applications are divided into partitions, each partition is executed on its own node | [STRONG PARTITION SERIALIZABLE](https://dbmsmusings.blogspot.com/2019/06/correctness-anomalies-under.html) guarantees, performance | If a node fails, some clients experience 2-5 minutes of downtime | Yes, we beleive up to ~20 seconds
| Naive Voedger engine update | Voedger engine leads to 2-5 minutes downtime, same as node restart | Simplicity | 2-5 minutes downtime | Yes, up to few seconds downtime |
| High granularity WASM-Host protocol | WASM module has to call Host for every field of a record it is interested in | Simplicity | Reduced performance due to multiple host calls | Yes, a low-granularity protocol can be developed|


## Application Partitions

**Architectural/design decisions:**
- The application is divided into partitions.
- Each application partition is executed on a separate node.
- If a node goes down, all partitions have to be restarted on other nodes.

**Problem:**
- If a node goes down, it causes 2-5 minutes of downtime visible to some clients.

**Can be improved:**
- Yes, downtime can be reduced to approximately 20 seconds.

## High granularity WASM-Host protocol

**Architectural/design decisions:**
- Extensions are executed as WASM modules.
- If an extension needs to read 5 fields of some record, it has to make 6 calls to the host system: one to read the record and 5 to read the fields.
- Extension execution time is controlled by the host system (anti-freeze), which increases the host-WASM-host latency.

**Problem:**
- Each call takes 300 ns, so 3000 calls will take around 1 ms.
- ??? Proofs

**Can be improved:**
- Yes, there are few approaches
  - By not using the anti-freeze option, in which case each call takes ~10 ns.
  - By developing a low-granularity protocol
- ??? Proofs
