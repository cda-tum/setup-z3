/*eslint import/no-unresolved: [2, { ignore: ['\\get-download-link.js$'] }]*/
import * as core from "@actions/core"
import * as exec from "@actions/exec"
import * as io from "@actions/io"
import * as tc from "@actions/tool-cache"
import getDownloadLink from "./get-download-link.js"
import path from "node:path"
import process from "node:process"

/**
 * Setup Z3
 * @returns {Promise<void>}
 */
async function run(): Promise<void> {
  const version = core.getInput("version", {required: true})
  const platform = core.getInput("platform", {required: true})
  const architecture = core.getInput("architecture", {required: true})

  core.debug("==> Determining Z3 asset URL")
  const url = await getDownloadLink(version, platform, architecture)
  core.debug(`==> Downloading Z3 asset: ${url.path}`)
  const file = await tc.downloadTool(`${url.path}`)
  core.debug("==> Extracting Z3 asset")
  const dir = await tc.extractZip(path.resolve(file))
  core.debug("==> Adding Z3 to tool cache")
  const cachedPath = await tc.cacheDir(dir, "z3", version)

  const z3Root = path.join(cachedPath, `${url.asset.replace(/\.zip$/, "")}`)
  core.setOutput("z3-root", z3Root)

  core.debug("==> Adding Z3 to PATH")
  core.addPath(path.join(z3Root, "bin"))
  core.debug("==> Exporting Z3_ROOT")
  core.exportVariable("Z3_ROOT", z3Root)

  if (process.platform === "darwin") {
    core.debug("==> Patching Z3 dynamic library")
    const dylib = path.join(z3Root, "bin", "libz3.dylib")
    core.debug(`==> Changing dylib ID from libz3.dylib to ${dylib}`)
    const cmd = "install_name_tool"
    const args = ["-id", dylib, "-change", path.basename(dylib), dylib, dylib]
    await exec.exec(cmd, args)
  }

  core.debug("==> Deleting temporary files")
  await io.rmRF(file)
  await io.rmRF(dir)
}

try {
  core.debug("==> Starting Z3 setup")
  await run()
  core.debug("==> Finished Z3 setup")
} catch (error) {
  if (typeof error === "string") {
    core.setFailed(error)
  } else if (error instanceof Error) {
    core.setFailed(error.message)
  }
}
