//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import styles from "./LeftBunchOfLogos.module.css";
import Hyperledger_Fabric_Logo from "../../../static/assets/Logos/Hyperledger_Fabric_Logo.svg";
import IBM_Cloud_Logo from "../../../static/assets/Logos/IBM_Cloud_Logo.svg";
import damlLogo from "../../../static/assets/Logos/DAML_Logo.svg";
import ThreePointLeft from "../../../static/assets/Elements/Slides_Three_Node_Network_Left.svg";
import React from "react";

export const LeftBunchOfLogos =()=>{

    return (<>
        <img src={Hyperledger_Fabric_Logo} className={styles.fabricLogo} alt={"#"} />
        <img src={IBM_Cloud_Logo} className={styles.ibmLogo} alt={"#"}/>
        <img src={damlLogo} className={styles.damlLogoLeft} alt={"#"}/>
        <img src={ThreePointLeft} className={styles.threePointLeft} alt={"#"}/>
    </>)
}
