/* *
 * Import Common
 * */
import {Alert, AsyncStorage, Keyboard} from 'react-native';
import {_, ReduxStore} from 'libs';
import Util from 'libs/util';
import env from 'libs/env';
/* *
 * Import node_modules
 * */
import Cookie from 'react-native-cookie';
import loginScreen from 'src/login';
// import pinch from 'react-native-pinch';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
const fetchHttp = envConfig.fetchHttp;
// const fetchHttps = envConfig.fetchHttps;
/* *
 * 통신관련 라이브러리
 * */

const request = (code, method, config, toastYN, dissKeyboard) => {
  if (fetchURL.indexOf('https') > -1) {
    return requestHttps(code, method, config, toastYN, dissKeyboard);
  }
  return requestHttp(code, method, config, toastYN, dissKeyboard);
};

const requestApicall = async (code, method, config, toastYN, dissKeyboard) => {
  if (fetchURL.indexOf('https') > -1) {
    return requestApicallHttps(code, method, config, toastYN, dissKeyboard);
  }
  return requestApicallHttp(code, method, config, toastYN, dissKeyboard);
};

const token = () => {
  if (fetchURL.indexOf('https') > -1) {
    return tokenHttps();
  }
  return tokenHttp();
};

const login = (csrf, id, password) => {
  if (fetchURL.indexOf('https') > -1) {
    return loginHttps(csrf, id, password);
  }
  return loginHttp(csrf, id, password);
};

const logout = () => {
  if (fetchURL.indexOf('https') > -1) {
    return logoutHttps();
  }
  return logoutHttp();
};

//* ************************* Http 메소드 시작 **********************************/
const requestHttp = async (code, method, config, toastYN, dissKeyboard) => {
  try {
    // 기본은 키보드 닫기, dissKeyboard가 false라면 그래도 두기.
    if (Util.isEmpty(dissKeyboard) || dissKeyboard) {
      Keyboard.dismiss(); // 키보드 닫기!
    }
    Cookie.clear();
    const response = await fetch(`${fetchURL}/api/${code}/${method}`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': globalThis.gToken,
        Accept: 'application/json',
        AJAX: true,
        Cookie: globalThis.gCookie,
        'User-Agent': 'okhttp/3.4.1',
        'Content-Type': 'application/json;charset=UTF-8',
        credentials: 'omit',
        // withCredentials: true,
      },
      body: config.body || null,
    });

    // console.log('fetch config', `${fetchURL}/api/${code}/${method}`, config);
    const responseJson = await response.json();
    console.log(
      'fetch end',
      `${fetchURL}/api/${code}/${method}`,
      config,
      responseJson,
    );
    const msg = _.get(responseJson, 'MSG');
    const type1 = _.get(responseJson, 'TYPE');

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(msg)) {
      Util.toastMsg(msg);
    }

    if (_.has(responseJson, 'TYPE')) {
      const type = _.get(responseJson, 'TYPE');
      console.log(`Jay Type${type}`);
      if (type === 200111 || type === 200130 || type === 403) {
        // await AsyncStorage.removeItem('token');
        // await AsyncStorage.removeItem('cookie');
        return;
      }
    }
    return responseJson;
  } catch (error) {
    console.error(error);

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(error)) {
      Util.toastMsg(error);
    }
  }
};

const requestApicallHttp = async (
  code,
  method,
  config,
  toastYN,
  dissKeyboard,
) => {
  try {
    // 기본은 키보드 닫기, dissKeyboard가 false라면 그래도 두기.
    if (Util.isEmpty(dissKeyboard) || dissKeyboard) {
      Keyboard.dismiss(); // 키보드 닫기!
    }
    Cookie.clear();
    const response = await fetch(`${fetchURL}/api/${code}/${method}`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': globalThis.gToken,
        Accept: 'application/json',
        AJAX: true,
        Cookie: globalThis.gCookie,
        'User-Agent': 'okhttp/3.4.1',
        'Content-Type': 'application/json;charset=UTF-8',
        credentials: 'omit',
        // withCredentials: true,
        LICENSE_HTNSAPI_KEY: '4owYJ9k53GKgYGdvg2wnaw',
      },
      body: config.body || null,
    });

    // console.log('fetch config', `${fetchURL}/api/${code}/${method}`, config);
    const responseJson = await response.json();
    console.log(
      'fetch end',
      `${fetchURL}/api/${code}/${method}`,
      config,
      responseJson,
    );
    const msg = _.get(responseJson, 'MSG');
    const type1 = _.get(responseJson, 'TYPE');

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(msg)) {
      Util.toastMsg(msg);
    }

    if (_.has(responseJson, 'TYPE')) {
      const type = _.get(responseJson, 'TYPE');
      console.log(`Jay Type${type}`);
      if (type === 200111 || type === 200130 || type === 403) {
        // await AsyncStorage.removeItem('token');
        // await AsyncStorage.removeItem('cookie');
        return;
      }
    }
    return responseJson;
  } catch (error) {
    console.error(error);

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(error)) {
      Util.toastMsg(error);
    }
  }
};

