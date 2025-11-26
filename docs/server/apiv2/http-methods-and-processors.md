# HTTP methods and processors

## Problem

API v1 is based on POST queries.
However, according to many resources, using POST for queries in RESTful API is not a good practice:

- [Swagger.io: best practices in API design](https://swagger.io/resources/articles/best-practices-in-api-design/)
- [MS Azure Architectural Center: Define API operations in terms of HTTP methods](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#define-api-operations-in-terms-of-http-methods)
- [StackOverflow: REST API using POST instead of GET](https://stackoverflow.com/questions/19637459/rest-api-using-post-instead-of-get)

## Functional design

Using different HTTP methods GET and POST allows to distinguish between Query and Command processors clearly:

| HTTP Method         | Processor         |
|---------------------|-------------------|
| GET                 | Query Processor   |
| POST, PATCH, DELETE | Command Processor |

> Note: according to RESTful API design, queries should not change the state of the system. Current QueryFunction design allows it to execute commands through HTTP bus.
