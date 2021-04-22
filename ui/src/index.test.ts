// Copyright (c) 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChildProcess, spawn, SpawnOptions } from 'child_process';
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

  await waitOn({resources: [`tcp:localhost:${JSONAPI_PORT}`]});
  await waitOn({resources: [`tcp:localhost:${UI_PORT}`]});

  browser = await puppeteer.launch();
}, 80_000);

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

async function getContent(page: Page, selector: string) {
  await page.waitForSelector(selector);
  return await page.$eval(selector, n => n.innerHTML);
}

test('dummy', async () => {
  const page = await newLandlordPage();
//  await page.$$('.test-alice-balance-normal');
//  const aliceBalanceNormal_ = await page.$$eval('.test-alice-balance-normal', balance => balance.map(e => e.innerHTML));
  const aliceBalanceNormal = await getContent(page, '.test-alice-balance-normal');
  expect(aliceBalanceNormal).toEqual("0 USD");
  const aliceBalanceStimulus = await getContent(page, '.test-alice-balance-stimulus');
  expect(aliceBalanceStimulus).toEqual("0 USD-S");
});

async function newLandlordPage(): Promise<Page> {
  if (!browser) {
    throw Error('Puppeteer browser has not been launched');
  }
  const page = await browser.newPage();
  await page.goto(`http://localhost:${UI_PORT}/customer`);
  return page;
}
