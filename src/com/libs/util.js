/* *
 * Import Common
 * */
import {Platform, ToastAndroid, Linking, AsyncStorage} from 'react-native';
import _ from 'lodash';
import Navigation from 'libs/navigation';
import store from 'libs/store';
import Fetch from 'libs/fetch';
import env from 'libs/env';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import Tts from 'react-native-tts';
/* *
 * Import node_modules
 * */
import mainTabIcons from 'assets/mainTabIcons';
import bluecolor from 'styles/theme-color-blue';
import RNBeep from 'react-native-a-beep';
/*
 * 유틸 관련 라이브러리
 *
 */

// 메뉴관련
import mainNavigatorStyle from 'styles/navigator';

const mainNavigatorButtons = {
  leftButtons: [
    {
      id: 'sideMenu',
      component: 'com.layout.DrawerButton',
      passProps: {},
    },
  ],
  rightButtons: [
    {
      id: 'nav-right-btn-chatting',
      component: 'com.layout.ChattingButton',
      passProps: {},
    },
    {
      id: 'nav-right-btn-notification',
      component: 'com.layout.NotificationButton',
      passProps: {},
    },
  ],
};

const getCode = code => {
  const {commonCode} = store.getState().global;
  return commonCode[code];
};

const pivotCode = commonCode => {
  const newCode = {};

  _.each(commonCode, code => {
    newCode[code.COMMON_CODE] = code;
  });

  return newCode;
};

const pivotMsgId = msgId => {
  const newMsg = {};

  _.each(msgId, code => {
    newMsg[code.MSG_ID] = code;
  });

  return newMsg;
};

const getCodeOptions = code => {
  const {commonCode} = store.getState().global;
  return _.get(commonCode, `[${code}].options`, []);
};

const getSelOption = (code, selected) => {
  const options = getCodeOptions(code);
  const selOption = _.find(options, {
    DT_CODE: selected,
  });

  return selOption;
};

