//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { ChangeEvent } from 'react';
import styles from './Input.module.css';
import { Styles } from '../../../models/Styles';
import NumberFormat from 'react-number-format';

type InputProps = {
    label?: string,
    id?: string,
    value: string,
    onChange: (value: string) => void,
    inputContainerStyle?: Styles,
    inputStyle?: Styles,
    labelStyle?: Styles,
}

const Input: React.FC<InputProps> = (props) => {
    const {
        label,
        id,
        inputStyle = '',
        inputContainerStyle = '',
        labelStyle = '',
        value,
        onChange,
    } = props;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
    const idprop = id ? {id: id} : {}

    return (
        <div className={`${inputContainerStyle} ${styles.customContainerStyles}`}>
            {label && <p className={`${styles.inputLabel} ${styles.inputText} ${labelStyle}`}>{label}</p>}
            <NumberFormat
                // suffix={"M"}
                // placeholder={"0M"}
                value={value}
                onChange={handleChange}
                className={`${styles.input} ${styles.inputText} ${inputStyle}`}
                {...idprop}
            />
        </div>
    )
}

export default Input;
