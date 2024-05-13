const process = require("process");
const exec = require("@actions/exec");
const path = require("path");
const { expect, test } = require("@jest/globals");

function executeTest(version = "latest", platform = "host", architecture = "host", addToLibraryPath = "false") {
  const options = {
    cwd: path.resolve(__dirname, "../lib"),
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
  return exec.exec("node", ["main.js"], options)
}

test("linux_latest", async () => {
  const ret = await executeTest("latest", "linux")
  expect(ret).toEqual(0)
})

test("macOS_latest", async () => {
  const ret = await executeTest("latest", "macOS")
  expect(ret).toEqual(0)
})

test("macOS_arm_latest", async () => {
  const ret = await executeTest("latest", "macOS", "arm64")
  expect(ret).toEqual(0)
})

test("windows_latest", async () => {
  const ret = await executeTest("latest", "windows", "host", "true")
  expect(ret).toEqual(0)
})

test("specific_version", async () => {
  const ret = await executeTest("4.8.17")
  expect(ret).toEqual(0)
})

test("old_version_macOS", async () => {
  const ret = await executeTest("4.8.11", "macOS", "host", "true")
  expect(ret).toEqual(0)
})

test("old_version_linux", async () => {
  const ret = await executeTest("4.8.10", "linux", "host", "true")
  expect(ret).toEqual(0)
})
