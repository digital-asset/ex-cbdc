//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from 'react'
import styles from './FirstFlowBox.module.css'
import SuccessArrow from '../../../../static/assets/FirstFlowItems/Black_Arrow,_Broken,_Right.svg'
import FailArrow from '../../../../static/assets/FirstFlowItems/Grey_Arrow.svg'
import {arrowStatusesType} from "../../../../models/ArrowStatuses";

interface boxProps {
    currency:string,
    inputData:string | number | JSX.Element,
    isReverse?:boolean,
    status:boolean | undefined,
    sender:string,
    receiver:string,
    containerStyles?:any
}

export const FirstFlowBox:React.FC<boxProps> =(props):JSX.Element=>{

    const {currency, inputData, isReverse, status, sender, receiver, containerStyles} = props

    return (
        <div className={`${styles.container} ${containerStyles} ${!status && styles._notActiveCContainer}`}>
            <p className={styles.text}>{sender}</p>
            <div className={`${styles.text} ${status && styles._activeBackground}`}>{inputData} {currency}</div>
            <p className={styles.text}>{receiver}</p>
             <img src={arrowTypes[arrowStatusesType.SUCCESS]} alt={'#'}
                  className={`${styles.image} ${isReverse && styles._reverse}`}/>
        </div>
    )
}

const arrowTypes = {
    [arrowStatusesType.SUCCESS]:SuccessArrow,
    [arrowStatusesType.FAIL]:FailArrow
}
