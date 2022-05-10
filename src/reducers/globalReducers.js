import { combineReducers } from 'redux';
import themeLight from 'styles/theme-light-blue';

const themes = {
  light: themeLight,
};

const token = (state = null, action) => {
  switch (action.type) {
    case 'global.token.set':
      return action.token;
    default:
      return state;
  }
};

const config = (state = {}, action) => {
  switch (action.type) {
    case 'global.config.set':
      return action.config;
    default:
      return state;
  }
};

const navigator = (state = {}, action) => {
  switch (action.type) {
    case 'global.navigator.set':
      return action.navigator;
    default:
      return state;
  }
};

const theme = (state = themeLight, action) => {
  switch (action.type) {
    case 'global.theme.set':
      return themes[action.theme];
    default:
      return state;
  }
};

const commonCode = (state = {}, action) => {
  switch (action.type) {
    case 'global.commonCode.set':
      return action.commonCode;
    default:
      return state;
  }
};

const activeTab = (state = 0, action) => {
  switch (action.type) {
    case 'global.activeTab.set':
      return action.activeTab;
    default:
      return state;
  }
};

// getInit api로 부터 가져온 system setting 값을 저장하는 reducer
const varSetting = (state = {}, action) => {
  switch (action.type) {
    case 'global.varSetting.set':
      return action.setting;
    default:
      return state;
  }
};

// getInit api로 부터 가져온 variable setting 값을 저장하는 reducer
const sysSetting = (state = {}, action) => {
  switch (action.type) {
    case 'global.sysSetting.set':
      return action.setting;
    default:
      return state;
  }
};

// getInit api로 부터 가져온 session 값을 저장하는 reducer
// 채팅 같은 소켓통신을 할 때 해당로그인 한 유저의 session 정보를 전부 던짐
const session = (state = {}, action) => {
  switch (action.type) {
    case 'global.session.set':
      return action.session;
    default:
      return state;
  }
};

// getInit api로 부터 가져온 message(다국어) setting 값을 저장하는 reducer
const message = (state = {}, action) => {
  switch (action.type) {
    case 'global.message.set':
      return action.setting;
    default:
      return state;
  }
};

// getInit api로 부터 가져온 menu(메뉴) setting 값을 저장하는 reducer
const menu = (state = {}, action) => {
  switch (action.type) {
    case 'global.menu.set':
      return action.menu;
    default:
      return state;
  }
};

// getInit api로 부터 가져온 menu(메뉴) setting 값을 저장하는 reducer
const lmenu = (state = {}, action) => {
  switch (action.type) {
    case 'global.lmenu.set':
      return action.lmenu;
    default:
      return state;
  }
};

const location = (state = {}, action) => {
  switch (action.type) {
    case 'global.location.set':
      return {
        lat: action.lat,
        lon: action.lon,
        addr: action.addr, // 주속
        spd: action.spd, // 속도
        head: action.head, // 방향
        temp: action.temp, // 온도
        humi: action.humi, // 습도
        battery: action.battery, // 배터리
      };
    default:
      return state;
  }
};

const trnstatus = (state = '', action) => {
  switch (action.type) {
    case 'global.trnstatus.set':
      return action.trnstatus;
    default:
      return state;
  }
};

// WMS WH_CODE
const whcode = (state = '', action) => {
  switch (action.type) {
    case 'global.whcode.set':
      return action.whcode;
    default:
      return state;
  }
};

// WMS VENDOR_CODE
const vendorcode = (state = '', action) => {
  switch (action.type) {
    case 'global.vendorcode.set':
      return action.vendorcode;
    default:
      return state;
  }
};

// WMS WH_CODE
const dmsWhcode = (state = '', action) => {
  switch (action.type) {
    case 'global.dmsWhcode.set':
      return action.dmsWhcode;
    default:
      return state;
  }
};

// WMS VENDOR_CODE
const dmsVendorcode = (state = '', action) => {
  switch (action.type) {
    case 'global.dmsVendorcode.set':
      return action.dmsVendorcode;
    default:
      return state;
  }
};

// WMS VENDOR_CODE
const dmsStockVendorcode = (state = '', action) => {
  switch (action.type) {
    case 'global.dmsStockVendorcode.set':
      return action.dmsStockVendorcode;
    default:
      return state;
  }
};


export default combineReducers({
  token,
  config,
  navigator,
  theme,
  commonCode,
  activeTab,
  varSetting,
  sysSetting,
  session,
  message,
  menu,
  lmenu,
  location,
  trnstatus,
  whcode,
  vendorcode,
  dmsWhcode,
  dmsVendorcode,
  dmsStockVendorcode,
});
