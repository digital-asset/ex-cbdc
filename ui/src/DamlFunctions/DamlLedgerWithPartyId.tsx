//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import DamlLedger from "@daml/react";
import React from "react";
import { Credentials } from "../models/CredentialsType";


export function DamlLedgerWithPartyId(props: Credentials) {
    return <DamlLedger {...props} party={props.partyId.asString()} />
}
