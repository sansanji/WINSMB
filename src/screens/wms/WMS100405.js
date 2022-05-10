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
  HCombobox,
} from 'ux';

/**
 * Stock Flow 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100405');

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
    modelUtil.setModelData('WMS100405', {
      WH_CODE: this.props.WH_CODE,
      GR_NO: this.props.GR_NO,
      GR_DATE_FROM: this.props.GR_DATE,
      GR_DATE_TO: this.props.GR_DATE,
      REF_NO: this.props.REF_NO,
      VENDOR_CODE: this.props.VENDOR_CODE,
      VENDOR_PLANT_CODE: this.props.VENDOR_PLANT_CODE,
      GR_FLAG: 'Y',
      GRGI_DAY: 'GR',
      REF_NO_LIKE: 'Y',
    });
  }

  async componentDidMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 whcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.wmsValidCheckFunc(alertType);

    if (validCheck) {
      this.fetch();
    }
  }

  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010212SVC', 'getFlow', {
      body: JSON.stringify({
        WMS010212F1: modelUtil.getModelData('WMS100405'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.WMS010212G4, env().listCnt);
      this.setState({
        dataTotal: result.WMS010212G4,
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
    <View key={item.GR_NO + item.GR_SEQ_NO}>
      <HFormView style={{ marginTop: 2 }}>
        <HRow>
          <HText
            value={item.REF_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HText value={`${item.STOCK_DAYS} Days`} />
        </HRow>
        <HRow>
          <HText value={`${item.GI_NO} ${item.GI_STATUS_NAME}`} />
          <HText value={item.GI_DATE_TIME} />
        </HRow>
        <HRow>
          <HNumberfield label={'GR'} value={item.GR_BASE_QTY} />
          <HNumberfield label={'GI'} value={item.GI_BASE_QTY} />
        </HRow>
      </HFormView>
    </View>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.GR_NO + item.GR_SEQ_NO}
          renderHeader={null}
          renderItem={({ item, index }) => this.renderBody(item, index)}
          onSearch={() => this.fetch()}
          onMoreView={this.onMoreView}
          // 그려진값
          data={this.state.data}
          // 조회된값
          totalData={this.state.dataTotal}
          // 하단에 표시될 메세지값
          status={this.state.status}
          msgStatusVisible={false}
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
