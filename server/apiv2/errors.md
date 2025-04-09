# Errors

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
