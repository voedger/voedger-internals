---
reqmd.package: server.vsql.smallints
---

# Small integers

## Motivation

As of March 2025, Voedger does not support 2-byte and 1-byte integers. This limitation causes unnecessary storage and processing overhead, particularly for data types that don't require the full range of 4-byte integers.

## Introduction

This document outlines the implementation of two smaller integer data types in Voedger: `smallint` (2 bytes) and `tinyint` (1 byte). Adding these types will optimize storage utilization and processing efficiency for appropriate use cases.

### smallint

A 2-byte signed integer type with range from -32,768 to 32,767.

`smallint` is declared in ISO/IEC 9075 standard and is widely supported by popular SQL database systems:

- MySQL: [SMALLINT](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html)
- MariaDB: [SMALLINT](https://mariadb.com/kb/en/smallint/)
- Microsoft SQL Server: [smallint](https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql?view=sql-server-ver16)
- PostgreSQL: [smallint](https://www.postgresql.org/docs/current/datatype-numeric.html)
- IBM Db2: [SMALLINT](https://www.ibm.com/docs/en/db2/11.5?topic=list-numbers)

### tinyint

A 1-byte signed integer type with range from -128 to 127

While not declared in the ISO/IEC 9075 standard, `tinyint` is implemented by several major SQL database systems:

- MySQL: [TINYINT](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html)
- MariaDB: [TINYINT](https://mariadb.com/kb/en/tinyint/)
- Microsoft SQL Server: [tinyint](https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql?view=sql-server-ver16)

## Functional design

Example of a view with `smallint` and `tinyint` columns:

```sql
VIEW MeasurementAggr (

    -- Partion key

    ID smallint,
    Period smallint,
    Cluster smallint,

    -- Clustering key

    Year smallint,
    Month tinyint,
    Day tinyint,
    Hour tinyint,
    Minute tinyint,
    Second tinyint,

    -- Value

    Cnt smallint,           -- Number of measurements
    Sum double precision,   -- Sum of measurements
    Min double precision,   -- Minimal measurement
    Max double precision    -- Maximum measurement

    PRIMARY KEY ((ID, Period, Cluster), Year, Month, Day, Hour, Minute, Second)
)
```

## Technical design

- `~cmp.AppDef~`covered[^1]✅: Support new data types
- `~cmp.Parser~`covered[^2]✅: Support new data types
- `~cmp.istructs~`covered[^3]✅: Add new members to `IRowReader` and `IRowWriter` interfaces
- `~cmp.istructsmem~`covered[^4]✅: Implement new members of `IRowReader` and `IRowWriter` interfaces

## Test plan

- `~it.SmallIntegers~`covered[^5]✅

### Addressed issues

- [SMALLINT & TINYINT #3430](https://github.com/voedger/voedger/issues/3430)

## Footnotes

[^1]: `[~server.vsql.smallints/cmp.AppDef~impl]` [pkg/appdef/internal/datas/data_test.go:320:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/internal/datas/data_test.go#L320), [pkg/appdef/utils_data_test.go:27:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/utils_data_test.go#L27), [pkg/appdef/utils_data_test.go:116:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/utils_data_test.go#L116), [pkg/appdef/utils_data_test.go:119:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/utils_data_test.go#L119), [pkg/appdef/utils_data_test.go:150:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/utils_data_test.go#L150), [pkg/appdef/utils_data_test.go:233:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/utils_data_test.go#L233), [pkg/appdef/utils_data_test.go:242:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/appdef/utils_data_test.go#L242), [server/vsql/types-small.md:87:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/vsql/types-small.md#L87)
[^2]: `[~server.vsql.smallints/cmp.Parser~impl]` [server/vsql/types-small.md:88:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/vsql/types-small.md#L88)
[^3]: `[~server.vsql.smallints/cmp.istructs~impl]` [pkg/istructs/utils.go:68:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructs/utils.go#L68), [pkg/istructs/utils.go:69:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructs/utils.go#L69), [pkg/istructs/utils.go:101:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructs/utils.go#L101), [pkg/istructs/utils.go:102:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructs/utils.go#L102), [pkg/istructsmem/tables-types.go:63:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/tables-types.go#L63), [pkg/istructsmem/tables-types.go:65:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/tables-types.go#L65), [pkg/istructsmem/tables-types.go:164:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/tables-types.go#L164), [pkg/istructsmem/tables-types.go:184:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/tables-types.go#L184), [pkg/istructsmem/tables-types.go:186:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/tables-types.go#L186), [pkg/istructsmem/types-dynobuf.go:38:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/types-dynobuf.go#L38), [pkg/istructsmem/types-dynobuf.go:45:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/types-dynobuf.go#L45), [server/vsql/types-small.md:89:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/vsql/types-small.md#L89)
[^4]: `[~server.vsql.smallints/cmp.istructsmem~impl]` [pkg/istructsmem/internal/dynobuf/utils.go:27:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/internal/dynobuf/utils.go#L27), [pkg/istructsmem/internal/dynobuf/utils.go:29:impl](https://github.com/voedger/voedger/blob/27336951f2bf46b63f8e21532bee82f3b53042d1/pkg/istructsmem/internal/dynobuf/utils.go#L29), [server/vsql/types-small.md:90:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/vsql/types-small.md#L90)
[^5]: `[~server.vsql.smallints/it.SmallIntegers~impl]` [server/vsql/types-small.md:91:impl](https://github.com/voedger/voedger-internals/blob/7c007d555b627b7fb6d5a6ba14c82c76b7a270e7/server/vsql/types-small.md#L91)
