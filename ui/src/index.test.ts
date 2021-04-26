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

// To reduce test times, we reuse the same processes between all the tests.
// TODO restart them before every test
beforeAll(async () => {
  const launcherOpts: SpawnOptions = { cwd: '..', stdio: 'inherit', detached: true};
  sandboxProc = spawn('launchers/sandbox', launcherOpts);
  jsonapiProc = spawn('launchers/jsonapi', launcherOpts);

  // Disable automatically opening a browser using the env var described here:
  // https://github.com/facebook/create-react-app/issues/873#issuecomment-266318338
  const env = {...process.env, BROWSER: 'none'};
  // Note(kill-npm-start): The `detached` flag starts the process in a new process group.
  // This allows us to kill the process with all its descendents after the tests finish,
  // following https://azimi.me/2014/12/31/kill-child_process-node-js.html.
  uiProc = spawn('npm', ['run-script', 'start'], { env, stdio: 'inherit', detached: true});
  // TODO ^^ make sure npm-cli.js is in the PATH, or just run npm???

  spawnSync('launchers/populate', launcherOpts);

  await waitOn({resources: [`tcp:localhost:${JSONAPI_PORT}`]});
  await waitOn({resources: [`tcp:localhost:${UI_PORT}`]});

  browser = await puppeteer.launch();
}, 60_000);

afterAll(async () => {
  if (sandboxProc) {
    process.kill(-sandboxProc.pid)
  }
  if (jsonapiProc) {
    process.kill(-jsonapiProc.pid)
  }
  if (uiProc) {
    process.kill(-uiProc.pid)
  }
  if (browser) {
    browser.close();
  }
});

async function expectContent(page: Page, selector: string, content: string) {
  console.info({selector: selector, expectedContent: content})
  await page.waitForSelector(selector);
  console.info('currently: ' + await page.$eval(selector, n => n.innerHTML))
  await page.waitForFunction(
    ([selector, content]) =>
      document.querySelector(selector)?.innerHTML === content,
    {},
    [selector, content]
  );
  console.info('got expected content')
}

async function issueStimulus(page: Page, amount: number) {
  const restrictedStimulusDrowdown = await page.waitForXPath('.//button[text()="Restricted Stimulus"]');
  await restrictedStimulusDrowdown?.click()
  const amountInput = await page.waitForSelector('.test-stimulus-amount');
  await amountInput?.click();
  await amountInput?.type(amount.toString());
  await page.click('.test-stimulus-submit');
}

async function issueInvoice(page: Page, amount: number) {
  await page.click('.test-landlords-dropdown');
  await page.click('.test-create-invoice');
  const amountInput = await page.waitForSelector('.test-invoice-amount');
  await amountInput?.click();
  await amountInput?.type(amount.toString());
  await page.click('.test-invoice-submit');
}

async function payInvoice(page: Page) {
  await page.click('.test-alice-dropdown');
  await page.click('.test-alice-pay');
}

test('dummy', async () => {
  const page = await newLandlordPage();
  await expectContent(page, '.test-alice-balance-normal', '0 USD');
  await expectContent(page, '.test-alice-balance-stimulus', '0 USD-S');

  issueStimulus(page, 200)
  // TODO is reload useful / necessary?
  await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  // TODO fix, looking from a real browser during test make this pass:
  await expectContent(page, '.test-alice-balance-stimulus', '200 USD-S');

  issueInvoice(page, 50)

  payInvoice(page)

  await expectContent(page, '.test-alice-balance-normal', '0 USD');
  await expectContent(page, '.test-alice-balance-stimulus', '150 USD-S');
}, 60_000);

async function newLandlordPage(): Promise<Page> {
  if (!browser) {
    throw Error('Puppeteer browser has not been launched');
  }
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60 * 1000);
  await page.goto(`http://localhost:${UI_PORT}/customer`);
  return page;
}
