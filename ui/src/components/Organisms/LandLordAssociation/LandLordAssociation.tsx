//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import styles from "./LandLordAssociation.module.css";
import LandLord from "../../../static/assets/Logos/Landlords.svg";
import { useParty, useStreamQueries } from "@daml/react";
import { BankCustomer } from "../../../models/Banks";
import { AssetDeposit } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset";
import User from "../../Atoms/User";
import { PartyId } from "../../../models/CredentialsType";
import { getBalances } from "../CentralBankSecondFlow/getBalances";

const personList = [
  { id: BankCustomer.AlphaProperties, name: "Alpha Properties, LLC", money: 0 },
  { id: "2", name: "Beta Properties, LLC", money: 0 },
  { id: "3", name: "Delta Properties, LLC", money: 0 },
  { id: "4", name: "Epsilon Properties, LLC", money: 0 },
  { id: "5", name: "Gamma Properties, LLC", money: 0 },
];

type LandLordAssociationProps = {
  renter: PartyId;
  handleCleanState: (boolean) => void;
};

export const LandLordAssociation: React.FC<LandLordAssociationProps> = (
  props
) => {
  const { renter, handleCleanState } = props;

  const party = useParty();
  const assets = useStreamQueries(
    AssetDeposit,
    () => [{ account: { owner: party } }],
    []
  );

  const [b] = getBalances(assets.contracts);
  const money = b.length > 0 ? b[0].quantity : 0;

  return (
    <div className={styles.bankContainer}>
      <div className={`${styles.bankTop} ${styles.bankBorder}`}>
        <div className={`${styles.bankImgContainer}`}>
          <img className={styles.bankImg} src={LandLord} alt="Central Bank" />
        </div>
        <h6 className={`${styles.bankText} ${styles._topTitle} `}>
          LANDLORDS ASSOCIATION
        </h6>
      </div>
      <div className={styles.bankBottom}>
        <h6 className={`${styles.bankText} ${styles._bottomTitle}`}>Members</h6>
        <div className={styles.bankList}>
          {personList.map((_person) => (
            <div
              key={_person.id}
              className={`${styles.bankListItem} ${
                BankCustomer.AlphaProperties === _person.id && styles._active
              }`}
            >
              <p className={`${styles.bankText} ${styles._personName}`}>
                {_person.name}
              </p>
              {BankCustomer.AlphaProperties === _person.id && (
                <User
                  name={BankCustomer.AlphaProperties}
                  money={
                    money && _person.id === BankCustomer.AlphaProperties
                      ? money
                      : 0
                  }
                  renter={renter}
                  handleCleanState={handleCleanState}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
