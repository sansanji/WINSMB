/* *
* Import Common
* */
import { View, StyleSheet, TextInput, Text, Keyboard } from 'react-native';
import {
  React,
  Util,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  modelUtil,
  env,
  bluecolor,
  moment,
} from 'libs';
import {
  HBaseView,
  Touchable,
  HRow,
  HCheckbox,
  HTextfield,
  HFormView,
  HText,
  HIcon,
  HListView,
  HNumberfield,
  HButton,
  HTexttitle,
} from 'ux';
/**
* 롯데 출고 화면
*/
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS201303');
    // 바코드 및 list 관련
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      barcodeData0: null,
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      scanVaildData: null,
      barSeq: 0,
      Date: moment().format('YYYYMMDD'),
    };
  }
  async componentWillMount() {
    this.barcode = [];
    const validCheck = Util.dmsValidCheckFunc('alert');
    if (!validCheck) {
      return;
    }

    // 체크박스 설정 관련
    modelUtil.setModelData('DMS201303', {
      COMPANY_CODE: this.props.global.session.COMPANY_CODE,
      WH_CODE: this.props.global.session.WH_CODE,
      fixLabel: 'N',
      fixType: 'N',
      fixWh: 'N',
      fixWeight: 'N',
      GR_FLAG: 'Y',
    });

    await this.fetchList(null, () => this.barcode[0].focus());
  }

  // 처음 값을 조회 해 온다.
  async fetchList(callback, focus) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { COMPANY_CODE } = this.props.global.session;
    const { WH_CODE } = this.props.global.dmsWhcode;

    const result = await Fetch.request('WMS050315SVC', 'getOut', {
      body: JSON.stringify({
        WMS050315F1: {
          COMPANY_CODE,
          WH_CODE,
          GR_FLAG: 'Y',
          GR_DATE_FROM: this.state.Date,
          GR_DATE_TO: this.state.Date,
        },
      }),
    });
    Util.openLoader(this.screenId, false);
    if (!Util.isEmpty(callback)) {
      callback();
    } else {
      this.barcode[0].focus();
    }

    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.WMS050315G2, env().listCnt);
      this.setState(
        {
          dataTotal: result.WMS050315G2,
          data,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
      );
      if (!Util.isEmpty(focus)) {
        this.barcode[0].focus();
      }
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 스캔값 저장
  async saveScan(WH_CODE, BARCODE, TYPE, WEIGHT, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('WMS050315SVC', 'saveOut', {
      body: JSON.stringify({
        WMS050315G2: {
          data: [{
            GI_DATE: this.state.Date,
            BARCODE,
            TYPE,
            WEIGHT,
            WH_CODE,
          }],
        },
      }),
    });
    Util.openLoader(this.screenId, false);
    if (result.TYPE === 1) {
      this.setState({
        scanVaildData: 'Scan Sucess',
      });
      this.successScan();
      // 성공 시 문구 표시
      this.fetchList(callback);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
        scanVaildData: 'Scan fail, please check barcode Data',
      });
      this.failScan();
    }
  }

  // 포커스 이동
  async _focusNextField(scanData) {
    let barSeq = this.state.barSeq;
    let barcodeData = this.barcode[barSeq]._lastNativeText;
    let barcodeData0 = this.state.barcodeData0;
    let barcodeData1 = this.state.barcodeData1;
    let barcodeData2 = this.state.barcodeData2;
    let barcodeData3 = this.state.barcodeData3;

    if (scanData) {
      barcodeData = scanData;
    }
    if (!barcodeData) {
      this.deleteAll('Please, Input the barcode data!');
      this.failScan();
      return;
    }

    // 스캔된 바코드를 화면에 입력해 주는 부분
    if (barSeq === 0) {
      barcodeData0 = barcodeData;
    } else if (barSeq === 1) {
      barcodeData1 = barcodeData;
    } else if (barSeq === 2) {
      barcodeData2 = barcodeData;
    } else {
      barcodeData3 = barcodeData;
    }

    this.setState({
      barcodeData0,
      barcodeData1,
      barcodeData2,
      barcodeData3,
    });

    // ********** focus 이동 부분 시작 ****************
    if (barSeq === 0 && (!Util.isEmpty(this.state.barcodeData0) || !Util.isEmpty(barcodeData0))) {
      barSeq += 1;
    }

    if (barSeq === 1 && (!Util.isEmpty(this.state.barcodeData1) || !Util.isEmpty(barcodeData1))) {
      barSeq += 1;
    }

    if (barSeq === 2 && (!Util.isEmpty(this.state.barcodeData2) || !Util.isEmpty(barcodeData2))) {
      barSeq += 1;
    }
    // if (barSeq === 3 && !Util.isEmpty(this.state.barcodeData3)) {
    //   barSeq = 0;
    // }

    // 모든 입력값이 채워져 있을 시에는 세이브 진행
    if ((!Util.isEmpty(this.state.barcodeData3) || !Util.isEmpty(barcodeData3)) &&
        (!Util.isEmpty(this.state.barcodeData2) || !Util.isEmpty(barcodeData2)) &&
        (!Util.isEmpty(this.state.barcodeData1) || !Util.isEmpty(barcodeData1)) &&
        (!Util.isEmpty(this.state.barcodeData0) || !Util.isEmpty(barcodeData0))) {
      this.saveScan(barcodeData0, barcodeData1, barcodeData2, barcodeData3, () => this.resetScanValue());
      return;
    }

    this.barcode[barSeq].clear();
    this.barcode[barSeq].focus();

    this.setState({
      barSeq,
    });
    // ********** focus 이동 부분 끝 ****************
  }

  // 스캔 성공 시 리셋 처리
  async resetScanValue() {
    const { fixWh, fixLabel, fixType, fixWeight } = modelUtil.getModelData('DMS201303');
    const barSeq = [];

    // 바코드 초기화
    if (fixWeight === 'N') {
      this.setState({ barcodeData3: null });
      this.barcode[3].clear();
      barSeq.unshift('weight');
    }

    if (fixType === 'N') {
      this.setState({ barcodeData2: null });
      this.barcode[2].clear();
      barSeq.unshift('type');
    }

    if (fixLabel === 'N') {
      this.setState({ barcodeData1: null });
      this.barcode[1].clear();
      barSeq.unshift('label');
    }

    if (fixWh === 'N') {
      this.setState({ barcodeData0: null });
      this.barcode[0].clear();
      barSeq.unshift('warehouse');
    }

    // 포커스이동
    for (let i = 0; i < barSeq.length; i += 1) {
      if (barSeq[i] === 'warehouse') {
        this.barcode[0].focus();
        this.setState({ barSeq: 0 });
      } else if (barSeq[i] === 'label') {
        this.barcode[1].focus();
        this.setState({ barSeq: 1 });
      } else if (barSeq[i] === 'type') {
        this.barcode[2].focus();
        this.setState({ barSeq: 2 });
      } else if (barSeq[i] === 'weight') {
        this.barcode[3].focus();
        this.setState({ barSeq: 3 });
      }
      return;
    }
  }

  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
    // this.barcode[1].focus();
  }

  failScan() {
    this.barcode[0].focus();
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
  }

  deleteAll(msg) {
    this.setState({
      scanVaildData: msg,
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
    this._focusNextField(result);
  }

  // 해당 화면의 데이터 초기화
  _resetState(barcodeData0) {
    this.setState({
      barcodeData0: null,
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      scanVaildData: null,
      barSeq: 0,
    });
    if (!Util.isEmpty(this.barcode[0])) {
      this.barcode[0].clear();
    }
    if (!Util.isEmpty(this.barcode[1])) {
      this.barcode[1].clear();
    }
    if (!Util.isEmpty(this.barcode[2])) {
      this.barcode[2].clear();
    }
    if (!Util.isEmpty(this.barcode[3])) {
      this.barcode[3].clear();
    }
    this.barcode[0].focus();
    if (!Util.isEmpty(barcodeData0)) {
      barcodeData0();
    }
  }

// 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
onMoreView = getRtnData => {
// 리턴 된 값이 있을 경우만 setState 처리!
  if (!Util.isEmpty(getRtnData)) {
    this.setState({
      data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
    });
  }
};


renderBody = (item, index) => (
  <Touchable
    style={{ flex: 1 }}
    key={item.SEQ + item.BARCODE}
  >
    <HFormView style={{ marginTop: 2 }}>
      <HRow between>
        <HText
          value={`${item.BARCODE}`}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText value={item.GR_DATE} />
      </HRow>
      <HRow>
        <HTextfield label={'WHARE HOUSE'} value={item.WH_CODE} />
        <HTextfield label={'SEQ'} value={item.SEQ} />
        <HRow>
          <HTextfield label={'TYPE'} value={item.TYPE} />
          <HNumberfield label={'WEIGHT'} value={item.WEIGHT} />
        </HRow>
      </HRow>
    </HFormView>
  </Touchable>
);
render() {
  return (
    <HBaseView scrollable={false}>
      <View>
        <View style={styles.spaceAroundStyle}>
          <TextInput
            // editable={false}
            // selectTextOnFocus={false}
            ref={c => {
              this.barcode[0] = c;
            }}
            placeholder="WH Code"
            keyboardType="email-address" // autoFocus
            value={this.state.barcodeData0}
            style={(styles.barcodeInput, { flex: 1 })}
            onChangeText={barcodeData0 => this.setState({ barcodeData0 })}
            onSubmitEditing={() => {
              this._focusNextField();
            }}
          />

        </View>
        <View style={styles.spaceAroundStyle}>
          <TextInput
            // editable={false}
            // selectTextOnFocus={false}
            ref={c => {
              this.barcode[1] = c;
            }}
            placeholder="Lotte Label"
            keyboardType="email-address"
            value={this.state.barcodeData1}
            style={(styles.barcodeInput, { flex: 1 })}
            onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
            onSubmitEditing={() => {
              this._focusNextField();
            }}
          />
          <TextInput
            // editable={false}
            // selectTextOnFocus={false}
            ref={c => {
              this.barcode[2] = c;
            }}
            placeholder="Type"
            keyboardType="email-address"
            value={this.state.barcodeData2}
            style={(styles.barcodeInput, { flex: 1 })}
            onChangeText={barcodeData2 => this.setState({ barcodeData2 })}
            onSubmitEditing={() => {
              this._focusNextField();
            }}
          />
          <TextInput
            style={(styles.barcodeInput, { flex: 1 })}
            ref={c => {
              this.barcode[3] = c;
            }}
            placeholder="Weight"
            keyboardType="number-pad"
            value={this.state.barcodeData3}
            onChangeText={barcodeData3 => this.setState({ barcodeData3 })}
            onSubmitEditing={() => {
              this._focusNextField();
            }}
          />
        </View>
        <View style={styles.spaceAroundStyle}>
          <HCheckbox label={'WH Code fix'} bind={'DMS201303.fixWh'} editable />
          <HCheckbox label={'Label fix'} bind={'DMS201303.fixLabel'} editable />
          <HCheckbox label={'Type fix'} bind={'DMS201303.fixType'} editable />
          <HCheckbox label={'Weight fix'} bind={'DMS201303.fixWeight'} editable />
          <View style={styles.buttonStyle}>
            <HButton onPress={() => this._resetState()} name={'refresh'} />
          </View>
        </View>
        <View>
          <Text
            style={styles.textVaildScan}
            ref={c => {
              this.scanVaildData = c;
            }}
          >
            {this.state.scanVaildData}
          </Text>
        </View>
      </View>

      <HTexttitle>Scan LIST</HTexttitle>
      <HListView
        keyExtractor={item => item.SEQ + item.BARCODE}
        renderItem={({ item, index }) => this.renderBody(item, index)}
        onSearch={() => this.fetchList()}
        onMoreView={this.onMoreView}
        // 그려진값
        data={this.state.data}
        // 조회된값
        totalData={this.state.dataTotal}
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
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
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
