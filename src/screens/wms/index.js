import { Navigation } from 'react-native-navigation';

import WMS100101 from './WMS100101'; // 바코드

import WMS100201 from './WMS100201'; // 출고
import WMS100202 from './WMS100202'; // GI Dt Info Tab.

import WMS100203 from './WMS100203'; // GI Ref Dt List
import WMS100204 from './WMS100204'; // GI Dt List
import WMS100205 from './WMS100205'; // GI Header Info

import WMS100301 from './WMS100301'; // 입고
import WMS100302 from './WMS100302'; // GR Dt Info Tab.

import WMS100303 from './WMS100303'; // GR Ref Dt List
import WMS100304 from './WMS100304'; // GR Dt List
import WMS100305 from './WMS100305'; // GR Header Info
import WMS100306 from './WMS100306'; // GR Ref Dt List(LOT NO)

import WMS100401 from './WMS100401'; // 재고 탭
import WMS100402 from './WMS100402'; // Stock Dt List
import WMS100403 from './WMS100403'; // Stock List
import WMS100404 from './WMS100404'; // Stock Daily
import WMS100405 from './WMS100405'; // Stock Flow

import WMS100501 from './WMS100501'; // 위치정보
import WMS100502 from './WMS100502'; // Location Item

import WMS100601 from './WMS100601'; // 위치이동

import WMS100701 from './WMS100701'; // 사고관리
import WMS100702 from './WMS100702'; // 사고등록

import WMS100801 from './WMS100801'; // 환경설정

import WMS100901 from './WMS100901'; // 재고조사
import WMS100902 from './WMS100902'; // Stock History

// 공항보세창고
import WMS110101 from './WMS110101'; // 하기운송관리(출고)
import WMS110102 from './WMS110102'; // 하기운송관리(출고) 상세
import WMS110201 from './WMS110201'; // 반입신고 LIST
import WMS110301 from './WMS110301'; // 반출신고 LIST

import React from 'react';

