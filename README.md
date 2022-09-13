# Setup Z3

A GitHub action to set up a specific version of the Z3 theorem prover in a GitHub Actions workflow.

## Usage

To download the latest version of Z3 for the host platform and add it to the `PATH` environment variable for all subsequent steps in a job, add the following step to your workflow:

```yaml
- name: Setup Z3
  id: z3
  uses: cda-tum/setup-z3@v1
```

This action creates a `z3-root` output variable that contains the path to the root directory of the Z3 installation. You can use this variable, e.g., to set the `Z3_ROOT` environment variable for subsequent steps in a job:

```yaml
- name: Use Z3
  runs: ...
  env:
    Z3_ROOT: ${{ steps.z3.outputs.z3-root }}
```

### Specifying a version

In many cases, it is convenient to use a specific version of Z3. This can be done by specifying the `version` input:

```yaml
- name: Setup Z3
  id: z3
  uses: cda-tum/setup-z3@v1
  with:
    version: 4.11.2
```

> **Note**
> In order to use a specific version of Z3, the action will download the corresponding release from GitHub. This means that the version must be a valid release tag of the [Z3 repository](https://github.com/Z3Prover/z3).

### Specifying a platform and architecture

If you want to explicitly specify the platform and architecture for which Z3 should be downloaded (e.g., for cross-compiling to Apple Silicon), you can use the `platform` and `architecture` inputs:

```yaml
- name: Setup Z3
  id: z3
  uses: cda-tum/setup-z3@v1
  with:
    platform: macOS
    architecture: arm64
```

> **Note**
> Valid and tested combinations for the `platform` and `architecture` inputs are:
>
> - `platform: linux`, `architecture: x64`
> - `platform: macOS`, `architecture: x64`
> - `platform: macOS`, `architecture: arm64`
> - `platform: windows`, `architecture: x64`
