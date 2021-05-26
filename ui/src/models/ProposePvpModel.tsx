//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import { Commercial } from "./Banks";

export enum ProposePvpModel {
  PROPOSER = "Proposer",
  COUNTERPARTY = "Counterparty:",
  PROPOSER_TO_BUY = "Proposer To Buy:",
  PROPOSER_TO_SELL = "Proposer To Sell:",
  STATUS = "Status:",
}

export enum ProposeStatusType {
  AWAITING_RESPONSE = "Awaiting Response",
  ACCEPTED = "Accepted",
  AWAIT_ALLOCATION = "Awaiting Allocation",
  SETTLED = "Settled",
}
export enum PvpStatuses {
  ConfirmAllocation = "SettlementStatus_Instructed",
  AllocationsDone = "SettlementStatus_Settled",
}

export const disabledPvpStatuses = [
  ProposeStatusType.AWAITING_RESPONSE,
  ProposeStatusType.AWAIT_ALLOCATION,
  ProposeStatusType.ACCEPTED,
];
export const disabledAllocateStatuses = [
  ProposeStatusType.AWAITING_RESPONSE,
  "",
  ProposeStatusType.SETTLED,
];

export interface ProposePvPTypes {
  [ProposePvpModel.PROPOSER]: string;
  [ProposePvpModel.COUNTERPARTY]: string;
  [ProposePvpModel.PROPOSER_TO_BUY]: dealModel;
  [ProposePvpModel.PROPOSER_TO_SELL]: dealModel;
  [ProposePvpModel.STATUS]: string;
  [Commercial.BankA]: boolean | null;
  [Commercial.BankB]: boolean | null;
}
type dealModel = {
  amount: string | number;
  currency: string;
};
