/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
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
  HListView,
  HNumberfield,
} from 'ux';

/**
 * 출고 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100201');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      selectedCal: 0,
      selectedIndex: 0,
      spinner: false,
      visible: true,
      visibleTabCntr: this.props.visibleTabCntr !== false,
    };
    this.callapsed = false;
  }

  async componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'vendorcode.VENDOR_CODE', null);
    const vendorPlantCode = _.get(this.props.global, 'vendorcode.VENDOR_PLANT_CODE', null);

    if (whCode && vendorCode && vendorPlantCode) {
      modelUtil.setModelData('WMS100201', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        VENDOR_PLANT_CODE: vendorPlantCode,
        GI_DATE_FROM: Util.getDateValue(null, -3),
        GI_DATE_TO: Util.getDateValue(),
        GI_FLAG: 'Y',
        M_KEYWORD: null,
        M_GI_STATUS: 'Y',
      });
    } else {
      modelUtil.setModelData('WMS100201', {
        GI_DATE_FROM: Util.getDateValue(null, -3),
        GI_DATE_TO: Util.getDateValue(),
        GI_FLAG: 'Y',
        M_GI_STATUS: 'Y',
      });
    }
  }

  async componentDidMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 whcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.wmsValidCheckFunc(alertType);

    if (validCheck) {
      this.fetch('', null);
    }
  }

  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010209SVC', 'get', {
      body: JSON.stringify({
        WMS010209F1: modelUtil.getModelData('WMS100201'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.WMS010209G1, env().listCnt);
      this.setState(
        {
          dataTotal: result.WMS010209G1,
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

  _onPress(item) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.WMS100202',
      {
        onSaveComplete: callback => this.fetch('null', callback),
        params: item,
      },
      'GI Dt. Info.',
    );
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
      <HDateSet
        bindVar={{
          FROM_DATE: 'WMS100201.GI_DATE_FROM',
          TO_DATE: 'WMS100201.GI_DATE_TO',
          DATE_TYPE: 'WMS100201.DATE_TYPE',
        }}
        fDateNum={-3}
        tDateNum={0}
      />
      <HRow>
        <HTextfield label={'Search'} bind={'WMS100201.M_KEYWORD'} editable />
        <HCheckbox
          label={langUtil.get(this, 'A000000001')}
          bind={'WMS100201.M_GI_STATUS'}
          editable
        />
      </HRow>
    </View>
  );
  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.GI_NO}
      onPress={() => this._onPress(item)}
    >
      <HFormView style={{ marginTop: 2 }}>
        <HRow between>
          <HText
            value={item.GI_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HText value={item.GI_DATE_TIME} />
        </HRow>
        <HRow between>
          <HText value={item.VENDOR_NAME} />
          <HText
            value={item.GI_STATUS_NAME}
            textStyle={[
              item.GI_STATUS === 'F'
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
        </HRow>
        <HRow>
          <HTextfield label={'Ugent'} value={item.WH_URGENT_NAME} />
          <HNumberfield label={'ItemCnt'} value={item.GI_DT_COUNT} />
          <HNumberfield label={'Qty'} value={item.T_BASE_QTY} />
          <HTextfield label={'HBL'} value={item.HBL_NO} />
        </HRow>
        <HText value={item.GI_REF_DOC_NO} />
      </HFormView>
    </Touchable>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.GI_NO}
          headerClose
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
