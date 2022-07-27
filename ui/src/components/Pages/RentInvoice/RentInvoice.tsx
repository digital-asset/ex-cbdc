//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useEffect, useState } from "react";
import { computeCredentials } from "../../../Credentials";
import { BankCustomer, Central, Landlord } from "../../../models/Banks";
import styles from "./RentInvoice.module.css";
import DamlLedger, { useStreamQueries } from "@daml/react";
import CentralBank from "../../Organisms/CentralBankSecondFlow";
import Customer from "../../Organisms/Customer";
import { LandLordAssociation } from "../../Organisms/LandLordAssociation/LandLordAssociation";
import DamlLogo from "../../../static/assets/Logos/DAML_Logo.svg";
import ThreePointsRight from "../../../static/assets/Elements/Slides_Three_Node_Network_Right.svg";
import Fabric from "../../../static/assets/Logos/Hyperledger_Fabric_Logo.svg";
import IBM_CLOUD from "../../../static/assets/Logos/IBM_Cloud_Logo.svg";
import SQL_LOGO from "../../../static/assets/Logos/PostgreSQL_Logo.svg";
import ThreePointsLeft from "../../../static/assets/Elements/Slides_Three_Node_Network_Left.svg";
import Azure from "../../../static/assets/Logos/Azure_Logo.svg";
import BrightPoint from "../../../static/assets/Elements/Bright_Point.png";
import leftArrow from "../../../static/assets/Elements/Blue_Arrow_Left_UC2.svg";
import rightArrow from "../../../static/assets/Elements/Blue_Arrow_Right_UC2.svg";
import { FirstFlowBox } from "../../Atoms/BlueBoxes/FirstFlow/FirstFlowBox";
import Certificate from "../../../static/assets/Icons/Certification_Icon_Small_(for_Blue_Box).svg";
import atomicIcon from "../../../static/assets/Icons/Atomic_Icon.svg";
import { InfoComponent } from "../../Atoms/InfoComponent/InfoComponent";
import FirstPoint from "../../../static/assets/NewIcons/Step_1_Icon.svg";
import SecondPoint from "../../../static/assets/NewIcons/Step_2_Icon.svg";
import ThirdPoint from "../../../static/assets/NewIcons/Step_3_Icon.svg";
import FourthPoint from "../../../static/assets/NewIcons/Step_4_Icon.svg";
import {
  LastPaidRentInvoice,
  RentInvoice,
} from "@daml.js/landlord-1.0.0/lib/Landlord/Landlord";
import { LedgerProps } from "@daml/react/createLedgerContext";
import { PartyId } from "../../../models/CredentialsType";

function RentInvoiceProcessVisualization() {
  const rentInvoice = useStreamQueries(RentInvoice);
  const lastPaidRentInvoice = useStreamQueries(LastPaidRentInvoice);

  enum InvoiceStage {
    Nothing,
    Issued,
    Paid,
  }

  const [stage, price]: [InvoiceStage, string] = rentInvoice.contracts.length
    ? [InvoiceStage.Issued, rentInvoice?.contracts[0].payload.price]
    : lastPaidRentInvoice.contracts.length
    ? [
        InvoiceStage.Paid,
        lastPaidRentInvoice?.contracts[0].payload.rentInvoice.price,
      ]
    : [InvoiceStage.Nothing, ""];

  function inputData(price): JSX.Element {
    return (
      <div>
        <img
          src={Certificate}
          alt="Certificate"
          className={styles.certificateImg}
        />
        {`INVOICE: ${price}`}
      </div>
    );
  }

  function paid(price): JSX.Element {
    return (
      <div>
        <FirstFlowBox
          currency={"USD"}
          inputData={inputData(Math.round(price))}
          status={true}
          sender={"ALPHA PROPERTIES, LLC"}
          receiver={"ALICE B."}
          containerStyles={styles.invoiceImage}
        />
        <img src={leftArrow} className={styles.leftArrow} alt="#" />
        <img src={atomicIcon} className={styles.atomicLogo} alt={"#"} />
        <img src={rightArrow} className={styles.rightArrow} alt={"#"} />
        <div className={styles.block} />
      </div>
    );
  }

  function invoice(price, paidComponent): JSX.Element {
    return (
      <div className={styles.invoiceContainer}>
        <FirstFlowBox
          currency={"USD"}
          isReverse={true}
          inputData={inputData(Math.round(price))}
          status={true}
          sender={"ALPHA PROPERTIES, LLC"}
          receiver={"ALICE B."}
        />
        {paidComponent}
      </div>
    );
  }

  switch (stage) {
    case InvoiceStage.Nothing:
      return <div />;
    case InvoiceStage.Issued:
      return invoice(price, <div />);
    case InvoiceStage.Paid:
      return invoice(price, paid(price));
    default:
      return <div />;
  }
}

