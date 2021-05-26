///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import { Commercial } from "../../../models/Banks";
import _ from "lodash";
import {
  ProposePvpModel,
  ProposeStatusType,
  PvpStatuses,
} from "../../../models/ProposePvpModel";
import { PartyId } from "../../../models/CredentialsType";
import { DvpProposal } from "@daml.js/finance-1.0.0/lib/DA/Finance/Trade/DvpProposal";
import { CreateEvent } from "@daml/ledger";
import { Dvp } from "@daml.js/finance-1.0.0/lib/DA/Finance/Trade/Dvp";

export function getPvpStatus(
  settlementInstructions,
  pvpProposals,
  dvps,
  party: PartyId
) {
  const { pvp, ourAsset, actualInstruction, bankAllocationDone } =
    getPvpStatusDetails(settlementInstructions, dvps, party);
  const pvpStatus = computePvpStatus(
    pvp,
    pvpProposals,
    settlementInstructions,
    actualInstruction,
    bankAllocationDone
  );
  return { pvp, ourAsset, actualInstruction, pvpStatus };
}

export function getPvpStatusDetails(
  settlementInstructions,
  dvps,
  party: PartyId
) {
  const handleSortContracts = [...dvps].sort((a: any, b: any) => {
    const first = new Date(a.payload.settledAtTime).getTime();
    const second = new Date(b.payload.settledAtTime).getTime();
    return first - second;
  });
  // Note that it cannot happen that both assets are exactly the same (Dvp Proposal does not allow EUR/EUR exchange)
  const pvp = handleSortContracts.some((i) => _.isNull(i.payload.settledAtTime))
    ? _.first(handleSortContracts)
    : _.last(handleSortContracts);
  const ourAsset =
    party.asString() === pvp?.payload.buyer
      ? pvp?.payload.payments[0]
      : pvp?.payload.deliveries[0];
  const actualInstruction = settlementInstructions.contracts!.find(
    (c) =>
      c?.payload.asset.earmark === ourAsset?.earmark &&
      c?.payload.asset.quantity === ourAsset?.quantity &&
      c?.payload.asset.id.label === ourAsset?.id.label
  );
  const bankAllocationDone = actualInstruction?.payload.steps[0].depositCid
    ? true
    : false;
  return { pvp, ourAsset, actualInstruction, bankAllocationDone };
}

export interface PvpData {
  [ProposePvpModel.PROPOSER]: PartyId | undefined;
  [ProposePvpModel.COUNTERPARTY]: PartyId | undefined;
  [ProposePvpModel.PROPOSER_TO_BUY]: {
    amount: number;
    currency: string;
  };
  [ProposePvpModel.PROPOSER_TO_SELL]: {
    amount: number;
    currency: string;
  };
  [ProposePvpModel.STATUS]: string;
  [Commercial.BankA]: any;
  [Commercial.BankB]: any;
}

const pvpData: PvpData = {
  [ProposePvpModel.PROPOSER]: undefined,
  [ProposePvpModel.COUNTERPARTY]: undefined,
  [ProposePvpModel.PROPOSER_TO_BUY]: {
    amount: 0,
    currency: "",
  },
  [ProposePvpModel.PROPOSER_TO_SELL]: {
    amount: 0,
    currency: "",
  },
  [ProposePvpModel.STATUS]: "",
  [Commercial.BankA]: null,
  [Commercial.BankB]: null,
};

export function computePvpStatus(
  pvp: CreateEvent<Dvp>,
  pvpProposals: readonly CreateEvent<DvpProposal>[],
  settlementInstructions: { contracts: any; loading?: boolean },
  actualInstruction: { payload: any },
  bankAllocationDone: boolean
) {
  var pvpStatus = { ...pvpData };

  function getPvpTransfers(firstContract: Dvp, status: string) {
    const banks = firstContract.masterAgreement;
    const buyAmount: string = firstContract.deliveries[0].quantity;
    const sellAmount: string = firstContract.payments[0].quantity;
    const buyCurrency: string = firstContract.deliveries[0].id.label;
    const sellCurrency: string = firstContract.payments[0].id.label;

    function getCounterparty(): PartyId {
      return PartyId.from(
        firstContract.buyer === banks.party1 ? banks.party2 : banks.party1
      );
    }

    pvpStatus[ProposePvpModel.PROPOSER] = PartyId.from(firstContract.buyer);
    pvpStatus[ProposePvpModel.COUNTERPARTY] = getCounterparty();
    pvpStatus[ProposePvpModel.PROPOSER_TO_BUY] = {
      amount: +buyAmount / 1000000,
      currency: buyCurrency,
    };
    pvpStatus[ProposePvpModel.PROPOSER_TO_SELL] = {
      amount: +sellAmount / 1000000,
      currency: sellCurrency,
    };
    pvpStatus[ProposePvpModel.STATUS] = status;
  }

  if (!!pvpProposals.length) {
    const firstContract = pvpProposals[0].payload.dvp;
    getPvpTransfers(firstContract, ProposeStatusType.AWAITING_RESPONSE);
  }
  if (
    pvp &&
    !pvpProposals.length &&
    settlementInstructions.contracts.every(
      (i) => i.payload.steps[0].depositCid === null
    )
  ) {
    const firstContract = pvp.payload;
    getPvpTransfers(firstContract, ProposeStatusType.ACCEPTED);
  }
  if (
    pvp?.payload.status === PvpStatuses.ConfirmAllocation &&
    settlementInstructions.contracts.some(
      (i) => i.payload.steps[0].depositCid !== null
    )
  ) {
    const firstContract = pvp.payload;
    getPvpTransfers(firstContract, ProposeStatusType.AWAIT_ALLOCATION);
  }
  if (
    pvp?.payload.status === PvpStatuses.AllocationsDone &&
    !pvpProposals.length
  ) {
    pvpStatus[ProposePvpModel.STATUS] = ProposeStatusType.SETTLED;
  }
  if (bankAllocationDone)
    pvpStatus[actualInstruction?.payload.steps[0].senderAccount.owner || ""] =
      true;
  return pvpStatus;
}
