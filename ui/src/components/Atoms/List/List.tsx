//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from 'react';
import styles from './List.module.css';
import _ from 'lodash';

type ListProps = {
    labels: string[],
    rows: { label: string, value: string }[],
    widthPadding?: boolean,
}

const List: React.FC<ListProps> = (props) => {
    const {
        labels,
        rows,
        widthPadding
    } = props;

    return (
        <div className={styles.table}>
          <div className={styles.tableRow}>
              {labels.map(label => (
                <p className={`${styles.tableCell} ${styles.tableText} ${styles._th}`} key={Math.random()}>{label}</p>
              ))}
          </div>
          {rows.map(row => (
            <div className={styles.tableRow} key={Math.random()}>
                <p className={`
                    ${styles.tableCell}
                    ${styles.tableText}
                    ${styles._cell}
                  `}
                >
                  {row.label}
                </p>
                <p className={`
                    ${styles.tableCell}
                    ${styles.tableText}
                    ${styles._cell}
                    ${(!_.isEqual(_.last(rows), row) && widthPadding) ? styles._padding : ''}
                  `}
                >
                  {row.value}
                </p>
            </div>
          ))}
        </div>
    )
}

export default List;
