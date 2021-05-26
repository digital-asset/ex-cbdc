//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useState } from "react";
import styles from "./Bank.module.css";
import { Central, Commercial } from "../../../models/Banks";
import BankLogo from "../../../static/assets/Icons/Commercial.svg";
import _ from "lodash";
import List from "../../Atoms/List/List";
import Dropdown from "../../Atoms/Dropdown";
import Button from "../../Atoms/Button";
import Select from "../../Molecules/Select";
import Progress from "../../Atoms/Progress";
import { AssetDeposit } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { SettlementInstruction } from "@daml.js/finance-1.0.0/lib/DA/Finance/Trade/SettlementInstruction";
import { BankRole } from "@daml.js/banking-1.0.0/lib/Banking/Role/Bank";
import { AssetSettlementRule } from "@daml.js/finance-1.0.0/lib/DA/Finance/Asset/Settlement";
import { DvpProposal } from "@daml.js/finance-1.0.0/lib/DA/Finance/Trade";
import TransferAdjustArea from "../../Molecules/TransferAdjustArea/TransferAdjustArea";
import PvpStatusItem from "../../Atoms/PvpStatusItem/PvpStatusItem";
import { CommercialBankData } from "../../../models/CommercialBankData";
import { PvpButtons } from "../../Molecules/PvpButtons/PvpButtons";
import {
  disabledAllocateStatuses,
  disabledPvpStatuses,
  ProposePvpModel,
  ProposeStatusType,
} from "../../../models/ProposePvpModel";
import { Currency } from "../../../models/Curency";
import { Dvp } from "@daml.js/finance-1.0.0/lib/DA/Finance/Trade/Dvp";
import { handleProposePvp } from "../../../DamlFunctions/handleProposePvp";
import { allocateTransferMoney } from "../../../DamlFunctions/AllocateTransferMoney";
import { handleAcceptPvpProposal } from "../../../DamlFunctions/handleAcceptPvpProposal";
import { getBalances } from "../CentralBankSecondFlow/getBalances";
import { getPvpStatus } from "./computePvpStatus";
import { PartyId } from "../../../models/CredentialsType";
import { getPartyId } from "../../../Credentials";

const handleDeclinePvp = async (pvpProposals, ledger, DvpProposal) => {
  try {
    const pvpProposal: { contractId: string } = _.first(pvpProposals) || {
      contractId: "",
    };
    if (pvpProposal === undefined) {
      console.log("No PvP proposal.");
      return;
    }
    await ledger.exercise(
      DvpProposal.DvpProposal.DvpProposal_Reject,
      pvpProposal.contractId,
      {}
    );
  } catch (e) {
    console.error(e);
  }
};

