// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChildProcess, spawn, spawnSync, SpawnOptions } from 'child_process';
import puppeteer, { Browser } from 'puppeteer';
import { Page } from 'puppeteer';
import waitOn from 'wait-on';

const UI_PORT = 3000;
const JSONAPI_PORT = 4000;

let sandboxProc: ChildProcess | undefined = undefined;
let jsonapiProc: ChildProcess | undefined = undefined;
let uiProc: ChildProcess | undefined = undefined;

let browser: Browser | undefined = undefined;

beforeAll(async () => {
  // Note(kill-npm-start): The `detached` flag starts the process in a new process group.
  // This allows us to kill the process with all its descendents after the tests finish,
  // following https://azimi.me/2014/12/31/kill-child_process-node-js.html.
  const launcherOpts: SpawnOptions = { stdio: 'inherit', detached: true, cwd: '..' };

  sandboxProc = spawn('launchers/sandbox', launcherOpts);
  jsonapiProc = spawn('launchers/jsonapi', launcherOpts);
  uiProc = spawnUI(launcherOpts);
  spawnSyncPopulate(launcherOpts);

  await waitOn({resources: [`tcp:localhost:${JSONAPI_PORT}`]});
  await waitOn({resources: [`tcp:localhost:${UI_PORT}`]});

  browser = await puppeteer.launch();
}, 60_000);

function spawnUI(opts: SpawnOptions) {
  // Disable automatically opening a browser using the env var described here:
  // https://github.com/facebook/create-react-app/issues/873#issuecomment-266318338
  const env = {...process.env, BROWSER: 'none'};
  return spawn('launchers/ui', { ...opts, env });
}

function spawnSyncPopulate(opts: SpawnOptions) {
  const r = spawnSync('launchers/populate', opts);
  if (r.error) throw r.error
  if (r.status) throw Error('launchers/populate returned nonzero ' + r.status)
}

afterAll(async () => {
  // TODO there may be still some hanging processes.
  if (uiProc) {
    process.kill(-uiProc.pid)
  }
  if (jsonapiProc) {
    process.kill(-jsonapiProc.pid)
  }
  if (sandboxProc) {
    process.kill(-sandboxProc.pid)
  }
  if (browser) {
    await browser.close();
  }
});

test('Alice pays rent with stimulus money', async () => {
  const page = await newLandlordPage();

  await expectContent(page, '#test-alice-balance-normal', '0 USD');
  await expectContent(page, '#test-alice-balance-stimulus', '0 USD-S');

  await issueStimulus(page, 200)

  await expectContent(page, '#test-alice-balance-stimulus', '200 USD-S');

  await issueInvoice(page, 50)

  await payInvoice(page)

  await expectContent(page, '#test-alice-balance-normal', '0 USD');
  await expectContent(page, '#test-alice-balance-stimulus', '150 USD-S');
}, 60_000);

async function newLandlordPage(): Promise<Page> {
  if (!browser) {
    throw Error('Puppeteer browser has not been launched');
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${UI_PORT}/customer`);
  return page;
}

async function issueStimulus(page: Page, amount: number) {
  console.log("Issuing stimulus...")
  const restrictedStimulusDropdown = await page.waitForXPath('.//button[text()="Restricted Stimulus"]');
  await restrictedStimulusDropdown!.click()
  await page.click('#test-stimulus-amount');
  await page.type('#test-stimulus-amount', amount.toString());
  const stimulusSubmit = await page.waitForSelector('#test-stimulus-submit:not([disabled])');
  await stimulusSubmit!.click();
}

async function issueInvoice(page: Page, amount: number) {
  console.log("Issuing invoice...")
  await page.click('#test-landlords-dropdown');
  const createInvoice = await page.waitForXPath('.//button[text()="Create invoice"]');
  await createInvoice!.click()
  await page.click('#test-invoice-amount');
  await page.type('#test-invoice-amount', amount.toString());
  await page.click('#test-invoice-submit');
}

async function payInvoice(page: Page) {
  console.log("Paying invoice...")
  await page.click('#test-alice-dropdown');
  const paySubmit = await page.waitForSelector('#test-alice-pay:not([disabled])');
  await paySubmit!.click();
}

async function expectContent(page: Page, selector: string, content: string) {
  console.debug({selector: selector, expectedContent: content})
  await page.waitForSelector(selector);
  console.debug('currently: ' + await page.$eval(selector, n => n.innerHTML))
  await page.waitForFunction(
    ([selector, content]) =>
      document.querySelector(selector)?.innerHTML === content,
    {},
    [selector, content]
  );
  console.debug('got expected content')
}
