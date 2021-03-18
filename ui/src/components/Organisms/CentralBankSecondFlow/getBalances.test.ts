///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import { Sector } from "@daml.js/lib-1.0.0/lib/DA/Lib/Types/Sector";
import { Optional } from "@daml/types";
import { PartyId } from "../../../models/CredentialsType";
import { aggregateAllBalances, computeBalances, getBalance, getBalances } from "./getBalances";


it('getBalances parses and computes correctly', () => {
  function getAsset(owner: string, quantity: number, earmark: Optional<Sector>) {
    return { payload: {
      account: {
        owner: owner,
      },
      asset: {
        quantity: quantity.toString(),
        earmark: earmark
      },
    }
  }}
  const testData = [
    getAsset("Alice", 1, null),
    getAsset("Alice", 2, null),
    getAsset("Alice", 10, "Housing"),
    getAsset("Alice", 20, "Housing"),
    getAsset("Landlord", 100, null),
    getAsset("Landlord", 200, null),
    getAsset("USFRB", 1, null),
  ]
  const expected = [
    [
     { owner: "Alice", quantity: 3, },
     { owner: "Landlord", quantity: 300, },
     { owner: "USFRB", quantity: 1, },
    ],
    [
      { owner: "Alice", quantity: 30, },
    ]
   ]
  expect(getBalances(testData)).toStrictEqual(expected)
});


it('computeBalances computes balances correctly', () => {
  const testData = [
    { owner: "Alice" , quantity: 1.0, earmark: false },
    { owner: "Alice" , quantity: 2.0, earmark: false },
    { owner: "Alice" , quantity: 10.0, earmark: true },
    { owner: "Alice" , quantity: 20.0, earmark: true },
    { owner: "Landlord", quantity: 100.0, earmark: false },
    { owner: "Landlord", quantity: 200.0, earmark: false },
    { owner: "USFRB" , quantity: 1.0, earmark: false },
    { owner: "BankB" , quantity: 1.0, earmark: false },
   ]
  const expected = [
    [
     { owner: "Alice", quantity: 3, },
     { owner: "Landlord", quantity: 300, },
     { owner: "USFRB", quantity: 1, },
     { owner: "BankB", quantity: 1, },
    ],
    [
     { owner: "Alice", quantity: 30, },
    ]
   ]
  expect(computeBalances(testData)).toStrictEqual(expected)
});


it('aggregateAllBalances sums assets correctly', () => {
  const testData = [
    { owner: "Alice" , quantity: 1.0, earmark: false },
    { owner: "Alice" , quantity: 2.0, earmark: false },
    { owner: "Landlord", quantity: 100.0, earmark: false },
    { owner: "Landlord", quantity: 200.0, earmark: false },
   ]
  const expected = [
     { owner: "Alice", quantity: 3, },
     { owner: "Landlord", quantity: 300, },
   ]
  expect(aggregateAllBalances(testData)).toStrictEqual(expected)
});


it('getBalance finds and formats', () => {
  const testData = [
    { owner: "Alice", quantity: 3, },
    { owner: "Landlord", quantity: 300, },
  ]
  const expected = { label: "Alpha", value: "300 USD", }
  expect(getBalance(testData, PartyId.from("Landlord"),  (qty) => `${qty} USD`, "Alpha")).toStrictEqual(expected)
});


it('getBalance handles empty', () => {
  const testData = []
  const expected = { label: "Alice", value: "0 USD", }
  expect(getBalance(testData, PartyId.from("Alice"), (qty) => `${qty} USD`, "Alice")).toStrictEqual(expected)
});
