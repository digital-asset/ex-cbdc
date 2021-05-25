//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import styles from "./RightBunchOfLogos.module.css";
import Ethereum from "../../../static/assets/Logos/Ethereum_Logo.svg";
import AzureLogo from "../../../static/assets/Logos/Azure_Logo.svg";
import damlLogo from "../../../static/assets/Logos/DAML_Logo.svg";
import ThreePointRight from "../../../static/assets/Elements/Slides_Three_Node_Network_Right.svg";

export const RightBunchOfLogos = () => {
  return (
    <>
      <img src={Ethereum} className={styles.ethereum} alt={"#"} />
      <img src={AzureLogo} className={styles.azureLogo} alt={"#"} />
      {/*{state.twoPoints && <img src={Two_Points_Right} className={styles.twoPointsRight} alt={"#"}/>}*/}
      <img src={damlLogo} className={styles.damlLogo} alt={"#"} />
      <img src={ThreePointRight} className={styles.threePointRight} alt={"#"} />
    </>
  );
};
