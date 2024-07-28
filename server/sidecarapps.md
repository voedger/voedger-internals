## Sidecar Applications

- **Sidecar Applications** are placed near the Voedger executable and deployed automatically when VVM starts
- Naming: after [Sidecar Containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/)
- VVMConfig.ConfigFS
  - 📂apps
    - 📁app1Owner.app1Name
      - 📁image // unzipped app image, the same structure as baseline, see https://github.com/voedger/voedger-internals/edit/main/framework/vpm/baseline.md
      - descriptor.json
    - 📁app2Owner.app2Name
      - 📁image // unzipped app image
      - descriptor.json

Related issues:
- [github: Sidecar Applications](https://github.com/voedger/voedger/issues/2326)      

## Functional design

- place a sidecar app files to $dataPath/apps/
- provide $dataPath value in `--data-path` cmd line arg of host application
- currently the following names for sidecar applications are only allowed:
  - test1/app1
  - test1/app2
  - test2/app1
  - test2/app2
- on successful sidecar app include the following message is logged:
  - `sidecar app <app name> parsed`

## Technical design

- `VVMConfig.DataPath`
- `provideSidecarApps()` build all sidecar applications if `VVMConfig.DataPath` is specified 