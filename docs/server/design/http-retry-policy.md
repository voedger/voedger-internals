# HTTP Retry Policy

## Components

| Name | Policy | Purpose | Factory |
|------|--------|---------|----------------|
| [httpu.IHTTPClient](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/state/types.go#L56) | Retry All Retryables | HTTP communication to external systems (e.g., AI services in `menupic2art`) | [httpu.NewIHTTPClient()](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/goutils/httpu/provide.go#L15) |
| [federation.IFederation](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/coreutils/federation/interface.go#L32) | No Retry | Federation requests in funcs and async projectors; fail fast to prevent server resource exhaustion | [federation.New()](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/coreutils/federation/provide.go#L15) |
| [federation.IFederationWithRetry](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/coreutils/federation/interface.go#L39) | Retry All Retryables |<ul><li>Avoid errors on Workspace initialization on performance testing</li><li>Federation requests in Air queries that expect transient temporary errors under load</li></ul> | [IFederation.WithRetry()](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/coreutils/federation/impl.go#L297) |
| [vit.VIT](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/vit/types.go#L24) | Retry 503 Only | Integration testing framework | [vit.NewVIT()](https://github.com/voedger/voedger/blob/1e9db3e1929f97c54ca7e17767ae26424c569acd/pkg/vit/impl.go#L56) |

## Retry Policies

All policies include:

- Ignore `WSAECONNRESET` errors when discarding response body (Windows only)
- Default maximum retry duration on retry on status code: 1 minute

### IHTTPClient (Retry All Retryables)

**Description:** HTTP communication to external systems (e.g., AI services in `menupic2art`). Currently not in use.

**Rationale:** https://cloud.google.com/storage/docs/retry-strategy#go

**Retried status codes:**

- `408 Request Timeout` - Request processing exceeded server timeout
- `429 Too Many Requests` - Rate limiting; respects `Retry-After` header
- `500 Internal Server Error` - Transient server error
- `502 Bad Gateway` - Upstream service crashed, restarted, or returned invalid response (transient)
- `503 Service Unavailable` - Temporary service unavailability
- `504 Gateway Timeout` - Upstream didn't respond in time due to network latency or temporary timeout

**Configuration:**

  - [Policy definition](https://github.com/voedger/voedger/blob/55d50d19a601b4466f26e19bdb0d6309c20bff8b/pkg/goutils/httpu/consts.go#L49)
  - [Policy usage](https://github.com/voedger/voedger/blob/55d50d19a601b4466f26e19bdb0d6309c20bff8b/pkg/goutils/httpu/provide.go#L28)

### VIT (Retry 503 Only)

**Description:** policy used in VIT tests

**Rationale:**

  - The default policy is not suitable because some tests expect `429` errors.
  - `503` need to be retried to avoid errors on workspace initialization under load.

**Retried status codes:**

- `503 Service Unavailable` - Temporary service unavailability

**Retried errors:**

- WSAECONNREFUSED (Windows only)

**Configuration:**
  - [Policy definition](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/vit/consts.go#L56)
  - [Policy usage](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/vit/impl.go#L162)

**Usage examples:**
- [expect 429 on calling `c.registry.ChangePassword` >1 times per minute](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/sys/it/impl_changepassword_test.go#L116)
- [expect 503 on available processors exhausting](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/sys/it/impl_test.go#L169)
- [expect no errors (200)](https://github.com/voedger/voedger/blob/main/pkg/sys/it/impl_test.go#L187)

**Note:** Integration tests should be designed to expect and handle retried status codes appropriately.

### IFederation (No Retry)

**Description:** Policy used in Federation requests in funcs and async projectors.

**Rationale:**

- Funcs: fail fast and delegate retry handling to the caller.
- Projectors: preventing excessive server resource consumption, delegate retry handling to actualizer engine

**Retried status codes:** None

**Retried errors:** None

**Configuration:**

- [Policy definition](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/goutils/httpu/impl_opts.go#L170)
- [Policy usage](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/coreutils/federation/provide.go#L17)

**Usage examples:**

- [ap.sys.ApplyUpdateInviteRoles](https://github.com/voedger/voedger/blob/55d50d19a601b4466f26e19bdb0d6309c20bff8b/pkg/sys/invite/impl_applyupdateinviteroles.go#L61) - update subjects
- [q.registry.IssuePrincipalToken](https://github.com/voedger/voedger/blob/55d50d19a601b4466f26e19bdb0d6309c20bff8b/pkg/processors/query2/impl_auth_login_handler.go#L41) - login via APIv2

### IFederationWithRetry (Retry All Retryables)

See [Retry All Retryables policy above](#ihttpclient-retry-all-retryables)

**Description:** Federation requests that expect transient errors under load


**Configuration:**

- [Policy usage](https://github.com/voedger/voedger/blob/c75ea912803054b4cbf9d3ad0ec9f42d97a61ee1/pkg/coreutils/federation/impl.go#L305)

**Use examples:**

- Workspace initialization
  - [ap.registry.InvokeCreateWorkspaceID_registry](https://github.com/voedger/voedger/blob/fbf8f7e15754a233aed84e1ecc1c8827f3a8b771/pkg/registry/impl_invokecreateworkspaceid.go#L25)
  - [ap.sys.InvokeCreateWorkspaceID](https://github.com/voedger/voedger/blob/fbf8f7e15754a233aed84e1ecc1c8827f3a8b771/pkg/sys/workspace/impl.go#L37)
  - [ap.sys.InvokeCreateWorkspace](https://github.com/voedger/voedger/blob/fbf8f7e15754a233aed84e1ecc1c8827f3a8b771/pkg/sys/workspace/provide.go#L93)
  - [ap.sys.InitializeWorkspace](https://github.com/voedger/voedger/blob/fbf8f7e15754a233aed84e1ecc1c8827f3a8b771/pkg/sys/workspace/impl.go#L304) - uses `c.sys.CUD` and uploads BLOBs
  - Air restaurant [post-init func](https://github.com/untillpro/airs-bp3/blob/2d3d36abf0ee43e52f9788e087a6f50e9f5dead9/packages/air/workspace/impl_airinit.go#L28)
- Air queries (concurrent data collection)
  - [q.air.ResellersDashboardSalesMetrics](https://github.com/untillpro/airs-bp3/blob/e310eaef778771f4b648c795b098495c379d83d7/packages/air/salesmetrics/impl_resellersdashboardsalesmetrics.go#L29)
  - [q.air.ResellersDashboardBackofficeMetrics](https://github.com/untillpro/airs-bp3/blob/e310eaef778771f4b648c795b098495c379d83d7/packages/air/salesmetrics/impl_resellersdashboardbackofficemetrics.go#L29)
