import { DesktopUI } from "@docker/extension-test-helper";
import { describe, beforeAll, afterAll, test } from '@jest/globals';
import { exec as originalExec } from "child_process";
import * as util from "util";

export const exec = util.promisify(originalExec);

// keep a handle on the app to stop it at the end of tests
let dashboard: DesktopUI;

describe("Test my extension", () => {
  test("should be functional", async () => {
    dashboard = await DesktopUI.start();

    const eFrame = await dashboard.navigateToExtension("copacetic/copacetic-docker-desktop-extension:latest");

    // use puppeteer APIs to manipulate the UI, click on buttons, expect visual display and validate your extension
    // await eFrame.waitForSelector("#someElementId");
  }, 120000);
});

afterAll(async () => {
  dashboard?.stop();
  await exec(`docker extension uninstall copacetic/copacetic-docker-desktop-extension:latest`);
}, 120000);