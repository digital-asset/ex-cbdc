//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import {Central, Commercial} from "../models/Banks";
import {getPartyId} from "../Credentials";
import {Currency} from "../models/Curency";
import _ from "lodash";

export const handleProposePvp = async(setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsError: React.Dispatch<React.SetStateAction<boolean>>,
    displayName: string,
    inputBuyAmount, inputBuyCurrency, inputSellAmount,
    ourAssetSettlements,
    ourBankRoles,
    ledger,
    BankRole):Promise<any> => {

    try{
        setIsLoading(true)
        setIsError(false)

        const receiverPartyId = (displayName === Commercial.BankA) ?
            getPartyId(Commercial.BankB) :
            getPartyId(Commercial.BankA);

        const quantityToSend = `${inputSellAmount}000000`;

        const incomingCashQuantity = `${inputBuyAmount}000000`;

        const buyCashLabel = inputBuyCurrency;

        const incomingCb = getPartyId(buyCashLabel === Currency.USD ? Central.CentralBank1 : Central.CentralBank2);
        const outgoingCb = getPartyId(buyCashLabel === Currency.USD ? Central.CentralBank2 : Central.CentralBank1);

        const ownAccountForIncoming =
            _.first(ourAssetSettlements
                .filter(asRule => asRule.payload.account.provider === incomingCb.asString())
                .map(asRule => asRule.payload.account));

        const ourBankRole = _.first(ourBankRoles.filter(role => role.payload.centralBank === outgoingCb.asString()))

        if (ownAccountForIncoming === undefined) {
            throw new Error("No incoming account.");
        }
        if (ourBankRole === undefined) {
            throw new Error("No bank role.");
        }
        console.log({
            quantityToSend: quantityToSend,
            incomingCashId: { label: buyCashLabel, signatories: { textMap: { [incomingCb.asString()]: {} } }, version: "0" },
            ownAccountForIncoming: ownAccountForIncoming,
            receiver: receiverPartyId,
            incomingCashQuantity: incomingCashQuantity,
        })
        // @ts-ignore
        await ledger.exercise(BankRole.RequestPvp, ourBankRole?.contractId, {
            quantityToSend: quantityToSend,
            incomingCashId: { label: buyCashLabel, signatories: { textMap: { [incomingCb.asString()]: {} } }, version: "0" },
            ownAccountForIncoming: ownAccountForIncoming,
            receiver: receiverPartyId.asString(),
            incomingCashQuantity: incomingCashQuantity,
        });
    }catch (e){
        console.error(e)
        setIsError(true)

    }finally {
        setIsLoading(false)
    }
}
