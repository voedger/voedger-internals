# Populate View

## Motivation

As a developer, I want to populate a view with data, so that I can read from the view.

## Functional design

Projectors are used to populate and maintain the view's data.
Here's an example of a projector that updates the `DailyPayments` view based on sales data:

### VSQL

```sql
TABLE Payment INHERITS sys.ODoc (
  StoreID int32,
  Datetime timestamp,
  PaymentMethod varchar(50),
  Amount currency
);

EXTENSION ENGINE WASM (
  PROJECTOR HourlyPaymentsProjector AFTER EXECUTE ON COMMAND NewPayment INTENTS(View(DailyPayments));
  COMMAND NewPayment(Payment);
);
```

### WASM

```go
func HourlyPaymentsProjector() {
    // Get the event argument object
  	event := ext.MustGetValue(ext.KeyBuilder(ext.StorageEvent, ext.NullEntity))
  	arg := event.AsValue("ArgumentObject")

    // Extract data from the event
    storeID := arg.AsInt32("StoreID")
    date := time.Unix(arg.AsInt64("Datetime"), 0)
    amount := arg.AsInt64("Amount")

    // Create the view key
    viewKey := ext.KeyBuilder(ext.StorageView, "github.com/mycompany/myapp.DailyPayments")
    viewKey.PutInt32("StoreID", storeID)
    viewKey.PutInt16("PaymentsYear", int32(date.Year()))
    viewKey.PutInt8("PaymentsMonth", int32(date.Month()))
    viewKey.PutInt8("PaymentsDay", int32(date.Day()))

    // Query the current value of the view
    viewValue, exists := ext.QueryValue(key)

    // Update the view
    newValue := ext.NewValue(viewKey)
    if !exists {
        newValue.PutDecimal("TotalAmount", amount)
    } else {
        totalAmount := viewValue.AsDecimal("TotalAmount")
        newValue.PutDecimal("TotalAmount", totalAmount + amount)
    }
}
```
