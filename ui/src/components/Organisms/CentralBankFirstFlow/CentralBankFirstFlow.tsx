//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useState } from "react";
import styles from "./CentralBank.module.css";
import { Central, Commercial } from "../../../models/Banks";
import EuBank from "../../../static/assets/Logos/EuBank.png";
import USBank from "../../../static/assets/Logos/USBank.png";
import _ from "lodash";
import List from "../../Atoms/List/List";
import Dropdown from "../../Atoms/Dropdown";
import Button from "../../Atoms/Button";
import Select from "../../Molecules/Select";
import Input from "../../Atoms/Input";
import { Currency } from "../../../models/Curency";
import Progress from "../../Atoms/Progress";
import { AssetDeposit } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset";
import { AssetSettlementRule } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset/Settlement";
import { CentralBankRole } from "@daml.js/banking-1.0.0/lib/Banking/Role/CentralBank";
import { BankRole } from "@daml.js/banking-1.0.0/lib/Banking/Role/Bank";
import { useStreamQueries, useLedger, useParty } from "@daml/react";
import Error from "../../../static/assets/Icons/Error.svg";
import { getBalance, getBalances } from "../CentralBankSecondFlow/getBalances";
import { partyIdMap } from "../../../Credentials";

const CentralBankFirstFlow = (props: { displayName: string }) => {
  const { displayName } = props;

  const ledger = useLedger();
  const party = useParty();

  const assets = useStreamQueries(
    AssetDeposit,
    () => [{ account: { owner: party } }],
    []
  );

  const [selectValue, setSelectValue] = useState("");
  const cbRole = useStreamQueries(CentralBankRole).contracts;
  const bankRoleQuery = () => {
    return selectValue
      ? [{ bank: partyIdMap.get(selectValue)!.asString() }]
      : [];
  };
  const bankRole = useStreamQueries(BankRole, bankRoleQuery, [selectValue]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [isError, setIsError] = useState(false);

  let cbRoleKey = _.first(cbRole)?.payload.account.id;

  const handleTransferMoney = async (): Promise<any> => {
    const receiverAccountId = _.first(bankRole?.contracts)?.payload.account.id;
    try {
      setIsLoading(true);
      setIsError(false);
      const cbdc = assets.contracts;
      const value = inputValue.concat("000000");
      await ledger.exerciseByKey(
        AssetSettlementRule.AssetSettlement_Transfer,
        cbRoleKey!,
        {
          receiverAccountId: receiverAccountId!,
          amount: value,
          depositCids: cbdc.map((i) => i.contractId),
        }
      );
      setIsOpen(false);
      setIsShow(false);
      setInputValue("");
    } catch (e) {
      console.error(e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  const usFRBRoleCId = _.first(cbRole)?.contractId;

  const handleCreateIssue = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      await ledger.exercise(CentralBankRole.CreateCbdc, usFRBRoleCId!, {
        quantity: `${inputValue}000000`,
        targetAccount: null,
      });
      setIsOpen(false);
      setIsIssueShown(false);
      setInputValue("");
    } catch (e) {
      setIsError(true);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const [isShow, setIsShow] = useState<boolean>(false);
  const [isIssueShown, setIsIssueShown] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = (value: boolean) => () => setIsOpen(value);

  const { src, title, position } = BANK_TYPES[displayName];

  const centralButtons: {
    disabled: boolean;
    label: string;
    onClick: (e: MouseEvent) => void;
    buttonStyle: {};
  }[] = [
    {
      disabled: false,
      label: "Issue",
      onClick: () => {
        setInputValue("");
        if (isShow) {
          setIsShow(false);
        }
        setIsIssueShown(!isIssueShown);
        // setIsShow(!isShow)
      },
      buttonStyle: `${styles.buttonStyle}  ${
        isIssueShown ? styles._openSelect : ""
      }`,
    },
    {
      disabled: false,
      label: "Transfer",
      onClick: () => {
        setInputValue("");
        if (isIssueShown) {
          setIsIssueShown(false);
        }
        setIsShow(!isShow);
      },
      buttonStyle: `${styles.buttonStyle} ${isShow ? styles._openSelect : ""}`,
    },
  ];

  function SET_LIST(buttons, bank) {
    const list = buttons.map((el) => (
      <Button
        key={el.label}
        buttonStyle={el.buttonStyle ? el.buttonStyle : styles.buttonStyle}
        {...el}
      />
    ));
    const { currency } = BANK_TYPES[bank];

    if (isShow || isIssueShown) {
      if (!isIssueShown) {
        list.push(
          <Select
            key="select"
            title="Select Recipient:"
            dropdownList={_.values(Commercial)}
            onChange={(e) => {
              setSelectValue(e);
            }}
            selectContainerStyle={styles.selectStyles}
            initialLabel={selectValue}
          />
        );
      }

      list.push(
        <Input
          key="Input"
          label={`Amount (Million ${currency})`}
          value={inputValue}
          onChange={setInputValue}
        />
      );

      if (isError) {
        list.push(
          <div className={styles.errorBtnContainer}>
            <img src={Error} className={styles.btnError} alt="#" />
            <p className={styles.errorText}>
              Transfer Failed:
              <br />
              Insufficient Funds
            </p>
          </div>
        );
      }

      list.push(
        <div
          className={`${styles.btnTransferContainer} ${styles._inProgress}`}
          key="Transfer Button"
        >
          {isLoading ? (
            <Progress />
          ) : (
            <Button
              label="Submit"
              onClick={!isIssueShown ? handleTransferMoney : handleCreateIssue}
              buttonStyle={styles.btnTransfer}
              disabled={
                !isIssueShown ? !(inputValue && selectValue) : !inputValue
              }
            />
          )}
        </div>
      );
    }

    return list;
  }

  const allAssets = useStreamQueries(AssetDeposit);
  const [balances] = getBalances(allAssets?.contracts);

  function SET_TABLE() {
    const { currency } = BANK_TYPES[displayName];

    const formatMoney = (money: number) =>
      money === 0 ? "0" : `${money / 1000000}M ${currency}`;

    return [
      getBalance(
        balances,
        partyIdMap.get(displayName)!,
        formatMoney,
        BANK_LABELS[displayName]
      ),
      getBalance(
        balances,
        partyIdMap.get(Commercial.BankA)!,
        formatMoney,
        BANK_LABELS[Commercial.BankA]
      ),
      getBalance(
        balances,
        partyIdMap.get(Commercial.BankB)!,
        formatMoney,
        BANK_LABELS[Commercial.BankB]
      ),
    ];
  }

  return (
    <div style={position} className={`${styles.bank}`}>
      <div className={`${styles.bankTop} ${styles.bankBorder}`}>
        <div
          className={`${styles.bankImgContainer} ${
            displayName === Central.CentralBank2 && styles._eu
          }`}
        >
          <img className={styles.bankImg} src={src} alt="Central Bank" />
        </div>
        <h6
          className={`${styles.bankText} ${styles._topTitle} ${
            displayName === Central.CentralBank2 && styles._euTitlePaddings
          }`}
        >
          {title}
        </h6>
        <Dropdown
          onClick={() => {
            toggleDropdown(!isOpen)();
            setIsError(false);
          }}
          open={isOpen}
          dropdownStyles={styles.dropdownStyles}
          dropdownListStyles={styles.dropdownListStyles}
          list={SET_LIST(centralButtons, displayName)}
        />
      </div>

      <div className={styles.bankBottom}>
        <h6 className={`${styles.bankText} ${styles._bottomTitle}`}>
          Central Bank Network
        </h6>
        <List
          labels={["BANK", "CBDC HOLDING"]}
          rows={SET_TABLE()}
          widthPadding={true}
        />
      </div>
      <div
        className={`${styles.bankTriangle} ${
          displayName === Central.CentralBank2 ? styles._euTrgl : ""
        }`}
      />
      {isError && <div className={`${styles.bankError} ${styles._error}`} />}
    </div>
  );
};

export default React.memo(CentralBankFirstFlow);

const BANK_TYPES = {
  [Central.CentralBank1]: {
    money: "100",
    currency: Currency.USD,
    title: "United States Federal Reserve Bank",
    src: USBank,
    position: {},
  },
  [Central.CentralBank2]: {
    money: "85",
    currency: Currency.EUR,
    title: "European Central Bank",
    src: EuBank,
    position: {
      left: "unset",
      bottom: "303px",
      right: "223px",
    },
  },
};
//
const BANK_LABELS = {
  [Commercial.BankA]: "Bank A",
  [Commercial.BankB]: "Bank B",
  [Central.CentralBank1]: Central.CentralBank1,
  [Central.CentralBank2]: Central.CentralBank2,
};
//
//
