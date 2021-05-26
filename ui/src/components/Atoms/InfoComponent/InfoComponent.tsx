//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import styles from "./InfoComponent.module.css";
import thisIsAbout from "../../../static/assets/NewIcons/Info_Widget_-_Un-pressed.svg";
import { Styles } from "../../../models/Styles";
import searchIcon from "../../../static/assets/NewIcons/Magnifying_Glass.svg";

interface Hint {
  img?: any;
  text: string;
}

interface incomeProps {
  title: string;
  subtitle: string;
  toggle: () => void;
  isShown: boolean;
  listOfHints: Hint[];
  additionalInfo?: JSX.Element;
  containerStyle?: Styles;
  contentContainerStyle?: Styles;
  imageStyle?: Styles;
}

export const InfoComponent: React.FC<incomeProps> = (props) => {
  const {
    title = "TEST",
    subtitle = "test",
    toggle,
    isShown,
    listOfHints,
    additionalInfo,
    containerStyle,
    contentContainerStyle,
    imageStyle,
  } = props;
  return (
    <div className={`${styles.container} ${containerStyle}`}>
      <img
        onClick={toggle}
        src={thisIsAbout}
        alt={"#"}
        className={`${styles.titleImage} ${imageStyle}`}
      />
      {isShown && (
        <div className={styles.listContainer}>
          <div className={styles.triangle} />
          <div
            className={`${styles.contentContainer} ${contentContainerStyle}`}
          >
            <h2 className={`${styles.textMain} ${styles._title}`}>{title}</h2>
            <h3 className={`${styles.textMain} ${styles._subtitle}`}>
              {subtitle}
            </h3>
            <div>
              {listOfHints.map((hint) => (
                <div key={Math.random()} className={styles.itemContainer}>
                  {hint.img && (
                    <img src={hint.img} alt={"#"} className={styles.itemImg} />
                  )}
                  <span
                    className={`${styles.textMain} ${styles._hintItemText}`}
                  >
                    {hint.text}
                  </span>
                </div>
              ))}
            </div>
            {additionalInfo && (
              <span className={styles.textMain}>
                <img src={searchIcon} alt={"#"} />
                ...Did you notice?
              </span>
            )}
            {additionalInfo}
          </div>
        </div>
      )}
    </div>
  );
};