const tokenHttp = async () => {
  try {
    this.localcookie = null;
    await AsyncStorage.getItem('cookie', (err, result) => {
      if (result) {
        this.localcookie = result;
      }
    });
    // 거짓 데이터를 토큰을 발급받기 위해 보낸다.
    // 제대로 처리가 이루어져도 아래와 같은 에러를 발생한다.
    // Invalid CSRF Token 'Global No1 HTNS' was found on …quest parameter '_csrf' or header 'X-CSRF-TOKEN'.

    const response = await fetch(`${fetchURL}/htns_sec`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': 'Global No1 HTNS',
        AJAX: true,
        Cookie: this.localcookie,
        'User-Agent': 'okhttp/3.4.1',
        credentials: 'omit',
      },
      body: 'USER_ID=tokenfix&PW=tokenfix',
    });
    const responseJson = await response.json();
    console.log('loginToken', response, responseJson);
    return responseJson;
  } catch (error) {
    Alert.alert(
      '인터넷 연결 확인',
      'Network request failed',
      [{text: '확인'}],
      {
        cancelable: false,
      },
    );
    return false;
  }
};

const loginHttp = async (csrf, id, password) => {
  // ! * ' ( ) ; : @ & = + $ , / ? # [ ]
  // GET 방식으로 파라미터 전달시 &와 + 기호는 전달되지 않는다.
  // 로컬에서 데이터를 전달하는 시점에 + 기호를 공백으로 변경하여 전달한다.
  // 출처: https://118k.tistory.com/42 [개발자로 살아남기]
  const sBody = `_csrf=${csrf}&USER_ID=${id}&PW=${encodeURIComponent(
    password,
  )}&_spring_security_remember_me=${false}`;
  try {
    const response = await fetch(`${fetchURL}/htns_sec`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': csrf,
        AJAX: true,
        Cookie: globalThis.gCookie, // ios 토근 오류로 인해 주석처리!
        'User-Agent': 'okhttp/3.4.1',
        credentials: 'omit',
      },
      body: sBody,
    });

    await AsyncStorage.setItem(
      'cookie',
      response.headers.get('set-cookie').toString(),
    );
    // NOTE: DEBUG
    const responseJson = await response.json();
    console.log('login', response, responseJson);
    const resCookie = await _.get(responseJson, 'SetCookie');

    // 이상하게 response 헤더 cookie값이 짤려서 강제로 넣음 로컬 환경에서는 넣지 않는다.
    if (
      resCookie &&
      (fetchURL.indexOf('192') > 0 || fetchURL.indexOf('172') > 0)
    ) {
      await AsyncStorage.setItem('cookie', resCookie);
    }

    const resToken = _.get(responseJson, 'signaldata.X-CSRF-TOKEN');
    await AsyncStorage.setItem('token', resToken);

    globalThis.gToken = resToken;
    globalThis.gCookie = response.headers.get('set-cookie').toString();
    // globalThis.gCookie = resCookie;
    console.log(`JAY FINAL TOKEN = ${globalThis.gToken}`);
    console.log(`JAY FINAL COOKIE = ${globalThis.gCookie}`);
    return responseJson;
  } catch (error) {
    Alert.alert(
      '인터넷 연결 확인',
      `Network request failed${error}`,
      [{text: '확인'}],
      {
        cancelable: false,
      },
    );
    return false;
  }
};

