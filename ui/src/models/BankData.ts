///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

import {Central, Commercial} from "./Banks";
import {Currency} from "./Curency";
import {ProposePvpModel} from "./ProposePvpModel";

type centralAccounts = {
    [Commercial.BankA]:number | string,
    [Commercial.BankB]:number | string
}

type CommercialAccounts = {
    [Central.CentralBank1]:number | string,
    [Central.CentralBank2]:number | string
}

export type BankData = {
    inputValue: string,
    selectValue: string,
    firstAllocationDone?: boolean,
    isError: boolean | null,
    onBoard: { [key: string]: boolean },
    accounts:centralAccounts | CommercialAccounts,
    currency?:Currency[],
    selectCurrency?:string,
    [ProposePvpModel.PROPOSER_TO_BUY]?:string | number,
    [ProposePvpModel.PROPOSER_TO_SELL]?:string | number,
}

export const initialData = {
    onBoard: {
        [Commercial.BankA]: true,
        [Commercial.BankB]: true,
    },
    inputValue: '',
    isError: null,

}
