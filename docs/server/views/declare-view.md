# Declare View

## Motivation

As a developer, I want to declare a view in the application schema, so that I can populate and maintain the view's data using projectors.

## Functional design

Here's an example of declaration of a view to store daily payments data:

```sql
VIEW DailyPayments (
    StoreID int32,
    PaymentsYear smallint,
    PaymentsMonth tinyint,
    PaymentsDay tinyint,
    TotalAmount currency,
    PRIMARY KEY ((StoreID), PaymentsYear, PaymentsMonth, PaymentsDay)
) AS RESULT OF HourlyPaymentsProjector;
```

The declared view stores total daily payments amounts for each store. The view is populated and maintained by the `HourlyPaymentsProjector` projector. A combination of `StoreID` and `PaymentsYear`, `PaymentsMonth`, `PaymentsDay` is used as the view key, and `StoreID` is the partition key.

