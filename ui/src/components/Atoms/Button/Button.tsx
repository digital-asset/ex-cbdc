//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { MouseEventHandler } from 'react';
import styles from './Button.module.css';
import { Styles } from '../../../models/Styles';

type ButtonProps = {
    label: string,
    disabled?: boolean,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    buttonStyle?: Styles
}

const Button: React.FC<ButtonProps> = (props) => {
    const {
        label,
        buttonStyle = '',
        ...rest
    } = props;

    return <button className={`${styles.button} ${buttonStyle}`} {...rest} >{label}</button>
}

export default Button;
