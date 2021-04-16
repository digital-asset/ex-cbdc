///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

const credentials = require(process.env.REACT_APP_CONFIG_FILE as string);

export const preloadedCredentialsMap = credentials;

export const isLocal = process.env.REACT_APP_IS_LOCAL === "true";

const hostname = window.location.hostname;
export const ledgerId: string =
    hostname.includes('projectdabl')
  ? window.location.hostname.split('.')[0]
  : process.env.REACT_APP_LEDGER_ID
  ?? 'default-ledger-id';

export const httpBaseUrl: string =
    hostname.includes('projectdabl')
  ? `https://api.${hostname}/data/${ledgerId}/`
  : process.env.REACT_APP_HTTP_BASE_URL
  ?? 'da-marketplace-sandbox';
