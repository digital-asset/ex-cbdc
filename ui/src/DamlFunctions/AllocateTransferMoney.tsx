//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

export const allocateTransferMoney = async(setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsError: React.Dispatch<React.SetStateAction<boolean>>,
    settlementInstructions,
    cbdc,
    actualInstruction,
    ourAsset,
    pvp,
    ledger,
    SettlementInstruction,
    partyId: string) : Promise<any> =>
{
    try{
        setIsLoading(true)
        setIsError(false)

        if (settlementInstructions.contracts.length < 1) {
            throw new Error("No settlement instructions.");
        }

        if (actualInstruction === undefined) {
            console.log(ourAsset)
            console.log(settlementInstructions.contracts)
            console.log(pvp)
            throw new Error("Actual instruction not found. See the asset (ours), settlement instructions and Pvp")
        }

        const cbdcArray = cbdc.filter(c =>
            c?.payload.asset.id.label === actualInstruction?.payload.asset.id.label
            && c.payload.asset.earmark === actualInstruction.payload.asset.earmark)
            .map(c => c.contractId)
        await ledger?.exercise(SettlementInstruction.SettlementInstruction_AllocateNext, actualInstruction.contractId, {
            depositCids: cbdcArray,
            ctrl: partyId
        })
    }catch (e){
        console.error(e)
        setIsError(true)
    }finally {
        setIsLoading(false)
    }

}
