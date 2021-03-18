//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from 'react'
import styles from './TextButton.module.css'
import {Styles} from "../../../models/Styles";

interface incomeProps {
    text:string,
    icon?:any,
    textBtnContainerStyle?:Styles,
    textBtnTextStyle?:Styles,
    textBtnIconStyle?:Styles,
    handleAction?:()=>void | Promise<any>
}

export const TextButton:React.FC<incomeProps> =(
    {text, icon, textBtnContainerStyle="",textBtnTextStyle,handleAction,textBtnIconStyle}
)=>{
    return <div className={`${styles.container} ${textBtnContainerStyle}`} onClick={handleAction}>
        <p className={`${styles.text} ${textBtnTextStyle}`}>{text}</p>
        {icon && <img src={icon} alt={"#"} className={`${styles.icon} ${textBtnIconStyle}`}/>}
    </div>
}
