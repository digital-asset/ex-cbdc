//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, {useEffect, useState} from 'react';
import { Styles } from '../../../models/Styles';
import Dropdown from '../../Atoms/Dropdown';
import styles from './Select.module.css';

type SelectProps = {
    dropdownList: string[],
    title?: string,
    onChange?: (value: string) => void,
    selectContainerStyle?: Styles,
    selectTitleStyle?: Styles,
    dropdownItemStyle?: Styles,
    initialLabel?: string,
    noArrow?:boolean
}

type SelectState = {
    isOpen: boolean,
    label: string | null,
}

const Select: React.FC<SelectProps> = (props) => {
    const {
        dropdownList,
        title,
        initialLabel,
        onChange,
        selectContainerStyle = '',
        selectTitleStyle = '',
        dropdownItemStyle = '',
        noArrow=false
    } = props;

    const [selectState, setSelectState] = useState<SelectState>({
        label: initialLabel || null,
        isOpen: false
    })

    useEffect(()=>{
        if(initialLabel)setSelectState(prev=>({...prev, label:initialLabel}))
    },[initialLabel])

    const toggleDropdown = (isOpen: boolean) => () => setSelectState({ ...selectState, isOpen });
    const handleChangeList = (label: string) => () => {
        setSelectState({ label, isOpen: false });
        onChange && onChange(label);
    }

    const list = dropdownList.map(item => (
        <div
            key={Math.random()}
            className={`${styles.dropdownItem} ${dropdownItemStyle} ${styles.selectText}`}
            onClick={handleChangeList(item)}
        >
            {item}
        </div>
    ))

    return (
        <div className={`${selectContainerStyle}`}>
            <p className={`${styles.selectText} ${styles.selectTitle} ${selectTitleStyle}`}>{title}</p>
            <div className={styles.select}>
                <p className={styles.selectText}>{selectState.label}</p>
                <Dropdown
                    noArrow={noArrow}
                    onClick={toggleDropdown(!selectState.isOpen)}
                    open={selectState.isOpen}
                    list={list}
                    dropdownIconStyles={styles.dropdownIconStyle}
                    dropdownListStyles={styles.dropdownListStyles}
                />
            </div>
        </div>
    )
}

export default Select;
