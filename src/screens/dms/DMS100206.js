/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration } from 'react-native';
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
    super(props, 'DMS100206');

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
      LINK_TYPE: this.props.params.LINK_TYPE,
      GR_NO: this.props.params.GR_NO,
      GI_SEQ_NO: this.props.params.GI_SEQ_NO,
      GR_SEQ_NO: this.props.params.GR_SEQ_NO,
      COUNT: this.props.params.COUNT,
      ITEM_CODE: this.props.params.ITEM_CODE,
      ITEM_NAME: this.props.params.ITEM_NAME,
      GUBUN_NO: this.props.params.GUBUN_NO,
      SCAN_NO: this.props.params.SCAN_NO,
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
    const result = await Fetch.request('DMS030320SVC', 'getDetailData', {
      body: JSON.stringify({
        DMS030320F1: {
          WH_CODE: this.state.WH_CODE,
          GI_NO: this.state.GI_NO,
          GI_SEQ_NO: this.state.GI_SEQ_NO,
          GR_NO: this.state.GR_NO,
          GR_SEQ_NO: this.state.GR_SEQ_NO,
          GI_DATE_FROM: this.state.GI_DATE,
          GI_DATE_TO: this.state.GI_DATE,
          GI_FLAG: 'Y',
          LINK_TYPE: this.state.LINK_TYPE,
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
    if (eventType === 'SAVE') {
      this.tts('Do you want to Save?');
      Util.msgBox({
        title: 'Save',
        msg: 'Do you want to Save?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._SAVE(),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
  }

  async _SAVE() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { componentId } = this.props;
    const result = await Fetch.request('DMS030320SVC', 'mSave', {
      body: JSON.stringify({
        DMS030320F1: {
          WH_CODE: this.state.WH_CODE,
          GI_NO: this.state.GI_NO,
          GI_SEQ_NO: this.state.GI_SEQ_NO,
          GR_NO: this.state.GR_NO,
          GR_SEQ_NO: this.state.GR_SEQ_NO,
          GI_DATE_FROM: this.state.GI_DATE,
          GI_DATE_TO: this.state.GI_DATE,
          GI_FLAG: 'Y',
          LINK_TYPE: this.state.LINK_TYPE,
        },
        DMS030320G1: {
          data: this.state.data,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Save Alert',
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
        title: 'Save Alert',
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

  // 하단 버튼 컨트롤
  buttonControll(btnType) {
    const btn = {
      1: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._eventBtnBranch('SAVE')} title={'Save'} />
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
  async focusNextField(scanData) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    let g1ScanData = null;
    let checkScan = 1;
    const barcode1Data = this.state.barcodeData1;

    const countCheck = this.state.COUNT;

    if (dataLength >= countCheck) {
      Util.msgBox({
        title: 'Scan Check',
        msg: 'Exceeded Qty! Check again!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      Util.openLoader(this.screenId, false);
      return;
    }

    for (let i = 0; i < dataLength; i += 1) {
      g1ScanData = this.state.data[i].SCAN_NO.toUpperCase().trim();
      // 심플스캔일때는 아이템번호로 체크
      if (barcode1Data.toUpperCase().trim() === g1ScanData) {
        Util.msgBox({
          title: 'Scan Check',
          msg: 'already scaned! Check again!',
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });
        Util.openLoader(this.screenId, false);
        this.setState({
          barcodeData1: null,
        });
        checkScan = 2;
        return;
      }
    }
    const result1 = await Fetch.request('DMS030320SVC', 'getDetailScan', {
      body: JSON.stringify({
        DMS030320F1: {
          WH_CODE: this.state.WH_CODE,
          GI_NO: this.state.GI_NO,
          GI_SEQ_NO: this.state.GI_SEQ_NO,
          GR_NO: this.state.GR_NO,
          GR_SEQ_NO: this.state.GR_SEQ_NO,
          GI_DATE_FROM: this.state.GI_DATE,
          GI_DATE_TO: this.state.GI_DATE,
          GI_FLAG: 'Y',
          LINK_TYPE: this.state.LINK_TYPE,
          SCAN_NO: this.state.barcodeData1,
        },
      }),
    });

    if (result1) {
      // 정해진 데이터만 보여준다.
      if (result1.DMS030320G2[0]) {
        let totalData = '';
        totalData = this.state.data;
        totalData.push(result1.DMS030320G2[0]);

        this.setState(
          {
            data: totalData,
            status: {
              TYPE: result1.TYPE,
              MSG: result1.MSG,
            },
            barcodeData1: null,
          },
          scanData,
        );
        Util.openLoader(this.screenId, false);
      } else {
        this.setState({
          barcodeData1: null,
        // status: null, // fetch후 리턴받은 모든 값
        });
        Util.msgBox({
          title: 'Scan Check',
          msg: 'Invaild data! Check again!',
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });

        Util.openLoader(this.screenId, false);
      }
    } else {
      Util.msgBox({
        title: 'Scan Check',
        msg: 'Invaild data! Check again!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      this.setState({
        barcodeData1: null,
        // status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
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

  _onDelete(SCAN_NO) {
    const listData = this.state.data;
    const idx = listData.findIndex((item) => item.SCAN_NO === SCAN_NO);
    listData.pop(idx);
    this.setState({
      data: listData,
    });
    // const checkData = modelUtil.getModelData('DMS100206');
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

  renderBody = (item, index, scanData, scanIndex) => (
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
          <HButton
            onPress={() => this._onDelete(item.SCAN_NO)}
            name={'link'}
            title={'Delete'}
          />
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

  render() {
    return (
      <HBaseView style={styles.container} scrollable={false}>
        {/* <Spinner visible={this.state.spinner} /> */}
        <View style={styles.spaceAroundStyle}>
          <Text style={styles.textTopStyle}>
            {this.state.GI_NO} ({this.state.GI_STATUS_NAME})
          </Text>
          <Text style={styles.textTopStyle}>
            {this.state.LINK_TYPE} (CNT: {this.state.COUNT})
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

        <View style={styles.buttonContainer}>{this.buttonControll(1)}</View>
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
