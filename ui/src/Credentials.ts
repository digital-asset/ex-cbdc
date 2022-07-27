///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import { encode } from "jwt-simple";
import { credentialsMap } from "./config";

import Ledger from '@daml/ledger';
import { LedgerProps } from "@daml/react/createLedgerContext";
import { PartyId } from "./models/CredentialsType";

const makeToken = (loginName) => {
  const payload = userManagement.tokenPayload(loginName);
  return encode(payload, "secret", "HS256");
}

const userManagement = {
  tokenPayload: (loginName: string) =>
  ({
    sub: loginName,
    scope: "daml_ledger_api"
  }),
  primaryParty: async (loginName, ledger: Ledger) => {
    const user = await ledger.getUser();
    if (user.primaryParty !== undefined) {
      return user.primaryParty;
    } else {
      throw new Error(`User '${loginName}' has no primary party`);
    }

  }
}

export const partyIdMap = new Map<string, PartyId>();

export const computeCredentials = async (displayName: string): Promise<LedgerProps> => {
  const { userId, host } = credentialsMap[displayName];
  const token = makeToken(userId);
  const ledger = new Ledger({ token: token, httpBaseUrl: "http://localhost:3000/ecb/" });
  const party = await userManagement.primaryParty(userId, ledger).catch(error => {
          const errorMsg =
            error instanceof Error ? error.toString() : JSON.stringify(error);
          alert(`Failed to login as '${userId}':\n${errorMsg}`);
          throw error;
        });;
  partyIdMap.set(displayName, PartyId.from(party));

  return {
    party,
    token,
    httpBaseUrl:
      process.env.NODE_ENV === "production"
        ? host
        : `${host}${displayName}/`,
    user: userId
  };
};
