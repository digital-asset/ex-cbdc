//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, {useState} from "react";
import styles from "./LandLordAssociation.module.css";
import LandLord from '../../../static/assets/Logos/Landlords.svg';
import Arrow from '../../../static/assets/Icons/CloseDropdownLarge.svg';
import { useParty, useStreamQueries } from "@daml/react";
import { BankCustomer } from "../../../models/Banks";
import { AssetDeposit } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset";
import User from "../../Atoms/User";
import _ from "lodash";
import { PartyId } from "../../../models/CredentialsType";


const mockList = [
  { id: BankCustomer.AlphaProperties, name: "Alpha Properties, LLC", money: 0 },
  { id: '2', name: "Beta Properties, LLC", money: 0 },
  { id: '3', name: "Delta Properties, LLC", money: 0 },
  { id: '4', name: "Epsilon Properties, LLC", money: 0 },
  { id: '5', name: "Gamma Properties, LLC", money: 0 },
]

type Person = {
  id: string,
  name: string,
  money: number | string,
}

type LandLordAssociationProps = {
  personList?: Person[],
  renter: PartyId,
  handleCleanState: (boolean) => void
}

export const LandLordAssociation: React.FC<LandLordAssociationProps> = (props) => {
  const {
    personList = mockList,
    renter,
    handleCleanState
  } = props;

  const party = useParty();
  const assets = useStreamQueries(AssetDeposit, () => [{ account: { owner: party } }], []);

  const [activePerson] = useState<Person | null>(null);
  // const handleChangeActive = (person: Person) => () => setActivePerson(person);

  const money = assets.contracts.reduce((acc, contract) => acc + _.parseInt(contract.payload.asset.quantity), 0);

  return (
    <div className={styles.bankContainer}>
      <div className={`${styles.bankTop} ${styles.bankBorder}`}>
        <div className={`${styles.bankImgContainer}`}>
          <img className={styles.bankImg} src={LandLord} alt="Central Bank" />
        </div>
        <h6 className={`${styles.bankText} ${styles._topTitle} `}>LANDLORDS ASSOCIATION</h6>
      </div>
      <div className={styles.bankBottom}>
        <h6 className={`${styles.bankText} ${styles._bottomTitle}`}>Members</h6>
        <div className={styles.bankList}>
          {personList.map(_person => (
            <div
                // onClick={handleChangeActive(_person)}
                key={_person.id}
                className={`${styles.bankListItem} ${BankCustomer.AlphaProperties === _person.id && styles._active}`}>
              <p
                className={`${styles.bankText} ${styles._personName}`}
              >
                {_person.name}
                {activePerson?.id === _person.id && <img src={Arrow} alt="arrow" className={styles.bankListImg} />}
              </p>
              {BankCustomer.AlphaProperties === _person.id && (
                <User
                  name={BankCustomer.AlphaProperties}
                  money={(money && _person.id === BankCustomer.AlphaProperties) ? money : 0}
                  renter={renter}
                  handleCleanState={handleCleanState}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
