# VSQL Types

## General-purpose data types

| Data Type (sql-2016)    | Aliases                      | Description                                                     |
| ----------------------- | ---------------------------- | --------------------------------------------------------------- |
| character varying [(n)] | varchar [(n)], text [(n)]    | variable-length character string of n bytes: 1..65535, def. 255 |
| binary varying [(n)]    | varbinary [(n)], bytes [(n)] | variable-length binary data of n bytes: is 1..65535, def. 255   |
| bigint                  | int64                        | signed eight-byte integer                                       |
| integer                 | int, int32                   | signed four-byte integer                                        |
| smallint                | int16                        | signed two-byte integer                                         |
| tinyint                 | int8                         | signed one-byte integer                                         |
| real                    | float, float32               | single precision floating-point number (4 bytes)                |
| double precision        | float64                      | double precision floating-point number (8 bytes)                |
| timestamp               |                              | date and time (no time zone)                                    |
| boolean                 | bool                         | logical Boolean (true/false)                                    |
| binary large object     | blob                         | binary data                                                     |

## Voedger-specific data types

| Data Type (voedger)     | Aliases                      | Description                                                     |
| ----------------------- | ---------------------------- | --------------------------------------------------------------- |
| currency                | money                        | currency amount, accurate to a ten-thousandth of the units      |
| qualified name          | qname                        | package and entity                                              |
| record                  |                              | record inherited from crecord/orecord/wrecord                   |

## Addressed issues

- [VSQL Types](https://github.com/voedger/voedger/issues/1829)
