/*
 * A smart barcode scanner for react-native apps
 * https://github.com/react-native-component/react-native-smart-barcode/
 * Released under the MIT license
 * Copyright (c) 2016 react-native-component <moonsunfall@aliyun.com>
 */

import React, { Component } from 'react';
import { View, requireNativeComponent, NativeModules, AppState, Platform } from 'react-native';

const BarcodeManager = Platform.OS == 'ios' ? NativeModules.Barcode : NativeModules.CaptureModule;

class Barcode extends Component {
  static defaultProps = {
    barCodeTypes:
      Platform.OS == 'ios'
        ? Object.values(BarcodeManager.barCodeTypes)
        : [
          'AZTEC',
          'CODABAR',
          'CODE_39',
          'CODE_93',
          'CODE_128',
          'DATA_MATRIX',
          'EAN_8',
          'EAN_13',
          'ITF',
          'MAXICODE',
          'PDF_417',
          'QR_CODE',
          'RSS_14',
          'RSS_EXPANDED',
          'UPC_A',
          'UPC_E',
          'UPC_EAN_EXTENSION',
        ],
    scannerRectWidth: 255,
    scannerRectHeight: 70,
    scannerRectTop: 0,
    scannerRectLeft: 0,
    scannerLineInterval: 0,
    scannerRectCornerColor: '#09BB0D',
  };

  // static propTypes = {
  //   ...View.propTypes,
  //   onBarCodeRead: PropTypes.func.isRequired,
  //   barCodeTypes: PropTypes.array,
  //   scannerRectWidth: PropTypes.number,
  //   scannerRectHeight: PropTypes.number,
  //   scannerRectTop: PropTypes.number,
  //   scannerRectLeft: PropTypes.number,
  //   scannerLineInterval: PropTypes.number,
  //   scannerRectCornerColor: PropTypes.string,
  // };

  render() {
    return <NativeBarCode {...this.props} />;
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  startScan() {
    BarcodeManager.startSession();
  }

  stopScan() {
    BarcodeManager.stopSession();
  }

  _handleAppStateChange = currentAppState => {
    if (currentAppState !== 'active') {
      this.stopScan();
    } else {
      this.startScan();
    }
  };
}
const NativeBarCode = requireNativeComponent(
  Platform.OS === 'ios' ? 'RCTBarcode' : 'CaptureView',
  Barcode,
);
export default Barcode;
