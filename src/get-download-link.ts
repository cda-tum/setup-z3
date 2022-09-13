import process from "node:process"
import {Octokit} from "@octokit/action"
// eslint-disable-next-line import/no-unresolved
import {components} from "@octokit/openapi-types"

type ReleaseAsset = components["schemas"]["release-asset"]

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

  // determine the file name of the Z3 release depending on the platform and architecture
  const asset = findAsset(release.assets, release.version, platform, architecture)

  if (asset) {
    return {asset: asset.name, path: asset.browser_download_url}
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
 * @returns {Promise<{assets: ReleaseAsset[], version: string}>} - list of assets of a Z3 release and the release version
 */
async function getRelease(version: string): Promise<{assets: ReleaseAsset[]; version: string}> {
  const octokit = new Octokit()
  if (version === "latest") {
    const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
      owner: "Z3Prover",
      repo: "z3"
    })
    return {assets: response.data.assets, version: response.data.tag_name}
  } else {
    const response = await octokit.request("GET /repos/{owner}/{repo}/releases/tags/z3-{tag}", {
      owner: "Z3Prover",
      repo: "z3",
      tag: version
    })
    return {assets: response.data.assets, version: response.data.tag_name}
  }
}

/**
 * Find the Z3 release asset for the given platform and architecture.
 * @param {ReleaseAsset[]} assets - list of assets of a Z3 release
 * @param {string} version - Z3 release version
 * @param {string} platform - platform to look for (either linux, macOS, or windows)
 * @param {string} architecture - architecture to look for (either x64, x86, or arm64)
 * @returns {(ReleaseAsset | undefined)} - Z3 release asset or undefined if not found
 */
function findAsset(
  assets: ReleaseAsset[],
  version: string,
  platform: string,
  architecture: string
): ReleaseAsset | undefined {
  if (platform === "linux") {
    return assets.find(asset => asset.name.match(new RegExp(`^${version}-${architecture}-(ubuntu|glibc)-.*$`)))
  }

  if (platform === "macOS") {
    return assets.find(asset => asset.name.match(new RegExp(`^${version}-${architecture}-osx-.*$`)))
  }

  if (platform === "windows") {
    return assets.find(asset => asset.name.match(new RegExp(`^${version}-${architecture}-win.*$`)))
  }

  throw new Error(`Invalid platform: ${platform}`)
}
