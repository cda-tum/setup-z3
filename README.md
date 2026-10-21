# Setup Z3

A GitHub action to set up a specific version of the Z3 theorem prover in a GitHub Actions workflow.

## Usage

To download the latest version of Z3 for the host platform and add it to the `PATH` environment variable for all subsequent steps in a job, add the following step to your workflow:

```yaml
- name: Setup Z3
  id: z3
  uses: cda-tum/setup-z3@v1.7.3
```

This action creates a `z3-root` output variable that contains the path to the root directory of the Z3 installation and exports the `Z3_ROOT` environment variable for subsequent steps in a job. The output variable can be accessed as `${{ steps.z3.outputs.z3-root }}`.

### eMudhra CA incident: download trust

The [October 2026 eMudhra incident](https://emudhra.we-have-a-problem.com/)
affects HTTPS clients that still trust the compromised intermediates. This action
looks up releases and downloads Z3 using the GitHub runner's Node 24 runtime, whose
bundled CA store is independent of browser revocation updates. Updating the Z3
version or adding certificates with `NODE_EXTRA_CA_CERTS` does not remove that trust.

Until the runner supplies a patched Node runtime, Ubuntu 24.04 users can explicitly
select a patched OpenSSL trust store for this action:

```yaml
# Job prerequisite: runs-on: ubuntu-24.04
- name: Update and check the system CA package
  shell: bash
  run: |
    sudo apt-get update
    sudo apt-get install -y --only-upgrade ca-certificates
    dpkg --compare-versions "$(dpkg-query -W -f='${Version}' ca-certificates)" ge 20260816ubuntu0.24.04.1
- name: Setup Z3 using the updated trust store
  uses: cda-tum/setup-z3@v1.7.3
  env:
    NODE_OPTIONS: --use-openssl-ca
    SSL_CERT_FILE: /etc/ssl/certs/ca-certificates.crt
    SSL_CERT_DIR: /etc/ssl/certs
    NODE_EXTRA_CA_CERTS: ""
```

The package check fails if the security update is unavailable; it checks the
package version, not the effective trust store. Use the advisory's offline chain
verification instructions to check that the final store rejects every affected
chain. Review custom CA additions on self-hosted runners too.
[Node's CA options](https://nodejs.org/api/cli.html#--use-bundled-ca---use-openssl-ca)
select OpenSSL's store; merely setting `SSL_CERT_FILE` without that option does not
replace Node's bundled store. This example is specific to Ubuntu 24.04. Other
platforms need an independently verified patched trust store. Keep TLS verification
enabled; never use `NODE_TLS_REJECT_UNAUTHORIZED=0` as a workaround.
The step-level environment applies only to this action and replaces inherited
`NODE_OPTIONS` for that step; other actions and container jobs need their own
trust-store updates.

### Specifying a version

In many cases, it is convenient to use a specific version of Z3. This can be done by specifying the `version` input:

```yaml
- name: Setup Z3
  id: z3
  uses: cda-tum/setup-z3@v1.7.3
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
  uses: cda-tum/setup-z3@v1.7.3
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

### Using Z3 as a library

By default, the action only adds Z3 into `PATH`, meaning it cannot be used as a library through its C/C++ bindings. However, if you set `add_to_library_path` to `true`, the action also populates other environment variables (depending on the chosen platform) which ensure that you can build other libraries that link against Z3.

```yaml
- name: Setup Z3
  id: z3
  uses: cda-tum/setup-z3@v1.7.3
  with:
    add_to_library_path: true
```
