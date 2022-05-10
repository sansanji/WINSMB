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
    super(props, 'DMS200501');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      selectedCal: 0,
      selectedIndex: 0,
      spinner: false,
      visible: true,
      visibleTabCntr: this.props.visibleTabCntr !== false,
      grData: null,
    };
    this.callapsed = false;
  }
  async componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);
    if (whCode && vendorCode) {
      modelUtil.setModelData('DMS200501', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        GR_DATE_FROM: Util.getDateValue(null, -3),
        GR_DATE_TO: Util.getDateValue(),
        // GR_DATE_FROM: '20200601',
        // GR_DATE_TO: '20210628',
        GR_FLAG: 'Y',
        GR_NO: null,
        M_GR_STATUS: 'Y',
      });
    } else {
      modelUtil.setModelData('DMS200501', {
        GR_DATE_FROM: Util.getDateValue(null, -3),
        GR_DATE_TO: Util.getDateValue(),
        GR_FLAG: 'Y',
        M_GR_STATUS: 'Y',
      });
    }
  }
  async componentDidMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }
  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.dmsValidCheckFunc(alertType);
    if (validCheck) {
      this.fetch('', null);
    }
  }
  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    if (!Util.isEmpty(sort)) {
      modelUtil.setValue('DMS200501.GR_NO', sort);
    } else {
      modelUtil.setValue('DMS200501.GR_NO', this.state.grData);
    }


    const result = await Fetch.request('DMS030050SVC', 'get', {
      body: JSON.stringify({
        DMS030050F1: modelUtil.getModelData('DMS200501'),
      }),
    });
    if (result.TYPE === 1) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.DMS030050G1, env().listCnt);
      this.setState(
        {
          dataTotal: result.DMS030050G1,
          data,
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
      'screen.DMS200502',
      {
        onSaveComplete: callback => this.fetch(null, callback),
        params: item,
      },
      'GR Dt. Info.',
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
// FLAT LIST 내부에 넣으면 키보드가 닫히는 이슈발생으로 ..
// renderHeader = () => (
//   <View>
//     <HDateSet
//       bindVar={{
//         FROM_DATE: 'DMS200501.GR_DATE_FROM',
//         TO_DATE: 'DMS200501.GR_DATE_TO',
//         DATE_TYPE: 'DMS200501.DATE_TYPE',
//       }}
//       fDateNum={-3}
//       tDateNum={0}
//     />
//     <HRow>
//       <HTextfield label={'Search'} bind={'DMS200501.GR_NO'} editable />
//       <HCheckbox
//         label={'Ready'}
//         bind={'DMS200501.M_GR_STATUS'}
//         editable
//       />
//     </HRow>
//   </View>
// );

// 변경테스트
renderHeader = () => (
  <View>
    <HDateSet
      bindVar={{
        FROM_DATE: 'DMS200501.GR_DATE_FROM',
        TO_DATE: 'DMS200501.GR_DATE_TO',
        DATE_TYPE: 'DMS200501.DATE_TYPE',
      }}
      fDateNum={-3}
      tDateNum={0}
    />
    <View style={styles.spaceAroundStyle}>
      <TextInput
        style={(styles.barcodeInput, { flex: 1 })}
        ref={c => {
          this.barcode1 = c;
        }}
        placeholder="GR NO"
        onChangeText={grData => this.setState({ grData })}
        value={this.state.grData}
        autoFocus={this.state.GR_STATUS !== 'F'}
        blurOnSubmit={false}
        keyboardType="email-address"
        onSubmitEditing={() => {
          this.focusNextField();
        }}
        // onSubmitEditing={() => {
        //   this.fetch(this.state.grData);
        // }}
      />
      <View style={styles.buttonStyle}>
        <HCheckbox
          label={'Ready'}
          bind={'DMS200501.M_GR_STATUS'}
          editable
        />
      </View>
    </View>
  </View>
);


renderBody = (item, index) => (
  <Touchable
    style={{ flex: 1 }}
    activeOpacity={0.7}
    key={item.GR_NO}
    onPress={() => this._onPress(item)}
  >
    <HFormView style={{ marginTop: 2 }}>
      <HRow between>
        <HText
          value={item.GR_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText value={item.GR_DATE_TIME} />
      </HRow>
      <HRow between>
        <HText value={item.VENDOR_NAME} />

        {
          item.GR_STATUS === 'F' ? (
            <HText
              value={`${item.GR_STATUS_NAME}`}
              textStyle={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#003366',
              }}
            />
          ) : (
            <HText
              value={`${item.GR_STATUS_NAME} ${item.GR_STATUS !== 'F' && item.SCAN_QTY === 0 ? '' : '/ 임시저장'}`}
              textStyle={[
                item.GR_STATUS === 'F'
                  ? {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#003366',
                  }
                  : {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#d0b619',
                  },
              ]}
            />
          )
        }

      </HRow>
      <HRow>
        <HTextfield label={'Ref No'} value={item.REF_NO} />
        <HTextfield label={'Doc No'} value={item.REF_DOC_NO} />
        <HNumberfield label={'DT Cont'} value={item.GR_DT_COUNT} />
      </HRow>
    </HFormView>
  </Touchable>
);
render() {
  return (
    <HBaseView scrollable={false} button={() => this.fetch()}>
      <HListView
        keyExtractor={item => item.GR_NO}
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
    bottom: 490,
    right: 20,
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
    justifyContent: 'center',
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
