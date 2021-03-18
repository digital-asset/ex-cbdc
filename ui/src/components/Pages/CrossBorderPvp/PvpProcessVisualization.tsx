//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from 'react';
import styles from './CrossBorderPvp.module.css';
import BigLeftArrow from '../../../static/assets/Elements/Blue_Arrow_Left.svg'
import BigRightArrow from '../../../static/assets/Elements/Blue_Arrow_Right.svg'
import {FirstFlowBox} from "../../Atoms/BlueBoxes/FirstFlow/FirstFlowBox";
import {Currency} from "../../../models/Curency";
import {ProposePvpModel, ProposeStatusType} from "../../../models/ProposePvpModel";
import {boxesAllowedStatuses} from "../../../models/ArrowStatuses";
import { useStreamQueries } from '@daml/react';
import { SettlementInstruction } from '@daml.js/finance-1.0.0/lib/DA/Finance/Trade/SettlementInstruction';
import { Dvp } from '@daml.js/finance-1.0.0/lib/DA/Finance/Trade/Dvp';
import { computePvpStatus, getPvpStatusDetails } from '../../Organisms/Bank/computePvpStatus';
import {DvpProposal} from '@daml.js/finance-1.0.0/lib/DA/Finance/Trade';
import { PartyId } from '../../../models/CredentialsType';

const convertMoney = (money:string) => (+money / 1000000).toString().concat("M")

const allocationData = {
  [Currency.USD]:{
      quantity:'',
      owner: undefined,
      isDone:false
  },
  [Currency.EUR]:{
      quantity:'',
      owner:undefined,
      isDone:false
  }
}

function getAllocateStatus(settlementInstructions, dvps, bankA: PartyId, bankB: PartyId) {
  function updateAllocateStatus(allocateStatus, party: PartyId) {
    const {pvp, ourAsset, actualInstruction, bankAllocationDone} =
      getPvpStatusDetails(settlementInstructions, dvps, party)

    const label: string = actualInstruction?.payload.asset.id.label ?? ourAsset?.id.label ?? ""
    const quantity: string = actualInstruction?.payload.asset.quantity ?? ourAsset?.quantity ?? ""

    if (actualInstruction || pvp)
      allocateStatus[label] = {quantity, owner: party, isDone: actualInstruction ? bankAllocationDone : true}
  }

  var allocateStatus = {...allocationData}
  updateAllocateStatus(allocateStatus, bankA)
  updateAllocateStatus(allocateStatus, bankB)
  return allocateStatus
}

export function PvpProcessVisualization(props: { bankA: PartyId; bankB: PartyId; }) {
  const { bankA, bankB } = props;

  const settlementInstructions = useStreamQueries(SettlementInstruction);
  const {contracts: dvps} = useStreamQueries(Dvp);
  const pvpProposals = useStreamQueries(DvpProposal.DvpProposal).contracts;

  const allocateStatus = getAllocateStatus(settlementInstructions, dvps, bankA, bankB)
  const {pvp, actualInstruction, bankAllocationDone} =
    getPvpStatusDetails(settlementInstructions, dvps, bankA)
  const pvpStatus = computePvpStatus(pvp, pvpProposals, settlementInstructions, actualInstruction, bankAllocationDone);

  const showBoxes = boxesAllowedStatuses.some(status=>pvpStatus[ProposePvpModel.STATUS]===status)
  const showArrows = pvpStatus[ProposePvpModel.STATUS]===ProposeStatusType.SETTLED
  return (
      <>
      <div className={styles.boxesContainer}>
          {showBoxes &&
          <>
              <FirstFlowBox
                  currency={Currency.USD}
                  inputData={convertMoney(allocateStatus[Currency.USD].quantity)}
                  isReverse={allocateStatus[Currency.USD].owner === bankA}
                  status={allocateStatus[Currency.USD].isDone}
                  sender={'BankA'}
                  receiver={'BankB'}
              />
              <FirstFlowBox
                  currency={Currency.EUR}
                  inputData={convertMoney(allocateStatus[Currency.EUR].quantity)}
                  isReverse={allocateStatus[Currency.EUR].owner === bankA}
                  status={allocateStatus[Currency.EUR].isDone}
                  sender={'BankA'}
                  receiver={'BankB'}
              />
          </>
          }
      </div>
      {showArrows &&
      <div className={styles.damlArrows}>
          <img src={BigLeftArrow} alt={"#"} className={styles.damlLeftArrow}/>
          <img src={BigRightArrow} alt={"#"} className={styles.damlRightArrow}/>
      </div>}
      </>
  )
}
