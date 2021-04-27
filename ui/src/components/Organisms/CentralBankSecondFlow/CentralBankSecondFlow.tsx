//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, {useState} from 'react';
import styles from '../CentralBankFirstFlow/CentralBank.module.css';
import { BankCustomer, Central } from "../../../models/Banks";
import USBank from '../../../static/assets/Logos/USBank.png';
import _ from 'lodash';
import List from '../../Atoms/List/List';
import Dropdown from '../../Atoms/Dropdown';
import Button from '../../Atoms/Button';
import Select from '../../Molecules/Select';
import Input from '../../Atoms/Input';
import { Currency } from '../../../models/Curency';
import Progress from '../../Atoms/Progress';
import { AssetSettlementRule } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset/Settlement";
import { CentralBankRole } from "@daml.js/banking-1.0.0/lib/Banking/Role/CentralBank";
import { useStreamQueries, useLedger, useParty } from "@daml/react";
import { Sector } from '@daml.js/lib-1.0.0/lib/DA/Lib/Types';
import { AssetDeposit } from '@daml.js/finance-1.0.0/lib/DA/Finance/Asset';
import { getBalance, getBalances } from './getBalances';
import { PartyId } from '../../../models/CredentialsType';
import { getPartyId } from '../../../Credentials';
import { CreateEvent } from '@daml/ledger';

const LABEL ={
  [BankCustomer.Alice]:"Alice",
  [BankCustomer.AlphaProperties]:"Alpha Properties",
}

