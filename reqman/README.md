# Requirements Management

Requirements tracing using [reqmd](https://github.com/voedger/reqmd) tool.

## Scripts to manage requirements tracing and coverage.

### Prerequisites

- Bash shell
- Git
- Go environment
- Access to voedger repository
- Repos `https://github.com/voedger/reqmd` and  `https://github.com/voedger` are cloned in the same directory as `https://github.com/voedger/voedger-internals` repository

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
# Will be cloned automatically to .work directory
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