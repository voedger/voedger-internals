---
reqmd.package: server.vsql.smallints
---

# Small integers

## Motivation

As of March 2025 Voedger does not support 2-byte and 1-byte integers. It causes unnecessary storage and processing overhead.

## Introduction

### smallint

Declared in ISO/IEC 9075, supported by popular SQL servers:

- MySQL: [SMALLINT](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html)
- MariaDB: [SMALLINT](https://mariadb.com/kb/en/smallint/)
- Microsoft SQL Server: [SMALLINT](https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql?view=sql-server-ver16)
- PostgreSQL: [SMALLINT](https://www.postgresql.org/docs/current/datatype-numeric.html)
- IBM Db2: [SMALLINT](https://www.ibm.com/docs/en/db2/11.5?topic=list-numbers)

### tinyint

Not declared in ISO/IEC 9075, but used in SQL servers:

- MySQL: [TINYINT](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html)
- MariaDB: [TINYINT](https://mariadb.com/kb/en/tinyint/)
- Microsoft SQL Server: [TINYINT](https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql?view=sql-server-ver16)

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

- `~comp.AppDef~`uncvrd[^1]❓: Support new data types
- `~comp.Parser~`uncvrd[^2]❓: Support new data types
- `~comp.istructs~`uncvrd[^3]❓: Add new members to `IRowReader` and `IRowWriter` interfaces
- `~comp.istructsmem~`uncvrd[^4]❓: Implement new members of `IRowReader` and `IRowWriter` interfaces

## Test plan

- `~it.SmallIntegers~`uncvrd[^5]❓

### Addressed issues

- [SMALLINT & TINYINT #3430](https://github.com/voedger/voedger/issues/3430)

## Footnotes

[^1]: `[~server.vsql.smallints/comp.AppDef~impl]`
[^2]: `[~server.vsql.smallints/comp.Parser~impl]`
[^3]: `[~server.vsql.smallints/comp.istructs~impl]`
[^4]: `[~server.vsql.smallints/comp.istructsmem~impl]`
[^5]: `[~server.vsql.smallints/it.SmallIntegers~impl]`
