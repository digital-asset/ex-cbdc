//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import styles from "./PvpStatusItem.module.css";
import FailMark from "../../../static/assets/Icons/Error.svg";

interface incomeProps {
  title: string;
  result: string | undefined;
  pvpIncomeStyles?: string;
  isError?: boolean;
}

const PvpStatusItem: React.FC<incomeProps> = (props) => {
  const {
    title = "",
    result = "",
    pvpIncomeStyles = "",
    isError = false,
  } = props;
  return (
    <div className={`${styles.container} ${pvpIncomeStyles}`}>
      <p className={styles.textStyle}>{title}</p>
      <div className={styles.resultContainer}>
        {isError && <img src={FailMark} alt={"#"} className={styles.img} />}
        <p
          className={`${styles.textStyle} ${styles.resultText} ${
            isError && styles._textWithImg
          }`}
        >
          {result}
        </p>
      </div>
    </div>
  );
};
export default PvpStatusItem;
