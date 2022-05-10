/* *
 * Import Common
 * */
import { StyleSheet, AsyncStorage } from 'react-native';
import { React, Util, Redux, Fetch, Navigation, NavigationScreen, ReduxStore, env } from 'libs';
import {
  HBaseView,
  Touchable,
  HRow,
  HDatefield,
  HTextfield,
  HFormView,
  HText,
  HListView,
} from 'ux';

/**
 * 배차내역 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100101');

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
  }

  async componentWillMount() {
    this.fetch('', null);
  }

  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('TMS010101SVC', 'getTMList', {
      body: JSON.stringify({
        TMS010101F1: { CTM_SORT_TYPE: 'TR_DATE' },
      }),
    });
    // 알림 메세지 초기화
    ReduxStore.dispatch({
      type: 'chat.newalarm.add',
      newalarm: null,
    });
    AsyncStorage.removeItem('newalarm');

    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.TMS010101G1, env().listCnt);
      this.setState(
        {
          dataTotal: result.TMS010101G1,
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
      'screen.TMS100102',
      {
        onSaveComplete: callback => this.fetch('null', callback),
        TRN_NO: item.TRN_NO,
        TRANS_DATE: item.TRANS_DATE,
        item,
      },
      '배차상세정보',
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

  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.TRN_NO}
      onPress={() => this._onPress(item)}
    >
      <HFormView style={{ marginTop: 2 }}>
        <HRow>
          <HTextfield label={'도착지'} value={item.ARRIVAL_CODE_NAME} bold />
          <HDatefield label={'운송일'} value={item.TRANS_DATE} />
        </HRow>
        <HRow between>
          <HText value={item.CUSTOMER_NAME} />
          <HText value={item.TRN_NO} />
        </HRow>
        <HRow>
          <HTextfield label={'요청자'} value={item.T_CUSTOMER_NAME} />
          <HTextfield label={'출발지'} value={item.DEPART_CODE_NAME} bold />
        </HRow>
      </HFormView>
    </Touchable>
  );
  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.TRN_NO}
          headerClose
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
