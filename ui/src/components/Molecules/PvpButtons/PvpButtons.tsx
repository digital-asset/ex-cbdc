//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import Button from "../../Atoms/Button";
import styles from './PvpButtons.module.css'

interface incomeProps {
    accept:()=>void,
    decline:()=>void
}

export const PvpButtons:React.FC<incomeProps> =(props)=>{
    const {
        accept,
        decline
    }=props
    return (
        <div className={styles.container}>
            <Button label={'Decline'} buttonStyle={`${styles.btnContainer}  ${styles._declineBtn}`} onClick={decline}/>
            <Button label={"Accept"} buttonStyle={`${styles.btnContainer}`} onClick={accept}/>
        </div>
    )
}

