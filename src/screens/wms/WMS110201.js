/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Keyboard, Vibration } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  Util,
  bluecolor,
  modelUtil,
} from 'libs';
import {
  HBaseView,
  Touchable,
  HIcon,
  HRow,
  HFormView,
  HText,
  HListView,
  HDateSet,
  HCombobox,
  HButton,
  HCheckbox,
} from 'ux';
/* *
 * Import node_modules
 * */

/**
 * 반입신고 LIST
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS110201');

    this.state = {
      totalData: [],
      data: [],
      status: null,
      spinner: false,
      barcodeData1: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
    };
  }

  componentWillMount() {
    modelUtil.setModelData('WMS110201', {
      BONDED_CARRY_PRINT: 'SCHEDULE',
      BONDED_CODE: '04078011',
      TP_CODE: 'KCSIPT00000000',
      BONDED_UNLOAD_FLAG: 'A',
      BONDED_UNLOAD_FLAG_NAME: '하기장',
      FROM_DATE: Util.getDateValue(null, -7),
      TO_DATE: Util.getDateValue(null, 1),
      DATE_ACTIVE_FLAG: 'Y',
      EXCEPT_FLAG: 'N',
      WH_GR_YN: 'N',
      WH_GR_YN_NAME: 'NO',
    });
  }

  componentDidMount() {
    this.fetch(null);
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('WMS020105SVC', 'getSchedule', {
      body: JSON.stringify({
        WMS020105F1: modelUtil.getModelData('WMS110201'),
      }),
    });
    // 스캔 갯수 표시
    let count = 0;
    let ingcount = 0;
    for (let i = 0; i < result.WMS020105G1.length; i += 1) {
      if (result.WMS020105G1[i].CHECK_QTY === result.WMS020105G1[i].PKG_QTY) {
        count += 1;
      } else if (result.WMS020105G1[i].CHECK_QTY > 0) {
        ingcount += 1;
      }
    }

    if (result) {
      // 정해진 데이터만 보여준다.
      // const data = Util.getArrayData(result.WMS020105G1, env().listCnt);
      this.setState(
        {
          totalData: result.WMS020105G1,
          data: result.WMS020105G1,
          status: {
            TYPE: result.TYPE,
            MSG: `${result.MSG} 스캔완료(${count}) 스캔중(${ingcount})`,
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

  filterSearch(text) {
    const dataList = Util.filterData(this.state.totalData, 'H_BL_NO', text);
    this.setState({
      filterText: text,
      data: dataList,
    });
  }

  // 바코드 스캔 처리 로직
  focusNextField(scanData) {
    Vibration.vibrate(500);
    const dataList = this.state.totalData;
    const dataLength = this.state.totalData.length;

    this.barcode1.clear();

    let barcode1Data = this.barcode1._lastNativeText;
    if (scanData) {
      barcode1Data = scanData;
    }

    if (!barcode1Data) {
      this.setState({
        scanVaildData: '바코드를 입력해 주세요',
      });
      this.scanVaildData.setNativeProps({
        style: styles.textVaildScanFailure,
      });

      this._sound('f');

      return;
    }

    let barcodeYN = 'N';
    let currentIndex = null;
    let g1ScanData = null;
    let targetG1ScanData = null;
    let CHECK_QTY = 0;
    let TOTAL_QTY = 0;

    barcode1Data = Util.onlyBigChar(barcode1Data);
    for (let i = 0; i < dataLength; i += 1) {
      // if (barcode1Data.toUpperCase().trim() === this.state.data[i].REF_NO.toUpperCase().trim()) {
      // 1. 바코드 스캐너 기존 REF_NO에서 대상 컬럼 변경
      //  - wh_code + gr_no + gr_seq_no
      //  - WH13 + GR2018041900001 + 1
      //  - 최종 예시 : 13180419000011
      g1ScanData = this.state.totalData[i].H_BL_NO.toUpperCase().trim();
      if (barcode1Data === g1ScanData) {
        barcodeYN = 'Y'; // 스캔 성공
        currentIndex = i;
        if (
          dataList[currentIndex].CHECK_QTY === undefined ||
          dataList[currentIndex].CHECK_QTY === null
        ) {
          CHECK_QTY = 0;
        } else {
          CHECK_QTY = dataList[currentIndex].CHECK_QTY;
        }
        TOTAL_QTY = dataList[currentIndex].PKG_QTY;
      }
    }

    // 스캔 성공 여부에 따른 로직
    if (barcodeYN === 'Y') {
      // 스캔 성공한 경우
      dataList[currentIndex].scanChecked = 'Y';
      CHECK_QTY += 1;

      dataList[currentIndex].CHECK_QTY = CHECK_QTY;
      targetG1ScanData = this.state.totalData[currentIndex].H_BL_NO.trim();

      if (TOTAL_QTY === CHECK_QTY) {
        this.setState({
          scanVaildData: `"${targetG1ScanData}" (${CHECK_QTY} / ${TOTAL_QTY}) 수량이 일치합니다.`,
          barcodeScanData: barcode1Data,
          barcodeScanIndex: currentIndex,
          data: dataList,
        });

        this._setScanValidData('s');
        this._sound('s');
      } else {
        this.setState({
          scanVaildData: `"${targetG1ScanData}" (${CHECK_QTY}/${TOTAL_QTY}) 수량이 일치하지 않습니다.`,
          barcodeScanData: barcode1Data,
          barcodeScanIndex: currentIndex,
          data: dataList,
        });

        this._setScanValidData('f');
        this._sound('f');
      }
    } else {
      // 스캔 실패한 경우
      this.setState({
        scanVaildData: `"${barcode1Data}" (${CHECK_QTY} / ${TOTAL_QTY}) 스캔실패`,
        barcodeScanData: null,
        barcodeScanIndex: null,
      });

      this._setScanValidData('f');
      this._sound('f');
    }
  }

  _keyboardDismiss() {
    Keyboard.dismiss();
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
      filterText: null,
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

  // 수량 매뉴얼 체크
  _onCheckPress(item, index) {
    const data = this.state.data;
    const totalData = this.state.totalData;
    let setScanQty = item.PKG_QTY;
    if (item.CHECK_QTY === item.PKG_QTY) {
      setScanQty = 0;
    }
    totalData.forEach(x => {
      if (x === item) {
        x.CHECK_QTY = setScanQty;
        x.scanChecked = 'Y';
      }
    });

    data.forEach(dt => {
      if (dt === item) {
        dt.CHECK_QTY = setScanQty;
        dt.scanChecked = 'Y';
      }
    });

    this.setState({
      data,
      totalData,
    });

    Util.toastMsg(`${setScanQty}개 스캔`);
  }

  // 매뉴얼로 카운팅
  _onCountPress(item, index) {
    const data = this.state.data;
    const totalData = this.state.totalData;
    let setScanQty = item.CHECK_QTY || 0;
    setScanQty += 1;
    totalData.forEach(x => {
      if (x === item) {
        x.CHECK_QTY = setScanQty;
        x.scanChecked = 'Y';
      }
    });

    data.forEach(dt => {
      if (dt === item) {
        dt.CHECK_QTY = setScanQty;
        dt.scanChecked = 'Y';
      }
    });

    this.setState({
      data,
      totalData,
    });

    Util.toastMsg(`${setScanQty}개 스캔`);
  }

  onConfirm() {
    const dataList = this.state.totalData;
    const dataLength = this.state.totalData.length;
    const reqList = [];
    const missList = [];
    for (let i = 0; i < dataLength; i += 1) {
      if (dataList[i].CHECK_QTY) {
        if (dataList[i].CHECK_QTY === dataList[i].PKG_QTY) {
          reqList.push(dataList[i]);
        } else {
          missList.push(dataList[i]);
        }
      }
    }

    console.log(reqList);
    let msg = '반입처리 및 반입EDI 전송을 하시겠습니까?';
    if (missList.length > 0) {
      msg = `스캔수량이 맞지않는 ${missList.length}건의 비엘이 존재합니다.\n제외하고 ${msg}`;
    }
    Util.msgBox({
      title: '반입처리 및 EDI 전송',
      msg,
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchConfirm(reqList),
        },
      ],
    });
  }

  // 출고 스캔 수량 저장
  async onSave() {
    const dataList = this.state.totalData;
    const dataLength = this.state.totalData.length;
    const reqList = [];
    for (let i = 0; i < dataLength; i += 1) {
      if (dataList[i].scanChecked) {
        if (dataList[i].scanChecked === 'Y') {
          dataList[i].CHECK_QTY = dataList[i].CHECK_QTY.toString();
          reqList.push(dataList[i]);
        }
      }
    }

    const msg = '스캔수량을 임시저장 하시겠습니까?';
    Util.msgBox({
      title: '스캔수량 임시저장',
      msg,
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchSave(reqList, '스캔수량 저장'),
        },
      ],
    });
  }

  async fetchConfirm(reqList) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS020105SVC', 'sendMobileCarry', {
      body: JSON.stringify({
        WMS020105F1: modelUtil.getModelData('WMS110201'),
        WMS020105G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: '반입',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch();
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '반입',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  async fetchSave(reqList) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS020105SVC', 'saveSchedule', {
      body: JSON.stringify({
        WMS020105F1: modelUtil.getModelData('WMS110201'),
        WMS020105G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: '저장',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch();
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '저장',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
            },
          },
        ],
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
          placeholder="바코드를 입력해주세요"
          onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
          value={this.state.barcodeData1}
          autoFocus
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
  // 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
  // onMoreView = getRtnData => {
  //   // 리턴 된 값이 있을 경우만 setState 처리!
  //   if (!Util.isEmpty(getRtnData)) {
  //     this.setState({
  //       data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
  //     });
  //   }
  // };
  // FLAT LIST 내부에 넣으면 키보드가 닫히는 이슈발생으로 ..
  renderHeader = () => (
    <View>
      <HRow>
        <HDateSet
          bindVar={{
            FROM_DATE: 'WMS110201.FROM_DATE',
            TO_DATE: 'WMS110201.TO_DATE',
            DATE_TYPE: 'WMS110201.DATE_TYPE',
          }}
          fDateNum={-7}
          tDateNum={1}
          rowflex={5}
        />
        <HCombobox
          label={'반입여부'}
          groupCode={'USE_YN'}
          bindVar={{
            CD: 'WMS110201.WH_GR_YN',
            NM: 'WMS110201.WH_GR_YN_NAME',
          }}
          editable
          rowflex={1}
        />
      </HRow>
      <HRow>
        <HCombobox
          label={'구분'}
          groupCode={'BONDED_UNLOAD_FLAG'}
          bindVar={{
            CD: 'WMS110201.BONDED_UNLOAD_FLAG',
            NM: 'WMS110201.BONDED_UNLOAD_FLAG_NAME',
          }}
          editable
          rowflex={2.5}
        />
        <HCombobox
          label={'창고'}
          groupCode={'FLT_WHEREHOUSE'}
          bindVar={{
            CD: 'WMS110201.STORE_CODE',
            NM: 'WMS110201.STORE_CODE_NAME',
          }}
          editable
          rowflex={2.5}
        />
        <HCheckbox label={'제외'} bind={'WMS110201.EXCEPT_FLAG'} editable />
      </HRow>
      <View style={styles.filterInput}>
        <TextInput
          style={styles.barcodeInput}
          placeholder="B/L 번호를 입력해주세요"
          onChangeText={filterText => this.filterSearch(filterText)}
          value={this.state.filterText}
          // autoFocus
          blurOnSubmit={false}
        />
      </View>
    </View>
  );

  renderBody = (item, index, scanData, scanIndex) => (
    <View style={{ flex: 1 }} key={item.GR_REF_NO}>
      <HFormView
        style={[
          { marginTop: 2 },
          item.CHECK_QTY === item.PKG_QTY
            ? { backgroundColor: bluecolor.basicSkyLightBlueColor }
            : null,
          item.WH_GR_YN === 'D' ? { backgroundColor: bluecolor.basicGreenColor } : null,
        ]}
      >
        <HRow>
          <Touchable rowflex={2} onPress={() => this._onCountPress(item, index)}>
            <HText textStyle={{ fontWeight: 'bold' }} value={item.H_BL_NO} />
          </Touchable>
          <HButton
            onPress={() => this._onCheckPress(item, index)}
            name={'check-square-o'}
            bStyle={{
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: bluecolor.basicDeepGrayColor,
            }}
          />
          <HText
            textStyle={[
              item.CHECK_QTY > 0
                ? { color: bluecolor.basicRedColor, fontWeight: 'bold' }
                : { fontWeight: 'bold' },
            ]}
            value={`${item.CHECK_QTY || 0} / ${item.PKG_QTY}`}
          />
          <HText
            label={'G/W'}
            value={Util.formatNumber(item.GROSS_WEIGHT)}
            textStyle={{ textAlign: 'right' }}
          />
          <HText label={'위치'} value={item.LOCATION} textStyle={{ textAlign: 'right' }} />
        </HRow>
      </HFormView>
    </View>
  );

  render() {
    const buttonGroup = [
      {
        title: '반입', // 필수사항
        iconName: 'send', // 필수사항  // FontAwesome
        onPress: (title, param) => {
          this.onConfirm();
        },
      },
      {
        title: '스캔저장', // 필수사항
        iconName: 'save', // 필수사항 // FontAwesome
        onPress: (title, param) => {
          this.onSave();
        },
      },
      {
        title: '조회', // 필수사항
        iconName: 'search', // 필수사항 // FontAwesome
        onPress: (title, param) => {
          this.fetch();
        },
      },
    ];
    return (
      <HBaseView style={styles.container} scrollable={false} buttonGroup={buttonGroup}>
        {this.renderBarcode()}
        <Text
          style={styles.textVaildScan}
          ref={c => {
            this.scanVaildData = c;
          }}
        >
          {this.state.scanVaildData}
        </Text>
        <HListView
          keyExtractor={item => item.GR_REF_NO}
          renderHeader={this.renderHeader}
          renderItem={({ item, index }) =>
            this.renderBody(item, index, this.state.barcodeScanData, this.state.barcodeScanIndex)
          }
          onSearch={() => this.fetch()}
          onMoreView={null}
          data={this.state.data}
          // 조회된값
          totalData={this.state.totalData}
          // 하단에 표시될 메세지값
          status={this.state.status}
        />
        {/* 바코드 스캔입력부분 제어 */}
        <Touchable
          style={styles.searchButton}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.onBarcodePopup()}
        >
          <HIcon name="barcode" size={20} color="#fff" />
        </Touchable>
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
  filterInput: {
    flex: 1,
    marginTop: 10,
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
