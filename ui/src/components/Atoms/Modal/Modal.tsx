//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React, { useState, useRef } from 'react';
import styles from './Modal.module.css';
import Slide1 from '../../../static/assets/Modal/UC_1_Slide_13_Modal.png';
import Slide2 from '../../../static/assets/Modal/UC_1_Slide_14_Modal.png';
import Slide3 from '../../../static/assets/Modal/UC_1_Slide_15_Modal.png';
import Carousel from 'react-elastic-carousel'
import ReactElasticCarousel from "react-elastic-carousel";
import _ from 'lodash'


type ModalProps = {
  show: boolean,
  handleClose: () => void,
}

const slides: string[] = [Slide1, Slide2, Slide3];

const Modal: React.FC<ModalProps> = (props) => {
  const {
    show,
    handleClose
  } = props;

  enum CLICK_TYPE {
    NEXT = 'NEXT',
    PREV = 'PREV'
  }

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [activeImg, setActiveImg] = useState<string>(Slide1);
  const ref = useRef<ReactElasticCarousel & { goTo: (slide: number) => void }>(null);

  const handleChange = (type: string) => () => {
    const current = _.findIndex(slides, el => el === activeImg);
    if (type === CLICK_TYPE.NEXT) {
      ref.current?.goTo(activeSlide + 1);
      setActiveSlide(activeSlide + 1);
      return setActiveImg(slides[current + 1])
    };
    ref.current?.goTo(activeSlide - 1);
    setActiveSlide(activeSlide - 1);
    setActiveImg(slides[current - 1]);
    return
  }

  return (
    <div className={`${styles.modal} ${show ? styles._show : ''}`}>

      <div className={styles.modalBackground} />
      <div className={styles.modalClose} onClick={handleClose} />
      {_.first(slides) !== activeImg && (
          <div
              onClick={handleChange(CLICK_TYPE.PREV)}
              className={`${styles.modalBtn} ${styles._prev}`}
          />
      )}
      {_.last(slides) !== activeImg && (
          <div
              onClick={handleChange(CLICK_TYPE.NEXT)}
              className={`${styles.modalBtn} ${styles._next}`}
          />
      )}

      <Carousel
        itemsToShow={1}
        pagination={false}
        showArrows={false}
        enableSwipe={false}
        enableMouseSwipe={false}
        ref={ref}
      >
        {slides.map(img => (
          <img
            key={img + Math.random()}
            src={img}
            className={styles.modalImg}
            alt="Modals slide"
          />
        ))}
      </Carousel>
    </div>
  )
}

export default Modal;
