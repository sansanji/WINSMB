/* *
 * Import Common
 * */
import { Platform } from 'react-native';
import { _, Util, Fetch, ReduxStore } from 'libs';
/* *
 * Import node_modules
 * */

/*
 * 기초 데이터를 불러온다.
 *
 */
export const initCommonCode = async () => {
  const result = await Fetch.fetchCommonCode();
  // 나중에 참조 하기 쉽도록 레코드 형태 그대로 넘어오는 값들을
  // pivot 시켜서 오브젝트로 만든 다음 redux store에 저장해 놓는다.
  ReduxStore.dispatch({
    type: 'global.commonCode.set',
    commonCode: Util.pivotCode(result),
  });
};

export const initTrnStatus = async () => {
  const result = await Fetch.getTrnStatus();
  let carStatus = '대기';
  if (result) {
    if (result.TYPE === 1) {
      carStatus = result.TMS010101F1.CAR_STATUS_NAME;
    }
    ReduxStore.dispatch({
      type: 'global.trnstatus.set',
      trnstatus: carStatus,
    });
  } else {
    ReduxStore.dispatch({
      type: 'global.trnstatus.set',
      trnstatus: carStatus,
    });
  }
};

export const initSettings = async () => {
  const result = await Fetch.getInit();

  if (result) {
    ReduxStore.dispatch({
      type: 'global.varSetting.set',
      setting: _.get(result, 'data.varsetting', {}),
    });
    ReduxStore.dispatch({
      type: 'global.sysSetting.set',
      setting: _.get(result, 'data.syssetting', {}),
    });
    ReduxStore.dispatch({
      type: 'global.session.set',
      session: _.get(result, 'data.session', {}),
    });
    ReduxStore.dispatch({
      type: 'global.menu.set',
      menu: _.get(result, 'data.menu', {}),
    });
    if (result.data.menu) {
      ReduxStore.dispatch({
        type: 'global.lmenu.set',
        lmenu: Util.parseLmenu(result.data.menu, result.data.session.USER_AUTH),
      });
    }
  } else {
    ReduxStore.dispatch({
      type: 'global.varSetting.set',
      setting: null,
    });
    ReduxStore.dispatch({
      type: 'global.sysSetting.set',
      setting: null,
    });
    ReduxStore.dispatch({
      type: 'global.session.set',
      session: null,
    });
    ReduxStore.dispatch({
      type: 'global.menu.set',
      menu: null,
    });
    ReduxStore.dispatch({
      type: 'global.lmenu.set',
      lmenu: null,
    });
  }
};

export const initSettingsWins = async () => {
  const result = [{
    CHILD_YN: 'Y',
    CLS: 'WVWINS',
    CODE: 'WVWINS',
    DSKT_CD: 'WVWINS',
    DSKT_SQ: 7,
    HEIGHT: 700,
    ICONCLS: 'globe',
    ID: 'WVWINS',
    LEVEL: 1,
    MAXIMIZABLE: 'Y',
    ORDER_SEQ: 0,
    PCODE: '*',
    RESIZABLE: 'Y',
    SCLASS: 'com.layout.MainScreenWins',
    SHOTCUT: 'Y',
    SWIDGET: 'WVWINS',
    TEXT: 'WINS',
    WIDTH: 1310,
  }, {
    CHILD_YN: 'Y',
    CLS: 'WVPORTAL',
    CODE: 'WVPORTAL',
    DSKT_CD: 'WVPORTAL',
    DSKT_SQ: 7,
    HEIGHT: 700,
    ICONCLS: 'globe',
    ID: 'WVPORTAL',
    LEVEL: 1,
    MAXIMIZABLE: 'Y',
    ORDER_SEQ: 1,
    PCODE: '*',
    RESIZABLE: 'Y',
    SCLASS: 'com.layout.MainScreenPortal',
    SHOTCUT: 'Y',
    SWIDGET: 'WVPORTAL',
    TEXT: 'Portal',
    WIDTH: 1310,
  }];
  ReduxStore.dispatch({
    type: 'global.activeTab.set',
    activeTab: 0,
  });
  if (result) {
    ReduxStore.dispatch({
      type: 'global.menu.set',
      // menu: _.get(result, 'data.menu', {}),
      menu: result,
    });
    // if (result.data.menu) {
    ReduxStore.dispatch({
      type: 'global.lmenu.set',
      lmenu: Util.parseLmenu(result, ''),
    });
  } else {
    ReduxStore.dispatch({
      type: 'global.menu.set',
      menu: null,
    });
    ReduxStore.dispatch({
      type: 'global.lmenu.set',
      lmenu: null,
    });
  }
};

// export const initTrnStatus = async () => {
//   const result = await Fetch.getTrnStatus();
//   let carStatus = '대기';
//   if (result) {
//     if (result.TYPE === 1) {
//       carStatus = result.TMS010101F1.CAR_STATUS_NAME;
//     }
//     ReduxStore.dispatch({
//       type: 'global.trnstatus.set',
//       trnstatus: carStatus,
//     });
//   } else {
//     ReduxStore.dispatch({
//       type: 'global.trnstatus.set',
//       trnstatus: carStatus,
//     });
//   }
// };

export const initConfigure = async () => {
  const { message, config } = ReduxStore.getState().global;

  if (Object.keys(message).length === 0) {
    await Fetch.getLang(config.MSG_LANG || 'KO');
  }
  if (!config.MSG_LANG) {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: {
        MSG_LANG: 'KO',
        MSG_LANG_NAME: 'Korean',
      },
    });
  }

  if (_.isEmpty(ReduxStore.getState().global.config) === false) {
    return;
  }

  // const result = await Fetch.fetchConfig();
  // if (result) {
  // const config = _.get(result, '[0]', {});
  const { ALRAM_YN } = ReduxStore.getState().global.config;
  if (!ALRAM_YN) {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: {
        ALRAM_YN: 'N',
      },
    });
  }

  // } else {
  //   ReduxStore.dispatch({
  //     type: 'global.config.set',
  //     config: {
  //       ALRAM_YN: 'N',
  //     },
  //   });
  // }
};

export const initLocation = async () => {
  let geoConfig = null;
  if (Platform.OS === 'ios') {
    geoConfig = { enableHighAccuracy: true, timeout: 500, maximumAge: 0 };
  } else {
    geoConfig = { enableHighAccuracy: false, timeout: 3600, maximumAge: 0 };
  }

  navigator.geolocation.watchPosition(
    position => {
      const { latitude, longitude, speed, heading } = position.coords;
      (async (lat, lon, spd, head) => {
        // const result = await Fetch.geo2addr(lat, lon);
        // const addr = _.get(result, 'documents[0].address_name', ''); 기존 다음카카오 api를 호출할 경우의 처리
        // const addr = _.get(result, 'CTM030110F1.ADDRESS', '');
        const addr = '';

        ReduxStore.dispatch({
          type: 'global.location.set',
          lat,
          lon,
          addr,
          spd,
          head,
        });
      })(latitude, longitude, speed, heading);
    },
    error => {
      console.log(error);
    },
    geoConfig,
  );
};

export const initSocket = () => {
  ReduxStore.subscribe(() => {
    const {
      global: { token },
    } = ReduxStore.getState();
    if (!token) {
    }
  });
};
