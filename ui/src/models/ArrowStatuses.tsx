//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import {ProposeStatusType} from "./ProposePvpModel";

type statuses = {
    SUCCESS:string,
    FAIL:string
}

export const arrowStatusesType:statuses = {
    SUCCESS:"SUCCESS",
    FAIL:"FAIL"
}
const {ACCEPTED, AWAIT_ALLOCATION, SETTLED} = ProposeStatusType
export const boxesAllowedStatuses = [ACCEPTED, AWAIT_ALLOCATION, SETTLED]
