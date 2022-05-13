/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Keyboard, Vibration } from 'react-native';
import {
  _,
  React,
  Util,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  ReduxStore,
  bluecolor,
  modelUtil,
} from 'libs';
import { HBaseView, Touchable, HButton, HIcon, HTexttitle, HCombobox } from 'ux';

/**
 * 위치이동
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100602');
    this.state = {
      GR_NO: null,
      VENDOR_NAME: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      spinner: false,
      barcodeData1: null,
      scanVaildData: null,
      barcodeStatus: null,
      data: null,
    };
    modelUtil.setModelData('DMS100602', { CHANGE_TYPE: 'REMARKS', CHANGE_TYPE_NAME: 'Remarks' });
  }

  async componentWillMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  componentDidMount() {
    const { SCAN_NO } = this.props;
    if (SCAN_NO) {
      this.focusNextField(SCAN_NO);
    }
  }

  async fetch(barcode1Data) {
    const blockDup = this.props.global.config.DMS_BLOCK_DUP;
    const { config } = ReduxStore.getState().global;
    const changeType = modelUtil.getValue('DMS100602.CHANGE_TYPE');
    let tabCode = null;
    Vibration.vibrate(500);
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    // const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);
    // const vendorPlantCode = _.get(this.props.global,
    // 'dmsVendorcode.VENDOR_PLANT_CODE', null); barcode1Data = 'ITWH13180329000221';
    if (this.state.data != null) {
      // tabCode가 GR_DT일 경우 로케이션 중복검사를 하지않는다.M_GR_DT은 중복검사한다.
      // 상세인지 세부상세인지 STK_NO의 유무를 보고 판단
      if (this.state.data[0].TYPE === 'DT') {
        tabCode = 'DT';
      } else if (this.state.data[0].TYPE === 'PLT') {
        tabCode = 'PLT';
      } else if (this.state.data[0].TYPE === 'BOX') {
        tabCode = 'BOX';
      } else if (this.state.data[0].TYPE === 'ITM') {
        tabCode = 'ITEM';
      }

      // 스캔된재고아이템에 로케이션 등록
      this.state.data[0][changeType] = barcode1Data;
      if (barcode1Data !== null && barcode1Data !== '') {
        if (
          Util.dmsCheckBarcode(barcode1Data) === 'ITEM' ||
          Util.dmsCheckBarcode(barcode1Data) === 'PLT' ||
          Util.dmsCheckBarcode(barcode1Data) === 'BOX'
        ) {
          // 스캔 실패한 경우
          this.deleteLoc(
            `Please scan ${modelUtil.getValue('DMS100602.CHANGE_TYPE_NAME')} Barcord.`,
          );
          this.failScan();
          return;
        }
      }

      // Location format 체크로직
      if (changeType === 'LOCATION') {
        if (barcode1Data.indexOf('-') < 1 || barcode1Data.length !== 9) {
          this.deleteLoc('Please scan Correct Location format');
          this.failScan();
          return;
        }

        if (barcode1Data.substr(3, 1) !== '-' || barcode1Data.substr(6, 1) !== '-') {
          this.deleteLoc('Please scan Correct Location format');
          this.failScan();
          return;
        }
      }
      // 타입별로 저장하는 컬럼을 변경
      let reqService = 'saveLocOld';
      if (changeType === 'DOC_NO') {
        reqService = 'saveDoc';
      }
      if (changeType === 'REMARKS') {
        reqService = 'saveRemarks';
      }

      const result = await Fetch.request('DMS030510SVC', reqService, {
        body: JSON.stringify({
          DMS030510F1: {
            WH_CODE: whCode,
            TAB_CODE: tabCode,
            CHANGE_TYPE: changeType,
            DMS_BLOCK_DUP: blockDup,
          },
          DMS030510G1: {
            data: this.state.data,
          },
        }),
      });

      if (result) {
        if (result.TYPE === 1) {
          // 스캔 성공한 경우
          this.setState({
            scanVaildData: `"${this.state.SCAN_NO}" change to "${barcode1Data}" Success!`,
            MOVED_LOCATION: barcode1Data,
            spinner: false,
            data: null,
          });
          this.successScan();
        } else {
          this.deleteLoc(result.MSG);
          this.failScan();
        }
      } else {
        // 스캔 실패한 경우
        this.deleteLoc('Move Fail \n Please contact manager.');
        this.failScan();
      }
    } else {
      // 맨처음 화면을 띄우고 스캔할때에는 data에 값이 널이므로 이 프로세스를 탄다
      // 재고아이템을 찾아와서 스캔여부 확인

      // 바코드번호를 입력하지 않았으면 초기화
      if (!barcode1Data) {
        this.deleteAll('Please, Input the barcode data!');
        this.failScan();
        return;
      }

      if (Util.checkBarcode(barcode1Data) === 'LOC') {
        // 스캔 실패한 경우
        this.deleteLoc('Please scan Item Barcord.');
        this.failScan();
        return;
      }

      const result2 = await Fetch.request('DMS030511SVC', 'getStockAll', {
        body: JSON.stringify({
          DMS030511F1: {
            WH_CODE: whCode,
            SCAN_NO: barcode1Data,
            EXIST_YN: 'Y',
            GRGI_DAY: 'GR',
            GR_FLAG: 'N',
            LOC_YN: 'N',
          },
        }),
      });

      if (result2) {
        if (result2.DMS030511G6[0]) {
          result2.DMS030511G6[0].SCAN_NO = barcode1Data;
          // 스캔 성공한 경우
          this.setState({
            scanVaildData: `"${result2.DMS030511G6[0].SCAN_NO}" Scan Success!`,
            VENDOR_NAME: result2.DMS030511G6[0].VENDOR_NAME,
            GR_NO: result2.DMS030511G6[0].GR_NO,
            DOC_NO: result2.DMS030511G6[0].DOC_NO,
            LOCATION: result2.DMS030511G6[0].LOCATION,
            STOCK_DAYS: result2.DMS030511G6[0].STOCK_DAYS,
            SCAN_NO: result2.DMS030511G6[0].SCAN_NO,
            TYPE: result2.DMS030511G6[0].TYPE,
            MOVED_LOCATION: null,
            spinner: false,
            data: result2.DMS030511G6,
          });
          this.successScan();
        } else {
          // 스캔 실패한 경우
          this.deleteAll('This item is not exist now. \n Please contact manager.');
          this.failScan();
        }
      } else {
        // 데이터가 없는 경우
        this.deleteAll('This item is not exist now. \n Please contact manager.');
        this.failScan();
      }
    }
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    Util.dmsValidCheckFunc(alertType);
    // const validCheck = Util.dmsValidCheckFunc(alertType);
    // if (validCheck) {
    //   this.fetch('', null);
    // }
  }

  // 바코드 스캔 처리 로직
  async focusNextField(scanData) {
    this.barcode1.clear();

    let barcode1Data = this.barcode1._lastNativeText;
    if (scanData) {
      barcode1Data = scanData;
    }
    if (!barcode1Data) {
      this.deleteAll('Please, Input the barcode data!');
      this.failScan();
      return;
    }

    this.fetch(barcode1Data);
  }

  _keyboardDissmiss() {
    this.setState({
      GR_NO: null,
      VENDOR_NAME: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      spinner: false,
      barcodeData1: null,
      scanVaildData: null,
      barcodeStatus: null,
      data: null,
    });
    Keyboard.dismiss();
  }

  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
    this.barcode1.focus();
  }

  failScan() {
    this.barcode1.focus();
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
  }

  deleteAll(msg) {
    this.setState({
      scanVaildData: msg,
      VENDOR_NAME: null,
      GR_NO: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      spinner: false,
      data: null,
    });
  }

  deleteLoc(msg) {
    this.setState({
      scanVaildData: msg,
      MOVED_LOCATION: null,
      spinner: false,
    });
  }

  onBarcodePopup() {
    const { navigator } = this.props;
    Navigation(
      navigator,
      'com.layout.ComBarcode',
      {
        onBarcodeScan: result => this.onBarcodeScan(result),
      },
      'Barcode Scan',
    );
  }

  onBarcodeScan(result) {
    this.focusNextField(result);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.spaceAroundStyle}>
          <TextInput
            style={(styles.barcodeInput, { flex: 1 })}
            ref={c => {
              this.barcode1 = c;
            }}
            placeholder="Barcode"
            onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
            value={this.state.barcodeData1}
            autoFocus={this.state.GI_STATUS !== 'F'}
            keyboardType="email-address" // autoFocus
            blurOnSubmit={false}
            onSubmitEditing={() => {
              this.focusNextField();
            }}
          />
          <View style={styles.buttonStyle}>
            <HButton onPress={() => this._keyboardDissmiss()} name={'refresh'} />
          </View>
        </View>
        <HBaseView style={styles.container} scrollable={false}>
          <HCombobox
            label={'Change Type'}
            groupJson={[
              { DT_CODE: 'REMARKS', LOC_VALUE: 'Remarks' },
              { DT_CODE: 'DOC_NO', LOC_VALUE: 'Doc No' },
              { DT_CODE: 'LOCATION', LOC_VALUE: 'Location' },


            ]}
            bindVar={{
              CD: 'DMS100602.CHANGE_TYPE',
              NM: 'DMS100602.CHANGE_TYPE_NAME',
            }}
            editable
            require
          />
          <Text
            style={styles.textVaildScan}
            ref={c => {
              this.scanVaildData = c;
            }}
          >
            {this.state.scanVaildData}
          </Text>
          <HTexttitle>From</HTexttitle>
          <View style={styles.scanArea}>
            <Text style={styles.textTopStyle}>{this.state.GR_NO}</Text>
            <Text style={styles.textTopStyle}>{this.state.VENDOR_NAME}</Text>
            <Text style={styles.textTopStyle}>{this.state.REF_NO}</Text>
            <Text style={styles.textTopStyle}>{this.state.LOCATION}</Text>
            <Text style={styles.textTopStyle}>
              {this.state.STOCK_DAYS ? `${this.state.STOCK_DAYS} Days` : null}
            </Text>
          </View>
          <HButton onPress={() => this.fetch('')} name={'import-export'} iconType={'M'} />
          <HTexttitle>To</HTexttitle>
          <View style={styles.scanArea}>
            <Text style={styles.textTopStyle}>{this.state.MOVED_LOCATION}</Text>
          </View>
          {/* 바코드 스캔입력부분 제어 */}
          <Touchable
            style={styles.searchButton}
            underlayColor={'rgba(63,119,161,0.8)'}
            onPress={() => this.onBarcodePopup()}
          >
            <HIcon name="barcode" size={20} color="#fff" />
          </Touchable>
        </HBaseView>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonGroupContainer: {
    flex: 1,
    paddingRight: 5,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonInnerContainer: {
    flex: 1,
    margin: 5,
  },
  textTopStyle: {
    color: '#ffffff',
    fontSize: 15,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  textVaildScan: {
    color: '#000000',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  textVaildScanSucess: {
    color: '#3333ce',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  textVaildScanFailure: {
    color: '#d03a3a',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  spaceAroundStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 3,
    paddingLeft: 3,
  },
  barcodeInput: {
    height: 40,
    flex: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonStyle: {
    justifyContent: 'center',
  },
  scanArea: {
    justifyContent: 'center', // borderColor: color,
    borderWidth: 1,
    margin: 5,
    borderColor: bluecolor.basicSkyLightBlueColor,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: bluecolor.basicSkyLightBlueColor,
  },
  searchButton: {
    backgroundColor: 'rgba(52,152,219,0.8)',
    borderColor: 'rgba(52,152,219,0.8)',
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 200,
    right: 20,
    shadowColor: '#3f77a1',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
