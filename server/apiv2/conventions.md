# API conventions

## API URL
API URL must support versioning ([example IBM MQ](https://www.ibm.com/docs/en/ibm-mq/9.1?topic=api-rest-versions), [example Chargebee](https://apidocs.chargebee.com/docs/api/)):

- old API is available at `/api/v1/...` (for the period of AIR migration it will be available both on `/api/` and `/api/v1/`)
- new API is available at `/api/v2/...`
    - "v1" is not allowed as an owner name, at least until API "v1" is ready

TODO: add endpoint for the list of supported versions

## GET vs POST in Query Processor
Current design of the QueryProcessor based on POST queries. 
However, according to many resources, using POST for queries in RESTful API is not a good practice:
- [Swagger.io: best practices in API design](https://swagger.io/resources/articles/best-practices-in-api-design/)
- [MS Azure Architectural Center: Define API operations in terms of HTTP methods](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#define-api-operations-in-terms-of-http-methods)
- [StackOverflow: REST API using POST instead of GET](https://stackoverflow.com/questions/19637459/rest-api-using-post-instead-of-get)

Also, using GET and POST allows to distinguish between Query and Command processors clearly:

| HTTP Method         | Processor         |
|---------------------|-------------------|
| GET                 | Query Processor   |
| POST, PATCH, DELETE | Command Processor |

> Note: according to RESTful API design, queries should not change the state of the system. Current QueryFunction design allows it to execute commands through HTTP bus.

Another thing is that according to REST best practices, it is not recommended to use verbs in the URL, the resource names should be based on nouns:

[Example Microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#organize-the-api-design-around-resources):
```
POST https://adventure-works.com/orders // Good
POST https://adventure-works.com/create-order // Avoid
```

Summary, the following Queries in airs-bp3:
```
POST .../IssueLinkDeviceToken
POST .../GetSalesMetrics
```
violate Restful API design:
- uses POST for query, without changing the server state
- uses verb in the URL

Should be:
```
GET .../TokenToLinkDevice?args=...
GET .../SalesMetrics?args=...
```



## Errors
When HTTP Result code is not OK, then [response](https://docs.parseplatform.org/rest/guide/#response-format) is an object:
```json
{
  "message": "invalid field name: bl!ng"
  "status": 105,     //optional
  "qname": "qname",  //optional
  "data": "extra"    //optional
}
```
In the GET operations, returning the list of objects, when the error happens during the read, the "error" property may be added in the response object, meaning that the error is happened after the transmission started
