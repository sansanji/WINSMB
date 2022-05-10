/* *
 * Import Common
 * */
import { Util } from 'libs';
// import store from 'libs/store';
/* *
 * Import node_modules
 * */
import UARTUsb from 'libs/uartUtil';
/*
 * 비콘 유틸 관련 라이브러리
 *
 */
this.result = '';
// 비콘 스캔 시작
const initUSB = async () => {
  await UARTUsb.initUART();
  console.log('usbUtil initUSB');
  // await this.startUSB();
};

const findUSB = async () => {
  await UARTUsb.onUSBResume();
};

const startUSB = async () => {
  UARTUsb.startUART();
  console.log('usbUtil startUSB');
};

// USB 값 가져오기
const getUsbResult = (callback) => {
  // 값을 가져올때 직접 안드로이드에서 리턴받아 가져와야할듯?? 아니면 모델로 셋팅.. JKM
  // usbUtil.startUSB()를 어떻게 자동으로 실행할지 componentDidMount에 넣으면 잘 안됨 ㅠㅠ
  // initUSBResult하며 값이 초기화 되야되는데 안됨 ㅠ
  UARTUsb.getUART((msg) => {
    console.log('getUsbResult error', msg);
    Util.toastMsg(`Error ${msg}`);
    if (callback) {
      callback(msg);
    }
  },
  (msg) => {
    Util.toastMsg(`Scanning... ${msg}`);
    console.log('getUsbResult success', msg);
    if (callback) {
      callback(msg);
    }
  });
};

// USB값 초기화
const initUsbResult = () => {
  UARTUsb.setUART();
  console.log('usbUtil initUsbResult');
};

const clearUsb = () => {
  UARTUsb.onUSBDestroy();
  console.log('usbUtil clearUsb');
};

export default {
  initUSB,
  findUSB,
  startUSB,
  getUsbResult,
  initUsbResult,
  clearUsb,
};
