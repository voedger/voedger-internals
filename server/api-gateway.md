# API Gateway

[API Conventions](http-conventions.md)

## Requirements

- `<cluster-domain>/api/<AppQName.owner>/<AppQName.name>/<wsid>/<{q,c}.funcQName>`
  - 404, Application is not deployed
  - 404, Application Partition is not deployed
- `<cluster-domain>/api/sys/router/<wsid>/c.EchoCommand`
- `<cluster-domain>/api/sys/router/<wsid>/q.EchoQuery`

## Context: Current Solution

Provide
- requestHanlder

Command
- Router
  - calls IBus.SendRequest2()
    - Create sender
    - Call requestHandler()
      - Sends sender and parameters to Processors using service channels
- CP
  - sender is taken from service channel
  - IBus.SendResponse(sender, response Response)

Query
- Router
  - Same as for Command
- QP
  - sender is taken from service channel
  - var rs IResultSenderClosable = IBus.SendParallerResponse2(sender)
  - Use rs

## Technical Design

### ihttpimpl.Provide

struct with
  - IBus with httpimplRequestHandler
  - IHTTPProcessor

### IHTTPProcessor

type ISender interface {
  SendResponse(sender interface{})
  SendParallelResponse
}
implementation of ISender knows `IBus` and `sender interface{}`


type RequestHandler func(requestCtx context.Context, sender ISender, request ibus.Request))

- DeployApp(app istructs.AppQName, numPartitions int) (err error)
  - Usage: (DeployApp( DeployAppPartition | UndeployAppPartition )*  UndeployApp)*-
  - ErrAppAlreadyDeployed
- DeployAppPartition(app istructs.AppQName, partNo int, appPartitionRequestHandler RequestHandler) (err error)
  - ErrAppIsNotDeployed
- UndeployAppPartition(app istructs.AppQName, partNo int) (err error)
  - ErrAppIsNotDeployed
  - ErrAppParitionIsNotDeployed
- UndeployApp(app istructs.AppQName) (err error)
  - ErrActiveAppPartitionsExist

### Handle HTTP Request

- Call IBus.SendRequest2
  - httpimplRequestHandler
    - Determine App and Partition out of the Request
    - If AppPartition is not deployed return 404 ErrAppParitionIsNotDeployed
    - Call appPartitionRequestHandler
      - that was provided to DeployAppPartition()

### appPartitionRequestHandler

### apps

sys/router
  - c.EchoCommand
  - q.EchoQuery

## Issues

- https://github.com/voedger/voedger/issues/1872
