//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import styles from "./Transaction.module.css";
import { TransactionStatus } from "../../../models/TransactionStatus";
import TransactionConnection from "../../../static/assets/Elements/Transaction.svg";
import TransactionErrorAttempt from "../../../static/assets/Blue_Boxes/Slide_25.svg";
import TransactionErrorFail from "../../../static/assets/Blue_Boxes/Slide_26.svg";
import TransactionSuccess from "../../../static/assets/Blue_Boxes/Slide_33,_24.svg";
import TransactionTransparentErrorAttempt from "../../../static/assets/Blue_Boxes/Slide_19,_20,_21.svg";
import TransactionFirstAllocationAttempt from "../../../static/assets/Blue_Boxes/Slide_22,_23,_24.svg";
import SuccessAttempt from "../../../static/assets/Blue_Boxes/Slide_27,_28,_29.svg";
import SuccessFirstAttempt from "../../../static/assets/Blue_Boxes/Slide_30,_31,_32.svg";

type TransactionProps = {
  status: string;
};

const Transaction: React.FC<TransactionProps> = (props) => {
  const { status } = props;

  return (
    <div className={styles.transaction}>
      <img
        src={Image[status]}
        alt="Transaction"
        className={styles.transactionImg}
      />
    </div>
  );
};

export default Transaction;

const Image = {
  [TransactionStatus.CONNECTED]: TransactionConnection,
  [TransactionStatus.ERROR_ATTEMPT]: TransactionErrorAttempt,
  [TransactionStatus.ERROR_FAIL]: TransactionErrorFail,
  [TransactionStatus.SUCCESS]: TransactionSuccess,
  [TransactionStatus.TRANSPARENT_ERROR_ATTEMPT]:
    TransactionTransparentErrorAttempt,
  [TransactionStatus.TRANSPARENT_FIRST_ERROR_ATTEMPT]:
    TransactionFirstAllocationAttempt,
  [TransactionStatus.SUCCESS_ATTEMPT]: SuccessAttempt,
  [TransactionStatus.SUCCESS_FIRST_ATTEMPT]: SuccessFirstAttempt,
  // [TransactionStatus.FINISH]:FinishSlide
};
