# Naming conventions

It is not recommended to use verbs in the URL, the resource names should be based on nouns:

[Example Microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#organize-the-api-design-around-resources):

```shell
POST https://adventure-works.com/orders // Good
POST https://adventure-works.com/create-order // Avoid
```

Summary, the following Queries in airs-bp3:
```shell
POST .../IssueLinkDeviceToken
POST .../GetSalesMetrics
```
violates Restful API design:

- uses POST for query, without changing the server state
- uses verb in the URL

Should be:

```shell
GET .../TokenToLinkDevice?args=...
GET .../SalesMetrics?args=...
```