# Ephemeral Storage

**Ephemeral Storage** ([ɪˈfemərəl ˈstɔːrɪʤ]): a storage without strong durability guarantees. Keeps data that can be infrequently (~once per day) lost. Possible implementation: LRU Cache that is lost after a VVM restart.

## Motivation

[github: Ephemeral Storage #2269](https://github.com/voedger/voedger/issues/2269)
- 674859
- As a location owner, I want to prevent POS users from working on the same table simultaneously to avoid confusion and errors. We want to reduce the likelihood of such errors occurring.

## Use cases

- Lock the table (restaurant) so that waiters can not work with the same table simultaneously.
  - Extra measures shall be undertaken to prevent the conflict ("this table has been already modified by someone else").
  - Key: {PartitionID, WSID, subject(device), tableNo}, Value: {lockedAt, userID}.
- Track the status of devices.
  - Key: {PartitionID, WSID(app workspace), subject(device), }, Value: {lastActivity}.
- 

## Functional design

Principles

- LRU Cache with fixed-size entries, that is lost after a VVM restart.
  - By default 5MB per partition.
- Fixed-size entries => keys and values have basic types.

Principles

VQL:

```sql
STORAGE Ephemeral(
	GET		SCOPE(COMMANDS, QUERIES),
	INSERT		SCOPE(COMMANDS),
	UPDATE		SCOPE(COMMANDS),
	READ		SCOPE(QUERIES),
);
```

Deployment descriptor:
```
???
```
