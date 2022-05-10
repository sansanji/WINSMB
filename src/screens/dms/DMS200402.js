/* *
* Import Common
* */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration, TouchableOpacity } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, bluecolor, modelUtil } from 'libs';
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
  HCheckbox,
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
    super(props, 'DMS200402');
    this.state = {
      data: [],
      status: null,
      taskStep: this.props.params.GI_STATUS === 'F' ? '2' : '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      // 신규개발건
      SHIP_DATE: this.props.params.SHIP_DATE,
      PACKING_NO: this.props.params.PACKING_NO,
      TRUCK: this.props.params.TRUCK,
      CONFIRM_YN: this.props.params.CONFIRM_YN,


      // 클로즈 기능으로 신규추가
      VENDOR_CODE: this.props.params.VENDOR_CODE,
      BUYER_CODE: this.props.params.BUYER_CODE,
      WH_CODE: this.props.params.WH_CODE,
      GI_NO: this.props.params.GI_NO,
      GI_DATE: this.props.params.GI_DATE,
      GI_STATUS: this.props.params.GI_STATUS,
      GI_STATUS_NAME: this.props.params.GI_STATUS_NAME,
      barcodeData1: null,
      barcodeData2: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      barcode1Focus: false,
      barcode2Focus: false,
      successCnt: 0,
      itemEditable: this.props.params.GI_STATUS !== 'F', // 확정된 데이터라면 스캔 필드 비 활성화
      itemTotalQty: 0,
      totalItemQty: 0,
      totalCheckItemQty: 0,
      GI_REF_DOC_NO: null,
      serialTarget: 'N',
      serialList: [],
      currentIndex: null,
    };
    Tts.setDefaultLanguage('en');
    Tts.voices().then(voices => console.log('voices', voices));
  }

  componentWillMount() {
    this.fetch(null);
  }

  shouldComponentUpdate() {
    return true;
  }

  // packing list 조회
  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const COMPANY_CODE = this.props.global.dmsVendorcode.COMPANY_CODE;
    const WH_CODE = this.props.global.dmsVendorcode.WH_CODE;
    const packingInfo = this.state;

    const result = await Fetch.request('WMS050312SVC', 'getDtM', {
      body: JSON.stringify({
        WMS050312F1: {
          COMPANY_CODE,
          WH_CODE: 'LCHU',
          SHIP_DATE: packingInfo.SHIP_DATE,
          PACKING_NO: packingInfo.PACKING_NO,
          CONFIRM_YN: packingInfo.CONFIRM_YN,
        },
      }),
    });
    Util.openLoader(this.screenId, false);
    if (result.TYPE === 1) {
      // 백단에서 받아온 토탈 스캔 값을 받아온다.
      let successCnt = 0;
      if (packingInfo.CONFIRM_YN === 'Confirm') {
        for (let i = 0; i < result.WMS050312G1.length; i++) {
          if (!Util.isEmpty(result.WMS050312G1[i].BARCODE)) {
            successCnt += 1;
            result.WMS050312G1[i].completed = 'Y';
          }
        }
      }

      // let itemCheckQty = 0;
      // for (let i = 0; i < result.WMS050312G2.length; i++) {
      //   itemCheckQty += result.DMS030320G2[i].SCAN_QTY;
      // }
      // 정해진 데이터만 보여준다.
      this.setState(
        {
          data: result.WMS050312G1,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
          successCnt,
          // GI_REF_DOC_NO: result.WMS050312G2[0].GI_REF_DOC_NO,
          // totalCheckItemQty: itemCheckQty,
        },
        callback,
      );
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('DMS200402', result.WMS050312G1);
      this.barcode1.clear();
      this.barcode1.focus();

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
    const scanCnt = this.state.successCnt;
    if (eventType === 'CONFIRM') {
      this.tts('Do you want to Confrim?');
      // this.onSave(null, '현재상태 저장', 'confirmY');

      this._CONFIRM(scanCnt);
    }
  }

  async _CONFIRM(scanCnt) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const dataList = this.state.data;

    if (scanCnt !== this.state.data.length) {
      const msg = 'There are incompleted scan data. check the list out please';
      Util.msgBox({
        title: 'alert',
        msg,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      Util.openLoader(this.screenId, false);
      return;
    }

    const { componentId } = this.props;
    const result = await Fetch.request('WMS050312SVC', 'saveBarcode', {
      body: JSON.stringify({
        WMS050312G1: {
          data: dataList,
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
    const dataLength = this.state.data.length;
    const dataList = this.state.data;

    let barcode1Data = null; // 첫번째 바코드값
    let currentIndex = null; // 현재 바코드스캔으로 선택된로우인덱스
    let barcodeYN = 'N';


    // 바코드 값을 barcode1Data 에 넣어줌
    barcode1Data = this.barcode1._lastNativeText;
    if (scanData) {
      barcode1Data = scanData;
    }

    if (!barcode1Data) {
      this.setState({
        scanVaildData: '바코드를 입력해주세요',
      });
      this.scanVaildData.setNativeProps({
        style: styles.textVaildScanFailure,
      });
      this._sound('f');
      Vibration.vibrate(2000);
      return;
    }

    // scan한 값에 check_lot정보가 있는지 확인
    // 정보가 있다면 checklot ='Y'/ 없다면 checklot = 'N' 변수처리.
    // Y라면 로직 진행 N이라면 알람메세지 표출

    // 일치되는 데이터 찾아서 check 해줌
    for (let i = 0; i < dataLength; i += 1) {
      const lotValue = this.state.data[i].CHECK_LOT.toUpperCase().trim();
      const barcodeData = barcode1Data.toUpperCase().trim();
      if (barcodeData.includes(lotValue)) {
        if (Util.isEmpty(dataList[i].completed)) {
          barcodeYN = 'Y';
          currentIndex = i;
          this.setScanValue(currentIndex, barcodeYN, barcodeData);
          return;
        }
      } else {
        barcodeYN = 'N';
        currentIndex = i;
        this.setScanValue(currentIndex, barcodeYN, barcodeData);
      }
    }
  }

  setScanValue(currentIndex, barcodeYN, barcodeData) {
    const autoConfirmYN = this.props.global.config.DMS_AUTO_CONFIRM_YN;
    const dataList = this.state.data;
    let scanCnt = Number(this.state.successCnt); // 카운트 총 성공 값

    // 입력한 데이터 중복 체크하기
    let dupYn = false;
    for (let i = 0; i < this.state.data.length; i++) {
      const currElem = this.state.data[i].BARCODE;

      if (!Util.isEmpty(currElem)) {
        for (let j = 0; j < this.state.data.length; j++) {
          if (!Util.isEmpty(this.state.data[j].BARCODE)) {
            if (currElem === barcodeData) {
              dupYn = true;
            }
          }
        }
      }
    }

    if (dupYn === true) {
      this.setState({
        scanVaildData: `"${barcodeData}" Scan fail. duplicated data.`,
        barcodeScanData: null,
        // barcodeScanIndex: currentIndex,
      });
      this._setScanValidData('f');
      this._sound('f');
      Vibration.vibrate(2000);

      this._onClearBarcode('barcode1');
      // Keyboard.dismiss(); // 키보드 닫기!
      this.barcode1.focus();
      return;
    }

    // 스캔 성공 여부에 따른 로직
    if (barcodeYN === 'Y') {
      // 스캔 성공한 경우
      scanCnt += 1;
      dataList[currentIndex].completed = 'Y';
      dataList[currentIndex].BARCODE = barcodeData;
      this.setState({
        scanVaildData: `"${barcodeData}" Scan success.`,
        barcodeScanData: barcodeData,
        barcodeScanIndex: currentIndex,
        data: dataList,
        successCnt: scanCnt,
      });
      this._setScanValidData('s');
      this._sound('s');
      Vibration.vibrate(500);
      this.barcode1.focus();
      // this._sound('s');

      // this.getTotalCheckItemQty();
      this.barcode1.focus();
      // Keyboard.dismiss(); // 키보드 닫기!
    } else {
      // 스캔 실패한 경우
      this.setState({
        scanVaildData: `"${barcodeData}" Scan fail.`,
        barcodeScanData: null,
        // barcodeScanIndex: currentIndex,
      });
      this._setScanValidData('f');
      this._sound('f');
      Vibration.vibrate(2000);
    }
    this._onClearBarcode('barcode1');
    // Keyboard.dismiss(); // 키보드 닫기!
    this.barcode1.focus();

    if (autoConfirmYN === 'Y') {
      if (scanCnt === this.state.data.length) {
        this._CONFIRM(scanCnt);
      }
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
  _soundConfirm(type) {
    if (type === 's') {
      // 성공 시 알람
      Util.playConfirmSound('successSound');
    } else {
      // 실패 시 알람
      Util.playConfirmSound('failSound');
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
    // this.fetch(null);
  }

  onBarcodePopup() {
    const { navigator } = this.props;
    Navigation(
      navigator,
      'com.layout.ComBarcode',
      {
        onBarcodeScan: result => this.focusNextField(result),
      },
      'Barcode Scan',
    );
  }

  // 전체 카운팅
  _onCheckPress(item, index) {
    const data = this.state.data;
    let scanCnt = Number(this.state.successCnt); // 카운트 총 성공 값


    // 이미 체크가 되어있으면 체크를 해제해준다.
    if (item.completed === 'Y') {
      data.forEach(x => {
        if (x === item) {
          x.completed = '';
          x.BARCODE = '';
          scanCnt -= 1;
        }
      });
      Util.toastMsg('Cancle scan History');
    } else {
      // 이미 체크가 안되어있으면, 체크 해주기
      data.forEach(x => {
        if (x === item) {
          x.completed = 'Y';
          scanCnt += 1;
        }
      });
      Util.toastMsg('Scan sucess');
    }

    this.setState({
      scanVaildData: null,
      data,
      successCnt: scanCnt,
    });
    // this.getTotalCheckItemQty();
    // this._sound('s');
  }

  _onClearBarcode(barcodeType) {
    if (barcodeType === 'barcode1') {
      this.barcode1.clear();
      this.setState({
        barcodeData1: null,
      });
    } else {
      this.barcode2.clear();
      this.setState({
        barcodeData2: null,
      });
    }
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
          blurOnSubmit={this.state.barcode1Focus}
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
renderBody = (item, index, scanData, scanIndex) => (
  <View
    // style={[
    // item.scanChecked === 'Y' ? { backgroundColor: '#75d9ff' } : { backgroundColor: '#fafafa' },
    // ]}ㅋ
    key={item.SEQ + item.DT_SEQ}
  >
    <HFormView
      style={[
        { marginTop: 2 },
        item.completed === 'Y'
          ? { backgroundColor: bluecolor.basicSkyLightBlueColor }
          : null,
      ]}
    >
      <HRow between>
        <HText
          value={item.LOT}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText
          value={item.SEQ}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
      </HRow>
      <HRow between>
        <HText
          style={(styles.barcodeInput, { flex: 1 })}
          value={item.MATERIAL}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <View>
          <HButton
            // disabled={this.props.params.GI_STATUS === 'F'}
            onPress={() => this._onCheckPress(item, index)}
            name={'check-square-o'}
            bStyle={{
              width: 40,
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: (item.completed === 'N' || Util.isEmpty(item.completed)) ? bluecolor.basicDeepGrayColor : bluecolor.basicGreenColor,
            }}
          />
        </View>
      </HRow>
      <HRow>
        <HNumberfield label={'Pallet'} value={item.PAL} />
        <HNumberfield label={'D/T'} value={item.DT_SEQ} />
        <HNumberfield label={'Number'} value={item.NUM} />
        <HNumberfield label={'QTY'} value={item.QTY} />
      </HRow>
      <HRow>
        {
          item.BARCODE === undefined || item.BARCODE === '' ?
            <HText value={''} /> : <HText value={`${item.BARCODE}`} />
        }
      </HRow>
    </HFormView>
  </View>
);
render() {
  const buttonGroup = [
    {
      title: '임시저장 취소', // 필수사항
      iconName: 'save', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.onSave('cancel', '현재상태 취소');
      },
    },
    {
      title: '임시저장', // 필수사항
      iconName: 'save', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.onSave(null, '현재상태 저장');
      },
    },
    {
      title: '조회', // 필수사항
      iconName: 'search', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.fetch(null);
      },
    },
  ];
  return (
    <HBaseView style={styles.container} scrollable={false} buttonGroup={buttonGroup}>
      {/* <Spinner visible={this.state.spinner} /> */}
      <Text style={styles.textTopStyle}>
        {this.state.PACKING_NO} ( Truck No: {this.state.TRUCK})
      </Text>
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
      <HRow style={styles.countStyle}>
        <HText
          style={{ marginTop: 10 }}
          textStyle={[
            this.state.data.length !== this.state.successCnt
              ? { color: bluecolor.basicRedColor, fontWeight: 'bold', fontSize: 20 }
              : { color: bluecolor.basicGreenColor, fontWeight: 'bold', fontSize: 20 },
          ]}
        >
          {this.state.successCnt} / {this.state.data.length}
        </HText>
      </HRow>
      <HListView
        keyExtractor={item => item.SEQ + item.DT_SEQ}
        renderHeader={null}
        renderItem={({ item, index }) =>
          this.renderBody(item, index)
        }
        onSearch={() => {}}
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
  },
  textTopStyle: {
    marginStart: 2,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#2c7bba',
    fontSize: 16,
    paddingLeft: 5,
    fontWeight: 'bold',
  },
  textDocStyle: {
    color: '#d03a3a',
    fontSize: 12,
    paddingLeft: 1,
    paddingRight: 1,
    marginStart: 0,
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
  barcodeStyle: {
    flexDirection: 'row',
    // justifyContent: 'center',
    paddingRight: 3,
    paddingLeft: 3,
  },
  countStyle: {
    backgroundColor: '#F6F6F6',
    borderTopWidth: 1,
    borderColor: '#d4d4d4',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  serialInput: {
    height: 5,
    flex: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 5,
  },
  buttonStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingRight: 1,
    paddingLeft: 1,
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
    bottom: 80,
    right: 15,
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
