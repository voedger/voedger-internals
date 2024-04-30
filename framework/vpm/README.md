# vpm

## Principles

### packages_gen.go

- By analogy with `wire_gen.go`

### pkg folder

All go files shall be in `pkg` subfolder

- Function `main()` and module `main` is a must, ref. https://github.com/tinygo-org/tinygo/issues/2703
- It is impossible to use main package from another package

