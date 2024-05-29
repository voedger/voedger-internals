# Key architectural and design decisions

Here you will find a description and discussion of the key architectural and design decisions that have been made in the development of the project, their pros and cons, and the rationale behind them. This is a living document that will be updated as the project evolves.

## Decisions

| Decision| Description | Advantages | Trade-offs |
| ----------- | ----------- | ----------- | ----------- |
| Application Partitions| Applications are divided into partitions, each partition is executed on its own node| STRONG PARTITION SERIALIZABLE guarantees, performance. | If a node fails some clients see 2-5 minutes of downtime|
| High Granularity Host-WASM Protocol | WASM module has to call Host for every field of a record it is interested in| Simplicity | Performance|
