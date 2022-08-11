///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import { Sector } from "@daml.js/lib-1.0.0/lib/DA/Lib/Types/Sector";
import { Optional } from "@daml/types";
import { PartyId } from "../../../models/CredentialsType";
import {
  aggregateAllBalances,
  computeBalances,
  getBalance,
  getBalances,
} from "./getBalances";

it("getBalances parses and computes correctly", () => {
  function getAsset(
    owner: string,
    quantity: number,
    earmark: Optional<Sector>
  ) {
    return {
      payload: {
        account: {
          owner: owner,
        },
        asset: {
          quantity: quantity.toString(),
          earmark: earmark,
        },
      },
    };
  }
  const testData = [
    getAsset("alice", 1, null),
    getAsset("alice", 2, null),
    getAsset("alice", 10, "Housing"),
    getAsset("alice", 20, "Housing"),
    getAsset("landlord", 100, null),
    getAsset("landlord", 200, null),
    getAsset("usFRB", 1, null),
  ];
  const expected = [
    [
      { owner: "alice", quantity: 3 },
      { owner: "landlord", quantity: 300 },
      { owner: "usFRB", quantity: 1 },
    ],
    [{ owner: "alice", quantity: 30 }],
  ];
  expect(getBalances(testData)).toStrictEqual(expected);
});

it("computeBalances computes balances correctly", () => {
  const testData = [
    { owner: "alice", quantity: 1.0, earmark: false },
    { owner: "alice", quantity: 2.0, earmark: false },
    { owner: "alice", quantity: 10.0, earmark: true },
    { owner: "alice", quantity: 20.0, earmark: true },
    { owner: "landlord", quantity: 100.0, earmark: false },
    { owner: "landlord", quantity: 200.0, earmark: false },
    { owner: "usFRB", quantity: 1.0, earmark: false },
    { owner: "bankB", quantity: 1.0, earmark: false },
  ];
  const expected = [
    [
      { owner: "alice", quantity: 3 },
      { owner: "landlord", quantity: 300 },
      { owner: "usFRB", quantity: 1 },
      { owner: "bankB", quantity: 1 },
    ],
    [{ owner: "alice", quantity: 30 }],
  ];
  expect(computeBalances(testData)).toStrictEqual(expected);
});

it("aggregateAllBalances sums assets correctly", () => {
  const testData = [
    { owner: "alice", quantity: 1.0, earmark: false },
    { owner: "alice", quantity: 2.0, earmark: false },
    { owner: "landlord", quantity: 100.0, earmark: false },
    { owner: "landlord", quantity: 200.0, earmark: false },
  ];
  const expected = [
    { owner: "alice", quantity: 3 },
    { owner: "landlord", quantity: 300 },
  ];
  expect(aggregateAllBalances(testData)).toStrictEqual(expected);
});

it("getBalance finds and formats", () => {
  const testData = [
    { owner: "alice", quantity: 3 },
    { owner: "landlord", quantity: 300 },
  ];
  const expected = { label: "Alpha", value: "300 USD" };
  expect(
    getBalance(
      testData,
      PartyId.from("landlord"),
      (qty) => `${qty} USD`,
      "Alpha"
    )
  ).toStrictEqual(expected);
});

it("getBalance handles empty", () => {
  const testData = [];
  const expected = { label: "alice", value: "0 USD" };
  expect(
    getBalance(testData, PartyId.from("alice"), (qty) => `${qty} USD`, "alice")
  ).toStrictEqual(expected);
});
