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
  HCombobox,
} from 'ux';

/**
 * Stock Daily 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100404');

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
      modelUtil.setModelData('WMS100404', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        VENDOR_PLANT_CODE: vendorPlantCode,
        GR_DATE_FROM: Util.getDateValue(null, -3),
        GR_DATE_TO: Util.getDateValue(),
        GR_FLAG: 'Y',
        M_KEYWORD: null,
        EXIST_YN: 'Y',
        GRGI_DAY: 'GR',
        GRGI_DAY_NAME: 'G/R',
      });
    } else {
      modelUtil.setModelData('WMS100404', {
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
    // this._validCheckFunc('alert'); // 모든 화면은 기본적으로 whcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.wmsValidCheckFunc(alertType);

    if (validCheck) {
      this.fetch();
    }
  }

  async fetch() {
    if (modelUtil.getValue('WMS100404.M_KEYWORD').length <= 0) {
      Util.toastMsg('Please input Search keyword');
      return;
    }
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010212SVC', 'getDaily', {
      body: JSON.stringify({
        WMS010212F1: modelUtil.getModelData('WMS100404'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.WMS010212G3, env().listCnt);
      this.setState({
        dataTotal: result.WMS010212G3,
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
          FROM_DATE: 'WMS100404.GR_DATE_FROM',
          TO_DATE: 'WMS100404.GR_DATE_TO',
          DATE_TYPE: 'WMS100404.DATE_TYPE',
        }}
        fDateNum={-3}
        tDateNum={0}
      />
      <HRow>
        <HCheckbox label={'Exist'} bind={'WMS100404.EXIST_YN'} editable />
        <HCombobox
          label={'GR'}
          groupJson={[{ DT_CODE: 'GR', LOC_VALUE: 'G/R' }, { DT_CODE: 'DA', LOC_VALUE: 'Daily' }]}
          bindVar={{
            CD: 'WMS100404.GRGI_DAY',
            NM: 'WMS100404.GRGI_DAY_NAME',
          }}
          editable
        />
      </HRow>
      <HTextfield label={'Search'} bind={'WMS100404.M_KEYWORD'} editable require />
    </View>
  );
  renderBody = (item, index) => (
    <View key={item.STK_NO}>
      <HFormView style={{ marginTop: 2 }}>
        <HText
          value={item.REF_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
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
