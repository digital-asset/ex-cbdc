//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import _ from "lodash";
import { Currency } from "../models/Curency";
import { Central } from "../models/Banks";
import { getPartyId } from "../Credentials";

export const handleAcceptPvpProposal = async (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsError: React.Dispatch<React.SetStateAction<boolean>>,
  pvpProposals,
  ourAssetSettlements,
  ourBankRoles,
  BankRole,
  ledger
): Promise<any> => {
  try {
    setIsLoading(true);
    setIsError(false);
    const pvpProposal = _.first(pvpProposals);
    if (pvpProposal === undefined) {
      throw new Error("No PvP proposal.");
    }
    // @ts-ignore
    const incomingPaymentCashLabel =
      pvpProposal?.payload.dvp.payments[0].id.label;
    const incomingCb = getPartyId(
      incomingPaymentCashLabel === Currency.USD
        ? Central.CentralBank1
        : Central.CentralBank2
    );
    const ownAccountForIncoming = _.first(
      ourAssetSettlements
        .filter(
          (asRule) => asRule.payload.account.provider === incomingCb.asString()
        )
        .map((asRule) => asRule.payload.account)
    );
    // @ts-ignore
    const outgoingPaymentCashLabel =
      pvpProposal.payload.dvp.deliveries[0].id.label;
    const outgoingCb = getPartyId(
      outgoingPaymentCashLabel === Currency.USD
        ? Central.CentralBank1
        : Central.CentralBank2
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

    // @ts-ignore
    await ledger.exercise(BankRole.AcceptPvp, ourBankRole.contractId, {
      // @ts-ignore
      pvpRequestCid: pvpProposal?.contractId,
      ownAccountForIncoming: ownAccountForIncoming,
    });
  } catch (e) {
    console.error(e);
    setIsError(true);
  } finally {
    setIsLoading(false);
  }
};
