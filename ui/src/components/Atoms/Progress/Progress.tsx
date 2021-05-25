//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import styles from "./Progress.module.css";
import { Styles } from "../../../models/Styles";

type ProgressProps = {
  containerStyles?: Styles;
};

const Progress: React.FC<ProgressProps> = (props) => {
  const { containerStyles = "" } = props;

  return (
    <div className={`${styles.progress} ${containerStyles}`}>
      <div className={styles.progressLine} />
      <div className={`${styles.progressLine} ${styles._second}`} />
    </div>
  );
};

export default Progress;
