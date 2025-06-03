# Query Constraints

## Motivation

In API operations which return the list of objects, the API must provide a way to apply constraints: filter, order, etc.

## Functional Design

Support basic [Parse API](https://docs.parseplatform.org/rest/guide/#queries) request syntax in the API.

Supported constraints:

- order (string) - order by field
- limit (int) - limit number of records
- skip (int) skip number of records
- include (string) - include referenced objects and/or containers
- keys (string) - select only some field(s). Use quotes for fields with dots in the name, e.g. `keys="sys.ID",name`
- where (object) - filter records

## Example

### Request

```bash
curl -X GET \
-H "AccessToken: ${ACCESS_TOKEN}"
--data-urlencode 'order=name'
--data-urlencode 'limit=10'
--data-urlencode 'skip=30'
--data-urlencode 'include=department.group,article_prices'  #include both department and group; include article_prices container
--data-urlencode 'keys="sys.ID",name,department.name,department.group.name' #select only some fields
--data-urlencode 'where={"id_department":123456,"number":{"$gte": 100, "$lte": 200}}'

  https://air.untill.com/api/v2/apps/untill/airs-bp/workspaces/140737488486431/cdocs/untill.articles
```

### Response

```json
{
    "results": [
        {
            "sys.ID": 123,
            "name": "Coca-Cola 0.5l",
            "department": {
                "name": "Fresh Drinks",
                "group": {
                    "name": "Drinks"
                }
            },
            "article_prices": [
                {
                    "sys.ID": 125,
                    "price": 1.5,
                    "currency": "EUR"
                }
            ]
        },
        {
            "sys.ID": 124,
            "name": "Fanta 0.5l",
            "department": {
                "name": "Fresh Drinks",
                "group": {
                    "name": "Drinks"
                }
            },
            "article_prices": [
                {
                    "sys.ID": 126,
                    "price": 1.4,
                    "currency": "EUR"
                }
            ]
        }
    ]

}
```

### Include

- the `include` parameter expects comma-separated list, where each entry is either:
  - the name of the pointer field 
  - the name of the cotainer
- the names can be nested, e.g. `include=department.group,article_prices`

## Technical Design

Rows are filtered by [Rows Processor](../design/qp.md#rows-processor-1) component of the Query Processor. 

## Misc

Parse API [multi-level inclding](https://docs.parseplatform.org/rest/guide/#relational-queries):
```bash
curl -X GET \
  -H "X-Parse-Application-Id: ${APPLICATION_ID}" \
  -H "X-Parse-REST-API-Key: ${REST_API_KEY}" \
  -G \
  --data-urlencode 'order=-createdAt' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'include=post.author' \
  https://YOUR.PARSE-SERVER.HERE/parse/classes/Comment
```

## See Also

- [Parse API: select only some fields](http://parseplatform.org/Parse-SDK-JS/api/3.4.2/Parse.Query.html#select)
  - [see also: Stack overflow](https://stackoverflow.com/questions/61100282/parse-server-select-a-few-fields-from-included-object)
- [Launchpad: Schemas: Describe Heeus Functions with OpenAPI Standard](https://dev.heeus.io/launchpad/#!19069)
- [Launchpad: API v2](https://dev.heeus.io/launchpad/#!23905)
