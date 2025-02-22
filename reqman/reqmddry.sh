#!/usr/bin/env bash
set -Eeuo pipefail

go run -C ../../reqmd . -v trace --dry-run ../voedger-internals ../voedger
