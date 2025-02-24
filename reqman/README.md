# Requirements Management

Requirements management using [reqmd](https://github.com/voedger/reqmd) tool.

## Motivation

- [Requirements management #2782](https://github.com/voedger/voedger/issues/2782)

## Scripts to manage requirements tracing and coverage.

### Prerequisites

- Bash shell
- Git
- Go environment
- Repos `https://github.com/voedger/reqmd` and  `https://github.com/voedger/voedger` are cloned into the same directory as `https://github.com/voedger/voedger-internals` repository

```text
.
└── <your-workspace>
    ├── voedger
    ├── voedger-internals
    └── reqmd
```

### Main script

- `trace.sh` - Main script with command line interface

```bash
# Show help
./trace.sh help

# Trace requirements using remote voedger repository
# Repo https://github.com/voedger/voedger will be cloned automatically to .work directory
./trace.sh trace

# Trace requirements using local voedger repository
./trace.sh trace --local-voedger

# Dry run mode (shows what would be done)
./trace.sh trace --dry-run
```

### Convenience scripts

Shorthand scripts for common operations:

- `trace-d.sh` - Trace with dry run mode
- `trace-l.sh` - Trace using local voedger repository
- `trace-l-d.sh` - Trace using local voedger repository in dry run mode

## Script behavior

- Creates `.work` directory for temporary files
- Clones/updates voedger repository when using remote mode
- Traces requirements coverage between voedger-internals and voedger repositories

## History

- [adsn, story...](https://github.com/voedger/voedger-internals/blob/4379075396a1fd50275c7eaf7877eb1cb23ab265/reqman/README.md#L26)
- [OpenFastTrace (OFT)...](https://github.com/voedger/voedger-internals/blob/1c51ed06b1b6d700ce66aa21d4a68cb3504efcb9/reqman/README.md)