const logoutHttp = async () => {
  console.log('fetch-log', 'logout', `${fetchURL}/j_spring_security_logout`);
  try {
    const response = await fetch(`${fetchURL}/j_spring_security_logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': globalThis.gToken,
        AJAX: true,
        Cookie: globalThis.gCookie,
      },
    });

    const responseJson = await response.json();
    await AsyncStorage.removeItem('cookie');
    await AsyncStorage.removeItem('token');
    loginScreen();
    console.log('fetch-log', 'logout', 'result', responseJson);
    // 세션강제해제
    // const { phoneno } = ReduxStore.getState().phone;
    // const response2 = await fetch(`${fetchURL}/api/apicall/forceLogOut/${phoneno}/${phoneno}`);
    // return responseJson;
  } catch (error) {
    console.error(error);
  }
};
//* ************************* Http 메소드 끝 **********************************/

//* ************************* Https 메소드 시작 *****************************/
const requestHttps = async (code, method, config, toastYN, dissKeyboard) => {
  try {
    // 기본은 키보드 닫기, dissKeyboard가 false라면 그래도 두기.
    if (Util.isEmpty(dissKeyboard) || dissKeyboard) {
      Keyboard.dismiss(); // 키보드 닫기!
    }

    // Keyboard.dismiss(); // 키보드 닫기!
    Cookie.clear();
    const response = await fetch(`${fetchURL}/api/${code}/${method}`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': globalThis.gToken,
        Accept: 'application/json',
        AJAX: 'true',
        Cookie: globalThis.gCookie,
        'User-Agent': 'okhttp/3.4.1',
        'Content-Type': 'application/json;charset=UTF-8',
        credentials: 'omit',
        // withCredentials: true,
      },
      body: config.body || null,
      sslPinning: {
        cert: 'mycert', // cert file name without the `.cer`
      },
    });

    // console.log('fetch start', `${fetchURL}/api/${code}/${method}`, config, response);

    const responseJson = await response.json();
    console.log(
      'fetch end',
      `${fetchURL}/api/${code}/${method}`,
      config,
      responseJson,
    );
    const msg = _.get(responseJson, 'MSG');
    const type1 = _.get(responseJson, 'TYPE');

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(msg)) {
      Util.toastMsg(msg);
    }

    if (_.has(responseJson, 'TYPE')) {
      const type = _.get(responseJson, 'TYPE');
      console.log(`Jay Type${type}`);
      if (type === 200111 || type === 200130 || type === 403) {
        // await AsyncStorage.removeItem('token');
        // await AsyncStorage.removeItem('cookie');
        return;
      }
    }
    return responseJson;
  } catch (error) {
    console.error(error);

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(error)) {
      Util.toastMsg(error);
    }
  }
};

// G1 OpenApi 호출!
const requestApicallHttps = async (
  code,
  method,
  config,
  toastYN,
  dissKeyboard,
) => {
  try {
    // 기본은 키보드 닫기, dissKeyboard가 false라면 그래도 두기.
    if (Util.isEmpty(dissKeyboard) || dissKeyboard) {
      Keyboard.dismiss(); // 키보드 닫기!
    }
    Cookie.clear();
    const response = await fetch(`${fetchURL}/api/${code}/${method}`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': globalThis.gToken,
        Accept: 'application/json',
        AJAX: 'true',
        Cookie: globalThis.gCookie,
        'User-Agent': 'okhttp/3.4.1',
        'Content-Type': 'application/json;charset=UTF-8',
        credentials: 'omit',
        // withCredentials: true,
        LICENSE_HTNSAPI_KEY: '4owYJ9k53GKgYGdvg2wnaw',
      },
      body: config.body || null,
      sslPinning: {
        cert: 'mycert', // cert file name without the `.cer`
      },
    });

    // console.log('fetch config', `${fetchURL}/api/${code}/${method}`, config);
    const responseJson = await response.json();
    console.log(
      'fetch end',
      `${fetchURL}/api/${code}/${method}`,
      config,
      responseJson,
    );
    const msg = _.get(responseJson, 'MSG');
    const type1 = _.get(responseJson, 'TYPE');

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(msg)) {
      Util.toastMsg(msg);
    }

    if (_.has(responseJson, 'TYPE')) {
      const type = _.get(responseJson, 'TYPE');
      console.log(`Jay Type${type}`);
      if (type === 200111 || type === 200130 || type === 403) {
        // await AsyncStorage.removeItem('token');
        // await AsyncStorage.removeItem('cookie');
        return;
      }
    }
    return responseJson;
  } catch (error) {
    console.error(error);

    // toastYN : true 일 경우 처리 토스트 메시지 처리!
    if (toastYN && !Util.isEmpty(error)) {
      Util.toastMsg(error);
    }
  }
};

const tokenHttps = async () => {
  try {
    this.localcookie = null;
    await AsyncStorage.getItem('cookie', (err, result) => {
      if (result) {
        this.localcookie = result;
      }
    });
    // 거짓 데이터를 토큰을 발급받기 위해 보낸다.
    // 제대로 처리가 이루어져도 아래와 같은 에러를 발생한다.
    // Invalid CSRF Token 'Global No1 HTNS' was found on …quest parameter '_csrf' or header 'X-CSRF-TOKEN'.
    const response = await fetch(`${fetchURL}/htns_sec`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': 'Global No1 HTNS',
        AJAX: 'true',
        Cookie: this.localcookie || '',
        'User-Agent': 'okhttp/3.4.1',
        credentials: 'omit',
      },
      body: 'USER_ID=tokenfix&PW=tokenfix',
      sslPinning: {
        cert: 'mycert', // cert file name without the `.cer`
      },
    });
    const responseJson = await response.json();
    console.log('loginToken', response, responseJson);
    return responseJson;
  } catch (error) {
    Alert.alert(
      '인터넷 연결 확인',
      'Network request failed',
      [{text: '확인'}],
      {
        cancelable: false,
      },
    );
    return false;
  }
};

const loginHttps = async (csrf, id, password) => {
  // ! * ' ( ) ; : @ & = + $ , / ? # [ ]
  // GET 방식으로 파라미터 전달시 &와 + 기호는 전달되지 않는다.
  // 로컬에서 데이터를 전달하는 시점에 + 기호를 공백으로 변경하여 전달한다.
  // 출처: https://118k.tistory.com/42 [개발자로 살아남기]
  const sBody = `_csrf=${csrf}&USER_ID=${id}&PW=${encodeURIComponent(
    password,
  )}&_spring_security_remember_me=${false}`;
  try {
    const response = await fetch(`${fetchURL}/htns_sec`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': csrf,
        AJAX: true,
        Cookie: globalThis.gCookie, // ios 토근 오류로 인해 주석처리!
        'User-Agent': 'okhttp/3.4.1',
        credentials: 'omit',
      },
      body: sBody,
      sslPinning: {
        cert: 'mycert', // cert file name without the `.cer`
      },
    });
    // Util.toastMsg('resToken :::: '+response.headers.get('set-cookie').toString())
    // console.log('response :::: ', response.headers.get('set-cookie').toString())
    await AsyncStorage.setItem(
      'cookie',
      response.headers.get('set-cookie').toString(),
    );
    // NOTE: DEBUG
    const responseJson = await response.json();
    const resCookie = await _.get(responseJson, 'SetCookie');
    // 이상하게 response 헤더 cookie값이 짤려서 강제로 넣음 로컬 환경에서는 넣지 않는다.
    if (
      resCookie &&
      (fetchURL.indexOf('192') > 0 || fetchURL.indexOf('172') > 0)
    ) {
      await AsyncStorage.setItem('cookie', resCookie);
    }

    const resToken = _.get(responseJson, 'signaldata.X-CSRF-TOKEN');
    await AsyncStorage.setItem('token', resToken);

    globalThis.gToken = resToken;
    globalThis.gCookie = response.headers.get('set-cookie').toString();

    // globalThis.gCookie = resCookie;
    if (
      globalThis.gCookie.indexOf('JSESSIONID') < 0 &&
      responseJson.sessionId
    ) {
      globalThis.gCookie =
        'X-CSRF-TOKEN=' +
        globalThis.gToken +
        '; Path=/;JSESSIONID=' +
        responseJson.sessionId.substr(
          responseJson.sessionId.indexOf('SessionId: ') + 11,
        ) +
        '; Path=/; ' +
        globalThis.gCookie;
      await AsyncStorage.setItem('cookie', globalThis.gCookie);
    }

    return responseJson;
  } catch (error) {
    Alert.alert(
      '인터넷 연결 확인',
      `Network request failed${error}`,
      [{text: '확인'}],
      {
        cancelable: false,
      },
    );
    return false;
  }
};

const logoutHttps = async () => {
  console.log('fetch-log', 'logout', `${fetchURL}/j_spring_security_logout`);
  try {
    const response = await fetch(`${fetchURL}/j_spring_security_logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-CSRF-TOKEN': globalThis.gToken,
        AJAX: true,
        Cookie: globalThis.gCookie,
      },
      sslPinning: {
        cert: 'mycert', // cert file name without the `.cer`
      },
    });

    const responseJson = await response.json();
    await AsyncStorage.removeItem('cookie');
    await AsyncStorage.removeItem('token');
    loginScreen();
    console.log('fetch-log', 'logout', 'result', responseJson);
    // 세션강제해제
    // const { phoneno } = ReduxStore.getState().phone;
    // const response2 = await fetch(`${fetchURL}/api/apicall/forceLogOut/${phoneno}/${phoneno}`);
    // return responseJson;
  } catch (error) {
    console.error(error);
  }
};

