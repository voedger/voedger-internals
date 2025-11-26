# Read from View

## Motivation

As a developer, I want to read from a view in an extension (queries, projectors, commands), so that I can use the view's data in the extension.

## Functional design

### Reading a single view row

To read a single row, the view key must be fully specified.

```go
func MyQuery() {
    // Create the view key
    viewKey := ext.KeyBuilder(ext.StorageView, "github.com/mycompany/myapp.DailyPayments")
    viewKey.PutInt32("StoreID", 123)
    viewKey.PutInt16("PaymentsYear", 2024)
    viewKey.PutInt8("PaymentsMonth", 1)
    viewKey.PutInt8("PaymentsDay", 1)

    // Query the view
    viewValue, exists := ext.QueryValue(key)

    // Check if the view exists
    if !exists {
        // Handle the case when the view doesn't exist
        return
    }

    // Use the view data
    totalAmount := viewValue.AsInt64("TotalAmount")
    // ...
}
```

### Reading multiple view rows

To read multiple rows, the view key can be partially specified.

```go
func MyQuery() {
    // Create the view key
    viewKey := ext.KeyBuilder(ext.StorageView, "github.com/mycompany/myapp.DailyPayments")
    viewKey.PutInt32("StoreID", 123)
    viewKey.PutInt16("PaymentsYear", 2024)
    viewKey.PutInt8("PaymentsMonth", 1)

    monthlyAmount := 0
    // Read multiple values from the view
    ext.ReadValues(viewKey, func(key ext.TKey, value ext.TValue) {
        monthlyAmount += value.AsInt64("TotalAmount")
	})
    // ...
}
```

### Reading views in commands

There are two limitations on reading from views in commands:

- The command can only read a single view row (with fully specified key)
- The command can only read from [sync views](sync-views.md)
  - or views maintained by `SYNC` projectors, but this will be deprecated soon.
