//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { ReactNode } from 'react';
import styles from './Dropdown.module.css';
import Arrow from '../../../static/assets/Icons/CloseDropdownLarge.svg';
import { Styles } from '../../../models/Styles';

type DropdownProps = {
    list: ReactNode[],
    id?: string,
    open: boolean,
    noArrow?: boolean,
    onClick?: () => void,
    dropdownStyles?: Styles,
    dropdownIconStyles?: Styles,
    dropdownListStyles?: Styles,
}

const Dropdown: React.FC<DropdownProps> = (props) => {
    const {
        list,
        id,
        open,
        noArrow,
        onClick = () => {},
        dropdownStyles = '',
        dropdownIconStyles = '',
        dropdownListStyles = ''
    } = props;
    const idprop = id ? {id: id} : {}
    return (
        <div className={`${styles.dropdown} ${dropdownStyles}`} {...idprop}>
            {!noArrow && <img
                className={`${dropdownIconStyles} ${styles.dropdownImage} ${open ? styles._open : ''}`}
                onClick={onClick}
                src={Arrow}
                alt="Dropdown"
            />}
            {open && (
                <div className={`${styles.dropdownList} ${dropdownListStyles}`}>
                    {list}
                </div>
            )}
        </div>
    )
}

export default Dropdown;
