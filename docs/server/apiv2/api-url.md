# API URL

## Motivation

- API URL must support versioning ([example IBM MQ](https://www.ibm.com/docs/en/ibm-mq/9.1?topic=api-rest-versions), [example Chargebee](https://apidocs.chargebee.com/docs/api/)):
- Old API must stay supported for a certain period of time

## Functional design

- old API is available at `/api/v1/...` (for the period of AIR migration it will be available both on `/api/` and `/api/v1/`)
- new API is available at `/api/v2/...`
  - "v1" is not allowed as an owner name, at least until API "v1" is ready

TODO: add endpoint for the list of supported versions