export default (store, Provider) => {
  Navigation.registerComponent(
    'screen.WMS100101',
    () => props => (
      <Provider store={store}>
        <WMS100101 {...props} />
      </Provider>
    ),
    () => WMS100101,
  );
  Navigation.registerComponent(
    'screen.WMS100201',
    () => props => (
      <Provider store={store}>
        <WMS100201 {...props} />
      </Provider>
    ),
    () => WMS100201,
  );
  Navigation.registerComponent(
    'screen.WMS100202',
    () => props => (
      <Provider store={store}>
        <WMS100202 {...props} />
      </Provider>
    ),
    () => WMS100202,
  );
  Navigation.registerComponent(
    'screen.WMS100203',
    () => props => (
      <Provider store={store}>
        <WMS100203 {...props} />
      </Provider>
    ),
    () => WMS100203,
  );
  Navigation.registerComponent(
    'screen.WMS100204',
    () => props => (
      <Provider store={store}>
        <WMS100204 {...props} />
      </Provider>
    ),
    () => WMS100204,
  );
  Navigation.registerComponent(
    'screen.WMS100205',
    () => props => (
      <Provider store={store}>
        <WMS100205 {...props} />
      </Provider>
    ),
    () => WMS100205,
  );
  Navigation.registerComponent(
    'screen.WMS100301',
    () => props => (
      <Provider store={store}>
        <WMS100301 {...props} />
      </Provider>
    ),
    () => WMS100301,
  );
  Navigation.registerComponent(
    'screen.WMS100302',
    () => props => (
      <Provider store={store}>
        <WMS100302 {...props} />
      </Provider>
    ),
    () => WMS100302,
  );
  Navigation.registerComponent(
    'screen.WMS100303',
    () => props => (
      <Provider store={store}>
        <WMS100303 {...props} />
      </Provider>
    ),
    () => WMS100303,
  );
  Navigation.registerComponent(
    'screen.WMS100304',
    () => props => (
      <Provider store={store}>
        <WMS100304 {...props} />
      </Provider>
    ),
    () => WMS100304,
  );
  Navigation.registerComponent(
    'screen.WMS100305',
    () => props => (
      <Provider store={store}>
        <WMS100305 {...props} />
      </Provider>
    ),
    () => WMS100305,
  );
  Navigation.registerComponent(
    'screen.WMS100306',
    () => props => (
      <Provider store={store}>
        <WMS100305 {...props} />
      </Provider>
    ),
    () => WMS100306,
  );
  Navigation.registerComponent(
    'screen.WMS100401',
    () => props => (
      <Provider store={store}>
        <WMS100401 {...props} />
      </Provider>
    ),
    () => WMS100401,
  );
  Navigation.registerComponent(
    'screen.WMS100402',
    () => props => (
      <Provider store={store}>
        <WMS100402 {...props} />
      </Provider>
    ),
    () => WMS100402,
  );
  Navigation.registerComponent(
    'screen.WMS100403',
    () => props => (
      <Provider store={store}>
        <WMS100403 {...props} />
      </Provider>
    ),
    () => WMS100403,
  );
  Navigation.registerComponent(
    'screen.WMS100404',
    () => props => (
      <Provider store={store}>
        <WMS100404 {...props} />
      </Provider>
    ),
    () => WMS100404,
  );
  Navigation.registerComponent(
    'screen.WMS100405',
    () => props => (
      <Provider store={store}>
        <WMS100405 {...props} />
      </Provider>
    ),
    () => WMS100405,
  );
  Navigation.registerComponent(
    'screen.WMS100501',
    () => props => (
      <Provider store={store}>
        <WMS100501 {...props} />
      </Provider>
    ),
    () => WMS100501,
  );
  Navigation.registerComponent(
    'screen.WMS100502',
    () => props => (
      <Provider store={store}>
        <WMS100502 {...props} />
      </Provider>
    ),
    () => WMS100502,
  );
  Navigation.registerComponent(
    'screen.WMS100601',
    () => props => (
      <Provider store={store}>
        <WMS100601 {...props} />
      </Provider>
    ),
    () => WMS100601,
  );
  Navigation.registerComponent(
    'screen.WMS100701',
    () => props => (
      <Provider store={store}>
        <WMS100701 {...props} />
      </Provider>
    ),
    () => WMS100701,
  );
  Navigation.registerComponent(
    'screen.WMS100702',
    () => props => (
      <Provider store={store}>
        <WMS100702 {...props} />
      </Provider>
    ),
    () => WMS100702,
  );
  Navigation.registerComponent(
    'screen.WMS100801',
    () => props => (
      <Provider store={store}>
        <WMS100801 {...props} />
      </Provider>
    ),
    () => WMS100801,
  );
  Navigation.registerComponent(
    'screen.WMS100901',
    () => props => (
      <Provider store={store}>
        <WMS100901 {...props} />
      </Provider>
    ),
    () => WMS100901,
  );
  Navigation.registerComponent(
    'screen.WMS100902',
    () => props => (
      <Provider store={store}>
        <WMS100902 {...props} />
      </Provider>
    ),
    () => WMS100902,
  );
  Navigation.registerComponent(
    'screen.WMS110101',
    () => props => (
      <Provider store={store}>
        <WMS110101 {...props} />
      </Provider>
    ),
    () => WMS110101,
  );
  Navigation.registerComponent(
    'screen.WMS110102',
    () => props => (
      <Provider store={store}>
        <WMS110102 {...props} />
      </Provider>
    ),
    () => WMS110102,
  );
  Navigation.registerComponent(
    'screen.WMS110201',
    () => props => (
      <Provider store={store}>
        <WMS110201 {...props} />
      </Provider>
    ),
    () => WMS110201,
  );
  Navigation.registerComponent(
    'screen.WMS110301',
    () => props => (
      <Provider store={store}>
        <WMS110301 {...props} />
      </Provider>
    ),
    () => WMS110301,
  );
};