//* ************************* Https 메소드 끝 *****************************/

const forceLogout = async (phoneno, password) => {
  console.log(
    'fetch-log',
    'forceLogout',
    `${fetchURL}/api/apicall/forceLogOut/${phoneno}/${encodeURIComponent(
      password,
    )}`,
  );

  const response = await fetch(
    `${fetchURL}/api/apicall/forceLogOut/${phoneno}/${encodeURIComponent(
      password,
    )}`,
  );
  console.log('fetch-log', 'forceLogout', 'result', response);

  return response;
};

// const fetchCommonCode = async () => {
//   const result = await request('CTM010301', 'getCtmCode', {
//     body: JSON.stringify({
//       groupCode: 'WMS',
//     }),
//   });

//   return result;
// };

const fetchCommonCode = async (groupCode, SQL) => {
  const result = await request('COM050101SVC', 'getCode', {
    body: JSON.stringify({
      groupCode,
      SQL,
    }),
  });

  return result;
};

// const fetchConfig = async () => {
//   const result = await request('CTM040107', 'get', {
//     body: JSON.stringify({
//       CTM040107F1: {},
//     }),
//   });

//   return result;
// };

// VTX010101SVC/appUserToken';
const updatePushToken = async mobileToken => {
  const result = await request('VTX010101SVC', 'appUserToken', {
    body: JSON.stringify({
      APP_ID: 'G1MB',
      MOBILE_TOKEN: mobileToken,
    }),
  });

  return result;
};

