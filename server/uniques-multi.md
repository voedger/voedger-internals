# Uniques With Multiple Fields

## Motivation

It is needed for Air (663686) to have an unique on a fields combination `From` and `Till` varchar fields of `wdoc.air.UPPayout`
Problems: 
- old uniques engine is not suitable because `From` and `Till` are both varchar fields. Only one varchar field in one unique is allowed

## Functional design

```sql
TABLE TablePlan INHERITS CDoc (
    TableState int,
    Name varchar NOT NULL,
    ...

    UNIQUE (TableState, Name), -- unnamed UNIQUE table constraint, parser generates unique QName `main.TablePlan$uniques$01` automatically
    CONSTRAINT UniqueTable UNIQUE (TableNumber), -- named UNIQUE table constraint. Parser generates unique QName `main.TablePlan$uniques$UniqueTable` automatically
    UNIQUEFIELD Name, -- deprecated. For Air backward compatibility only. No according `IUnique` is generated
)
```

## Technical design

We can use existing Uniques view

## Context
- #151 


## Issues

- https://github.com/voedger/voedger/issues/867