const openComboBox = async ({
  label,
  groupCode,
  groupJson,
  sql,
  codeField,
  nameField,
  selected,
  onChange,
}) => {
  const {navigator} = store.getState().global;
  let result = null;

  // groupJson이 있다면 그대로 보내준다.
  if (!isEmpty(groupJson)) {
    result = {
      TYPE: 1,
      data: groupJson,
    };
  } else {
    result = await Fetch.fetchCommonCode(groupCode, sql);
  }

  if (result.TYPE === 1) {
    navigator.showOverlay({
      component: {
        name: 'common.ComboBox',
        passProps: {
          label,
          codeField,
          nameField,
          onChange,
          selected,
          comboValues: result.data,
          onClose: () => {
            navigator.dismissOverlay(this.props.componentId);
          },
        },
        options: {
          layout: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
  } else {
    msgBox({
      title: result.MSG,
      msg: result.DESC,
      buttonGroup: [
        {
          title: 'OK',
        },
      ],
    });
  }
};

const openGridComboBox = async ({
  label,
  groupCode,
  sql,
  codeField,
  nameField,
  selected,
  onChange,
}) => {
  const {navigator} = store.getState().global;
  const result = await Fetch.fetchCommonCode(groupCode, sql);

  if (result.TYPE === 1) {
    navigator.showOverlay({
      component: {
        name: 'common.GridComboBox',
        passProps: {
          label,
          codeField,
          nameField,
          onChange,
          selected,
          groupCode,
          sql,
          comboValues: result.data,
          onClose: () => {
            navigator.dismissOverlay(this.props.componentId);
          },
        },
        options: {
          layout: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
  } else {
    msgBox({
      title: result.MSG,
      msg: result.DESC,
      buttonGroup: [
        {
          title: 'OK',
        },
      ],
    });
  }
};

const openCalendar = props => {
  const {navigator} = store.getState().global;

  navigator.showOverlay({
    component: {
      name: 'common.Calendar',
      passProps: {
        label: props.label,
        onChange: props.onChange,
        current: props.current,
        // 추후 DateSet 공통 Form 사용시 주석 해제 후 사용!
        // currentFromDate: props.currentFromDate,
        // currentToDate: props.currentToDate,
        // dateType: props.dateType,
      },
      options: {
        layout: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          componentBackgroundColor: 'rgba(0, 0, 0, 0.7)',
          // backgroundBlur: 'dark',
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

// 입력박스 띄우기
const openWriteBox = props => {
  const {navigator} = store.getState().global;

  // navigator.showLightBox({
  //   screen: 'common.WriteBox',
  //   passProps: {
  //     onPost: props.onPost,
  //     textValue: props.textValue,
  //     maxLength: props.maxLength,
  //   },
  //   style: {
  //     backgroundBlur: 'dark',
  //     backgroundColor: 'rgba(0, 0, 0, 0.7)',
  //     tapBackgroundToDismiss: false,
  //   },
  // });
  navigator.showOverlay({
    component: {
      name: 'common.WriteBox',
      passProps: {
        label: props.label,
        onPost: props.onPost,
        textValue: props.textValue,
        maxLength: props.maxLength,
      },
      options: {
        layout: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          componentBackgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

// 문자열 바꾸기
const replaceAll = (str, searchStr, replaceStr) =>
  str.split(searchStr).join(replaceStr);

const getLocation = () => {
  let geoConfig = null;
  if (Platform.OS === 'ios') {
    geoConfig = {enableHighAccuracy: true, timeout: 5000, maximumAge: 0};
  } else {
    geoConfig = {enableHighAccuracy: false, timeout: 36000, maximumAge: 0};
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const {latitude, longitude, speed, heading} = position.coords;
      (async (lat, lon, spd, head) => {
        // const result = await Fetch.geo2addr(lat, lon);
        // const addr = _.get(result, 'documents[0].addressgetLocation_name', ''); 기존 다음카카오 api를 호출할 경우의 처리
        // const addr = _.get(result, 'CTM030110F1.ADDRESS', '');
        const addr = '';
        store.dispatch({
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

// 다국어 처리할 msgId에 대한 Name을 리턴한다.
const getMultiText = msgId => {
  const {message} = store.getState().global;
  let msgContents = null;
  msgContents = _.get(message, `[${msgId}].MSG_CONTENTS`, null);
  // 값이 비어있는 경우 그냥 요청값을 리턴해준다.
  if (!msgContents) {
    msgContents = msgId;
  }
  return msgContents;
};

const isEmpty = value => {
  if (
    value === '' ||
    value === null ||
    value === undefined ||
    (value != null && typeof value === 'object' && !Object.keys(value).length)
  ) {
    return true;
  }
  return false;
};

const parseLmenu = (value, userAuth) => {
  const lfuncMenus = [];
  value.forEach(tmenu => {
    if (tmenu.PCODE === '*') {
      // 기사용일때 홈화면과 운송만..
      if (userAuth !== 'D') {
        lfuncMenus.push({
          title: tmenu.TEXT,
          label: tmenu.TEXT,
          icon: mainTabIcons.home,
          finalIcon: tmenu.ICONCLS,
          screen: tmenu.SCLASS, // unique ID registered with Navigation.registerScreen
          navigatorStyle: mainNavigatorStyle, // override the navigator style for the tab screen, see "Styling the navigator" below (optional),
          navigatorButtons: mainNavigatorButtons, // override the nav buttons for the tab screen, see "Adding buttons to the navigator" below (optional)
          swidget: tmenu.SWIDGET,
        });
      }
    }
  });
  return lfuncMenus;
};

const parseSmenu = (value, targetMenu) => {
  const menuFavList = [];
  const menuList = [];
  value.forEach(tmenu => {
    // 대기능 제거
    if (tmenu.PCODE !== '*' && tmenu.PCODE.indexOf(targetMenu) > -1) {
      // 1레벨 메뉴 선별
      if (tmenu.PCODE === targetMenu) {
        menuList.push({
          title: tmenu.TEXT,
          pcode: tmenu.CODE,
          menu: [],
        });
      }
      // 즐겨찾기 선별
      if (tmenu.PCODE !== targetMenu && tmenu.SHOTCUT === 'Y') {
        menuFavList.push({
          title: tmenu.TEXT,
          finalIcon: tmenu.ICONCLS,
          screen: tmenu.SCLASS, // unique ID registered with Navigation.registerScreen
        });
      }
    }
  });

  value.forEach((tmenu, menuIndex) => {
    menuList.forEach((smenu, i) => {
      if (smenu.pcode === tmenu.PCODE) {
        menuList[i].menu.push({
          subtitle: tmenu.TEXT,
          subscreen: tmenu.SCLASS,
          menuID: tmenu.CODE,
          iconcls: tmenu.ICONCLS,
          shortcut: tmenu.SHOTCUT,
          menuIndex,
        });
      }
    });
  });

  return {menuFavList, menuList};
};

const toastMsg = message => {
  // ios만 별도 라이브러리를 사용하고, 'android'는 내장 함수인 ToastAndroid 를 사용한다.
  if (Platform.OS === 'ios') {
    Toast.show(message);
  } else {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  }
};

// https://www.npmjs.com/package/react-native-tts
const tts = message => {
  // 기본언어 재 설정! (선언 안할 시 'en-US') ... https://docs.microsoft.com/ko-kr/windows-hardware/customize/mobile/mcsf/set-languages-and-locales  :> ja-JP, zh-CN, zh-HK, ko-KR
  Tts.setDefaultLanguage('ko-KR');
  Tts.voices().then(voices => console.log('voices', voices)); // (Android API 레벨 <21에서 지원되지 않음, 빈 목록 반환)

  Tts.speak(message);

  // iOS 디버깅 시 주의점
  // - YellowBox.js Warning!! Sending `tts-start` with no listeners registered.
  // ==> 이러한 경고는 무해하며 프로덕션 빌드에는 표시되지 않습니다. 개발 중에 사용하지 않으려면 다음을보십시오.
  //     https://facebook.github.io/react-native/docs/debugging.html#warnings
  //     console.ignoredYellowBox에 관한 부분
};

const msgBox = ({title, msg, buttonGroup}) => {
  const {navigator} = store.getState().global;

  navigator.showOverlay({
    component: {
      name: 'common.MsgBox',
      passProps: {
        title,
        msg,
        buttonGroup,
      },
      options: {
        layout: {
          backgroundColor: bluecolor.basicRedColorTransLow,
          componentBackgroundColor: bluecolor.basicRedColorTransLow,
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

// parentId: Loader를 열람한 부모 화면!
// type: true or false (스피너(로딩) 열람 구분)
const openLoader = (parentId, type) => {
  const {navigator} = store.getState().global;

  if (type) {
    // true : Loader 열람!
    navigator.showOverlay({
      component: {
        id: `${parentId}_common.Loader`, // componentId 강제 변수화 처리! (자체적으로 Close할 경우 필요!)
        name: 'common.Loader',
        passProps: {
          type,
        },
        options: {
          layout: {
            backgroundColor: bluecolor.basicTrans,
            componentBackgroundColor: bluecolor.basicTrans,
          },
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
  } else {
    // false : Loader 닫힘!
    navigator.dismissOverlay(`${parentId}_common.Loader`);
  }
};

const signBox = (
  refType,
  sFuncCode,
  title,
  refNo,
  companyCode,
  onSaveComplete,
) => {
  if (isEmpty(refNo)) {
    toastMsg('The reference number(BL No, TRN No Etc...) is a required value.');
    return;
  }

  const {navigator} = store.getState().global;

  navigator.showOverlay({
    component: {
      name: 'common.SignBox',
      passProps: {
        refType,
        sFuncCode,
        title,
        refNo,
        companyCode,
        onSaveComplete,
      },
      options: {
        layout: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

const barcodeBox = (value, format, singleBarWidth, height, lineColor) => {
  if (isEmpty(value)) {
    toastMsg('The reference number(BL No, TRN No Etc...) is a required value.');
    return;
  }

  const {navigator} = store.getState().global;

  navigator.showOverlay({
    component: {
      name: 'common.BarcodeBox',
      passProps: {
        value,
        format,
        options: {singleBarWidth, height, lineColor},
      },
      options: {
        layout: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

const imageBox = (title, source, companyCode, fileMgtCode) => {
  if (isEmpty(source)) {
    toastMsg('The Image source is incorrect!');
    return;
  }

  const {navigator} = store.getState().global;

  Navigation(
    navigator,
    'common.ImageBox',
    {title, source, companyCode, fileMgtCode},
    title,
  );
};

// listRow 페이징 처리!
const flatListOnEndReached = (data, dataTotal) => {
  const listCnt = env().listCnt;
  const fromIndex = data.length; // 20 부터 currentPage *listCnt
  const toIndex = fromIndex + listCnt; // 40 까지
  const dataTotalLength = dataTotal.length; // 실제 조회된 전체 건수!
  let applyToIndex = null;
  let toastMessage = null;
  const arrData = [];

  if (dataTotalLength >= toIndex && dataTotalLength > fromIndex) {
    // 전체 건수에 아직 도달하지 못했을 경우!
    applyToIndex = toIndex;
    toastMessage = `+ ${listCnt} View more ( ${fromIndex} / ${dataTotalLength} )`;

    toastMsg(toastMessage); // 간략 정보 토스트 메시지 처리
  } else if (dataTotalLength < toIndex && dataTotalLength > fromIndex) {
    // 전체 건수에 도달하였지만, 100% 페이징에 설정된 기본 갯수가 다 채워 지지 않았을 경우 나머지 값 처리!
    applyToIndex = dataTotalLength;
    toastMessage = `+ ${
      dataTotalLength % listCnt === 0 ? listCnt : dataTotalLength % listCnt
    } View more ( ${fromIndex} / ${dataTotalLength} )`;

    toastMsg(toastMessage); // 간략 정보 토스트 메시지 처리
  } else if (fromIndex >= dataTotalLength && dataTotalLength <= fromIndex) {
    // 페이징 처리 후 그려질 갯수가 더 이상 없을 경우! 리턴한다!
    toastMsg(`The view end ( ${dataTotalLength} / ${dataTotalLength} )`); // 간략 정보 토스트 메시지 처리

    return null;
  }

  // 지정된 페이징 Row 갯수만큼 임시 저장한다.
  for (let i = fromIndex; i < applyToIndex; i += 1) {
    arrData.push({
      ...dataTotal[i],
    });
  }

  return {arrData, applyToIndex};
};

// 배열 자르기
const getArrayData = (arrData, num) => {
  const arrSetRow = [];
  const totalLength = arrData.length;
  let currentRow = 0;

  if (isEmpty(totalLength) || totalLength < env().listCnt) {
    currentRow = totalLength;
  } else {
    currentRow = env().listCnt;
  }
  for (let i = 0; i < currentRow; i += 1) {
    arrSetRow.push({
      ...arrData[i],
    });
  }

  return arrSetRow;
};

// 숫자 포맷팅
const formatNumber = num => {
  let Tnum = replaceAll(num.toString(), ',', '');
  if (Tnum.indexOf('.') > -1) {
    const Pnum = Tnum.split('.')[1];
    if (Pnum.length > 2) {
      Tnum = String(Math.round(Number(Tnum) * 100) / 100);
    }
  }

  Tnum = Tnum.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  return Tnum;
};

// 날짜 포맷팅
const formatDate = (date, dateNum) => {
  let result = null;
  if (isEmpty(date)) {
    result = moment().format('YYYY-MM-DD');
    if (!isEmpty(dateNum)) {
      result = moment()
        .subtract(dateNum * -1, 'days')
        .format('YYYY-MM-DD');
    }
  } else {
    const Tdate = moment(date, 'YYYYMMDD');
    result = Tdate.format('YYYY-MM-DD');
  }

  return result;
};

const getDateValue = (date, dateNum) => {
  const result = replaceAll(formatDate(date, dateNum), '-', '');
  return result;
};

// 시간 포맷팅
const formatTime = time => {
  let result = null;
  if (isEmpty(time)) {
    result = moment().format('HH:mm');
  } else {
    const THour = moment(time, 'hhmm');
    result = THour.format('HH:mm');
  }

  return result;
};

// editable 판단여부

const checkEdit = (editable, value) => {
  let checkEditable = false;
  if (editable === true || editable === false) {
    checkEditable = editable;
  }
  if (value) {
    checkEditable = false;
  }
  return checkEditable;
};

// 채팅 방만들기 로직
const makeRoomName = memberList => {
  let ROOM_NAME = '';
  memberList.map((item, i) => {
    if (i === 0) {
      ROOM_NAME = item.USER_NAME_LOC;
    } else {
      ROOM_NAME += `,${item.USER_NAME_LOC}`;
    }
  });
  return ROOM_NAME;
};

// 전화걸기
const onCalling = phoneNumber => {
  msgBox({
    title: 'Calling',
    msg: 'Do you want to call?',
    buttonGroup: [
      {
        title: 'Call',
        onPress: item => {
          Linking.openURL(`tel:${phoneNumber}`);
        },
      },
    ],
  });
};

// 기본적인 조회 조건에 대한 필수 값 체크!(whCode, vendorCode)
const wmsValidCheckFunc = alertType => {
  const {whcode} = store.getState().global;
  const {vendorcode} = store.getState().global;
  const rtnValue = false;

  let whCode = null;
  let vendorCode = null;

  whCode = _.get(whcode, 'WH_CODE', null);
  vendorCode = _.get(vendorcode, 'VENDOR_CODE', null);

  if (whCode === null || vendorCode === null) {
    // alertType에 따라 alert문구가 보여질지 말지 결정
    // 즉, 메인 탭 화면 중 2번째(입고), 3번째(재고)화면이 처음 그려질 때 이미 1번째(출고)에서 필수 값을 체크
    // 하기 때문에 여러개의 alert창이 필요가 없다.
    // 다만, 각각의 화면에서 물리적으로 조회 버튼을 클릭했을 때는 alert창이 보여야 한다.
    if (alertType !== null && alertType === 'alert') {
      msgBox({
        title:
          // getLang(null, 'A000000002') ||
          '선택된 센터와 거래처정보가 없습니다. (No vendor or warehouse master information selected.)',
        msg:
          // getLang(null, 'A000000003') ||
          '일반창고 > 환경설정 가서 거래처를 선택해주세요 (Please set it in the setting menu.)',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }

    return rtnValue;
  }
  return true;
};

const dmsValidCheckFunc = alertType => {
  const {dmsWhcode} = store.getState().global;
  const {dmsVendorcode} = store.getState().global;
  const rtnValue = false;

  let whCode = null;
  let vendorCode = null;

  whCode = _.get(dmsWhcode, 'WH_CODE', null);
  vendorCode = _.get(dmsVendorcode, 'VENDOR_CODE', null);

  if (whCode === null || vendorCode === null) {
    // alertType에 따라 alert문구가 보여질지 말지 결정
    // 즉, 메인 탭 화면 중 2번째(입고), 3번째(재고)화면이 처음 그려질 때 이미 1번째(출고)에서 필수 값을 체크
    // 하기 때문에 여러개의 alert창이 필요가 없다.
    // 다만, 각각의 화면에서 물리적으로 조회 버튼을 클릭했을 때는 alert창이 보여야 한다.
    if (alertType !== null && alertType === 'alert') {
      msgBox({
        title:
          // getLang(null, 'A000000002') ||
          '선택된 센터와 거래처정보가 없습니다. (No vendor or warehouse master information selected.)',
        msg:
          // getLang(null, 'A000000003') ||
          '일반창고 > 환경설정 가서 거래처를 선택해주세요 (Please set it in the setting menu.)',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }

    return rtnValue;
  }
  return true;
};

const playSound = type => {
  const {config} = store.getState().global;
  if (config.WMS_SOUND_YN || config.DMS_SOUND_YN) {
    if (config.WMS_SOUND_YN === 'Y' || config.DMS_SOUND_YN === 'Y') {
      if (type === 'successSound') {
        RNBeep.PlaySysSound(RNBeep.AndroidSoundIDs.TONE_CDMA_ABBR_INTERCEPT);
      } else {
        RNBeep.PlaySysSound(RNBeep.AndroidSoundIDs.TONE_CDMA_ALERT_INCALL_LITE);
      }
    }
  }
};

const playConfirmSound = type => {
  const {config} = store.getState().global;
  if (config.WMS_SOUND_YN || config.DMS_SOUND_YN) {
    if (config.WMS_SOUND_YN === 'Y' || config.DMS_SOUND_YN === 'Y') {
      if (type === 'successSound') {
        RNBeep.PlaySysSound(RNBeep.AndroidSoundIDs.TONE_SUP_CONFIRM);
      } else {
        RNBeep.PlaySysSound(
          RNBeep.AndroidSoundIDs.TONE_CDMA_EMERGENCY_RINGBACK,
        );
      }
    }
  }
};

const checkBarcode = refNo => {
  const {config} = store.getState().global;
  let result = null;
  if (refNo) {
    if (refNo.indexOf('IT') > -1) {
      result = 'REF';
    } else if (refNo.indexOf('PLT') > -1) {
      result = 'PLT';
    } else {
      result = 'LOC';
    }
    // 심플스캔일때는 SKIP처리
    if (config.WMS_SIMPLE_YN) {
      if (config.WMS_SIMPLE_YN === 'Y') {
        result = 'SIM';
      }
    }
  }
  return result;
};

const dmsCheckBarcode = refNo => {
  const {config} = store.getState().global;
  let result = null;
  if (refNo) {
    if (refNo.indexOf('PLT') > -1) {
      result = 'PLT';
    } else if (refNo.indexOf('BOX') > -1) {
      result = 'BOX';
    } else if (refNo.indexOf('ITEM') > -1) {
      result = 'ITEM';
    } else {
      result = 'DT';
    }
  }
  return result;
};

// 필터링 기능 (전체데이터, 검색데이터컬럼, 검색어)
const filterData = (totalData, searchColum, text) => {
  const searchText = text.toUpperCase();
  const seachData = totalData.filter(x => {
    if (x[searchColum].toUpperCase().indexOf(searchText) > -1) {
      return x;
    }
    return null;
  });

  return seachData;
};

// 문자를 대문자로 변환 및 특수문자 뒤부터 제거
const onlyBigChar = targetText => {
  let resultText = targetText.toUpperCase().trim();
  if (resultText.indexOf(';') > -1) {
    resultText = resultText.substr(0, resultText.indexOf(';'));
  }
  if (resultText.indexOf('+') > -1) {
    resultText = resultText.substr(0, resultText.indexOf('+'));
  }

  return resultText;
};

// url오픈
const openURL = url => {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log(`Don't know how to open URI: ${url}`);
    }
  });
};

// 분리된 일자 정보 (년, 월, 달, 시, 분, 초, 밀리초)
const getDividedDateSet = () => {
  const year = new Date().getFullYear(); // Current Year (YYYY)
  let month = new Date().getMonth() + 1; // Current Month (MM)
  if (month.toString().length === 1) {
    month = `0${month}`;
  }
  const day = new Date().getDate(); // Current Date (DD)
  const hour = new Date().getHours(); // Current Hours (HH24)
  const min = new Date().getMinutes(); // Current Minutes (MI)
  const sec = new Date().getSeconds(); // Current Seconds (SS)
  const mSec = new Date().getMilliseconds(); // Current MilliSecnonds (FF)

  return {year, month, day, hour, min, sec, mSec};
};

// 웹뷰 오픈
const openWebView = async props => {
  const {navigator} = store.getState().global;
  let id = null;
  let pw = null;
  await AsyncStorage.getItem('poneNo', (err, result) => {
    id = result;
  });
  await AsyncStorage.getItem('password', (err, result) => {
    pw = result;
  });

  navigator.showOverlay({
    component: {
      id: 'webview',
      name: 'com.layout.ComWebView',
      passProps: {
        mode: props.mode || '',
        source: props.source,
        onMessage: props.onMessage,
        onLoad: props.onLoad,
        id,
        pw,
      },
      options: {
        layout: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

// 이용 약관 동의
const TosBox = (useTermYN, personalTermYN) => {
  const {navigator} = store.getState().global;

  navigator.showOverlay({
    component: {
      name: 'common.TosBox',
      passProps: {
        useTermYN,
        personalTermYN,
        allTerm: useTermYN === 'Y' && personalTermYN === 'Y' ? 'Y' : 'N',
      },
      options: {
        layout: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        overlay: {
          interceptTouchOutside: true,
        },
      },
    },
  });
};

export default {
  getCode,
  pivotCode,
  pivotMsgId,
  getCodeOptions,
  getSelOption,
  openComboBox,
  openGridComboBox,
  openCalendar,
  openWriteBox,
  replaceAll,
  getLocation,
  getMultiText,
  isEmpty,
  parseLmenu,
  parseSmenu,
  toastMsg,
  tts,
  msgBox,
  flatListOnEndReached,
  getArrayData,
  formatNumber,
  formatDate,
  getDateValue,
  formatTime,
  checkEdit,
  makeRoomName,
  onCalling,
  openLoader,
  signBox,
  barcodeBox,
  imageBox,
  wmsValidCheckFunc,
  dmsValidCheckFunc,
  playSound,
  playConfirmSound,
  checkBarcode,
  filterData,
  onlyBigChar,
  openURL,
  dmsCheckBarcode,
  getDividedDateSet,
  openWebView,
  TosBox,
};
