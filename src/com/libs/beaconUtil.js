/* *
 * Import Common
 * */
import { DeviceEventEmitter, Platform } from 'react-native';
import store from 'libs/store';
import { Fetch } from 'libs';
// import store from 'libs/store';
/* *
 * Import node_modules
 * */
import Beacons from 'react-native-beacons-manager';
/*
 * 비콘 유틸 관련 라이브러리
 *
 */
this.APP_IDENTI = '';

this.temp = null;
this.humi = null;

// 배차가 없는 경우
this.tempNoTR = null;
this.humiNoTR = null;

this.ediCode = 'N';
// 장비마스터 API_CODE가 MB(휴대폰)일 경우에만 등록!!
this.apiCode = null;

const setBeaconData = (macAD, data) => {
  console.log('Beacon getter1', data);
  // 무조건 초기화
  if (data.beacons.length > 0) {
    data.beacons.forEach((bc) => {
      // mac 같을때만 값을 수집!
      if (bc.mac === macAD) {
        if (this.temp !== bc.temp || this.humi !== bc.humi) {
          console.log('Beacon getter Success!2', bc);
          this.temp = bc.temp;
          this.humi = bc.humi;
        }
        if (this.tempNoTR !== bc.temp || this.humiNoTR !== bc.humi) {
          console.log('Beacon getter Success!3', bc);
          this.tempNoTR = bc.temp;
          this.humiNoTR = bc.humi;
        }
      }
    });
  }
};

const setBeaconDataIOS = (uuid, data) => {
  console.log('Beacon getter1', data);
  //   major: 6490 159a
  // minor: 10546
  // 무조건 초기화
  if (data.beacons.length > 0) {
    data.beacons.forEach((bc) => {
      // mac 같을때만 값을 수집!
      // const tempTen = bc.major;
      // const humiTen = bc.minor;

      if (bc.uuid === uuid) {
        const tempST = bc.major.toString(16);
        const humiST = bc.minor.toString(16);
        const temp1 = tempST.substr(0, 2);
        const temp2 = tempST.substr(2, 2);
        const humi1 = humiST.substr(0, 2);
        const humi2 = humiST.substr(2, 2);

        const tempF1 = parseInt(temp1, 16) || 0;
        const tempF2 = parseInt(temp2, 16) || 0;
        const humiF1 = parseInt(humi1, 16) || 0;
        const humiF2 = parseInt(humi2, 16) || 0;

        let temp = 0;
        let humi = 0;

        if (tempF2 > 99) {
          temp = `-${tempF1}.${255 - tempF2}`;
        } else {
          temp = `${tempF1}.${tempF2}`;
        }

        if (humiF2 > 99) {
          humi = `-${humiF1}.${255 - humiF2}`;
        } else {
          humi = `${humiF1}.${humiF2}`;
        }
        if (this.temp !== temp || this.humi !== humi) {
          console.log('IOS Beacon getter Success!2', bc);
          this.temp = temp;
          this.humi = humi;
        }
        if (this.tempNoTR !== temp || this.humiNoTR !== humi) {
          console.log('IOS Beacon getter Success!3', bc);
          this.tempNoTR = temp;
          this.humiNoTR = humi;
        }
      }
    });
  }
};

// 비콘 스캔 시작
const startBeacon = async () => {
  const { session } = store.getState().global;
  const result = await Fetch.request('GPS000000SVC', 'getCarDevice', {
    body: JSON.stringify({
      GPS000000F1: {
        CAR_NO: session.EMP_ID || session.USER_ID,
      },
    }),
  });

  // 장비관리의 EDI CODE 셋팅
  if (result.GPS000000F1.EDI_CODE) {
    this.ediCode = result.GPS000000F1.EDI_CODE;
  }

  // 장비관리의 API CODE 셋팅
  if (result.GPS000000F1.API_CODE) {
    this.apiCode = result.GPS000000F1.API_CODE;
  }

  // 어떤 비콘을 쓸 것인지 MobileIdent가 장비관리에 등록되어 있을때만 비콘 실행..
  if (result.GPS000000F1.APP_IDENTI) {
    this.APP_IDENTI = result.GPS000000F1.APP_IDENTI;
    if (Platform.OS === 'android') {
      await Beacons.detectIBeacons();
      try {
        await Beacons.startRangingBeaconsInRegion('G1MB');
        console.log('Beacons ranging started succesfully!');
      } catch (err) {
        await Beacons.startRangingBeaconsInRegion('G1MB');
        console.log(`Beacons ranging not started, error: ${err}`);
      }
      // DeviceEventEmitter.removeAllListeners();
      DeviceEventEmitter.addListener(
        'beaconsDidRange',
        (data) => {
          setBeaconData(result.GPS000000F1.APP_IDENTI, data);
        },
      );
    } else {
      const region = {
        identifier: 'G1MB',
        // uuid: '696E6E6F-6261-7365-0531-0108003C004B',
        uuid: result.GPS000000F1.APP_IDENTI,
      };
      // IOS는 권한도필요하고 UUID도 필요하고...

      // Request for authorization while the app is open
      Beacons.requestWhenInUseAuthorization();

      // Beacons.startMonitoringForRegion(region);
      Beacons.startRangingBeaconsInRegion(region);

      // Beacons.startUpdatingLocation();
      // Listen for beacon changes
      Beacons.BeaconsEventEmitter.addListener('beaconsDidRange',
        (data) => {
          setBeaconDataIOS(result.GPS000000F1.APP_IDENTI, data);
          // data.region - The current region
          // data.region.identifier
          // data.region.uuid

          // data.beacons - Array of all beacons inside a region
          //  in the following structure:
          //    .uuid
          //    .major - The major version of a beacon
          //    .minor - The minor version of a beacon
          //    .rssi - Signal strength: RSSI value (between -100 and 0)
          //    .proximity - Proximity value, can either be "unknown", "far", "near" or "immediate"
          //    .accuracy - The accuracy of a beacon
        });
    }
  }
};

// 비콘 스캔 정지
const stopBeacon = () => {
  if (Platform.OS === 'android') {
    try {
      DeviceEventEmitter.removeAllListeners();
      Beacons.stopRangingBeaconsInRegion('G1MB');
      console.log('Beacons ranging stoped!');
    } catch (err) {
      console.log(`Beacons ranging not stoped, error: ${err}`);
    }
  } else {
    /*
    try {
      Beacons.stopRangingBeaconsInRegion(this.state.region);
      console.log('Beacons ranging stoped!');
    } catch (err) {
      console.log(`Beacons ranging not stoped, error: ${err}`);
    }
    */
  }
};


// 비콘 값 가져오기
const getBeaconData = () => ({
  temp: this.temp,
  humi: this.humi,
  tempNoTR: this.tempNoTR,
  humiNoTR: this.humiNoTR,
  ediCode: this.ediCode,
  apiCode: this.apiCode,
});

// 비콘 값 가져오기
const getAppIdenti = () => (this.APP_IDENTI);

// 비콘 값 초기화
const initBeaconData = () => {
  this.temp = null;
  this.humi = null;
};

// 배차없는 비콘 값 초기화
const initBeaconDataNoTR = () => {
  this.tempNoTR = null;
  this.humiNoTR = null;
};

export default {
  startBeacon,
  stopBeacon,
  getBeaconData,
  initBeaconData,
  initBeaconDataNoTR,
  getAppIdenti,
};
