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
  const addToLibraryPath = core.getBooleanInput("add-to-library-path", {required: false})

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

  if (addToLibraryPath) {
    if (process.platform === "darwin") {
      // On macOS, we want to update CPATH, LIBRARY_PATH and DYLD_LIBRARY_PATH
      appendEnv("CPATH", `${z3Root}/include`)
      appendEnv("LIBRARY_PATH", `${z3Root}/bin`)
      appendEnv("DYLD_LIBRARY_PATH", `${z3Root}/bin`)
    } else if (process.platform === "linux") {
      // On linux, we want to update CPATH, LIBRARY_PATH and LD_LIBRARY_PATH
      appendEnv("CPATH", `${z3Root}/include`)
      appendEnv("LIBRARY_PATH", `${z3Root}/bin`)
      appendEnv("LD_LIBRARY_PATH", `${z3Root}/bin`)
    } else if (process.platform === "win32") {
      // On windows, it is CPATH and LIB. Windows should search for .dll files in PATH already.
      appendEnv("CPATH", `${z3Root}\\include`)
      appendEnv("LIB", `${z3Root}\\bin`)
    } else {
      core.warning(` ==> Canot set library paths on ${process.platform}`)
    }
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

function appendEnv(varName: string, value: string): void {
  const sep = process.platform === "win32" ? ";" : ":"
  if (varName in process.env) {
    core.exportVariable(varName, process.env[varName] + sep + value)
  } else {
    core.exportVariable(varName, value)
  }
}
