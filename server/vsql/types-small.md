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

- MySQL: [SMALLINT](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html) (signed: -32,768 to 32,767; unsigned: 0 to 65,535)
- MariaDB: [SMALLINT](https://mariadb.com/kb/en/smallint/) (signed: -32,768 to 32,767; unsigned: 0 to 65,535)
- Microsoft SQL Server: [smallint](https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql?view=sql-server-ver16) (-32,768 to 32,767)
- PostgreSQL: [smallint](https://www.postgresql.org/docs/current/datatype-numeric.html) (-32,768 to 32,767)
- IBM Db2: [SMALLINT](https://www.ibm.com/docs/en/db2/11.5?topic=list-numbers) (-32,768 to 32,767)

### tinyint

A 1-byte signed integer type with range from -128 to 127

While not declared in the ISO/IEC 9075 standard, `tinyint` is implemented by several major SQL database systems:

- MySQL: [TINYINT](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html) (signed: -128 to 127; unsigned: 0 to 255)
- MariaDB: [TINYINT](https://mariadb.com/kb/en/tinyint/) (signed: -128 to 127; unsigned: 0 to 255)
- Microsoft SQL Server: [tinyint](https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql?view=sql-server-ver16) (0 to 255, unsigned only)

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

- `~cmp.AppDef~`uncvrd[^1]❓: Support new data types
- `~cmp.Parser~`uncvrd[^2]❓: Support new data types
- `~cmp.istructs~`uncvrd[^3]❓: Add new members to `IRowReader` and `IRowWriter` interfaces
- `~cmp.istructsmem~`uncvrd[^4]❓: Implement new members of `IRowReader` and `IRowWriter` interfaces

## Test plan

- `~it.SmallIntegers~`uncvrd[^5]❓

### Addressed issues

- [SMALLINT & TINYINT #3430](https://github.com/voedger/voedger/issues/3430)

## Footnotes

[^1]: `[~server.vsql.smallints/cmp.AppDef~impl]`
[^2]: `[~server.vsql.smallints/cmp.Parser~impl]`
[^3]: `[~server.vsql.smallints/cmp.istructs~impl]`
[^4]: `[~server.vsql.smallints/cmp.istructsmem~impl]`
[^5]: `[~server.vsql.smallints/it.SmallIntegers~impl]`
