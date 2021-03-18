//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import { Currency } from "../../../models/Curency";
import Input from "../../Atoms/Input";
import Select from "../Select";
import styles from "./TransferAdjustArea.module.css"

interface incomeProps {
    label?:string,
    noArrow?:boolean,
    incomeTransferAdjustContainer?:string,
    labelStyle?:string,
    initialLabel:string,
    changeCurrency:(input:string)=>void,
    inputValue:string,
    changeInputValue:(allocateInput:string)=>void
}

const TransferAdjustArea:React.FC<incomeProps> =(props):JSX.Element=>{
    const {
    label="",
        noArrow,
        incomeTransferAdjustContainer="",
        labelStyle="",
        initialLabel="",
        changeCurrency,
        inputValue,
        changeInputValue
    } = props

    return (
        <div className={`${styles.container} ${incomeTransferAdjustContainer}`}>
            {label && <p className={`${styles.inputLabel} ${styles.inputText} ${labelStyle}`}>{label}</p>}
            <Input  value={inputValue}
                    onChange={changeInputValue}
                    inputContainerStyle={styles.inputContainerStyle}
            />
            <Select onChange={changeCurrency}
                    dropdownList={[Currency.USD, Currency.EUR]}
                    noArrow={noArrow}
                    selectContainerStyle={styles.selectContainerStyle}
                    initialLabel={initialLabel}/>
        </div>
    )
}
export default TransferAdjustArea
