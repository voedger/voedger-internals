# vpm

## Principles

### packages_gen.go

- By analogy with `wire_gen.go`

### pkg folder

The go sources for wasm should be located in the `pkg` folder

- Function `main()` and module `main` is a must, ref. https://github.com/tinygo-org/tinygo/issues/2703
- It is impossible to use main package from another package

