//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, {useState} from 'react';
import _ from 'lodash';
import * as Role from "@daml.js/demoadmin-1.0.0/lib/DemoAdmin/Role";
import * as ResetImplementation from "@daml.js/reset-1.0.0/lib/DA/Reset/ResetImplementation";
import { useStreamQueries, useLedger } from "@daml/react";
import { useHistory } from 'react-router-dom';
import styles from './BtnActions.module.css'
import {TextButton} from "../../Atoms/TextButton/TextButton";
import {dropdownTypes} from "../../App";
import activePath from "../../../static/assets/NewIcons/Check_Icon_for_Dropdown.svg";
import { DablPartiesInput, PartyDetails } from "@daml/hub-react"
import { ledgerId } from '../../../config';
import { storeParties } from '../../../Credentials';

type Button = {
    text: string,
    icon?: any,
    action?:()=>void,

}

type BtnActionsProps = {
    buttons: Button[],
    locationList:dropdownTypes[]
}

const BtnActions: React.FC<BtnActionsProps> = (props) => {
    const {
        buttons,
        locationList,
    } = props;

    const [, setIsLoading] = useState<boolean>(false);

    const [isDropdownShown, setIsDropdownShown] = useState<boolean>(false)

    const history = useHistory();

    const handleRedirect =(path:string, cb:(item:boolean)=>void)=>()=> {
        history.push(path)
        cb(false)
    }
    const handleToggleDropdown = () =>setIsDropdownShown(!isDropdownShown)

    function getDrowpDownList() {
        const duplicate = [...locationList]
        const item=duplicate.find(item=>item.location===history.location.pathname)
        const idx= duplicate.findIndex(i=>i.text===item?.text)
        duplicate[idx].active=true
        return [...duplicate];
    }
    const dropdownList = getDrowpDownList();

    const ledger = useLedger();
    const demoAdminRole = useStreamQueries(Role.DemoAdmin.DemoAdminRole);

    const handleLedgerReset = async ():Promise<any> => {
            try {
                setIsLoading(true);
                const demoAdmin = _.first(demoAdminRole.contracts)?.payload.demoAdmin || "";
                const payload = { party: demoAdmin };
                await ledger.create(ResetImplementation.ResetRequest, payload).catch((e) => {
                    console.log(e)
                });
                history.replace('/');
                window.location.reload();
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false);
            }
    };

    const handleLoad = async (parties: PartyDetails[]) => {
        // setParties(parties)
        // setSelectedPartyId(parties[0]?.party || "")
        storeParties(parties)
    }

    return (
        <div className={`${styles.actions}`}>
            {buttons.map(
                button =>
                  "LOAD PARTY FILE" === button.text
                  ? <DablPartiesInput
                        ledgerId={ledgerId}
                        onError={error => console.log(error)}
                        onLoad={handleLoad}
                    />
                  : <TextButton
                        textBtnIconStyle={`${isDropdownShown && button.text==="SECTIONS"?styles._activeDropdown:null}`}
                        key={Math.random()}
                        text={button.text}
                        icon={button.icon?button.icon:null}
                        handleAction={ button.text === "RELOAD" ? handleLedgerReset : handleToggleDropdown }/>)}
            {isDropdownShown && <div className={styles.dropdownContainer}>
                {dropdownList.map(button => <TextButton textBtnContainerStyle={`${styles.dropdownItem} ${button.active?styles._dropdownActiveContainer:null}`} key={Math.random()}
                                                        textBtnTextStyle={`${button.active?styles._dropdownActiveIcon:null}`}
                                                        textBtnIconStyle={styles.dropdownIcon}
                                                        text={button.text} icon={button.icon ? button.active?activePath:button.icon : null}
                                                        handleAction={handleRedirect(button.location, setIsDropdownShown)}/>)}
            </div>}
        </div>
    )
}
export default BtnActions;
