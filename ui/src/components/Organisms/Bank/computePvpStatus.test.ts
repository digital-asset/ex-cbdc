///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import { PartyId } from "../../../models/CredentialsType";
import {
  PvpStatuses,
  ProposeStatusType,
} from "../../../models/ProposePvpModel";
import { computePvpStatus, getPvpStatusDetails } from "./computePvpStatus";

it("computePvpStatus smoke", () => {
  const asset = { earmark: null, quantity: 10000000, id: { label: "USD" } };
  const testInput = {
    pvp: {
      payload: {
        status: PvpStatuses.ConfirmAllocation,
        deliveries: [asset],
        payments: [asset],
        masterAgreement: { party1: "BankA", party2: "BankB" },
        buyer: "BankA",
      },
    },
    pvpProposals: [
      {
        payload: {
          dvp: {
            deliveries: [asset],
            payments: [asset],
            masterAgreement: { party1: "BankA", party2: "BankB" },
            buyer: "BankA",
          },
        },
      },
    ],
    settlementInstructions: {
      contracts: [{ payload: { asset: asset, steps: [{ depositCid: {} }] } }],
    },
    actualInstruction: {
      payload: {
        asset: asset,
        steps: [{ senderAccount: {} }],
      },
    },
    bankAllocationDone: false,
  };
  const {
    pvp,
    pvpProposals,
    settlementInstructions,
    actualInstruction,
    bankAllocationDone,
  } = testInput;
  const expected = {
    BankA: null,
    BankB: null,
    "Counterparty:": PartyId.from("BankB"),
    Proposer: PartyId.from("BankA"),
    "Proposer To Buy:": { amount: 10, currency: "USD" },
    "Proposer To Sell:": { amount: 10, currency: "USD" },
    "Status:": ProposeStatusType.AWAIT_ALLOCATION,
  };
  const actual = computePvpStatus(
    pvp,
    pvpProposals,
    settlementInstructions,
    actualInstruction,
    bankAllocationDone
  );
  expect(actual).toStrictEqual(expected);
});

it("getPvpStatusDetails smoke", () => {
  const assetA = { earmark: null, quantity: 20, id: { label: "USD" } };
  const assetB = { earmark: null, quantity: 10, id: { label: "USD" } };
  const settlementInstructions = {
    contracts: [{ payload: { asset: assetB, steps: [{ depositCid: {} }] } }],
  };
  const dvps = [
    { payload: { settledAtTime: "a", payments: [], deliveries: [assetA] } },
    { payload: { settledAtTime: "b", payments: [], deliveries: [assetB] } },
  ];
  const expected = {
    ourAsset: assetB,
    pvp: {
      payload: {
        deliveries: [assetB],
        payments: [],
        settledAtTime: "b",
      },
    },
    actualInstruction: {
      payload: {
        asset: assetB,
        steps: [{ depositCid: {} }],
      },
    },
    bankAllocationDone: true,
  };
  expect(
    getPvpStatusDetails(settlementInstructions, dvps, PartyId.from("BankA"))
  ).toStrictEqual(expected);
});
