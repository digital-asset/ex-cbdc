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

  uiProc = spawnUI();

  spawnSync('launchers/populate', launcherOpts);

  await waitOn({resources: [`tcp:localhost:${JSONAPI_PORT}`]});
  await waitOn({resources: [`tcp:localhost:${UI_PORT}`]});

  browser = await puppeteer.launch();
}, 60_000);

function spawnUI() {
  // Disable automatically opening a browser using the env var described here:
  // https://github.com/facebook/create-react-app/issues/873#issuecomment-266318338
  const env = {...process.env, BROWSER: 'none'};
  // Note(kill-npm-start): The `detached` flag starts the process in a new process group.
  // This allows us to kill the process with all its descendents after the tests finish,
  // following https://azimi.me/2014/12/31/kill-child_process-node-js.html.
  return spawn('npm', ['run-script', 'start'], { env, stdio: 'inherit', detached: true});
  // TODO ^^ make sure npm-cli.js is in the PATH, or just run npm???
}

afterAll(async () => {
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
    // TODO there are chrome processes hanging after this
    // occasionally java and node too, so I start the test by
    // killall chrome java node ; make test
    browser.close();
  }
});

test('dummy', async () => {
  const page = await newLandlordPage();
  await expectContent(page, '.test-alice-balance-normal', '0 USD');
  await expectContent(page, '.test-alice-balance-stimulus', '0 USD-S');

  issueStimulus(page, 200)
  // TODO is reload useful / necessary? see also comments below about the workaround
  await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  // TODO this workaround appears to pass this test:
  // 1. start npm test
  // open http://localhost:3000/customer in a real browser during npm start is loading
  // refresh the page http://localhost:3000/customer during the Daml Script execution
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
  page.setDefaultNavigationTimeout(60 * 1000);
  await page.goto(`http://localhost:${UI_PORT}/customer`);
  return page;
}

async function issueStimulus(page: Page, amount: number) {
  console.log("stimulus issuance...")
  page.waitForTimeout(1000);
  const restrictedStimulusDrowdown = await page.waitForXPath('.//button[text()="Restricted Stimulus"]');
  await restrictedStimulusDrowdown!.click()
  page.waitForTimeout(2000);
  console.log("stimulus amount...")
  const amountInput = await page.waitForSelector('.test-stimulus-amount');
  page.waitForTimeout(1000);
  await amountInput!.click();
  await amountInput!.type(amount.toString());
  page.waitForTimeout(1000);
  console.log("stimulus submit...")
  const stimulusSubmit = await page.waitForSelector('.test-stimulus-submit');
  await stimulusSubmit!.click();
  console.log("stimulus done")
}

async function issueInvoice(page: Page, amount: number) {
  console.log("invoice issuance...")
  const landlordDrowdown = await page.waitForSelector('.test-landlords-dropdown');
  await landlordDrowdown!.click()
  page.waitForTimeout(1000);
  console.debug('invoice: test-create-invoice...: ')
  const createInvoice = await page.waitForSelector('.test-create-invoice');
  await createInvoice!.click()
  page.waitForTimeout(1000);
  console.debug('invoice: test-invoice-amount...: ')
  const amountInput = await page.waitForSelector('.test-invoice-amount');
  await amountInput!.click();
  await amountInput!.type(amount.toString());
  const invoiceSubmit = await page.waitForSelector('.test-invoice-submit');
  await invoiceSubmit!.click();
  console.log("invoice done")
}

async function payInvoice(page: Page) {
  console.log("pay...")
  const aliceDrowdown = await page.waitForSelector('.test-alice-dropdown');
  // TODO remove waitForTimeout and debugs
  console.debug('pay: test-alice-dropdown...: ')
  console.debug('pay: test-alice-dropdown: ' + await page.$eval('.test-alice-dropdown', n => n.innerHTML))
  await aliceDrowdown!.click()
  page.waitForTimeout(1000);
  const paySubmit = await page.waitForSelector('.test-alice-pay');
  page.waitForTimeout(1000);
  console.debug('pay: test-alice-pay...: ')
  console.debug('pay: test-alice-pay: ' + await page.$eval('.test-alice-pay', n => n))
  console.debug('pay: test-alice-pay handler: ' + paySubmit)
  console.debug('pay: test-alice-pay props: ' + await paySubmit?.getProperties())
  //console.debug('pay: test-alice-pay handler: ' + await paySubmit?.jsonValue())
  console.debug('pay: test-alice-pay inner: ' + await page.$eval('.test-alice-pay', n => n.innerHTML))
  await paySubmit!.click();
  console.log("pay: clicking again...")
  await page.click('.test-alice-pay');
  console.log("pay: and clicking again...")
  const paySubmit2 = await page.waitForSelector('.test-alice-pay');
  await paySubmit2!.click();
  console.log("pay done")
}

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
