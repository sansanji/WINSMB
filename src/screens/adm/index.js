import { Navigation } from 'react-native-navigation';
import React from 'react';
import ADM010101 from './ADM010101'; // 환경설정
import ADM010102 from './ADM010102'; // 공지사항
import ADM010103 from './ADM010103'; // 유저정보
import ADM010104 from './ADM010104'; // 문의사항
import ADM010105 from './ADM010105'; // 문의사항 상세
import ADM010106 from './ADM010106'; // 채팅리스트
import ADM010107 from './ADM010107'; // 채팅리스트
import ADM010108 from './ADM010108'; // 채팅리스트
import ADM010109 from './ADM010109'; // 모바일알림리포트
import ADM010114 from './ADM010114'; // 투표리스트
import ADM010115 from './ADM010115'; // 투료생성
import ADM010116 from './ADM010116'; // 투표시스템

import TEMPFORM from './TEMPFORM';
import TEMPLIST from './TEMPLIST';
import TEMPTAB from './TEMPTAB';
import TEMPPHOTO from './TEMPPHOTO';
import TEMPMAP from './TEMPMAP';
import TEMPWEB from './TEMPWEB';
import TEMPTEST from './TEMPTEST';
import TEMPPRINT from './TEMPPRINT'; // 프린트
import TEMPTEST2 from './TEMPTEST2'; // TEST
import TEMPSERIAL from './TEMPSERIAL'; // 시리얼뎀플릿


export default (store, Provider) => {
  Navigation.registerComponent(
    'screen.ADM010101',
    () => props => (
      <Provider store={store}>
        <ADM010101 {...props} />
      </Provider>
    ),
    () => ADM010101,
  );
  Navigation.registerComponent(
    'screen.ADM010102',
    () => props => (
      <Provider store={store}>
        <ADM010102 {...props} />
      </Provider>
    ),
    () => ADM010102,
  );
  Navigation.registerComponent(
    'screen.ADM010103',
    () => props => (
      <Provider store={store}>
        <ADM010103 {...props} />
      </Provider>
    ),
    () => ADM010103,
  );
  Navigation.registerComponent(
    'screen.ADM010104',
    () => props => (
      <Provider store={store}>
        <ADM010104 {...props} />
      </Provider>
    ),
    () => ADM010104,
  );
  Navigation.registerComponent(
    'screen.ADM010105',
    () => props => (
      <Provider store={store}>
        <ADM010105 {...props} />
      </Provider>
    ),
    () => ADM010105,
  );
  Navigation.registerComponent(
    'screen.ADM010106',
    () => props => (
      <Provider store={store}>
        <ADM010106 {...props} />
      </Provider>
    ),
    () => ADM010106,
  );
  Navigation.registerComponent(
    'screen.ADM010107',
    () => props => (
      <Provider store={store}>
        <ADM010107 {...props} />
      </Provider>
    ),
    () => ADM010107,
  );
  Navigation.registerComponent(
    'screen.ADM010108',
    () => props => (
      <Provider store={store}>
        <ADM010108 {...props} />
      </Provider>
    ),
    () => ADM010108,
  );
  Navigation.registerComponent(
    'screen.TEMPFORM',
    () => props => (
      <Provider store={store}>
        <TEMPFORM {...props} />
      </Provider>
    ),
    () => TEMPFORM,
  );
  Navigation.registerComponent(
    'screen.TEMPLIST',
    () => props => (
      <Provider store={store}>
        <TEMPLIST {...props} />
      </Provider>
    ),
    () => TEMPLIST,
  );
  Navigation.registerComponent(
    'screen.TEMPTAB',
    () => props => (
      <Provider store={store}>
        <TEMPTAB {...props} />
      </Provider>
    ),
    () => TEMPTAB,
  );
  Navigation.registerComponent(
    'screen.TEMPPHOTO',
    () => props => (
      <Provider store={store}>
        <TEMPPHOTO {...props} />
      </Provider>
    ),
    () => TEMPPHOTO,
  );
  Navigation.registerComponent(
    'screen.TEMPMAP',
    () => props => (
      <Provider store={store}>
        <TEMPMAP {...props} />
      </Provider>
    ),
    () => TEMPMAP,
  );
  Navigation.registerComponent(
    'screen.TEMPWEB',
    () => props => (
      <Provider store={store}>
        <TEMPWEB {...props} />
      </Provider>
    ),
    () => TEMPWEB,
  );
  Navigation.registerComponent(
    'screen.TEMPTEST',
    () => props => (
      <Provider store={store}>
        <TEMPTEST {...props} />
      </Provider>
    ),
    () => TEMPTEST,
  );
  Navigation.registerComponent(
    'screen.TEMPTEST2',
    () => props => (
      <Provider store={store}>
        <TEMPTEST2 {...props} />
      </Provider>
    ),
    () => TEMPTEST2,
  );
  Navigation.registerComponent(
    'screen.ADM010109',
    () => props => (
      <Provider store={store}>
        <ADM010109 {...props} />
      </Provider>
    ),
    () => ADM010109,
  );
  Navigation.registerComponent(
    'screen.TEMPSERIAL',
    () => props => (
      <Provider store={store}>
        <TEMPSERIAL {...props} />
      </Provider>
    ),
    () => TEMPSERIAL,
  );
  Navigation.registerComponent(
    'screen.TEMPPRINT',
    () => props => (
      <Provider store={store}>
        <TEMPPRINT {...props} />
      </Provider>
    ),
    () => TEMPPRINT,
  );
  Navigation.registerComponent(
    'screen.ADM010114',
    () => props => (
      <Provider store={store}>
        <ADM010114 {...props} />
      </Provider>
    ),
    () => ADM010114,
  );
  Navigation.registerComponent(
    'screen.ADM010115',
    () => props => (
      <Provider store={store}>
        <ADM010115 {...props} />
      </Provider>
    ),
    () => ADM010115,
  );
  Navigation.registerComponent(
    'screen.ADM010116',
    () => props => (
      <Provider store={store}>
        <ADM010116 {...props} />
      </Provider>
    ),
    () => ADM010116,
  );
};