const Bank: React.FC<CommercialBankData> = (props) => {
  const { displayName, counterparty } = props;

  function otherCurrency(currency) {
    return currency === Currency.USD ? Currency.EUR : Currency.USD;
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputBuyAmount, setInputBuyAmount] = useState("");
  const [inputBuyCurrency, setInputBuyCurrency] = useState<string>(
    Currency.USD
  );
  const [inputSellAmount, setInputSellAmount] = useState("");
  const [isError, setIsError] = useState(false);

  const ledger = useLedger();
  const party = useParty();

  const assets = useStreamQueries(
    AssetDeposit,
    () => [{ account: { owner: party } }],
    []
  );
  const { contracts: dvps } = useStreamQueries(Dvp);

  const settlementInstructions = useStreamQueries(SettlementInstruction);

  const cbdc = assets?.contracts;
  const ourBankRoles = useStreamQueries(
    BankRole,
    () => [{ bank: party }],
    []
  ).contracts;

  const ourAssetSettlements = useStreamQueries(
    AssetSettlementRule,
    () => [{ account: { owner: party } }],
    []
  ).contracts;

  const pvpProposals = useStreamQueries(DvpProposal.DvpProposal).contracts;

  function getBalanceFor(currency) {
    const [normal] = getBalances(
      assets?.contracts.filter((c) => c?.payload.asset.id.label === currency)
    );
    return normal.length ? normal[0].quantity : 0;
  }

  const { pvp, ourAsset, actualInstruction, pvpStatus } = getPvpStatus(
    settlementInstructions,
    pvpProposals,
    dvps,
    PartyId.from(party)
  );

  const convertMoney = (money: number) =>
    (money / 1000000).toString().concat(money === 0 ? "" : "M");

  const isFormShown =
    !pvpStatus[ProposePvpModel.STATUS] ||
    pvpStatus[ProposePvpModel.STATUS] === ProposeStatusType.SETTLED;
  const [isProposeBlockShown, setIsProposeBlockShown] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = (value: boolean) => () => setIsOpen(value);

  const { src, title, position } = BANK_TYPES[displayName];

  const buttons = [
    {
      disabled: disabledPvpStatuses.some(
        (status) => status === pvpStatus[ProposePvpModel.STATUS]
      ),
      label: "Propose PVP",
      onClick: () => {
        setIsProposeBlockShown(!isProposeBlockShown);
        setIsError(false);
      },
      buttonStyle: `${styles.buttonStyle} ${
        isFormShown ? styles._openSelect : ""
      }`,
    },
    {
      disabled:
        pvpStatus[party] ||
        disabledAllocateStatuses.some(
          (status) => status === pvpStatus[ProposePvpModel.STATUS]
        ),
      label: "Allocate",
      onClick: () => {
        allocateTransferMoney(
          setIsLoading,
          setIsError,
          settlementInstructions,
          cbdc,
          actualInstruction,
          ourAsset,
          pvp,
          ledger,
          SettlementInstruction,
          party
        );
        setIsOpen(false);
      },
      buttonStyle: `${styles.buttonStyle} ${
        isFormShown ? styles._openSelect : ""
      }`,
    },
  ];
  // Daml imported func
  function handleCancelPvp() {
    handleDeclinePvp(pvpProposals, ledger, DvpProposal);
  }
  function handleAcceptPvp() {
    handleAcceptPvpProposal(
      setIsLoading,
      setIsError,
      pvpProposals,
      ourAssetSettlements,
      ourBankRoles,
      BankRole,
      ledger
    );
  }
  function handleCreatePvp() {
    handleProposePvp(
      setIsLoading,
      setIsError,
      displayName,
      inputBuyAmount,
      inputBuyCurrency,
      inputSellAmount,
      ourAssetSettlements,
      ourBankRoles,
      ledger
    );
    setInputBuyAmount("");
    setInputSellAmount("");
  }

  function SET_LIST(bank: string) {
    let spliceNumber = 0,
      startPosition = 0;

    const statusesForProgress = [
      ProposeStatusType.ACCEPTED,
      ProposeStatusType.AWAIT_ALLOCATION,
    ];
    const list = [
      <Button key={buttons[0].label} {...buttons[0]} />,
      isLoading &&
      statusesForProgress.some(
        (status) => status === pvpStatus[ProposePvpModel.STATUS]
      ) ? (
        <Progress key={Math.random()} />
      ) : (
        <Button key={buttons[1].label} {...buttons[1]} />
      ),
    ];

    const listData = [
      <Select
        key={Math.random()}
        title="Counterparty:"
        dropdownList={[counterparty]}
        selectContainerStyle={styles.selectStyles}
        initialLabel={counterparty}
        noArrow={true}
      />,
      <TransferAdjustArea
        key={"1"}
        label={"Enter Buy Amount:"}
        initialLabel={inputBuyCurrency}
        changeCurrency={setInputBuyCurrency}
        inputValue={inputBuyAmount}
        changeInputValue={setInputBuyAmount}
      />,
      <TransferAdjustArea
        key={"2"}
        label={"Enter Sell Amount:"}
        noArrow={true}
        initialLabel={otherCurrency(inputBuyCurrency)}
        changeCurrency={(_) => {}}
        inputValue={inputSellAmount}
        changeInputValue={setInputSellAmount}
      />,
      <div
        className={`${styles.btnTransferContainer} ${
          isLoading ? styles._inProgress : ""
        }`}
        key="Transfer Button"
      >
        {isLoading ? (
          <Progress key={Math.random()} />
        ) : (
          <Button
            key={Math.random()}
            label="Submit"
            onClick={handleCreatePvp}
            buttonStyle={styles.btnTransfer}
            disabled={!inputBuyAmount || !inputSellAmount}
          />
        )}
        {isError && <div className={`${styles.bankError} ${styles._error}`} />}
      </div>,
    ];
    function getDisplayName(partyId: PartyId): string {
      return partyId?.equals(getPartyId(displayName))
        ? displayName
        : counterparty;
    }
    let approvedData = [
      <p
        key={Math.random()}
        className={`${styles.dropDownText} ${styles.dropdownTitleStyle}`}
      >
        PVP Proposal:
      </p>,
      <PvpStatusItem
        key={Math.random()}
        title={"Proposer:"}
        result={getDisplayName(pvpStatus[ProposePvpModel.PROPOSER]!)}
      />,
      <PvpStatusItem
        key={Math.random()}
        title={"Counterparty:"}
        result={getDisplayName(pvpStatus[ProposePvpModel.COUNTERPARTY]!)}
      />,
      <PvpStatusItem
        key={Math.random()}
        title={"Proposer To Buy:"}
        result={`${pvpStatus[ProposePvpModel.PROPOSER_TO_BUY].amount} Million ${
          pvpStatus[ProposePvpModel.PROPOSER_TO_BUY].currency
        }`}
      />,
      <PvpStatusItem
        key={Math.random()}
        title={"Proposer To Sell:"}
        result={`${
          pvpStatus[ProposePvpModel.PROPOSER_TO_SELL].amount
        } Million ${pvpStatus[ProposePvpModel.PROPOSER_TO_SELL].currency}`}
      />,
      <PvpStatusItem
        key={Math.random()}
        title={"Status:"}
        result={isError ? "Failed" : pvpStatus[ProposePvpModel.STATUS]}
        isError={isError}
      />,
    ];

    if (
      !pvpStatus[ProposePvpModel.PROPOSER]?.equals(getPartyId(bank)) &&
      pvpStatus[ProposePvpModel.STATUS] === ProposeStatusType.AWAITING_RESPONSE
    ) {
      approvedData.push(
        <div key={Math.random()} className={styles.acceptButtons}>
          {isLoading ? (
            <Progress key={Math.random()} />
          ) : (
            <PvpButtons
              key={Math.random()}
              accept={handleAcceptPvp}
              decline={handleCancelPvp}
            />
          )}
        </div>
      );
    }

    if (isProposeBlockShown) {
      if (!isFormShown) {
        approvedData.forEach((i) =>
          list.splice(++spliceNumber, startPosition, i)
        );
      } else {
        listData.forEach((i) => list.splice(++spliceNumber, startPosition, i));
      }
    }

    return list;
  }

  const balances: { label: string; value: string }[] = [
    {
      label: Currency.USD,
      value: `${convertMoney(getBalanceFor(Currency.USD))}`,
    },
    {
      label: Currency.EUR,
      value: `${convertMoney(getBalanceFor(Currency.EUR))}`,
    },
  ];

  return (
    <div style={position} className={`${styles.bank}`}>
      <div className={`${styles.bankTop}`}>
        <div
          className={`${styles.bankImgContainer} ${
            displayName === Central.CentralBank2 && styles._eu
          }`}
        >
          <img className={styles.bankImg} src={src} alt="Central Bank" />
        </div>
        <h6
          className={`${styles.bankText} ${styles._topTitle}  ${styles._topTitleCommercial} `}
        >
          {title}
        </h6>
        {/*{!!assetsValue &&!isFinish &&*/}
        <Dropdown
          onClick={toggleDropdown(!isOpen)}
          open={isOpen}
          dropdownStyles={styles.dropdownStyles}
          dropdownListStyles={styles.dropdownListStyles}
          list={SET_LIST(displayName)}
        />
        {/*}*/}
      </div>

      <div className={styles.bankBottom}>
        <List labels={["CURRENCY", "CBDC HOLDING"]} rows={balances} />
      </div>
      {isError && <div className={`${styles.bankError} ${styles._error}`} />}
    </div>
  );
};

export default React.memo(Bank);

const BANK_TYPES = {
  [Commercial.BankA]: {
    title: "Commercial Bank A",
    src: BankLogo,
    money: "",
    currency: Currency.USD,
    position: {
      left: "567px",
      bottom: "453px",
    },
  },
  [Commercial.BankB]: {
    title: "Commercial Bank B",
    src: BankLogo,
    money: "",
    currency: Currency.EUR,
    style: "_commercialB",
    position: {
      left: "567px",
      bottom: "71px",
    },
  },
};
