# Requirements Management

## Context

- https://github.com/itsallcode/openfasttrace/blob/main/doc/user_guide.md

### Artifact types

```
"feat" --needs--> "req" --needs--> "dsn" --needs--> "impl" (terminates chain)
                                             |----> "utest" (terminates chain)
                                             '----> "itest" (terminates chain)                                             
```