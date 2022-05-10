/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { _, React, Util, Redux, Fetch, NavigationScreen, modelUtil, env, bluecolor } from 'libs';
import {
  HBaseView,
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
 * Stock info stock Flow 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100405');

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
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);

    if (whCode && vendorCode) {
      modelUtil.setModelData('DMS100405', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        GR_DATE_FROM: Util.getDateValue(null, -3),
        GR_DATE_TO: Util.getDateValue(),
        GR_FLAG: 'Y',
        M_KEYWORD: null,
        EXIST_YN: 'Y',
        GRGI_DAY: 'GR',
        GRGI_DAY_NAME: 'G/R',
      });
    } else {
      modelUtil.setModelData('DMS100405', {
        GR_DATE_FROM: Util.getDateValue(null, -3),
        GR_DATE_TO: Util.getDateValue(),
        GR_FLAG: 'Y',
        EXIST_YN: 'Y',
        GRGI_DAY: 'GR',
        GRGI_DAY_NAME: 'G/R',
      });
    }
  }

  async componentDidMount() {
    // this._validCheckFunc('alert'); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.dmsValidCheckFunc(alertType);

    if (validCheck) {
      this.fetch();
    }
  }

  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('DMS030510SVC', 'getFlow', {
      body: JSON.stringify({
        DMS030510F1: modelUtil.getModelData('DMS100405'),
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
          FROM_DATE: 'DMS100405.GR_DATE_FROM',
          TO_DATE: 'DMS100405.GR_DATE_TO',
          DATE_TYPE: 'DMS100405.DATE_TYPE',
        }}
        fDateNum={-3}
        tDateNum={0}
      />

      <HCheckbox label={'Exist'} bind={'DMS100405.EXIST_YN'} editable />
      <HTextfield label={'Search'} bind={'DMS100405.M_KEYWORD'} editable />
    </View>
  );
  renderBody = (item, index) => (
    <View key={item.GR_NO}>
      <HFormView style={{ marginTop: 2 }}>
        <HRow>
          <HText
            value={item.GR_NO}
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
          <HText
            value={'Type'}
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
            value={'Stock'}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          />
        </HRow>
        <HRow>
          <HText value={'Item'} />
          <HText value={item.GR_ITEM_QTY || 0} />
          <HText value={item.GI_ITEM_QTY || 0} />
          <HText value={item.STOCK_ITEM_QTY || 0} />
        </HRow>
        <HRow>
          <HText value={'Carton'} />
          <HText value={item.GR_BOX_QTY || 0} />
          <HText value={item.GI_BOX_QTY || 0} />
          <HText value={item.STOCK_CT_QTY || 0} />
        </HRow>
        <HRow>
          <HText value={'Pallet'} />
          <HText value={item.GR_PLT_QTY || 0} />
          <HText value={item.GI_PLT_QTY || 0} />
          <HText value={item.STOCK_PLT_QTY || 0} />
        </HRow>
      </HFormView>
    </View>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.STK_NO}
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
