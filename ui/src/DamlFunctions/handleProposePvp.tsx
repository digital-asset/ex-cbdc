//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import { Central, Commercial } from "../models/Banks";
import { partyIdMap } from "../Credentials";
import { Currency } from "../models/Curency";
import _ from "lodash";
import { BankRole } from "@daml.js/banking-1.0.0/lib/Banking/Role/Bank";
import { AssetSettlementRule } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset/Settlement";
import Ledger, { CreateEvent } from "@daml/ledger";
import * as damlTypes from "@daml/types";
import { emptyMap } from "@daml/types";
import { PartyId } from "../models/CredentialsType";

function singleton(elem: PartyId): { map: damlTypes.Map<string, {}> } {
  return { map: emptyMap<string, {}>().set(elem.asString(), {}) };
}

export const handleProposePvp = async (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsError: React.Dispatch<React.SetStateAction<boolean>>,
  displayName: string,
  inputBuyAmount: string,
  inputBuyCurrency: string,
  inputSellAmount: string,
  ourAssetSettlements: readonly CreateEvent<AssetSettlementRule>[],
  ourBankRoles: readonly CreateEvent<BankRole>[],
  ledger: Ledger
): Promise<any> => {
  try {
    setIsLoading(true);
    setIsError(false);

    const receiverPartyId =
      displayName === Commercial.BankA
        ? partyIdMap.get(Commercial.BankB)!
        : partyIdMap.get(Commercial.BankA)!;

    const quantityToSend = `${inputSellAmount}000000`;

    const incomingCashQuantity = `${inputBuyAmount}000000`;

    const buyCashLabel = inputBuyCurrency;

    const incomingCb = partyIdMap.get(
      buyCashLabel === Currency.USD
        ? Central.CentralBank1
        : Central.CentralBank2
    )!;
    const outgoingCb = partyIdMap.get(
      buyCashLabel === Currency.USD
        ? Central.CentralBank2
        : Central.CentralBank1
    )!;

    const ownAccountForIncoming = _.first(
      ourAssetSettlements
        .filter(
          (asRule) => asRule.payload.account.provider === incomingCb.asString()
        )
        .map((asRule) => asRule.payload.account)
    );

    const ourBankRole = _.first(
      ourBankRoles.filter(
        (role) => role.payload.centralBank === outgoingCb.asString()
      )
    );

    if (ownAccountForIncoming === undefined) {
      throw new Error("No incoming account.");
    }
    if (ourBankRole === undefined) {
      throw new Error("No bank role.");
    }
    console.log({
      quantityToSend: quantityToSend,
      incomingCashId: {
        label: buyCashLabel,
        signatories: { textMap: { [incomingCb.asString()]: {} } },
        version: "0",
      },
      ownAccountForIncoming: ownAccountForIncoming,
      receiver: receiverPartyId,
      incomingCashQuantity: incomingCashQuantity,
    });
    const signatories = singleton(incomingCb);
    await ledger.exercise(BankRole.RequestPvp, ourBankRole?.contractId, {
      quantityToSend: quantityToSend,
      incomingCashId: {
        label: buyCashLabel,
        signatories: signatories,
        version: "0",
      },
      ownAccountForIncoming: ownAccountForIncoming,
      receiver: receiverPartyId.asString(),
      incomingCashQuantity: incomingCashQuantity,
    });
  } catch (e) {
    console.error(e);
    setIsError(true);
  } finally {
    setIsLoading(false);
  }
};
