/* *
* Import Common
* */
import { View, StyleSheet, TextInput } from 'react-native';
import {
  _,
  React,
  Util,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  modelUtil,
  env,
  bluecolor,
  langUtil,
} from 'libs';
import {
  HBaseView,
  Touchable,
  HRow,
  HDateSet,
  HDatefield,
  HCheckbox,
  HTextfield,
  HFormView,
  HText,
  HIcon,
  HListView,
  HNumberfield,
} from 'ux';
/**
* 출고 화면
*/
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200401');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      packingNo: null,
    };

    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('DMS200401', {
      // GI_DATE_FROM: Util.getDateValue(null, -3),
      // SHIP_DATE: '20210628',
      SHIP_DATE: Util.getDateValue(),
      M_KEYWORD: null,
      M_GI_STATUS: 'Y',
    });
  }

  async componentWillMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // async componentDidMount() {
  // }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.dmsValidCheckFunc(alertType);
    if (validCheck) {
      this.fetch('', null);
    }
  }

  // packing List 정보를 조회한다
  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    // WMS에서 데이터 정보를 끌어 쓰고 있기에, dms의 WH_CODE 를 끌어올수 없음.
    // 현재는 LCHU창고에서만 해당 화면을 쓰기 때문에 하드코딩으로 대체함.
    // const WH_CODE = this.props.global.dmsVendorcode.WH_CODE;

    const COMPANY_CODE = this.props.global.dmsVendorcode.COMPANY_CODE;
    const SHIP_DATE = modelUtil.getValue('DMS200401.SHIP_DATE');
    let readyYN = modelUtil.getValue('DMS200401.M_GI_STATUS');

    if (readyYN === 'Y') {
      readyYN = 'Ready';
    } else {
      readyYN = null;
    }

    if (!Util.isEmpty(sort)) {
      modelUtil.setValue('DMS200401.M_KEYWORD', sort);
    } else {
      modelUtil.setValue('DMS200401.M_KEYWORD', this.state.packingNo);
    }


    const result = await Fetch.request('WMS050312SVC', 'getM', {
      body: JSON.stringify({
        WMS050312F1: {
          COMPANY_CODE,
          WH_CODE: 'LCHU',
          SHIP_DATE,
          M_GI_STATUS: readyYN,
        },
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.WMS050312G1, env().listCnt);
      let confirmData = 0;
      let readyData = 0;

      for (let i = 0; i < result.WMS050312G1.length; i++) {
        if (result.WMS050312G1[i].CONFIRM_YN === 'Confirm') {
          confirmData += 1;
        } else {
          readyData += 1;
        }
      }

      this.setState(
        {
          dataTotal: result.WMS050312G1,
          data,
          status: {
            TYPE: result.TYPE,
            MSG: `${result.MSG} (CONFIRM QTY: ${confirmData}, READY QTY: ${readyData}, TOTAL QTY:${result.WMS050312G1.length})`,
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

  // 바코드 스캔 처리 로직
  focusNextField(scanData) {
    this.barcode1.clear();

    const barcode1Data = this.barcode1._lastNativeText;
    if (!Util.isEmpty(scanData)) {
      this.fetch(scanData);
    } else {
      this.fetch(barcode1Data);
    }
  }

  _onPress(item) {
    const { navigator } = this.props;
    Navigation(
      navigator,
      'screen.DMS200402',
      {
        onSaveComplete: callback => this.fetch(null, callback),
        params: item,
      },
      'GI Dt. Info.',
    );
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

  // onBarcodeScan(result) {
  // this.focusNextField(result);
  // this.fetch(scanData);
  // }


// 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
onMoreView = getRtnData => {
// 리턴 된 값이 있을 경우만 setState 처리!
  if (!Util.isEmpty(getRtnData)) {
    this.setState({
      data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
    });
  }
};

// 변경테스트
renderHeader = () => (
  <View>
    <HRow>
      <HDatefield
        label={'SHIP_DATE'}
        bind={'DMS200401.SHIP_DATE'}
        style={{ marginStart: 5 }}
        editable
        require
      />
      <View style={styles.buttonStyle}>
        <HCheckbox
          label={'Ready'}
          bind={'DMS200401.M_GI_STATUS'}
          editable
        />
      </View>
    </HRow>

    <TextInput
      style={(styles.barcodeInput, { flex: 1 })}
      ref={c => {
        this.barcode1 = c;
      }}
      placeholder="Packing NO"
      onChangeText={packingNo => this.setState({ packingNo })}
      value={this.state.packingNo}
      autoFocus={this.state.GI_STATUS !== 'F'}
      blurOnSubmit={false}
      keyboardType="email-address"
      onSubmitEditing={() => {
        this.focusNextField();
      }}
      // onSubmitEditing={() => {
      //   this.fetch(this.state.packingNo);
      // }}
    />
  </View>
);

renderBody = (item, index) => (
  <Touchable
    style={{ flex: 1 }}
    activeOpacity={0.7}
    key={item.PACKING_NO}
    onPress={() => this._onPress(item)}
  >
    <HFormView
      style={[
        { marginTop: 2 },
        item.CONFIRM_YN === 'Confirm'
          ? { backgroundColor: bluecolor.basicSkyLightBlueTrans }
          : null,
      ]}
    >
      <HRow between>
        <HText
          value={item.PACKING_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText value={item.SHIP_DATE} />
      </HRow>
      <HRow>
        <HNumberfield label={'Truck No'} value={item.TRUCK} />
        <HNumberfield label={'Pallet QTY'} value={item.PAL} />
        <HNumberfield label={'Total QTY'} value={item.TOTAL_QTY} />
        {
          item.SCAN_COUNT > 0 ?
            <HNumberfield textColor={bluecolor.basicRedColor} label={'Scan Qty'} value={item.SCAN_COUNT} bold /> :
            <HNumberfield label={'Scan Qty'} value={item.SCAN_COUNT} />
        }

      </HRow>
    </HFormView>
  </Touchable>
);
render() {
  return (
    <HBaseView scrollable={false} button={() => this.fetch()}>
      <HListView
        keyExtractor={item => item.PACKING_NO}
        headerOpen
        renderHeader={this.renderHeader}
        renderItem={({ item, index }) => this.renderBody(item, index)}
        onSearch={() => this.fetch()}
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
  spaceAroundStyle: {
    flexDirection: 'row',
    // justifyContent: 'center',
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
    paddingRight: 80,
    paddingLeft: 3,
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
