# Loki and Cassandra Storage: Compatibility Analysis

Loki, a log aggregation system by Grafana, previously supported Cassandra as a storage backend for both chunks and indexes. However, as of Loki 2.9, Cassandra support has been deprecated with no planned future development.

## Research objectives

1. Identify a compatible Loki version for Cassandra/Scylla storage
   - Find the last stable Loki release that fully supports Cassandra integration
   - Document the configuration requirements for both chunk and index storage
   - Note any known limitations or performance considerations

2. Performance testing with production data
   - Conduct load testing with 10GB WM log dataset
   - Document the setup process and configuration used
   - Measure and analyze storage performance metrics
   - Contact Victor to obtain the test dataset

3. Identify extra potential risks of using Cassandra/Scylla with Loki
   - Consistency level specification (QUORUM, LOCAL_QUORUM, etc.)
   - Stretched cluster considerations

## Context

- https://github.com/grafana/loki/blob/main/docs/sources/configure/storage.md
    - Source: https://github.com/grafana/loki/blob/30afd21ce75ac87dcb4c10bac40bcc390a5da7be/docs/sources/configure/storage.md#on-premise-deployment-cassandracassandra
- https://github.com/grafana/loki/issues/9127
  - Closing as Cassandra was deprecated in 2.9. We do not plan any further development for Cassandra as a storage backend.
- https://grafana.com/docs/loki/latest/operations/storage/tsdb/  
