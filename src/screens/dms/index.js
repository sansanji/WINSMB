import { Navigation } from 'react-native-navigation';

import DMS100101 from './DMS100101'; // 바코드

import DMS100201 from './DMS100201'; // 출고
import DMS100202 from './DMS100202'; // GI Dt Info Tab.

import DMS100204 from './DMS100204'; // GI Dt List
import DMS100205 from './DMS100205'; // GI Header Info
import DMS100206 from './DMS100206'; // PLT BOX ITEM Link

import DMS100301 from './DMS100301'; // 입고
import DMS100302 from './DMS100302'; // GR Dt Info Tab.

import DMS100304 from './DMS100304'; // GR Dt List
import DMS100305 from './DMS100305'; // GR Header Info

import DMS100401 from './DMS100401'; // 재고 탭
import DMS100402 from './DMS100402'; // PLT Stock
import DMS100403 from './DMS100403'; // Stock Daily
import DMS100404 from './DMS100404'; // Stock Daily
import DMS100405 from './DMS100405'; // Stock Flow
import DMS100406 from './DMS100406'; // BOX Stock
import DMS100407 from './DMS100407'; // ITEM Stock
import DMS100408 from './DMS100408'; // 재고 pop up

import DMS100501 from './DMS100501'; // 위치정보
import DMS100502 from './DMS100502'; // Location Item

import DMS100601 from './DMS100601'; // 구버전 위치이동

import DMS100701 from './DMS100701'; // 사고관리
import DMS100702 from './DMS100702'; // 사고등록

import DMS100801 from './DMS100801'; // 환경설정

import DMS100901 from './DMS100901'; // 재고조사
import DMS100902 from './DMS100902'; // Stock History

import DMS200101 from './DMS200101'; // 출고검수
import DMS200102 from './DMS200102'; // 출고검수상세
import DMS200103 from './DMS200103'; // 시리얼 번호

import DMS200201 from './DMS200201'; // 화물매핑
import DMS200202 from './DMS200202'; // 화물매핑상세

import DMS200301 from './DMS200301'; //  파레트 오더

import DMS200401 from './DMS200401'; // 패킹리스트
import DMS200402 from './DMS200402'; // 패킹리스트상세

import DMS200501 from './DMS200501'; // 입고검수
import DMS200502 from './DMS200502'; // 입고검수상세
import DMS200503 from './DMS200503'; // 입고 스캔 중인 시리얼 번호

import DMS200601 from './DMS200601'; //  박스 오더

import DMS200701 from './DMS200701'; // 신버전 위치이동


import React from 'react';