const CentralBank = (props: { alice: PartyId, landlord: PartyId, isCustomer: any; }) => {
  const {
    alice,
    landlord,
    isCustomer
  } = props;

  const ledger = useLedger();
  const party = useParty();

  const usFRBRole = useStreamQueries(CentralBankRole, () => [{ centralBank: party }], []).contracts;
  const accountsProvidedByThisCb = useStreamQueries(AssetSettlementRule, () => [{ account: { provider: party } }], []).contracts;

  const [isShow, setIsShow] = useState<boolean>(false);
  const [isShowStimulus, setIsShowStimulus] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transferValue, setTransferValue] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const assetDeposits = useStreamQueries(AssetDeposit, () => [{ account: { provider: party } }], []).contracts;
  const [normalBalances, earmarkedBalances] = getBalances(assetDeposits)

  const balances = [
    getBalance(normalBalances, alice, (qty) => `${qty} USD`, LABEL[BankCustomer.Alice]),
    getBalance(earmarkedBalances, alice, (qty) => `${qty} USD-S`, LABEL[BankCustomer.Alice]),
    getBalance(normalBalances, landlord, (qty) => `${qty} USD`, LABEL[BankCustomer.AlphaProperties]),
  ]

  function getAccountFor(rules: readonly CreateEvent<AssetSettlementRule>[], partyId: PartyId) : CreateEvent<AssetSettlementRule> | undefined {
    return _.first(rules.filter(c => PartyId.from(c.payload.account.owner).equals(partyId)))
  }

  // targetPartyDisplayName - renter, in practice probably Alice
  // quantity    - the amount of stimulus CBDC to create
  const bodyForRestrictedStimulus = async (targetPartyDisplayName: string): Promise<any> => {
    try {
      const aliceAccount = getAccountFor(accountsProvidedByThisCb, getPartyId(targetPartyDisplayName));
      assertProperRoles(usFRBRole, aliceAccount);
      setIsLoading(true);
      setIsError(false);
      // We look for partial match ("includes") in the name of the owner party
      // so this cannot be pushed into a Query Filter in streamQuery.
      const usFRBRoleCid = _.first(usFRBRole)!.contractId;
      await ledger.exercise(CentralBankRole.CreateSpecialCbdc, usFRBRoleCid,
        {
          quantity: transferValue,
          // deadline: new Date(2022, 1, 1).toJSON(),
          targetAccount: aliceAccount!.payload.account,
          earmark: Sector.Sector.Housing
        });
      setIsOpen(false);
    } catch (e) {
      setIsError(true);
      console.error(e)
    } finally {
      setIsLoading(false);
    }
  };

  function assertProperRoles(cbRole: readonly CreateEvent<CentralBankRole>[],
    aliceAccount: CreateEvent<AssetSettlementRule> | undefined) {
    if (cbRole.length !== 1) {
      throw new Error("Need exactly one Central Bank role per Central Bank.")
    }
    if (aliceAccount === undefined) {
      throw new Error("Alice's (renter) account must be present.");
    }
  }

  const handleStimulus = async (targetPartyDisplayName: string): Promise<any> => {
    try {
      const aliceAccount = getAccountFor(accountsProvidedByThisCb, getPartyId(targetPartyDisplayName));
      assertProperRoles(usFRBRole, aliceAccount);
      setIsLoading(true);
      setIsError(false);
      // We look for partial match ("includes") in the name of the owner party
      // so this cannot be pushed into a Query Filter in streamQuery.
      const usFRBRoleCid = _.first(usFRBRole)!.contractId;
      await ledger.exercise(CentralBankRole.CreateCbdc, usFRBRoleCid,
          {
            quantity: transferValue,
            targetAccount: aliceAccount!.payload.account,
          });
      setIsOpen(false);
    } catch (e) {
      setIsError(true);
      console.error(e)
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = (value: boolean, fc:(item:boolean)=>void) => () => fc(value);

  const { src, title, position } = BANK_TYPES[Central.CentralBank1];

  const centralButtons = [
    {
      label: 'Stimulus',
      onClick: () => {
        setTransferValue("")
        toggleDropdown(false, setIsShow)()
        toggleDropdown(!isShowStimulus, setIsShowStimulus)()
      }
    },
    {
      label: 'Restricted Stimulus',
      onClick:()=> {
        setTransferValue("")
        toggleDropdown(false, setIsShowStimulus)()
        toggleDropdown(!isShow, setIsShow)()
      },
      buttonStyle: `${styles.buttonStyle} ${isShow ? styles._openSelect : ''}`
    },
  ];

  function getFormItems(buttons, bank, transferMoney, handleStimulus) {
    let spliceNumber = 0, startPosition = 0
    const list = buttons.map(el => (
      <Button
        key={el.label}
        buttonStyle={el.buttonStyle ? el.buttonStyle : styles.buttonStyle}
        {...el}
      />
    ));

    const { currency } = BANK_TYPES[bank];

    const table = [
      <Select
        key={BankCustomer.Alice}
        title='Recipient:'
        dropdownList={[BankCustomer.Alice]}
        selectContainerStyle={styles.selectStyles}
        initialLabel={BankCustomer.Alice}
      />,
      <Input
        key='Input'
        label={`Amount (${currency})`}
        value={transferValue}
        onChange={setTransferValue}
        id='test-stimulus-amount'
      />,
      <div className={`${styles.btnTransferContainer} ${styles._inProgress}`} key='Transfer Button'>
        {isLoading ? <Progress /> : (
            <Button
                label='Submit'
                onClick={isShowStimulus ? handleStimulus : transferMoney}
                buttonStyle={`${styles.btnTransfer} ${isShowStimulus && styles.test}`}
                disabled={!(transferValue) || usFRBRole.length !== 1}
                id='test-stimulus-submit'
            />
        )}
      </div>
    ]

    if (isShow) {
      table.forEach(i=>list.push(i))
    }
    if (isShowStimulus){
      table.forEach(i=>list.splice(++spliceNumber,startPosition,i))
    }

    return list
  }

  return (
    <div
      style={position}
      className={`${styles.bank} ${isCustomer && styles._centralBank}`}
    >
      <div className={`${styles.bankTop} ${styles.bankBorder}`}>
        <div className={styles.bankImgContainer}>
          <img className={styles.bankImg} src={src} alt="Central Bank" />
        </div>
        <h6 className={`${styles.bankText} ${styles._topTitle}`}>{title}</h6>
        <Dropdown
          onClick={toggleDropdown(!isOpen, setIsOpen)}
          open={isOpen}
          dropdownStyles={styles.dropdownStyles}
          dropdownListStyles={styles.dropdownListStyles}
          list={getFormItems(
            centralButtons,
            Central.CentralBank1,
            () => bodyForRestrictedStimulus(BankCustomer.Alice),
            () => handleStimulus(BankCustomer.Alice))}
        />
      </div>

      <div className={styles.bankBottom}>
        <h6 className={`${styles.bankText} ${styles._bottomTitle}`}>Central Bank Network</h6>
        <List
          labels={['ACCOUNT', 'CBDC HOLDING']}
          rows={balances}
          widthPadding
        />
      </div>
      {isError
             && <div className={`${styles.bankError} ${styles._error}`} />}
    </div>
  )

}

export default CentralBank;


const BANK_TYPES = {
  [Central.CentralBank1]: {
    currency: Currency.USD,
    title: 'United States Federal Reserve Bank',
    src: USBank,
    position: {
      bottom: 185
    }
  },
};
