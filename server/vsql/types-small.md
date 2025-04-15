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
- `~cmp.Parser~`uncvrd[^2]❓: Support new data types
- `~cmp.istructs~`uncvrd[^3]❓: Add new members to `IRowReader` and `IRowWriter` interfaces
- `~cmp.istructsmem~`uncvrd[^4]❓: Implement new members of `IRowReader` and `IRowWriter` interfaces

## Test plan

- `~it.SmallIntegers~`uncvrd[^5]❓

### Addressed issues

- [SMALLINT & TINYINT #3430](https://github.com/voedger/voedger/issues/3430)

## Footnotes

[^1]: `[~server.vsql.smallints/cmp.AppDef~impl]` [pkg/appdef/constraints/constraint.go:109:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/constraints/constraint.go#L109), [pkg/appdef/constraints/constraint.go:171:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/constraints/constraint.go#L171), [pkg/appdef/constraints/constraint.go:173:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/constraints/constraint.go#L173), [pkg/appdef/consts.go:64:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/consts.go#L64), [pkg/appdef/consts.go:65:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/consts.go#L65), [pkg/appdef/examples/example_field_test.go:100:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/examples/example_field_test.go#L100), [pkg/appdef/interface_data.go:19:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/interface_data.go#L19), [pkg/appdef/interface_data.go:20:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/interface_data.go#L20), [pkg/appdef/internal/datas/data.go:106:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/internal/datas/data.go#L106), [pkg/appdef/internal/datas/data.go:108:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/internal/datas/data.go#L108), [pkg/appdef/internal/datas/data_test.go:320:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/internal/datas/data_test.go#L320), [pkg/appdef/utils_data.go:28:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data.go#L28), [pkg/appdef/utils_data.go:80:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data.go#L80), [pkg/appdef/utils_data_test.go:27:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data_test.go#L27), [pkg/appdef/utils_data_test.go:116:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data_test.go#L116), [pkg/appdef/utils_data_test.go:119:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data_test.go#L119), [pkg/appdef/utils_data_test.go:150:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data_test.go#L150), [pkg/appdef/utils_data_test.go:233:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data_test.go#L233), [pkg/appdef/utils_data_test.go:242:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_data_test.go#L242), [pkg/appdef/utils_type.go:433:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_type.go#L433), [pkg/appdef/utils_type.go:543:impl](https://github.com/voedger/voedger/blob/9deb1fd8797c53d383ebed091961ecef39d045f2/pkg/appdef/utils_type.go#L543)
[^2]: `[~server.vsql.smallints/cmp.Parser~impl]`
[^3]: `[~server.vsql.smallints/cmp.istructs~impl]`
[^4]: `[~server.vsql.smallints/cmp.istructsmem~impl]`
[^5]: `[~server.vsql.smallints/it.SmallIntegers~impl]`
