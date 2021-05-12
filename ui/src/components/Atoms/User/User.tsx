//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, {useState} from 'react';
import styles from '../../Organisms/Customer/Customer.module.css';
import BankLogo from '../../../static/assets/Logos/AlphaProperties.svg';
import Button from "../Button";
import Dropdown from "../Dropdown";
import Input from "../Input";
import Select from "../../Molecules/Select";
import { useLedger, useParty, useStreamQueries } from '@daml/react';
import { DistributedEconomicSectorCertificate } from '@daml.js/certificates-1.0.0/lib/Certificates/Sector/Economic';
import { LandlordRole, RentInvoice } from '@daml.js/landlord-1.0.0/lib/Landlord/Landlord';
import _ from 'lodash';
import Progress from '../Progress';
import { PartyId } from '../../../models/CredentialsType';
import { CreateEvent } from '@daml/ledger';

type UserProps = {
  name: string,
  money: number,
  renter: PartyId,
  handleCleanState: (boolean) => void
}

const Customer: React.FC<UserProps>= (props) => {
  const {
    money,
    name,
    renter,
    handleCleanState // TODO consider remove
  } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isShown, setIsShown] = useState<boolean>(false)
  const [price, setPrice] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const toggleDropdown = (value: boolean) => () => setIsDropdownOpen(value);
  const handleChangeShown =()=>setIsShown(!isShown)

  const ledger = useLedger();
  const party = useParty();
  const landlordRole = useStreamQueries(LandlordRole, () => [{ landlord: party }], []).contracts;
  const certs = useStreamQueries(DistributedEconomicSectorCertificate, () => [{ owner: party }], []).contracts;
  const rentInvoice = useStreamQueries(RentInvoice);

  function assertProperRoles(landlordRoles: readonly CreateEvent<LandlordRole>[],
    cert: CreateEvent<DistributedEconomicSectorCertificate> | undefined) {
    if (landlordRoles.length !== 1) {
      throw new Error("Error, we should have exactly one Landlord Role per landlord.");
    }
    if (cert === undefined) {
      throw new Error("There should be a certificate.");
    }
  }

  const bodyCreateRentInvoice = async (price): Promise<any> => {
    try {
    const cert = _.first(certs);
    assertProperRoles(landlordRole, cert)
    setIsLoading(true);
    setIsError(false)
    const landlordRoleCid = _.first(landlordRole)!.contractId;
    const date = new Date().toJSON().slice(0,10).replace(/-/g,'-');
    await ledger.exercise(LandlordRole.CreateRentInvoice, landlordRoleCid,
      {
        price,
        date,
        renter: renter.asString(),
        economicSectorCertificate: cert!.contractId,
      });
    } catch(e) {
      setIsError(true);
      console.error(e)
    } finally {
      handleChangeShown()
      handleCleanState(false)
      toggleDropdown(false)()
      setIsLoading(false);
    }
  };

  function listForDropdown() {
    const list =[<Button
      disabled={rentInvoice.contracts.length !== 0 || isLoading}
      label={'Create invoice'}
      key={"CreateInvoice"}
      onClick={()=>{
        handleChangeShown()
        handleCleanState(true)
      }}
      buttonStyle={`${styles.dropDownBtn}`}/>
    ]

    const submitButton = isLoading
    ? <Progress key="key" containerStyles={styles.dropdownSpinner} />
    : <Button key="button-Recipient" label={"Submit"} id='test-invoice-submit' onClick={()=> {
      bodyCreateRentInvoice(price)
    }}/>

    if(isShown){
      list.push(
        <Select key="select-Recipient" dropdownList={[]} noArrow={true} title={"Recipient:"} initialLabel={"Alice B."} selectContainerStyle={styles._selectStyle}/>,
        <Input
          key="input-Recipient"
          inputContainerStyle={styles._inputStyle}
          id='test-invoice-amount'
          label={"Amount(USD)"}
          value={price}
          onChange={setPrice}/>,
        submitButton)
    }
    return list
  }

  return (
    <div className={`${styles.bank} ${styles._user}`}>
        <Dropdown
            onClick={toggleDropdown(!isDropdownOpen)}
            open={isDropdownOpen}
            dropdownStyles={`${styles._userDropdown}`}
            dropdownListStyles={styles.dropdownListStyles}
            list={listForDropdown()}
            id='test-landlords-dropdown'
        />
      <div className={`${styles.bankTop} ${styles._userBankTop}`}>
        <div className={styles.bankImgContainer}>
          <img className={styles.bankImg} src={BankLogo} alt="Customer"/>
        </div>
        <h6 className={`${styles.bankText} ${styles._topTitle}`}>{name}</h6>
      </div>
      <div className={styles.bankBottom}>
        <h6 className={`${styles.bankText} ${styles._bottomTitle}`}>Bank Account</h6>
      </div>
      <div className={styles.bankList}>
        <p className={`${styles.bankText} ${styles.bankListItem}`}>{`${money} USD`}</p>
      </div>
      {isError
             && <div className={`${styles.bankError} ${styles._error}`} />}
    </div>
  )
}

export default React.memo(Customer);
