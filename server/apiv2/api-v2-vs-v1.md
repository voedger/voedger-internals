# API v2 vs v1 comparison

| Feature | API v1 | API v2 |
| --- | --- | --- |
| Authorization | request to a special application, pseudo-WSID calculated on client-side | request to the same application, no WSID |
| Creating complex document | batch of CUD operations | separate endpoint for every allowed document, support of containers hierarchy |
| Reading collection | special function with "any" result | separate endpoints for every allowed document |
| Reading views | not supported | separate endpoints for every allowed view |
| Reading single objects | special function with "json" in response | separate endpoints for every allowed document |
| API Syntax | POST-queries, 4-dimensional array in response | GET/POST-queries, objects in response |
| Reading referenced objects | "elements" | Parse-like "include" syntax | 
