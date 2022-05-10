/* *
 * Import Common
 * */
import { Image, View, StyleSheet } from 'react-native';
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
  HTextfield,
  HFormView,
  HText,
  HListView,
  HIcon,
} from 'ux';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
/**
 * OCR Scanner List 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100901');

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
    modelUtil.setModelData('TMS100901', {
      DT_DATE_ACTIVE_FLAG: 'Y',
      DT_DATE_TYPE: 'ADD',
      DT_DATE_FROM: Util.getDateValue() - 2,
      DT_DATE_TO: Util.getDateValue(),
      DT_SUPPLIER_IRS_NO: null,
    });
  }

  async componentDidMount() {
    this.fetch();
  }

  async fetch() {
    const result = await Fetch.request('TMS010181SVC', 'getOCR', {
      body: JSON.stringify({
        TMS010181F2: modelUtil.getModelData('TMS100901'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.TMS010181G2, env().listCnt);
      this.setState(
        {
          dataTotal: result.TMS010181G2,
          data,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
      );
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
    }
  }

  _onPress(item) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.TMS100902',
      {
        onSaveComplete: () => this.fetch(),
        TAX_NO: item.TAX_NO,
        ADD_DATE: item.ADD_DATE,
      },
      'OCR 스캐너',
    );
  }

  openOCR() {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.TMS100902',
      {
        onSaveComplete: () => this.fetch(),
      },
      'OCR 스캐너',
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
          FROM_DATE: 'TMS100901.DT_DATE_FROM',
          TO_DATE: 'TMS100901.DT_DATE_TO',
          DATE_TYPE: 'TMS100901.DATE_TYPE',
        }}
        fDateNum={-2}
        tDateNum={0}
      />
      <HTextfield label={'사업자번호'} bind={'TMS100901.DT_SUPPLIER_IRS_NO'} editable />
    </View>
  );
  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.TAX_NO}
      onPress={() => this._onPress(item)}
    >
      <HFormView style={{ marginTop: 2 }}>
        <Image
          style={styles.image}
          source={{
            uri: item.FILE_URL,
            headers: {
              'X-CSRF-TOKEN': globalThis.gToken,
              Cookie: globalThis.gCookie,
              // withCredentials: true,
            },
          }}
        />
        <HRow>
          <HText value={item.TAX_NO} numberOfLines={1} textStyle={{ fontWeight: 'bold', color: bluecolor.basicBluebt }} />
          <HText value={`총 ${item.TOTAL_AMT} 원`} numberOfLines={1} />
        </HRow>
        <HRow>
          <HTextfield
            label={'사업자번호'}
            value={item.SUPPLIER_IRS_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HTextfield
            label={'계산서일자'}
            value={item.TAX_DATE}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
        </HRow>
        <HRow>
          <HTextfield
            label={'공급가액'}
            value={`${item.TOTAL_SUPPLY_AMT}`}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HTextfield
            label={'세액'}
            value={`${item.TOTAL_TAX_AMT}`}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
        </HRow>
      </HFormView>
    </Touchable>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.TAX_NO}
          headerClose={false}
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
        <Touchable
          style={styles.searchButton}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.openOCR({})}
        >
          <HIcon name="language" size={20} color="#fff" />
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
  image: {
    flex: 1,
    height: 100,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: bluecolor.basicBluebt,
  },
  searchButton: {
    backgroundColor: bluecolor.basicRedColorTrans,
    borderColor: bluecolor.basicRedColorTrans,
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
