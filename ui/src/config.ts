///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///
import { PartyDetails } from "@daml/hub-react"

const credentials = require(process.env.REACT_APP_CONFIG_FILE as string);

export const preloadedCredentialsMap: PartyDetails[] =
    Object.keys(credentials)
          .map((k) =>
            ({
                party: credentials[k].partyId,
                partyName: k,
                token: credentials[k].token,
                ledgerId: credentials[k].ledgerId,
                owner: ""
            }));

export const isLocal = process.env.REACT_APP_IS_LOCAL === "true";

const hostname = window.location.hostname;
export const ledgerId: string =
    hostname.includes('projectdabl')
  ? window.location.hostname.split('.')[0]
  : assertIsDefined(process.env.REACT_APP_LEDGER_ID, "REACT_APP_LEDGER_ID is not defined.");

export const httpBaseUrl: string =
    hostname.includes('projectdabl')
  ? `https://api.${hostname}/data/${ledgerId}/`
  : assertIsDefined(process.env.REACT_APP_HTTP_BASE_URL, "REACT_APP_HTTP_BASE_URL is not defined.");

function assertIsDefined(str: string | undefined, errorMessage: string): string {
    if (str === undefined) {
        throw new Error(errorMessage);
    }
    return str;
}
