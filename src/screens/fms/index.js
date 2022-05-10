import React from 'react';
import { Navigation } from 'react-native-navigation';

// import FMS010101T from './FMS010101T'; // EDI 관련 화면 Tab
import FMS010102 from './FMS010102'; // 인천공항 스케줄 정보
import FMS010103 from './FMS010103'; // 항공수출 GSCL(IV) EDI LIST
import FMS010104 from './FMS010104'; // 항공수출 GERP EDI LIST
// EDI 전송 이력 관리 (공통)
import FMS010105 from './FMS010105';
import FMS010106 from './FMS010106'; // 공항 화물터미널 출고관리 EDI LIST
import TEMPLATE from './TEMPLATE'; // 항공수출 GSCL(IV) EDI LIST

export default (store, Provider) => {
  Navigation.registerComponent(
    'screen.FMS010102',
    () => props => (
      <Provider store={store}>
        <FMS010102 {...props} />
      </Provider>
    ),
    () => FMS010102,
  );
  Navigation.registerComponent(
    'screen.FMS010103',
    () => props => (
      <Provider store={store}>
        <FMS010103 {...props} />
      </Provider>
    ),
    () => FMS010103,
  );
  Navigation.registerComponent(
    'screen.FMS010104',
    () => props => (
      <Provider store={store}>
        <FMS010104 {...props} />
      </Provider>
    ),
    () => FMS010104,
  );
  Navigation.registerComponent(
    'screen.FMS010105',
    () => props => (
      <Provider store={store}>
        <FMS010105 {...props} />
      </Provider>
    ),
    () => FMS010105,
  );
  Navigation.registerComponent(
    'screen.FMS010106',
    () => props => (
      <Provider store={store}>
        <FMS010106 {...props} />
      </Provider>
    ),
    () => FMS010106,
  );
  Navigation.registerComponent(
    'screen.TEMPLATE',
    () => props => (
      <Provider store={store}>
        <TEMPLATE {...props} />
      </Provider>
    ),
    () => TEMPLATE,
  );
};
