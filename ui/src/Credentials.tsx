///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import {encode} from 'jwt-simple';
import {preloadedCredentialsMap, httpBaseUrl, isLocal, ledgerId} from './config';
import {Credentials, PartyId} from './models/CredentialsType';
import { PartyDetails, convertPartiesJson, DablPartiesInput } from "@daml/hub-react"
import React from 'react';

const APPLICATION_ID: string = 'cbdc';

// NOTE: This is for testing purposes only.
// To handle authentication properly,
// see https://docs.daml.com/app-dev/authentication.html.
const SECRET_KEY: string = 'secret';

function computeToken(partyId: PartyId, ledgerId: string): string {
  const payload = {
    "https://daml.com/ledger-api": {
      "ledgerId": ledgerId,
      "applicationId": APPLICATION_ID,
      "actAs": [partyId.asString()]
    }
  };
  return encode(payload, SECRET_KEY, 'HS256');
}

export const getPartyId = (displayName: string): PartyId => {
  return getDetails(displayName).partyId;
}

export const computeCredentials = (displayName: string): Credentials => {
  const { partyId, token, ledgerId } = getDetails(displayName);

  return {
    partyId: partyId,
    token: isLocal ? computeToken(partyId, ledgerId) : token,
    ledgerId,
    httpBaseUrl: process.env.NODE_ENV === "production"
      ? httpBaseUrl
      : `${httpBaseUrl}${displayName}/`
  };
}

type InternalPartyDetails = {
  partyId : PartyId,
  token : string,
  ledgerId : string,
}

const getDetails = (displayName : string): InternalPartyDetails => {
  const uploadedCredentialsMap = retrieveParties();
  const credentialsMap =
    uploadedCredentialsMap === undefined ?
    preloadedCredentialsMap :
    uploadedCredentialsMap;
  const {party, token, ledgerId } = credentialsMap.find(p => p.partyName === displayName)!;
  return { partyId: PartyId.from(party), token, ledgerId }
}

const PARTIES_STORAGE_KEY = 'imported_parties';

function storeParties(parties: PartyDetails[]): void {
    localStorage.setItem(PARTIES_STORAGE_KEY, JSON.stringify(parties));
}

function retrieveParties(validateParties: boolean = true): PartyDetails[] | undefined {
    const partiesJson = localStorage.getItem(PARTIES_STORAGE_KEY);

    if (!partiesJson) {
        return undefined;
    }

    const [ parties, error ] = convertPartiesJson(partiesJson, ledgerId, validateParties);

    if (error) {
        console.warn("Tried to load an invalid parties file from cache.", error);

        if (validateParties) {
            localStorage.removeItem(PARTIES_STORAGE_KEY);
            return undefined;
        }
    }

    return parties;
}

export function ReloadPartiesButton() {
  return (
    <DablPartiesInput
      ledgerId={ledgerId}
      onError={error => console.log(error)}
      onLoad={(parties) => storeParties(parties)}
    />);
}
