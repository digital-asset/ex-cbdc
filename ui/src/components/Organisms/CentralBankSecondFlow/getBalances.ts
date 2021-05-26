///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import _ from "lodash";
import { Sector } from "@daml.js/lib-1.0.0/lib/DA/Lib/Types";
import { AssetDeposit } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset";
import { CreateEvent } from "@daml/ledger";
import { PartyId } from "../../../models/CredentialsType";

export type AssetItem = {
  owner: string;
  quantity: number;
  earmark: boolean;
};

export type Balance = {
  owner: string;
  quantity: number;
};

export function getBalance(
  balances: Balance[],
  owner: PartyId,
  format: (number) => string,
  label: string
): { label: string; value: string } {
  const balance = balances.find((x) => x.owner === owner.asString());
  return {
    label: label,
    value: `${format(balance ? balance.quantity : 0)}`,
  };
}

export function getBalances(
  assetDeposits: readonly CreateEvent<AssetDeposit>[]
): Balance[][] {
  const assets = assetDeposits.map((x) => {
    let a: AssetItem = {
      owner: x.payload.account.owner,
      quantity: +x.payload.asset.quantity,
      earmark: x.payload.asset.earmark === Sector.Sector.Housing,
    };
    return a;
  });

  return computeBalances(assets);
}

export function computeBalances(assets: AssetItem[]): Balance[][] {
  const normalAssets = assets.filter((x) => !x.earmark);
  const normalBalances = aggregateAllBalances(normalAssets);

  const earmarkedAssets = assets.filter((x) => x.earmark);
  const earmarkedBalances = aggregateAllBalances(earmarkedAssets);

  return [normalBalances, earmarkedBalances];
}

function sumAssets(assets: { quantity: number }[]): number {
  return assets.reduce((sum, current) => sum + current.quantity, 0);
}

export function aggregateAllBalances(assets: Balance[]): Balance[] {
  const grouped = _.groupBy(assets, function (asset) {
    return asset.owner;
  });
  const balances = _.keys(grouped).map((owner) => ({
    owner: owner,
    quantity: sumAssets(grouped[owner]),
  }));
  return balances;
}
