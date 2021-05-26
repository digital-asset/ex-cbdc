///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import { encode } from "jwt-simple";
import { credentialsMap, httpBaseUrl, isLocal } from "./config";
import { Credentials, PartyId } from "./models/CredentialsType";

const APPLICATION_ID: string = "cbdc";

// NOTE: This is for testing purposes only.
// To handle authentication properly,
// see https://docs.daml.com/app-dev/authentication.html.
const SECRET_KEY: string = "secret";

function computeToken(partyId: string, ledgerId: string): string {
  const payload = {
    "https://daml.com/ledger-api": {
      ledgerId: ledgerId,
      applicationId: APPLICATION_ID,
      actAs: [partyId],
    },
  };
  return encode(payload, SECRET_KEY, "HS256");
}

export const getPartyId = (displayName: string): PartyId => {
  return PartyId.from(credentialsMap[displayName].partyId);
};

export const computeCredentials = (displayName: string): Credentials => {
  const { partyId, token, ledgerId } = credentialsMap[displayName];

  return {
    partyId: PartyId.from(partyId),
    token: isLocal ? computeToken(partyId, ledgerId) : token,
    ledgerId,
    httpBaseUrl:
      process.env.NODE_ENV === "production"
        ? httpBaseUrl
        : `${httpBaseUrl}${displayName}/`,
  };
};
