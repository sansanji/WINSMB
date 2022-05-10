import { Navigation } from 'react-native-navigation';

import TMS100101 from './TMS100101'; // 배차내역
import TMS100102 from './TMS100102'; // 배차상세정보

import TMS100201 from './TMS100201'; // 지도검색

import TMS100301 from './TMS100301'; // 트레이싱
import TMS100302 from './TMS100302'; // 트레이싱(상세정보) 탭화면
import TMS100303 from './TMS100303'; // 배차정보
import TMS100304 from './TMS100304'; // 요청상세정보
import TMS100305 from './TMS100305'; // Tracing정보

import TMS100401 from './TMS100401'; // 운행기록조회

import TMS100501 from './TMS100501'; // 사고관리
import TMS100502 from './TMS100502'; // 사고등록

import TMS100601 from './TMS100601'; // 환경설정

import TMS100701 from './TMS100701'; // 기사전용 배차 화면
import TMS100702 from './TMS100702'; // 기사전용 배차정보

import TMS100801 from './TMS100801'; // 타업체 전용 배차 화면
import TMS100802 from './TMS100802'; // 타업체 전용 배차정보
import TMS100803 from './TMS100803'; // 타업체 전용 대리점 화면
import TMS100804 from './TMS100804'; // 지도

import TMS100901 from './TMS100901'; // OCR Scanner List 화면
import TMS100902 from './TMS100902'; // OCR Scanner 화면

import React from 'react';

export default (store, Provider) => {
  Navigation.registerComponent(
    'screen.TMS100101',
    () => props => (
      <Provider store={store}>
        <TMS100101 {...props} />
      </Provider>
    ),
    () => TMS100101,
  );
  Navigation.registerComponent(
    'screen.TMS100102',
    () => props => (
      <Provider store={store}>
        <TMS100102 {...props} />
      </Provider>
    ),
    () => TMS100102,
  );
  Navigation.registerComponent(
    'screen.TMS100201',
    () => props => (
      <Provider store={store}>
        <TMS100201 {...props} />
      </Provider>
    ),
    () => TMS100201,
  );
  Navigation.registerComponent(
    'screen.TMS100301',
    () => props => (
      <Provider store={store}>
        <TMS100301 {...props} />
      </Provider>
    ),
    () => TMS100301,
  );
  Navigation.registerComponent(
    'screen.TMS100302',
    () => props => (
      <Provider store={store}>
        <TMS100302 {...props} />
      </Provider>
    ),
    () => TMS100302,
  );
  Navigation.registerComponent(
    'screen.TMS100303',
    () => props => (
      <Provider store={store}>
        <TMS100303 {...props} />
      </Provider>
    ),
    () => TMS100303,
  );
  Navigation.registerComponent(
    'screen.TMS100304',
    () => props => (
      <Provider store={store}>
        <TMS100304 {...props} />
      </Provider>
    ),
    () => TMS100304,
  );
  Navigation.registerComponent(
    'screen.TMS100305',
    () => props => (
      <Provider store={store}>
        <TMS100305 {...props} />
      </Provider>
    ),
    () => TMS100305,
  );
  Navigation.registerComponent(
    'screen.TMS100401',
    () => props => (
      <Provider store={store}>
        <TMS100401 {...props} />
      </Provider>
    ),
    () => TMS100401,
  );
  Navigation.registerComponent(
    'screen.TMS100501',
    () => props => (
      <Provider store={store}>
        <TMS100501 {...props} />
      </Provider>
    ),
    () => TMS100501,
  );
  Navigation.registerComponent(
    'screen.TMS100502',
    () => props => (
      <Provider store={store}>
        <TMS100502 {...props} />
      </Provider>
    ),
    () => TMS100502,
  );
  Navigation.registerComponent(
    'screen.TMS100601',
    () => props => (
      <Provider store={store}>
        <TMS100601 {...props} />
      </Provider>
    ),
    () => TMS100601,
  );
  Navigation.registerComponent(
    'screen.TMS100701',
    () => props => (
      <Provider store={store}>
        <TMS100701 {...props} />
      </Provider>
    ),
    () => TMS100701,
  );
  Navigation.registerComponent(
    'screen.TMS100702',
    () => props => (
      <Provider store={store}>
        <TMS100702 {...props} />
      </Provider>
    ),
    () => TMS100702,
  );
  Navigation.registerComponent(
    'screen.TMS100801',
    () => props => (
      <Provider store={store}>
        <TMS100801 {...props} />
      </Provider>
    ),
    () => TMS100801,
  );
  Navigation.registerComponent(
    'screen.TMS100802',
    () => props => (
      <Provider store={store}>
        <TMS100802 {...props} />
      </Provider>
    ),
    () => TMS100802,
  );
  Navigation.registerComponent(
    'screen.TMS100803',
    () => props => (
      <Provider store={store}>
        <TMS100803 {...props} />
      </Provider>
    ),
    () => TMS100803,
  );
  Navigation.registerComponent(
    'screen.TMS100804',
    () => props => (
      <Provider store={store}>
        <TMS100804 {...props} />
      </Provider>
    ),
    () => TMS100804,
  );
  Navigation.registerComponent(
    'screen.TMS100901',
    () => props => (
      <Provider store={store}>
        <TMS100901 {...props} />
      </Provider>
    ),
    () => TMS100901,
  );
  Navigation.registerComponent(
    'screen.TMS100902',
    () => props => (
      <Provider store={store}>
        <TMS100902 {...props} />
      </Provider>
    ),
    () => TMS100902,
  );
};
