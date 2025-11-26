# vpm init

`vpm init`

* Create `go.mod`
  * error if exists
* Create `packages_gen.go`
  * error if exists
  * package `main`
  * `func main(){}`
  * DO NOT EDIT
  * import voedger sys package
* Run `go mod tidy`