const searchAddress = async keyword => {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
      keyword,
    )}`,
    {
      method: 'POST',
      headers: {
        Authorization: 'KakaoAK fa351f0d00e6c388a45a0b1ee164fdbc',
      },
    },
  );
  const responseJson = await response.json();
  return responseJson;
};

// const geo2addr = async (lat, lon) => {
//   const response = await fetch(
//     `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lon}&y=${lat}`,
//     {
//       method: 'POST',
//       headers: {
//         Authorization: 'KakaoAK fa351f0d00e6c388a45a0b1ee164fdbc',
//       },
//     },
//   );
//   const responseJson = await response.json();

//   return responseJson;
// };

// const geo2addr = async (lat, lon) => {
//   const response = await fetch(
//     'https://openapi.naver.com/v1/map/reversegeocode?query=127.09333169641359,37.16523607064404&encoding=utf-8&coordType=latlng&callback=json',
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Naver-Client-Id': 'uJy5nkLQbNCgcfJbGIpH',
//         'X-Naver-Client-Secret': 'WkuoOpnRlS',
//         Accept: '*/*',
//         HOST: 'openapi.naver.com',
//         'User-Agent': 'curl/7.43.0',
//       },
//     },
//   );
//   debugger;
//   const responseJson = await response.json();
//   return responseJson;
// };

// const geo2addr = async (lat, lon) => {
//   debugger;
//   const result = await request('CTM030110', 'getGeo', {
//     body: JSON.stringify({
//       CTM030110F1: {
//         ADDRESS: '경기도 화성시 동탄면 송리 456',
//       },
//     }),
//   });
//   debugger;
//   return result;
// };

// naver api 호출 G1 서비스를 호출하여 결과 값을 가져온다.
const geo2addr = async (lat, lon) => {
  const result = await request('CTM030110SVC', 'getReverseGeo', {
    body: JSON.stringify({
      CTM030110F1: {
        LATITUDE: lat,
        LONGITUDE: lon,
      },
    }),
  });

  return result;
};

const getWhether = async (lat, lon) => {
  try {
    const response = await fetch(
      `http://apis.skplanetx.com/gweather/current?version=1&lat=${lat}&lon=${lon}&units=celsius&timezone=utc`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          AppKey: '41388188-7de5-3283-a902-7afef3dab56c',
        },
      },
    );
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const getSunData = async (lat, lon) => {
  const result = await getWhether(lat, lon);
  return _.get(result, 'gweather.current[0].sun');
};