const Main: React.FC = () => {
  const [startingNewProcess, setStartingNewProcess] = useState<boolean>(false);

  const [credentialsUSA, setCredentialsUSA] = useState<LedgerProps>();
  const [credentialsAlice, setCredentialsAlice] = useState<LedgerProps>();
  const [credentialsLandlord, setCredentialsLandlord] = useState<LedgerProps>();

  const createCredentials = async () => {
    setCredentialsUSA(await computeCredentials(Central.CentralBank1));
    setCredentialsAlice(await computeCredentials(BankCustomer.Alice));
    setCredentialsLandlord(await computeCredentials(Landlord.Landlord));
  };

  useEffect(() => {
    createCredentials();
  }, []);

  const handleCleanState = (startingNew: boolean) => {
    setStartingNewProcess(startingNew);
  };

  const leftLogos = () => {
    return (
      <>
        <img src={DamlLogo} alt={"#"} className={styles.leftDamlLogo} />
        <img
          src={ThreePointsLeft}
          alt={"#"}
          className={styles.threePointsLeft}
        />
        <img src={Azure} alt={"#"} className={styles.azureLogo} />
      </>
    );
  };

  const rightLogos = () => {
    return (
      <>
        <img src={DamlLogo} alt={"#"} className={styles.damlLogo} />
        <img
          src={ThreePointsRight}
          className={styles.threePointsRight}
          alt={"#"}
        />
        <img src={IBM_CLOUD} className={styles.ibmLogo} alt={"#"} />
        <img src={Fabric} className={styles.fabric} alt={"#"} />
      </>
    );
  };

  const [isShownHints, setIsShownHints] = useState<boolean>(false);
  const handleToggleHints = () => setIsShownHints(!isShownHints);

  return (
    <div className={styles.content}>
      <img src={BrightPoint} alt={"#"} className={styles.brightPoint} />
      {startingNewProcess ? (
        <div />
      ) : (
        credentialsLandlord && (
          <DamlLedger {...credentialsLandlord}>
            <RentInvoiceProcessVisualization />
          </DamlLedger>
        )
      )}
      <div>
        <img src={SQL_LOGO} alt={"#"} className={styles.sqlLogo} />
        <div className={styles.leftLogosContainer}>{leftLogos()}</div>
      </div>

      <div className={styles.rightLogosContainer}>{rightLogos()}</div>
      <h1 className={styles.contentTitle}>
        TRUE INTEROPERABILITY: EXTENSIBILITY
      </h1>
      <InfoComponent
        containerStyle={styles.hintContainer}
        title={"WHAT CAN I DO IN THIS SECTION?"}
        subtitle={"Section Steps:"}
        toggle={handleToggleHints}
        isShown={isShownHints}
        listOfHints={infoList}
        contentContainerStyle={styles.hintContentContainer}
        imageStyle={styles.hintImageStyle}
        additionalInfo={AdditionalHints()}
      />
      {credentialsUSA && (
        <DamlLedger {...credentialsUSA!}>
          <CentralBank
            isCustomer
            alice={PartyId.from(credentialsAlice!.party)}
            landlord={PartyId.from(credentialsLandlord!.party)}
          />
        </DamlLedger>
      )}

      {credentialsLandlord && (
        <DamlLedger {...credentialsLandlord}>
          <LandLordAssociation
            handleCleanState={handleCleanState}
            renter={PartyId.from(credentialsAlice!.party)}
          />
        </DamlLedger>
      )}

      {credentialsAlice && (
        <DamlLedger {...credentialsAlice!}>
          <Customer
            name="Alice B."
            containerStyles={styles.customerStyles}
            withMenu
          />
        </DamlLedger>
      )}
    </div>
  );
};

export default Main;

const infoList = [
  {
    img: FirstPoint,
    text: "Use the controls for the United States Reserve Bank to transfer Stimulus dollars (any amount) to Alice B. ",
  },
  {
    img: "",
    text: "Alice’s USD account balance will update to reflect that transfer.",
  },
  {
    img: SecondPoint,
    text: "Use the controls for the United States Reserve Bank to transfer Restricted Stimulus dollars in any amount (which in this example, may only be used for rent payments) to Alice B. ",
  },
  {
    img: "",
    text: "Alice’s USD-S account balance will update to reflect that transfer.",
  },
  {
    img: ThirdPoint,
    text: "Next, use the controls for Alice’s landlord, Alpha Properties, to send her an invoice for a monthly rent payment. ",
  },
  {
    img: FourthPoint,
    text: "Finally, use the controls for Alice to respond to the invoice by paying her rent with her USD-S balance. ",
  },
  {
    img: "",
    text: "Afterwards, the balance of Alpha Properties will show an increase in regular USD.  ",
  },
];
const AdditionalHints = () => (
  <p className={styles.textHints}>
    During the rental payment, Alice’s USD-S balance was prioritized; if that
    balance was too low to cover her rent, then the remainder was paid from
    Alice’s regular USD balance.
  </p>
);
