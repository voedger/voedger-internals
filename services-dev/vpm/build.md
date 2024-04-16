# vpm build

## Issues

- https://github.com/voedger/voedger/issues/1835

## Requirements

`vpm build [-C] [-o <archive-name>]`
- Compile all packages which have `packages_gen.go` using tinygo and create a ZIP (`<folder-name>.var`) that contains *.wasm and *.vsql files
  - `tinygo build --no-debug -o <folder-name>.wasm -scheduler=none -opt=2 -gc=leaking -target=wasi .`
- Structure is similar to that of [vpm basline](https://github.com/voedger/voedger/issues/1057) command
- Requirements
  - Package shall contain application statement (`package does not have an APPLICATION statement`)
   