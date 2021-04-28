//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useState } from 'react';
import styles from './Customer.module.css';
import BankLogo from '../../../static/assets/Logos/Alice.svg';
import _ from 'lodash';
import { Styles } from "../../../models/Styles";
import Dropdown from "../../Atoms/Dropdown";
import Button from "../../Atoms/Button";
import { useLedger, useParty, useStreamQueries } from '@daml/react';
import { AssetDeposit } from '@daml.js/finance-1.0.0/lib/DA/Finance/Asset';
import { RentInvoice } from "@daml.js/landlord-1.0.0/lib/Landlord/Landlord";
import Progress from "../../Atoms/Progress";
import { getBalance, getBalances } from '../CentralBankSecondFlow/getBalances';
import { PartyId } from '../../../models/CredentialsType';

type CustomerProps = {
  name: string,
  containerStyles?: Styles,
  withMenu?: boolean,
}

const Customer: React.FC<CustomerProps> = (props) => {
  const {
    name,
    containerStyles,
    withMenu = false,
  } = props;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const party = useParty()
  const assets = useStreamQueries(AssetDeposit, () => [{ account: { owner: party } }], []);
  const ledger = useLedger();

  const toggleDropdown = (value: boolean) => () => setIsDropdownOpen(value);

  const rentInvoice = useStreamQueries(RentInvoice, () => [{ renter: party }], []).contracts;
  const cbdcs = useStreamQueries(AssetDeposit, () => [{ account: { owner: party } }], []).contracts;

  const bodyPayRentInvoice = async (): Promise<any> => {
    try {
      if (rentInvoice.length !== 1) {
        throw new Error("We should have exactly one RentInvoice per landlord.")
      }
      setIsLoading(true);
      setIsError(false)
      const rentInvoiceCid = _.first(rentInvoice)!.contractId;
        await ledger.exercise(RentInvoice.RentInvoice_Pay, rentInvoiceCid, { assetDepositCids: cbdcs.map(i=>i.contractId) });
    } catch(e) {
      console.error(e)
      setIsError(true)
    } finally {
      setIsDropdownOpen(false);
      setIsLoading(false);
    }
  }

  const payButton = isLoading
    ? [<Progress key="key" containerStyles={styles.dropdownSpinner} />]
    : [<Button
        key="key"
        label='Pay'
        onClick={bodyPayRentInvoice}
        disabled={rentInvoice.length !== 1 || isLoading}
        id='test-alice-pay'
      />]

  const [balancesUsd, balancesUsd_S] = getBalances(assets.contracts);
  const {value: balanceUsd} = getBalance(balancesUsd, PartyId.from(party), (num) => `${num} USD`, '')
  const {value: balanceUsd_S} = getBalance(balancesUsd_S, PartyId.from(party), (num) => `${num} USD-S`, '')
  return (
    <div className={`${styles.bank} ${containerStyles}`}>
      <div className={styles.bankTop}>
        <div className={styles.bankImgContainer}>
          <img className={styles.bankImg} src={BankLogo} alt="Customer" />
        </div>
        <h6 className={`${styles.bankText} ${styles._topTitle}`}>{name}</h6>
        {withMenu && (
          <Dropdown
            onClick={toggleDropdown(!isDropdownOpen)}
            open={isDropdownOpen}
            dropdownStyles={`${styles.dropdownStyles}`}
            dropdownListStyles={styles.dropdownListStyles}
            list={payButton}
            id='test-alice-dropdown'
          />
        )}
      </div>
      <div className={styles.bankBottom}>
        <h6 className={`${styles.bankText} ${styles._bottomTitle}`}>Bank Account</h6>
      </div>
      <div className={styles.bankList}>
        <p className={`${styles.bankText} ${styles.bankListItem} test-alice-balance-normal`}>{balanceUsd}</p>
        <p className={`${styles.bankText} ${styles.bankListItem} test-alice-balance-stimulus`}>{balanceUsd_S}</p>
      </div>
      <div className={styles.bankTriangle} />
      {isError
             && <div className={`${styles.bankError} ${styles._error}`} />}
    </div>
  )
}

export default React.memo(Customer);
