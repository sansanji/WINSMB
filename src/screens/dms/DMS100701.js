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
import { HBaseView, Touchable, HRow, HDateSet, HTextfield, HFormView, HText, HListView } from 'ux';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
/**
 * 사고관리 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100701');

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
      modelUtil.setModelData('DMS100701', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        IRR_YN: '',
        ISSUE_DATE_FROM: Util.getDateValue(null, -7),
        ISSUE_DATE_TO: Util.getDateValue(),
      });
    } else {
      modelUtil.setModelData('DMS100701', {
        ISSUE_DATE_FROM: Util.getDateValue(null, -7),
        ISSUE_DATE_TO: Util.getDateValue(),
        IRR_YN: '',
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

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('COM080101SVC', 'getDw', {
      body: JSON.stringify({
        COM080101F2: modelUtil.getModelData('DMS100701'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.COM080101G1, env().listCnt);
      this.setState(
        {
          dataTotal: result.COM080101G1,
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
      'screen.DMS100702',
      {
        onSaveComplete: callback => this.fetch(callback),
        REF_NO: item.REF_NO,
        IRRE_SEQ_NO: item.IRRE_SEQ_NO,
        REF_TYPE: item.REF_TYPE,
        IRRE_CODE: item.IRRE_CODE,
        IRRE_NAME: item.IRRE_NAME,
        IRRE_INFO: item.IRRE_INFO,
      },
      'IRRE Info.',
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
          FROM_DATE: 'DMS100701.ISSUE_DATE_FROM',
          TO_DATE: 'DMS100701.ISSUE_DATE_TO',
          DATE_TYPE: 'DMS100701.DATE_TYPE',
        }}
        fDateNum={-7}
        tDateNum={0}
      />
      <HTextfield label={'Search'} bind={'DMS100701.REF_NO'} editable />
    </View>
  );
  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.IREE_SEQ_NO}
      onPress={() => this._onPress(item)}
    >
      <HFormView style={{ marginTop: 2 }}>
        <HRow between>
          <HText
            value={item.ISSUE_TIME}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HText
            value={item.REF_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
        </HRow>
        <HText value={item.IRRE_INFO} numberOfLines={1} />
        <Image
          style={styles.image}
          source={{
            uri: `${fetchURL}/api/file/getDownload/${this.props.global.session.COMPANY_CODE}/MB/${item.PHOTO_VALUE}`,
            headers: {
              'X-CSRF-TOKEN': GLOBAL.gToken,
              Cookie: GLOBAL.gCookie,
              // withCredentials: true,
            },
          }}
        />
      </HFormView>
    </Touchable>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch(null)}>
        <HListView
          keyExtractor={item => item.STK_NO}
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
  image: {
    flex: 1,
    height: 100,
    backgroundColor: 'transparent',
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
