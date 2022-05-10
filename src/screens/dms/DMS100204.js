/* * DMS100204
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, bluecolor } from 'libs';
import {
  HBaseView,
  Touchable,
  HIcon,
  HRow,
  HFormView,
  HText,
  HListView,
  HNumberfield,
  HButton,
} from 'ux';
/* *
 * Import node_modules
 * */
import Tts from 'react-native-tts';

/**
 * 출고 상세 정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100204');
    this.state = {
      data: [],
      status: null,
      taskStep: this.props.params.GI_STATUS === 'F' ? '2' : '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      // 클로즈 기능으로 신규추가
      VENDOR_CODE: this.props.params.VENDOR_CODE,
      BUYER_CODE: this.props.params.BUYER_CODE,

      WH_CODE: this.props.params.WH_CODE,
      GI_NO: this.props.params.GI_NO,
      GI_DATE: this.props.params.GI_DATE,
      GI_STATUS: this.props.params.GI_STATUS,
      GI_STATUS_NAME: this.props.params.GI_STATUS_NAME,
      barcodeData1: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
      itemEditable: this.props.params.GI_STATUS !== 'F', // 확정된 데이터라면 스캔 필드 비 활성화
      PLT_CHECK: this.props.params.PLT_CHECK,
      BOX_CHECK: this.props.params.BOX_CHECK,
      ITEM_CHECK: this.props.params.ITEM_CHECK,
      GI_DT: this.props.params.GI_DT,
    };

    Tts.setDefaultLanguage('ko');
    Tts.voices().then(voices => console.log('voices', voices));
  }

  componentWillMount() {
    this.fetch(null);
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030320SVC', 'getScan', {
      body: JSON.stringify({
        DMS030320F1: {
          WH_CODE: this.state.WH_CODE,
          GI_NO: this.state.GI_NO,
          GI_DATE_FROM: this.state.GI_DATE,
          GI_DATE_TO: this.state.GI_DATE,
          GI_FLAG: 'Y',
          PLT_CHECK: this.state.PLT_CHECK,
          BOX_CHECK: this.state.BOX_CHECK,
          ITEM_CHECK: this.state.ITEM_CHECK,
          GI_DT: this.state.GI_DT,
        },
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.

      this.setState(
        {
          data: result.DMS030320G2,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
        callback,
      );
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 버튼 이벤트에 대한 조건 처리
  _eventBtnBranch(eventType) {
    if (eventType === 'CONFIRM') {
      this.tts('Do you want to Confrim?');
      Util.msgBox({
        title: 'Confirm',
        msg: 'Do you want to Confrim?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._CONFIRM_CHECK(),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
    if (eventType === 'CANCEL') {
      Util.msgBox({
        title: 'Cancel',
        msg: 'Do you want to Cancel?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._CANCEL(),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
  }

  // 확정 조건 여부 체크
  async _CONFIRM_CHECK() {
    // const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const successCnt = this.state.successCnt;
    // 베트남법인은 무조건 바코드 스캔 후 확정처리! 그러나 다른 법인들은 어떻게 할지 정해진 것이 없으므로 잠시 보류
    // const companyCode = _.get(this.props.global, 'session.COMPANY_CODE', null);

    if (dataLength !== successCnt) {
      Alert.alert(
        // me.showError(Util.getLocaleValue('F000000249')); //조회한 데이터와 바코드 스캔한 데이터 수가 상이합니다.
        'The scanned data exist. But confirm or Cancle Failed (Data count wrong!)',
        'Please, Scan the rest of data.',
        [{ text: 'Yes', onPress: () => console.log('cancel'), style: 'cancel' }],
        { cancelable: false },
      );
      this.setState({
        scanVaildData:
          'Confirm or Cancle Failed (Data count wrong!) \n Please, Scan the rest of data.',
        spinner: false,
      });

      this._setScanValidData('f');
    } else {
      this._CONFIRM();
    }
  }

  async _CONFIRM() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { componentId } = this.props;
    const result = await Fetch.request('DMS030320SVC', 'confirm', {
      body: JSON.stringify({
        DMS030320G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GI_NO: this.state.GI_NO,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
              GI_DATE: this.state.GI_DATE,
            },
          ],
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Confrim Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Confrim Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 확정 취소 처리
  async _CANCEL() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { componentId } = this.props;

    const result = await Fetch.request('DMS030320SVC', 'cancel', {
      body: JSON.stringify({
        DMS030320G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GI_NO: this.state.GI_NO,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
              GI_DATE: this.state.GI_DATE,
            },
          ],
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Cancel Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Cancel Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 하단 버튼 컨트롤
  buttonControll(btnType) {
    const btn = {
      1: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._eventBtnBranch('CONFIRM')} title={'Confirm'} />
        </View>
      ),
      2: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._eventBtnBranch('CANCEL')} title={'Cancel'} />
        </View>
      ),
      3: (
        <View style={styles.buttonGroupContainer}>
          <View style={[styles.buttonInnerContainer]}>
            <HButton onPress={() => this._eventBtnBranch('CONFIRM')} title={'Confirm'} />
          </View>
          <View style={[styles.buttonInnerContainer]}>
            <HButton onPress={() => this._eventBtnBranch('CANCEL')} title={'Cancel'} />
          </View>
        </View>
      ),
    };
    return btn[btnType];
  }

  // 바코드 스캔 처리 로직
  focusNextField(scanData) {
    Vibration.vibrate(500);
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const { config } = this.props.global;

    this.barcode1.clear();

    let barcode1Data = this.barcode1._lastNativeText;
    if (scanData) {
      barcode1Data = scanData;
    }

    if (!barcode1Data) {
      this.setState({
        scanVaildData: 'Please, Input the barcode data!',
      });
      this.scanVaildData.setNativeProps({
        style: styles.textVaildScanFailure,
      });

      this._sound('f');

      return;
    }

    let barcodeYN = 'N';
    let currentIndex = null;
    let scanCnt = Number(this.state.successCnt);
    let g1ScanData = null;
    let targetG1ScanData = null;

    for (let i = 0; i < dataLength; i += 1) {
      g1ScanData = this.state.data[i].SCAN_NO.toUpperCase().trim();
      // 심플스캔일때는 아이템번호로 체크
      if (config.DMS_SIMPLE_YN) {
        if (config.DMS_SIMPLE_YN === 'Y') {
          g1ScanData = this.state.data[i].REF_NO.toUpperCase().trim();
        }
      }
      if (barcode1Data.toUpperCase().trim() === g1ScanData) {
        if (this.state.data[i].scanChecked !== 'Y') {
          currentIndex = i;
          barcodeYN = 'Y'; // 스캔 성공
        } else {
          barcodeYN = 'A'; // 스캔 중복
          // 심플스캔일때는 중복허용
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              barcodeYN = 'Y';
            } else {
              currentIndex = i;
            }
          } else {
            currentIndex = i;
          }
        }
      }
    }

    // 스캔 성공 여부에 따른 로직
    if (barcodeYN === 'Y') {
      const autoConfirmYN = this.props.global.config.DMS_AUTO_CONFIRM_YN;
      // 스캔 성공한 경우
      if (currentIndex !== null) {
        dataList[currentIndex].scanChecked = 'Y';
        scanCnt += 1;
        targetG1ScanData = this.state.data[currentIndex].REF_NO.trim();
        this.setState({
          scanVaildData: `"${targetG1ScanData}" Scan Success! [${scanCnt}/${dataLength}]`,
          barcodeScanData: barcode1Data,
          barcodeScanIndex: currentIndex,
          data: dataList,
          successCnt: scanCnt,
        });

        this._setScanValidData('s');
        this._sound('s');
        if (autoConfirmYN === 'Y') {
          if (dataLength === scanCnt) {
            this._CONFIRM();
          }
        }
      }
    } else if (barcodeYN === 'A') {
      // 스캔 성공 하였지만, 중복 스캔 된 경우
      targetG1ScanData = this.state.data[currentIndex].REF_NO.trim();
      this.setState({
        scanVaildData: `"${targetG1ScanData}" already scanned! [${scanCnt}/${dataLength}]`,
      });

      this._setScanValidData('f');
      this._sound('f');
    } else {
      // 스캔 실패한 경우
      this.setState({
        scanVaildData: `"${barcode1Data}" Scan Failure! [${scanCnt}/${dataLength}]`,
      });

      this._setScanValidData('f');
      this._sound('f');
    }
  }

  _keyboardDismiss() {
    Keyboard.dismiss();
  }

  tts(message) {
    if (this.props.global.config.CTM_TTS_YN !== 'Y') {
      return;
    }
    Tts.speak(message);
  }

  _sound(type) {
    if (type === 's') {
      // 성공 시 알람
      Util.playSound('successSound');
    } else {
      // 실패 시 알람
      Util.playSound('failSound');
    }
  }

  _setScanValidData(type) {
    if (type === 'f') {
      // 실패 시 문구 표시
      this.scanVaildData.setNativeProps({
        style: styles.textVaildScanFailure,
      });
    } else {
      // 성공 시 문구 표시
      this.scanVaildData.setNativeProps({
        style: styles.textVaildScanSucess,
      });
    }
  }

  _clear() {
    this._keyboardDismiss();
    this.barcode1.clear();
    this.setState({
      barcodeData1: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
    });
    this.fetch(null);
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

  _onPress(item, type) {
    const { navigator } = this.props;
    // const checkData = modelUtil.getModelData('DMS100204');
    item.LINK_TYPE = type;
    let headInfo = '';
    if (type === 'PLT') {
      headInfo = 'PLT Info.';
      item.COUNT = item.PLT_QTY;
    } else if (type === 'BOX') {
      headInfo = 'BOX Info.';
      item.COUNT = item.BOX_QTY;
    } else if (type === 'ITEM') {
      headInfo = 'ITEM Info.';
      item.COUNT = item.ITEM_QTY;
    }

    item.GI_STATUS_NAME = this.state.GI_STATUS_NAME;

    Navigation(
      navigator,
      'screen.DMS100206',
      {
        onSaveComplete: callback => this.fetch(callback),
        params: item,
      },
      headInfo,
    );
  }


  renderBarcode() {
    return (
      <View style={styles.spaceAroundStyle}>
        <TextInput
          style={(styles.barcodeInput, { flex: 1 })}
          // ref="barcode1" // 빨간 줄 가도 무시하자!
          ref={c => {
            this.barcode1 = c;
          }}
          placeholder="Barcode"
          onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
          value={this.state.barcodeData1}
          autoFocus={this.state.GI_STATUS !== 'F'}
          // autoFocus
          blurOnSubmit={false}
          keyboardType="email-address"
          onSubmitEditing={() => {
            this.focusNextField();
          }}
        />
        <View style={styles.buttonStyle}>
          <HButton onPress={() => this._clear()} name={'refresh'} />
        </View>
      </View>
    );
  }

  renderBody = (item, index, scanData, scanIndex) => {
    let hbut1 = false;
    let hbut2 = false;
    let hbut3 = false;
    // if (item.TYPE == 'DT') {
    //   hbut1 = true;
    //   hbut2 = true;
    //   hbut3 = true;
    // } else if (item.TYPE == 'PT') {
    //   hbut1 = true;
    //   hbut2 = false;
    //   hbut3 = false;
    // } else if (item.TYPE == 'BX') {
    //   hbut1 = false;
    //   hbut2 = true;
    //   hbut3 = false;
    // } else if (item.TYPE == 'IT') {
    //   hbut1 = false;
    //   hbut2 = false;
    //   hbut3 = true;
    // }
    if (item.TYPE === 'DT') {
      hbut1 = true;
      hbut2 = true;
      hbut3 = true;
    } else {
      hbut1 = false;
      hbut2 = false;
      hbut3 = false;
    }

    return (
      <View
      // style={[
      //   item.scanChecked === 'Y' ? { backgroundColor: '#75d9ff' } : { backgroundColor: '#fafafa' },
      // ]}
        key={item.SCAN_NO}
      >
        <HFormView
          style={[
            { marginTop: 2 },
            item.scanChecked === 'Y'
              ? { backgroundColor: '#75d9ff' }
              : { backgroundColor: '#fafafa' },
          ]}
        >
          <HRow between>
            <HText
              value={item.ITEM_CODE}
              textStyle={{
                color: bluecolor.basicBlueImpactColor,
                fontWeight: 'bold',
                fontSize: 16,
              }}
            />
            <HText
              value={item.ITEM_NAME}
              textStyle={{
                color: bluecolor.basicBlueImpactColor,
                fontWeight: 'bold',
                fontSize: 16,
              }}
            />
          </HRow>
          <HRow>
            <HText
              value={item.SCAN_NO}
              textStyle={{
                color: bluecolor.basicBlueImpactColor,
                fontWeight: 'bold',
                fontSize: 16,
              }}
            />
          </HRow>
          <HRow>
            {hbut1 ? <HButton
              onPress={() => this._onPress(item, 'PLT')}
              name={'link'}
              title={'PLT'}
            /> : <HText />}
            {hbut2 ?
              <HButton
                onPress={() => this._onPress(item, 'BOX')}
                name={'link'}
                title={'BOX'}
              /> : <HText /> }
            {hbut3 ?
              <HButton
                onPress={() => this._onPress(item, 'ITEM')}
                name={'link'}
                title={'ITEM'}
              /> : <HText />}
          </HRow>
          <HRow>
            <HNumberfield label={'Item'} value={item.ITEM_QTY} />
            <HNumberfield label={'C/T'} value={item.BOX_QTY} />
            <HNumberfield label={'Plt'} value={item.PLT_QTY} />
            <HNumberfield label={'W/t:'} value={item.GW} />
          </HRow>
          <HRow between>
            <HText value={`${item.DOC_NO} / ${item.LOCATION}`} />
          </HRow>
        </HFormView>
      </View>
    );
  };

  render() {
    return (
      <HBaseView style={styles.container} scrollable={false}>
        {/* <Spinner visible={this.state.spinner} /> */}

        <View style={styles.spaceAroundStyle}>
          <Text style={styles.textTopStyle}>
            {this.state.GI_NO} ({this.state.GI_STATUS_NAME})
          </Text>
        </View>
        {/* 바코드 스캔입력부분 제어 */}
        {this.state.itemEditable ? this.renderBarcode() : null}

        <Text
          style={styles.textVaildScan}
          ref={c => {
            this.scanVaildData = c;
          }}
        >
          {this.state.scanVaildData}
        </Text>

        <HListView
          keyExtractor={item => item.SCAN_NO}
          renderHeader={null}
          renderItem={({ item, index }) =>
            this.renderBody(item, index, this.state.barcodeScanData, this.state.barcodeScanIndex)
          }
          onSearch={() => this.fetch()}
          onMoreView={null}
          data={this.state.data}
          // 조회된값
          totalData={this.state.data}
          // 하단에 표시될 메세지값
          status={this.state.status}
        />

        <View style={styles.buttonContainer}>{this.buttonControll(this.state.taskStep)}</View>
        {/* 바코드 스캔입력부분 제어 */}
        {this.state.itemEditable ? (
          <Touchable
            style={styles.searchButton}
            underlayColor={'rgba(63,119,161,0.8)'}
            onPress={() => this.onBarcodePopup()}
          >
            <HIcon name="barcode" size={20} color="#fff" />
          </Touchable>
        ) : null}
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
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
    color: '#2c7bba',
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
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingRight: 3,
    paddingLeft: 3,
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
