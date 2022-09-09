import process from "node:process"
import fetch from "node-fetch"

/**
 * Determine the URL of the Z3 release asset for the given platform and architecture.
 * @param {string} version - Z3 release version (defaults to latest)
 * @param {string} platform - platform to look for (either host, linux, macOS, or windows)
 * @param {string} architecture - architecture to look for (either host, x64, x86, or arm64)
 * @returns {{path: string, asset: string}} - URL path for the Z3 release assets and the asset name
 */
export default async function getDownloadLink(
  version = "latest",
  platform = "host",
  architecture = "host"
): Promise<{path: string; asset: string}> {
  const release = await getRelease(version)

  if (platform === "host") {
    platform = determinePlatform()
  }

  if (architecture === "host") {
    architecture = determineArchitecture()
  }

  // set the download path to the Z3 release
  const path = `https://github.com/Z3Prover/z3/releases/download/${release.version}`

  // determine the file name of the Z3 release depending on the platform and architecture
  const asset = findAsset(release.assets, release.version, platform, architecture)

  if (asset) {
    return {path, asset}
  } else {
    throw new Error(`No ${version} Z3 asset for ${architecture} ${platform} found.`)
  }
}

/**
 * Determine the platform of the current host.
 * @returns {string} - platform of the current host (either linux, macOS, or windows)
 */
function determinePlatform(): string {
  if (process.platform === "linux") {
    return "linux"
  } else if (process.platform === "darwin") {
    return "macOS"
  } else if (process.platform === "win32") {
    return "windows"
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`)
  }
}

/**
 * Determine the architecture of the current host.
 * @returns {string} - architecture of the current host (either x64 or arm64)
 */
function determineArchitecture(): string {
  if (process.arch === "x64") {
    return "x64"
  } else if (process.arch === "arm64") {
    return "arm64"
  } else {
    throw new Error(`Unsupported architecture: ${process.arch}`)
  }
}

/**
 * Get the Z3 release assets for the given version from GitHub.
 * @param version - Z3 release version (defaults to latest)
 * @returns {Promise<{assets: Array, version: string}>} - list of assets of a Z3 release and the release version
 */
async function getRelease(version: string): Promise<{assets: string[]; version: string}> {
  let url
  if (version === "latest") {
    url = "https://api.github.com/repos/Z3Prover/z3/releases/latest"
  } else {
    url = `https://api.github.com/repos/Z3Prover/z3/releases/tags/z3-${version}`
  }
  const response = await fetch(url)
  if (response.status !== 200) {
    throw new Error(`Invalid Z3 version: ${version}`)
  }

  const json = (await response.json()) as {assets: {name: string}[]; tag_name: string}
  const assets = json.assets.map(asset => asset.name)

  return {assets, version: json.tag_name}
}

/**
 * Find the Z3 release asset for the given platform and architecture.
 * @param {Array} assets - list of assets of a Z3 release
 * @param {string} version - Z3 release version
 * @param {string} platform - platform to look for (either linux, macOS, or windows)
 * @param {string} architecture - architecture to look for (either x64, x86, or arm64)
 * @returns {(string | undefined)} - name of the Z3 release asset or undefined if not found
 */
function findAsset(assets: string[], version: string, platform: string, architecture: string): string | undefined {
  if (platform === "linux") {
    return assets.find(asset => asset.match(new RegExp(`^${version}-${architecture}-(ubuntu|glibc)-.*$`)))
  }

  if (platform === "macOS") {
    return assets.find(asset => asset.match(new RegExp(`^${version}-${architecture}-osx-.*$`)))
  }

  if (platform === "windows") {
    return assets.find(asset => asset.match(new RegExp(`^${version}-${architecture}-win.*$`)))
  }

  throw new Error(`Invalid platform: ${platform}`)
}
