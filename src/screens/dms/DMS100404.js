/* *
 * Import Common
 * */
import { View, StyleSheet, TextInput } from 'react-native';
import { _, React, Util, Redux, Fetch, NavigationScreen, modelUtil, env, bluecolor, Navigation } from 'libs';
import {
  HBaseView,
  HRow,
  HDatefield,
  HCheckbox,
  HTextfield,
  HFormView,
  HText,
  HListView,
  Touchable,
  HIcon,
} from 'ux';

/**
 * Stock Daily 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100404');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      selectedCal: 0,
      selectedIndex: 0,
      spinner: false,
      visible: true,
      visibleTabCntr: this.props.visibleTabCntr !== false,
      M_KEYWORD: null,
    };
    this.callapsed = false;
  }

  async componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);

    if (whCode && vendorCode) {
      modelUtil.setModelData('DMS100404', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        GR_DATE_FROM: Util.getDateValue(),
        GR_FLAG: 'Y',
        M_KEYWORD: null,
        EXIST_YN: 'Y',
        DT_YN: 'N',
        PLT_YN: 'N',
        BOX_YN: 'N',
        ITEM_YN: 'N',
        GRGI_DAY: 'GR',
        GRGI_DAY_NAME: 'G/R',
      });
    } else {
      modelUtil.setModelData('DMS100404', {
        GR_DATE_FROM: Util.getDateValue(),
        GR_FLAG: 'Y',
        EXIST_YN: 'Y',
        DT_YN: 'N',
        PLT_YN: 'N',
        BOX_YN: 'N',
        ITEM_YN: 'N',
        GRGI_DAY: 'GR',
        GRGI_DAY_NAME: 'G/R',
        M_KEYWORD: null,
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
      this.fetch();
    }
  }

  async fetch(sort) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    if (!Util.isEmpty(sort)) {
      modelUtil.setValue('DMS100404.M_KEYWORD', sort);
    } else {
      modelUtil.setValue('DMS100404.M_KEYWORD', this.state.M_KEYWORD);
    }

    const result = await Fetch.request('DMS030510SVC', 'getDaily', {
      body: JSON.stringify({
        DMS030510F1: modelUtil.getModelData('DMS100404'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.DMS030510G1, env().listCnt);
      this.setState({
        dataTotal: result.DMS030510G1,
        data,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
      });
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


  popupItem(item) {
    if (item != null) {
      const { navigator } = this.props.global;
      const state = modelUtil.getModelData('DMS100404');
      navigator.showOverlay({
        component: {
          name: 'screen.DMS100408',
          passProps: {
            title: 'Item Detail',
            item,
            PLT_YN: state.PLT_YN,
            BOX_YN: state.BOX_YN,
            ITEM_YN: state.ITEM_YN,
          },
          options: {
            layout: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
            overlay: {
              interceptTouchOutside: true,
            },
          },
        },
      });
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

  // FLAT LIST 내부에 넣으면 키보드가 닫히는 이슈발생으로 ..
  renderHeader = () => (
    <View>
      <HDatefield label={'Stock Date'} bind={'DMS100404.GR_DATE_FROM'} editable require />
      <HRow>
        <HCheckbox label={'Exist'} bind={'DMS100404.EXIST_YN'} editable />
        <HCheckbox label={'PLT'} bind={'DMS100404.PLT_YN'} toggle editable />
        <HCheckbox label={'BOX'} bind={'DMS100404.BOX_YN'} toggle editable />
        <HCheckbox label={'ITEM'} bind={'DMS100404.ITEM_YN'} toggle editable />
      </HRow>
      <TextInput
        style={(styles.barcodeInput, { flex: 1 })}
        ref={c => {
          this.barcode1 = c;
        }}
        placeholder="Search"
        onChangeText={M_KEYWORD => this.setState({ M_KEYWORD })}
        value={this.state.M_KEYWORD}
        autoFocus={this.state.GR_STATUS !== 'F'}
        blurOnSubmit={false}
        keyboardType="email-address"
        onSubmitEditing={() => {
          this.focusNextField();
        }}
      />
    </View>
  );
  renderBody = (item, index) => (
    <View key={item.GR_NO}>
      <HFormView style={{ marginTop: 2 }}>
        <Touchable
          activeOpacity={0.5}
          onPress={() => this.popupItem(item)}
        >
          <HText
            value={item.GR_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
        </Touchable>
        <HRow>
          <HText
            value={'Type'}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          />
          <HText
            value={'T/T'}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          />
          <HText
            value={'GR'}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          />
          <HText
            value={'GI'}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          />
          <HText
            value={'NOW'}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          />
        </HRow>
        <HRow>
          <HText value={'Item'} />
          <HText value={item.BASE_ITEM_QTY || 0} />
          <HText value={item.GR_ITEM_QTY || 0} />
          <HText value={item.GI_ITEM_QTY || 0} />
          <HText value={item.NOW_ITEM_QTY || 0} />
        </HRow>
        <HRow>
          <HText value={'Carton'} />
          <HText value={item.BASE_CT_QTY || 0} />
          <HText value={item.GR_CT_QTY || 0} />
          <HText value={item.GI_CT_QTY || 0} />
          <HText value={item.NOW_CT_QTY || 0} />
        </HRow>
        <HRow>
          <HText value={'Pallet'} />
          <HText value={item.BASE_PLT_QTY || 0} />
          <HText value={item.GR_PLT_QTY || 0} />
          <HText value={item.GI_PLT_QTY || 0} />
          <HText value={item.NOW_PLT_QTY || 0} />
        </HRow>
      </HFormView>
    </View>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.GR_NO + item.GR_SEQ_NO}
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
