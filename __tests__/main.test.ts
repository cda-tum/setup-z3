import { exec } from "@actions/exec"
import path from "path"

describe("Z3 Setup Tests", () => {
  const executeTest = async (
    version = "latest",
    platform = "host",
    architecture = "host",
    addToLibraryPath = "false"
  ): Promise<number> => {
    const options = {
      cwd: path.resolve(__dirname, "../dist"),
      env: {
        ...process.env,
        INPUT_VERSION: version,
        INPUT_PLATFORM: platform,
        INPUT_ARCHITECTURE: architecture,
        INPUT_ADD_TO_LIBRARY_PATH: addToLibraryPath,
        RUNNER_TEMP: "/tmp",
        RUNNER_TOOL_CACHE: "/tmp"
      }
    }
    return exec("node", ["index.js"], options)
  }

  const testCases: {
    name: string
    version: string
    platform?: string
    architecture?: string
    addToLibraryPath?: string
  }[] = [
    { name: "linux_latest", version: "latest", platform: "linux" },
    { name: "macOS_latest", version: "latest", platform: "macOS" },
    { name: "macOS_arm_latest", version: "latest", platform: "macOS", architecture: "arm64" },
    { name: "windows_latest", version: "latest", platform: "windows", addToLibraryPath: "true" },
    { name: "specific_version", version: "4.8.17" },
    { name: "old_version_macOS", version: "4.8.11", platform: "macOS", addToLibraryPath: "true" },
    { name: "old_version_linux", version: "4.8.10", platform: "linux", addToLibraryPath: "true" }
  ]

  for (const { name, version, platform, architecture, addToLibraryPath } of testCases) {
    test(`${name}`, async () => {
      const ret = await executeTest(version, platform, architecture, addToLibraryPath)
      expect(ret).toEqual(0)
    })
  }
})
