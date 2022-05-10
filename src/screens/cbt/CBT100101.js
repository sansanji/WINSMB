/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Platform, Alert } from 'react-native';
// Platform,and ios구분
import {
  React,
  Redux,
  NavigationScreen,
  modelUtil,
  Util,
  bluecolor,
  io,
  env,
  usbUtil,
} from 'libs';
import {
  HFormView,
  HBaseView,
  HRow,
  Touchable,
  HTextfield,
  HCombobox,
  HCheckbox,
  HText,
  HTexttitle,
  HNumberfield,
} from 'ux';


let lsocket = null;

const TEMP_DATA = [{
  BOX_NO: 'B200900000172',
  BOX_SEQ: '01',
  CNEE_NAME: '송막저',
  COURIER_CODE: 'CJE',
  CUR: 'KRW',
  CUSTOMER_CODE: '1008908',
  CUSTOMER_NAME_LOC: '정보사업팀-테스트',
  EX_NO: 'EXNO200900000172',
  FOB_AMT: 1000,
  HBL_NO: '348246464096',
  HEIGHT: 0,
  LENGTH: 0,
  WIDTH: 0,
  ORDER_NO: 'KR_20200917_T056',
  ORDER_STATUS: '022',
  PORTENM: 'KR B2C',
  SCAN_BOX_QTY: 1,
  SERVICECODE: '9000',
  SERVICENM: 'KR B2C',
  SERVICEPORT: '10005',
  TOTAL_CW: 0,
  TOTAL_GW: 0,
  TOTAL_PKG_QTY: 1,
  TOTAL_VW: 0,
  COMPANY_CODE: '0001',
  COMPNAY_CODE_NAME: '하나로티엔에스',
  ORDER_STATUS_NAME: 'Pick생성',
  WH_CODE: 123,
  WH_CODE_NAME: '청라센터',
  PRINT_CODE_NAME: null,
  L_UNIT: null,
  W_UNIT: null,
  SCAN_DATA: null,
  VW: 0,
  WT: 0,
  FIX_YN: null,
  SAVE_YN: null,
  PRINT_YN: null }];


