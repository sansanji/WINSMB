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
    super(props, 'DMS100201');

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
      modelUtil.setModelData('DMS100201', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        GI_DATE_FROM: Util.getDateValue(null, -3),
        GI_DATE_TO: Util.getDateValue(),
        GI_FLAG: 'Y',
        M_KEYWORD: null,
        M_GI_STATUS: 'Y',
        GI_DT: 'N',
        PLT_CHECK: 'Y',
        BOX_CHECK: 'N',
        ITEM_CHECK: 'N',
      });
    } else {
      modelUtil.setModelData('DMS100201', {
        GI_DATE_FROM: Util.getDateValue(null, -3),
        GI_DATE_TO: Util.getDateValue(),
        GI_FLAG: 'Y',
        M_GI_STATUS: 'Y',
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

    const result = await Fetch.request('DMS030320SVC', 'get', {
      body: JSON.stringify({
        DMS030320F1: modelUtil.getModelData('DMS100201'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.DMS030320G1, env().listCnt);
      this.setState(
        {
          dataTotal: result.DMS030320G1,
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
    const checkData = modelUtil.getModelData('DMS100201');
    item.PLT_CHECK = checkData.PLT_CHECK;
    item.BOX_CHECK = checkData.BOX_CHECK;
    item.ITEM_CHECK = checkData.ITEM_CHECK;
    item.GI_DT = checkData.GI_DT;
    Navigation(
      navigator,
      'screen.DMS100202',
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
          FROM_DATE: 'DMS100201.GI_DATE_FROM',
          TO_DATE: 'DMS100201.GI_DATE_TO',
          DATE_TYPE: 'DMS100201.DATE_TYPE',
        }}
        fDateNum={-3}
        tDateNum={0}
      />
      <HRow>
        <HCheckbox
          label={'GI Dt'}
          bind={'DMS100201.GI_DT'}
          toggle
          editable
          rowflex={1}
        />
        <HCheckbox
          label={'PLT'}
          bind={'DMS100201.PLT_CHECK'}
          toggle
          editable
          rowflex={1}
        />
        <HCheckbox
          label={'BOX'}
          bind={'DMS100201.BOX_CHECK'}
          toggle
          editable
          rowflex={1}
        />
        <HCheckbox
          label={'ITEM'}
          bind={'DMS100201.ITEM_CHECK'}
          toggle
          editable
          rowflex={1}
        />
      </HRow>
      <HRow>
        <HTextfield label={'Search'} bind={'DMS100201.M_KEYWORD'} editable />
        <HCheckbox
          label={'Ready'}
          bind={'DMS100201.M_GI_STATUS'}
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
          <HTextfield label={'Ref No'} value={item.REF_NO} />
          <HTextfield label={'Doc No'} value={item.REF_DOC_NO} />
          <HNumberfield label={'DT Cont'} value={item.GI_DT_COUNT} />
        </HRow>
      </HFormView>
    </Touchable>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.GI_NO}
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
