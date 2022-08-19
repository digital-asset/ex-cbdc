//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useEffect, useState } from "react";
import CrossBorderPvp from "./Pages/CrossBorderPvp";
import RentInvoice from "./Pages/RentInvoice";
import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import styles from "./App.module.css";
import Conclusion from "./Pages/Conclusion";
import { computeCredentials } from "../Credentials";
import { DemoAdmin } from "../models/Banks";
import BtnActions from "./Molecules/BtnActions/BtnActions";
import newDropdownArrow from "../static/assets/Elements/rectangle.svg";
import reloadIcon from "../static/assets/NewIcons/Reload_Icon.svg";
import sectionIcon from "../static/assets/NewIcons/Go_Icon_for_Dropdown.svg";
import DamlLedger from "@daml/react";
import { LedgerProps } from "@daml/react/createLedgerContext";

export interface dropdownTypes {
  text: string;
  icon: any;
  active: boolean;
  location: string;
}

const App: React.FC = () => {
  const [credentials, setCredentials] = useState<LedgerProps>();

  const createCredentials = async () => {
    const cred = await computeCredentials(DemoAdmin.DemoAdmin);
    setCredentials(cred);
  };

  useEffect(() => {
    createCredentials();
  }, []);

  // function glide(val) {
  //   return spring(val, {
  //     stiffness: 150,
  //     damping: 20,
  //   });
  // }
  // const pageTransitions = {
  //   atEnter: {
  //     offset: -100,
  //     opacity: 0,
  //   },
  //   atLeave: {
  //     offset: glide(150),
  //     opacity: glide(0),
  //   },
  //   atActive: {
  //     offset: glide(0),
  //     opacity: glide(1),
  //   },
  // };

  const location = useLocation();

  const buttons = [
    { text: "SECTIONS", icon: newDropdownArrow },
    { text: "RELOAD", icon: reloadIcon },
  ];
  const locationList = [
    {
      text: "Cross Border Transactions",
      icon: sectionIcon,
      location: "/",
      active: false,
    },
    {
      text: "Restricted Stimulus",
      icon: sectionIcon,
      location: "/customer",
      active: false,
    },
    {
      text: "Conclusion",
      icon: sectionIcon,
      location: "/complete",
      active: false,
    },
  ];

  return (
    <div
      className={`${styles.appWrapper} ${
        location.pathname !== "/" && styles.secondBackground
      }`}
    >
      {credentials && (
        <DamlLedger {...credentials}>
          <BtnActions buttons={buttons} locationList={locationList} />
        </DamlLedger>
      )}

      <Routes
        // {...pageTransitions}
        // mapStyles={(styles) => ({
        //   opacity: `${styles.opacity}`,
        // })}
        // className={styles.routeWrapper}
      >
        <Route path="/" element={<CrossBorderPvp/>} />
        <Route path="/customer" element={<RentInvoice/>} />
        <Route path="/complete" element={<Conclusion/>} />
      </Routes>
    </div>
  );
};

export default App