export default (store, Provider) => {
  Navigation.registerComponent(
    'screen.DMS100101',
    () => props => (
      <Provider store={store}>
        <DMS100101 {...props} />
      </Provider>
    ),
    () => DMS100101,
  );
  Navigation.registerComponent(
    'screen.DMS100201',
    () => props => (
      <Provider store={store}>
        <DMS100201 {...props} />
      </Provider>
    ),
    () => DMS100201,
  );
  Navigation.registerComponent(
    'screen.DMS100202',
    () => props => (
      <Provider store={store}>
        <DMS100202 {...props} />
      </Provider>
    ),
    () => DMS100202,
  );

  Navigation.registerComponent(
    'screen.DMS100204',
    () => props => (
      <Provider store={store}>
        <DMS100204 {...props} />
      </Provider>
    ),
    () => DMS100204,
  );
  Navigation.registerComponent(
    'screen.DMS100205',
    () => props => (
      <Provider store={store}>
        <DMS100205 {...props} />
      </Provider>
    ),
    () => DMS100205,
  );

  Navigation.registerComponent(
    'screen.DMS100206',
    () => props => (
      <Provider store={store}>
        <DMS100206 {...props} />
      </Provider>
    ),
    () => DMS100206,
  );
  Navigation.registerComponent(
    'screen.DMS100301',
    () => props => (
      <Provider store={store}>
        <DMS100301 {...props} />
      </Provider>
    ),
    () => DMS100301,
  );
  Navigation.registerComponent(
    'screen.DMS100302',
    () => props => (
      <Provider store={store}>
        <DMS100302 {...props} />
      </Provider>
    ),
    () => DMS100302,
  );

  Navigation.registerComponent(
    'screen.DMS100304',
    () => props => (
      <Provider store={store}>
        <DMS100304 {...props} />
      </Provider>
    ),
    () => DMS100304,
  );
  Navigation.registerComponent(
    'screen.DMS100305',
    () => props => (
      <Provider store={store}>
        <DMS100305 {...props} />
      </Provider>
    ),
    () => DMS100305,
  );

  Navigation.registerComponent(
    'screen.DMS100401',
    () => props => (
      <Provider store={store}>
        <DMS100401 {...props} />
      </Provider>
    ),
    () => DMS100401,
  );
  Navigation.registerComponent(
    'screen.DMS100402',
    () => props => (
      <Provider store={store}>
        <DMS100402 {...props} />
      </Provider>
    ),
    () => DMS100402,
  );
  Navigation.registerComponent(
    'screen.DMS100403',
    () => props => (
      <Provider store={store}>
        <DMS100403 {...props} />
      </Provider>
    ),
    () => DMS100403,
  );
  Navigation.registerComponent(
    'screen.DMS100404',
    () => props => (
      <Provider store={store}>
        <DMS100404 {...props} />
      </Provider>
    ),
    () => DMS100404,
  );
  Navigation.registerComponent(
    'screen.DMS100405',
    () => props => (
      <Provider store={store}>
        <DMS100405 {...props} />
      </Provider>
    ),
    () => DMS100405,
  );
  Navigation.registerComponent(
    'screen.DMS100406',
    () => props => (
      <Provider store={store}>
        <DMS100406 {...props} />
      </Provider>
    ),
    () => DMS100406,
  );
  Navigation.registerComponent(
    'screen.DMS100407',
    () => props => (
      <Provider store={store}>
        <DMS100407 {...props} />
      </Provider>
    ),
    () => DMS100407,
  );
  Navigation.registerComponent(
    'screen.DMS100408',
    () => props => (
      <Provider store={store}>
        <DMS100408 {...props} />
      </Provider>
    ),
    () => DMS100408,
  );
  Navigation.registerComponent(
    'screen.DMS100501',
    () => props => (
      <Provider store={store}>
        <DMS100501 {...props} />
      </Provider>
    ),
    () => DMS100501,
  );
  Navigation.registerComponent(
    'screen.DMS100502',
    () => props => (
      <Provider store={store}>
        <DMS100502 {...props} />
      </Provider>
    ),
    () => DMS100502,
  );
  Navigation.registerComponent(
    'screen.DMS100601',
    () => props => (
      <Provider store={store}>
        <DMS100601 {...props} />
      </Provider>
    ),
    () => DMS100601,
  );
  Navigation.registerComponent(
    'screen.DMS100701',
    () => props => (
      <Provider store={store}>
        <DMS100701 {...props} />
      </Provider>
    ),
    () => DMS100701,
  );
  Navigation.registerComponent(
    'screen.DMS100702',
    () => props => (
      <Provider store={store}>
        <DMS100702 {...props} />
      </Provider>
    ),
    () => DMS100702,
  );
  Navigation.registerComponent(
    'screen.DMS100801',
    () => props => (
      <Provider store={store}>
        <DMS100801 {...props} />
      </Provider>
    ),
    () => DMS100801,
  );
  Navigation.registerComponent(
    'screen.DMS100901',
    () => props => (
      <Provider store={store}>
        <DMS100901 {...props} />
      </Provider>
    ),
    () => DMS100901,
  );
  Navigation.registerComponent(
    'screen.DMS100902',
    () => props => (
      <Provider store={store}>
        <DMS100902 {...props} />
      </Provider>
    ),
    () => DMS100902,
  );
  Navigation.registerComponent(
    'screen.DMS200101',
    () => props => (
      <Provider store={store}>
        <DMS200101 {...props} />
      </Provider>
    ),
    () => DMS200101,
  );
  Navigation.registerComponent(
    'screen.DMS200102',
    () => props => (
      <Provider store={store}>
        <DMS200102 {...props} />
      </Provider>
    ),
    () => DMS200102,
  );
  Navigation.registerComponent(
    'screen.DMS200103',
    () => props => (
      <Provider store={store}>
        <DMS200103 {...props} />
      </Provider>
    ),
    () => DMS200103,
  );
  Navigation.registerComponent(
    'screen.DMS200201',
    () => props => (
      <Provider store={store}>
        <DMS200201 {...props} />
      </Provider>
    ),
    () => DMS200201,
  );
  Navigation.registerComponent(
    'screen.DMS200202',
    () => props => (
      <Provider store={store}>
        <DMS200202 {...props} />
      </Provider>
    ),
    () => DMS200202,
  );
  Navigation.registerComponent(
    'screen.DMS200301',
    () => props => (
      <Provider store={store}>
        <DMS200301 {...props} />
      </Provider>
    ),
    () => DMS200301,
  );
  Navigation.registerComponent(
    'screen.DMS200401',
    () => props => (
      <Provider store={store}>
        <DMS200401 {...props} />
      </Provider>
    ),
    () => DMS200401,
  );
  Navigation.registerComponent(
    'screen.DMS200402',
    () => props => (
      <Provider store={store}>
        <DMS200402 {...props} />
      </Provider>
    ),
    () => DMS200402,
  );
  Navigation.registerComponent(
    'screen.DMS200501',
    () => props => (
      <Provider store={store}>
        <DMS200501 {...props} />
      </Provider>
    ),
    () => DMS200501,
  );
  Navigation.registerComponent(
    'screen.DMS200502',
    () => props => (
      <Provider store={store}>
        <DMS200502 {...props} />
      </Provider>
    ),
    () => DMS200502,
  );
  Navigation.registerComponent(
    'screen.DMS200503',
    () => props => (
      <Provider store={store}>
        <DMS200503 {...props} />
      </Provider>
    ),
    () => DMS200503,
  );
  Navigation.registerComponent(
    'screen.DMS200601',
    () => props => (
      <Provider store={store}>
        <DMS200601 {...props} />
      </Provider>
    ),
    () => DMS200601,
  );
  Navigation.registerComponent(
    'screen.DMS200701',
    () => props => (
      <Provider store={store}>
        <DMS200701 {...props} />
      </Provider>
    ),
    () => DMS200701,
  );
};
