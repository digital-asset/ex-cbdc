//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useState } from "react";
import styles from "./Conclusion.module.css";
import FirstScreen from "../../../static/assets/backgrounds/threBankPointSVG.svg";
import SecondScreen from "../../../static/assets/backgrounds/UC_2_Slide_14_Icons_+_lines.svg";
import ThirdScreen from "../../../static/assets/backgrounds/UC_2_Slide_15_Icons_+_lines.svg";
import TextLeft from "../../../static/assets/NewIcons/Conclusion_Text_Left.svg";
import TextRight from "../../../static/assets/NewIcons/Conclusion_Text_Right.svg";
import Rectangle from "../../../static/assets/NewIcons/Background_Rectangle_for_Conclusion_-_LEFT.svg";

type CompleteProps = {};

type InitialType = {
  status: number;
  statuses: any[];
  firstLogos: boolean;
  secondLogos: boolean;
  thirdLogos: boolean;
};

const initialState = {
  status: 0,
  statuses: [],
  firstLogos: true,
  secondLogos: false,
  thirdLogos: false,
};

const flowOfImages = [{ secondLogos: true }, { thirdLogos: true }];

const Conclusion: React.FC<CompleteProps> = (props) => {
  const [state, setState] = useState<InitialType>(initialState);

  // const keyAction = useCallback((e: KeyboardEvent) => ({
  //   [e.key.toUpperCase()]: () => {},
  //   [HOT_KEY.ARROW_RIGHT]: () => handleKeyboard(state.status, HOT_KEY.ARROW_RIGHT),
  //   [HOT_KEY.ARROW_LEFT]: () => handleKeyboard(_.last(state.statuses), HOT_KEY.ARROW_LEFT),
  //   [HOT_KEY.NEXT_PAGE]: () => history.push('/'),
  //   [HOT_KEY.PREV_PAGE]: () => history.push('/customer'),
  // }[e.key.toUpperCase()]()), [state.status]);

  const handleKeyboard = (status) => {
    if (status === undefined || status === flowOfImages.length) return null;
    const fields = flowOfImages[status];
    console.log("WORK");
    setState({
      ...state,
      statuses: [...state.statuses, status],
      status: status + 1,
      ...fields,
    });
  };

  setTimeout(() => {
    handleKeyboard(state.status);
  }, 3000);

  // useEffect(() => {
  //   window.addEventListener('keydown', keyAction);
  //   return () => window.removeEventListener('keydown', keyAction);
  // }, [keyAction]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h1 className={styles.contentTitle}>
          TRUE INTEROPERABILITY:
          <br /> WITH ATOMICITY + PRIVACY + CROSS-TECHNOLOGY + EXTENSIBILITY
        </h1>
        <img
          src={FirstScreen}
          alt="full network first screen"
          className={`${styles.contentImg} ${styles._first}`}
        />
        <img
          src={SecondScreen}
          alt="full network second screen"
          className={`${styles.contentImg} ${styles._second} ${
            !state.secondLogos && styles.hidden
          }`}
        />
        <img
          src={ThirdScreen}
          alt="full network third screen"
          className={`${styles.contentImg} ${styles._second} ${
            !state.thirdLogos && styles.hidden
          }`}
        />

        {/*{state.thirdLogos && <div className={styles.contentList}>*/}
        {/*      {list.map(item => <p key={item} className={styles.contentText}>{item}</p>)}*/}
        {/*    </div>*/}
        {/*}*/}
        {/*{state.thirdLogos && <p className={styles.link}>digitalasset.com/oecd</p>}*/}
      </div>
      <div className={`${styles.leftTextContainer}`}>
        <img className={styles.rectangle} src={Rectangle} alt={"rectangle"} />
        <img
          className={`${styles.leftText} ${!state.thirdLogos && styles.hidden}`}
          src={TextLeft}
          alt={"leftText"}
        />
      </div>
      <div className={`${styles.rightTextContainer}`}>
        <img
          src={TextRight}
          alt={"leftText"}
          className={`${styles.rightText} ${
            !state.thirdLogos && styles.hidden
          }`}
        />
        <img
          src={Rectangle}
          alt={"rectangle"}
          className={`${styles.rectangleRight}`}
        />
      </div>
    </div>
  );
};

export default Conclusion;
