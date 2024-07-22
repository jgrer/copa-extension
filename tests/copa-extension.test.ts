import { DesktopUI } from "@docker/extension-test-helper";
import { describe, beforeAll, afterAll, test } from '@jest/globals';
import { exec as originalExec } from "child_process";
import * as util from "util";

export const exec = util.promisify(originalExec);

// keep a handle on the app to stop it at the end of tests
let dashboard: DesktopUI;

// beforeAll(async () => { 
//   await exec(`json -I -f ~/.docker/desktop/settings.json -e "this.onlyMarketplaceExtensions='false'"`);
//   // originalExec('cat  ~/.docker/desktop/settings.json', (error, stdout, stderr) => {
//   //   if (error) {
//   //     console.error(`exec error: ${error}`);
//   //     return;
//   //   }
//   //   console.log(`stdout: ${stdout}`);
//   //   console.error(`stderr: ${stderr}`);
//   // });
//   await exec(`docker build -t copacetic/copacetic-docker-desktop-extension:latest .`);
//   await exec(`docker extension install -f copacetic/copacetic-docker-desktop-extension:latest`);
// }, 120000);

describe("Test my extension", () => {
  test("should be functional", async () => {
    dashboard = await DesktopUI.start();

    const eFrame = await dashboard.navigateToExtension("copacetic/copacetic-docker-desktop-extension:latest");

    // use puppeteer APIs to manipulate the UI, click on buttons, expect visual display and validate your extension
    // await eFrame.waitForSelector("#someElementId");
  });
});

afterAll(async () => {
  dashboard?.stop();
  await exec(`docker extension uninstall copacetic/copacetic-docker-desktop-extension:latest`);
}, 120000);