# vpm build

## Motivation

- https://github.com/voedger/voedger/issues/1835

## Requirements

`vpm build [-C] [-o <archive-name>]`
- Build a structure with *.vsql files that is similar to that of [vpm baseline](https://github.com/voedger/voedger/issues/1057) command
  - If a package has `packages_gen.go` (result of `vpm init`) if shall be compiled to pkg.wasm using tinygo
    - `tinygo build --no-debug -o pkg.wasm -scheduler=none -opt=2 -gc=leaking -target=wasi .`
- Create a ZIP (`<folder-name>.var`)
- Requirements
  - Package shall contain application statement (`package does not have an APPLICATION statement`)  
