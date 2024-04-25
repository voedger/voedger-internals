# vpm build

## Issues

- https://github.com/voedger/voedger/issues/1835

## Requirements

`vpm build [-C] [-o <archive-name>]`
- Compile all packages (including dependencies) which have `packages_gen.go` (result of `vpm init`) using tinygo and create a ZIP (`<folder-name>.var`) that contains *.wasm and *.vsql files
  - `tinygo build --no-debug -o pkg.wasm -scheduler=none -opt=2 -gc=leaking -target=wasi .`
- Structure is similar to that of [vpm baseline](https://github.com/voedger/voedger/issues/1057) command
- Requirements
  - Package shall contain application statement (`package does not have an APPLICATION statement`)
  
  
   