class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'CBT100101');
    this.state = {
      barcodeData1: null,
    };
    modelUtil.setModelData('CBT100101', TEMP_DATA[0]);
    modelUtil.setModelData('CBT100101_BT',
      { SAVE_YN: 'N',
        PRINT_YN: 'N',
        COMPANY_CODE: '0001',
        COMPNAY_CODE_NAME: '하나로티엔에스',
        WH_CODE: 123,
        WH_CODE_NAME: '청라센터',
        PRINT_CODE_NAME: null },
    );
  }

  async componentWillMount() {
    // this.fetch();
    const { navigator } = this.props.global;
    await usbUtil.initUSB();
    await usbUtil.findUSB();
    if (Platform.OS === 'ios') {
      Util.msgBox({
        title: 'Alert',
        msg: 'Serial is not support for IOS platform',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              navigator.dismissModal(this.props.componentId);
            },
          },
        ],
      });
    }
  }

  async componentDidMount() {
    await usbUtil.initUsbResult();
  }

  componentWillUnmount() {
    usbUtil.clearUsb();
    this.stopPrint();
  }

  async startScan() {
    await usbUtil.findUSB();
    await usbUtil.startUSB();
    this.startPrint();
  }


  setUsbResult(result) {
    const barcode1Data = this.barcode1._lastNativeText;

    this.fetch(barcode1Data, result);
  }

  // 바코드 스캔 처리 로직
  focusNextField() {
    this.barcode1.clear();

    usbUtil.getUsbResult((result) => this.setUsbResult(result));
  }

  // 다시시작 끝
  initSocket() {
    let printer = modelUtil.getValue('CBT100101_BT.PRINT_CODE_NAME');
    if (Util.isEmpty(printer)) {
      printer = 'EPRINT';
      modelUtil.setValue('CBT100101_BT.PRINT_CODE_NAME', printer);
    }

    const socket = io.connect(env().chatURL, {
      path: '',
      'force new connection': true,
    });
    socket.on('connect', data => {
      console.log('socekt connect!!');
    });
    socket.emit('join', {
      ROOM_ID: printer,
      ROOM_NAME: printer,
    });
    return socket;
  }

  startPrint() {
    try {
      lsocket = this.initSocket();
      console.log('socket', lsocket);
    } catch (error) {
      Alert.alert(
        '프린터 통신 오류발생',
        '프린터를 다시 실행해 주세요 잠시후 다시 시도해주세요',
        [{ text: 'OK' }, { cancelable: false }],
        { cancelable: false },
      );
    }
  }

  stopPrint() {
    lsocket.socket.disconnect();
    console.log('SocketProcess2', 'disconnect');
  }

  onSend(testMessage) {
    if (!lsocket || !lsocket.socket.connected) {
      Alert.alert(
        '프린터 통신 문제 발생',
        '프린터를 다시 실행해 주세요 잠시후 다시 시도해주세요',
        [{ text: 'OK' }, { cancelable: false }],
        { cancelable: false },
      );
      return;
    }
    this.sendMsg(testMessage);
  }


  sendMsg(sMsg, msgObjects) {
    const printer = modelUtil.getValue('CBT100101_BT.PRINT_CODE_NAME');
    // BizTalk이 자동으로 호출된 경우는 User Name도 "BizTalk"로 설정!
    lsocket.emit('utilmsg', {
      ROOM_ID: printer,
      MSG_CONTENTS: sMsg,
      MSG_OBJECTS: msgObjects,
    });
  }

  // 데이터 조회
  async fetch(barcode1Data, wResult, testMessage) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = {
      TYPE: 1,
      MSG: '정상적으로 처리되었습니다',
      CBT100101F1: TEMP_DATA[0],
    };

    result.CBT100101F1.TOTAL_GW = wResult;
    modelUtil.setModelData('CBT100101', result.CBT100101F1);
    this.onSend(testMessage);

    Util.openLoader(this.screenId, false);
  }

  // 저장
  onSave() {
    if (this.checkEmpty()) {
      Util.msgBox({
        title: 'ERROR',
        msg: '부피정보를 넣어 주세요.',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    console.log('test');
    this.clear();
  }

  // 부피중량 계산
  onCalculate() {
    const { WIDTH, LENGTH, HEIGHT, L_UNIT } = modelUtil.getModelData('CBT100101');
    let tempCal = 0;

    if (!(Util.isEmpty(L_UNIT) || L_UNIT === 0)) {
      tempCal = (WIDTH * LENGTH * HEIGHT) / L_UNIT;
    }

    const calDisValue = Util.formatNumber(tempCal);
    const calValue = (Math.round(Number(tempCal) * 100) / 100);
    this.setState({ VW: calDisValue });
    modelUtil.setValue('CBT100101.VW', calValue);
  }

  // 부피 값 입력 여부 확인 로직
  checkEmpty() {
    let result = true;
    const { WIDTH, LENGTH, HEIGHT, L_UNIT } = modelUtil.getModelData('CBT100101');

    if ((WIDTH > 0 && LENGTH > 0 && HEIGHT > 0) && (!Util.isEmpty(L_UNIT) && L_UNIT > 0)) {
      result = false;
    }
    return result;
  }

  // 입력 정보 초기화
  clear() {
    const temp = modelUtil.getModelData('CBT100101');

    let initData = {
      VW: 0,
      SERVICECODE: '',
      COURIER_CODE: '',
      ORDER_STATUS_NAME: '',
      ORDER_STATUS: '',
      WH_CODE: '',
    };
    if (temp.FIX_YN === 'Y') {
      initData = {
        HEIGHT: temp.HEIGHT,
        LENGTH: temp.LENGTH,
        WIDTH: temp.WIDTH,
        L_UNIT: temp.L_UNIT,
        L_UNIT_NAME: temp.L_UNIT_NAME,
        FIX_YN: temp.FIX_YN,
        SERVICECODE: '',
        COURIER_CODE: '',
        ORDER_STATUS_NAME: '',
        ORDER_STATUS: '',
        WH_CODE: '',
        VW: temp.VW,
      };
    } else {
      this.setState({ VW: 0 });
    }
    modelUtil.setModelData('CBT100101', initData);
  }


  renderHeader = () => (
    <View>
      <HRow>
        <HCombobox
          label={'Company Code'}
          groupJson={[
            { DT_CODE: '0001', LOC_VALUE: '하나로tns' },
          ]}
          bindVar={{
            CD: 'CBT100101_BT.COMPNAY_CODE',
            NM: 'CBT100101_BT.COMPNAY_CODE_NAME',
          }}
          editable
          rowflex={5}
        />
        <HCombobox
          label={'Warehouse'}
          groupJson={[
            { DT_CODE: '0001', LOC_VALUE: '청라센터' },
          ]}
          bindVar={{
            CD: 'CBT100101_BT.WH_CODE',
            NM: 'CBT100101_BT.WH_CODE_NAME',
          }}
          editable
          rowflex={5}
        />
      </HRow>
      <HTextfield label={'PrintName'} bind={'CBT100101_BT.PRINT_CODE_NAME'} editable />
    </View>
  )

  render() {
    const { SERVICECODE, COURIER_CODE, ORDER_STATUS_NAME, ORDER_STATUS, WH_CODE } = modelUtil.getModelData('CBT100101');
    const SVCCODE = `[${SERVICECODE}] ${COURIER_CODE}`;
    const STATUS = `[${ORDER_STATUS}] ${ORDER_STATUS_NAME}`;

    return (
      <HBaseView>
        <HFormView
          renderHeader={this.renderHeader}
          headerClose={!Util.isEmpty(WH_CODE)}

        />
        <HFormView>
          <View style={styles.spaceAroundStyle}>
            <TextInput
              style={(styles.barcodeInput, { flex: 1 })}
              // ref="barcode1" // 빨간 줄 가도 무시하자!
              ref={c => {
                this.barcode1 = c;
              }}
              placeholder="바코드를 입력해주세요"
              onChangeText={(barcodeData1) => this.setState({ barcodeData1 })}
              value={this.state.barcodeData1}
              autoFocus
              // autoFocus
              blurOnSubmit={false}
              keyboardType="email-address"
              onSubmitEditing={() => {
                this.focusNextField();
              }}
            />
            <View>
              <Touchable
                style={styles.buttonStyle}
                onPress={() => this.Reset()}
                underlayColor="#0B276F"
              >
                <Text style={styles.buttonText}>Submit</Text>
              </Touchable>
            </View>
            <View>
              <Touchable
                style={styles.buttonStyle}
                onPress={() => this.startScan()}
                underlayColor="#0B276F"
              >
                <Text style={styles.buttonText}>Connect</Text>
              </Touchable>
            </View>
          </View>
        </HFormView>
        <HFormView
          style={{ marginTop: 0.1 }}
        >
          {/* HbaseView를 상속 받는 화면의 경우는 HbaseView의 속성값으로 지정하고,
         * 그외의 건들은 최상위 부모 <View> </View> 안에 <KeepAwake /> 설정한다.
         * libs 공동 선언부에 처리 */}
          {/* <KeepAwake /> */}
          <HTexttitle>Information</HTexttitle>
          <HRow>
            <HTextfield label={'Customer'} bind={'CBT100101.CUSTOMER_NAME_LOC'} />
            <HTextfield label={'Status'} value={STATUS} />
          </HRow>
          <HRow>
            <HTextfield label={'SVC Code'} value={SVCCODE} />
            <HTextfield label={'Box No'} bind={'CBT100101.BOX_NO'} />
          </HRow>
          <HRow>
            <HTextfield label={'B/L No'} bind={'CBT100101.HBL_NO'} />
            <HTextfield label={'Order No'} bind={'CBT100101.ORDER_NO'} />
          </HRow>
          <HRow>
            <HNumberfield label={'G/W'} bind={'CBT100101.TOTAL_GW'} />
            <HNumberfield label={'V/W'} bind={'CBT100101.TOTAL_VW'} />
            <HNumberfield label={'C/W'} bind={'CBT100101.TOTAL_CW'} />
          </HRow>
          <HTexttitle>Dimension</HTexttitle>
          <HRow>
            <HNumberfield label={'Width'} bind={'CBT100101.WIDTH'} onChanged={() => this.onCalculate()} editable />
            <Text style={styles.containerX}>{'X'}</Text>
            <HNumberfield label={'Length'} bind={'CBT100101.LENGTH'} onChanged={() => this.onCalculate()} editable />
            <Text style={styles.containerX}>{'X'}</Text>
            <HNumberfield label={'Height'} bind={'CBT100101.HEIGHT'} onChanged={() => this.onCalculate()} editable />
          </HRow>
          <HRow>
            <HCheckbox label={'fix'} bind={'CBT100101.FIX_YN'} editable />
            <View rowflex={5} style={styles.textInputStyle}>
              <TextInput
                style={(styles.barcodeInput, { flex: 1 })}
                placeholder="Vol Weight"
                onChangeText={(VW) => this.setState({ VW })}
                value={this.state.VW}
                keyboardType="number-pad"
              />
            </View>
            <HText>{'kg'}</HText>
            <HCombobox
              label={'Volume Denominater'}
              groupJson={[{ DT_CODE: 5000, LOC_VALUE: '5,000' }, { DT_CODE: 6000, LOC_VALUE: '6,000' }]}
              bindVar={{
                CD: 'CBT100101.L_UNIT',
                NM: 'CBT100101.L_UNIT_NAME',
              }}
              editable
              rowflex={5}
              onChanged={() => this.onCalculate()}
            />
          </HRow>
          <HRow>
            <View style={styles.textInputStyle} rowflex={5}>
              <TextInput
                style={(styles.barcodeInput, { flex: 1 })}
                placeholder="Weight"
                onChangeText={(WT) => this.setState({ WT })}
                value={this.state.WT}
                keyboardType="number-pad"
              />
            </View>
            <HText>{'kg'}</HText>
            <HCombobox
              label={'Weight_Unit'}
              groupJson={[{ DT_CODE: 'kg & cm', LOC_VALUE: 'kg & cm' },
                { DT_CODE: 'LBS & inch', LOC_VALUE: 'LBS & inch' }, { DT_CODE: 'O.Z', LOC_VALUE: 'O.Z' }]}
              bindVar={{
                CD: 'CBT100101.W_UNIT',
                NM: 'CBT100101.W_UNIT_NAME',
              }}
              editable
              rowflex={5}
            />
          </HRow>
          <HRow>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            >
              <View>
                <HCheckbox label={'auto'} bind={'CBT100101_BT.SAVE_YN'} editable />
              </View>
              <View style={{ justifyContent: 'flex-end', marginLeft: -10, zIndex: 2 }}>
                <Touchable style={styles.autoButtonStyle} onPress={() => this.onSave()}>
                  <Text style={styles.buttonText} >Save</Text>
                </Touchable>
              </View>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            >
              <View>
                <HCheckbox label={'auto'} bind={'CBT100101_BT.PRINT_YN'} editable />
              </View>
              <View style={{ justifyContent: 'flex-end', marginLeft: -10, zIndex: 2 }}>
                <Touchable
                  style={styles.autoButtonStyle}
                >
                  <Text style={styles.buttonText}>Print</Text>
                </Touchable>
              </View>
            </View>
          </HRow>
        </HFormView>
      </HBaseView>
    );
  }
}

const styles = StyleSheet.create({
  containerX: {
    fontSize: 9,
    fontWeight: 'bold',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    marginRight: 1,
    marginLeft: 3,
    marginTop: 3,
    padding: 8,
    backgroundColor: bluecolor.basicBluebtTrans,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  autoButtonStyle: {
    alignSelf: 'center',
    padding: 8,
    backgroundColor: bluecolor.basicBluebtTrans,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  spaceAroundStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 3,
    paddingLeft: 3,
  },
  barcodeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'black',
    color: 'black',
  },
  textInputStyle: {
    backgroundColor: bluecolor.basicSkyBlueColorTrans,
    padding: 5,
  },
});


/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