const getInit = async () => {
  const result = await request('G1E000000SVC', 'getInitG1M', {
    body: JSON.stringify({
      WINS: {},
    }),
  });

  // 모바일 버전에서도 G1 My Cloud 채팅방을 만든다. (촤초 로그인 시 한버만 실행된다!)
  // (이유: 기존 Web버전에서 최초 로그인 시 생성이 되지만, Web버전에서 한번도 접속하지 않고 모바일버전에서 로그인 시
  //       G1 My Cloud 채팅방에 생성이 되지 않는 문제가 발생하기 때문에 추가한다.)
  if (!Util.isEmpty(result.data.session.USER_ID)) {
    const resultCloudRoom = await request('VTX010101SVC', 'postRoomAndMemb', {
      body: JSON.stringify({
        ROOM_ID: result.data.session.USER_ID,
      }),
    });
    console.log('resultCloudRoom', resultCloudRoom);
  }

  return result;
};

const getInitWins = async () => {
  const result = await request('G1E000000SVC', 'getInit', {});
  return result;
};

const getLang = async P_USER_LANG => {
  const result = await request('G1E000000SVC', 'getMobileMsg', {
    body: JSON.stringify({
      P_USER_LANG,
    }),
  });

  // 모바일 버전에서도 G1 My Cloud 채팅방을 만든다. (촤초 로그인 시 한버만 실행된다!)
  // (이유: 기존 Web버전에서 최초 로그인 시 생성이 되지만, Web버전에서 한번도 접속하지 않고 모바일버전에서 로그인 시
  //       G1 My Cloud 채팅방에 생성이 되지 않는 문제가 발생하기 때문에 추가한다.)
  if (!Util.isEmpty(result.data.lang)) {
    ReduxStore.dispatch({
      type: 'global.message.set',
      setting: Util.pivotMsgId(_.get(result, 'data.lang', {})),
    });
    Util.toastMsg('Language Update Success!');
  } else {
    Util.toastMsg('Language Update Fail!');
  }

  return result;
};

const getTrnStatus = async () => {
  const result = await request('TMS010101SVC', 'getTMTrcStatus', {
    body: JSON.stringify({
      TMS010101F1: {},
    }),
  });
  return result;
};

const getZoneValid = async (whCode, location, zoneCode) => {
  let rtnValue = 'N';

  const resultLoc = await request('WMS010205SVC', 'getZoneValid', {
    body: JSON.stringify({
      WMS010205F1: {
        WH_CODE: whCode,
        LOCATION: location,
        ZONE_CODE: zoneCode,
      },
    }),
  });

  if (resultLoc.TYPE === 1) {
    rtnValue = resultLoc.WMS010205F1.rtnValue;
  } else {
    rtnValue = 'N';
  }

  return rtnValue;
};

export default {
  request,
  requestApicall,
  fetchHttp,
  fetchURL,
  token,
  login,
  logout,
  forceLogout,
  fetchCommonCode,
  // fetchConfig,
  searchAddress,
  geo2addr,
  updatePushToken,
  getInit,
  getInitWins,
  getTrnStatus,
  getWhether,
  getSunData,
  getLang,
  getZoneValid,
};
