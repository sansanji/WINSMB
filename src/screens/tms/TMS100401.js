/* *
 * Import Common
 * */
import { StyleSheet, View } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, Util, env, modelUtil, Navigation } from 'libs';
import { HBaseView, HRow, HFormView, HListView, HText, HTextfield, Touchable } from 'ux';

/**
 * 운행기록조회
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100401');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  async componentWillMount() {
    modelUtil.setModelData('TMS100401', {
      CTM_SORT_TYPE: 'ADD_DATE',
      TRANS_DATE_FROM: Util.getDateValue(null, -7),
      TRANS_DATE_TO: Util.getDateValue(),
    });
  }

  async componentDidMount() {
    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('TMS010101SVC', 'getTMHistory', {
      body: JSON.stringify({
        TMS010101F1: modelUtil.getModelData('TMS100401'),
      }),
    });

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
        data: [
          {
            AP_TT_AMT: 0,
            AP_FIN_TT_CHARGE: 0,
          },
        ],
      });
      Util.openLoader(this.screenId, false);
    }
  }

  _onPress(item) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.TMS100302',
      {
        onSaveComplete: callback => this.fetch(callback),
        params: item,
      },
      '트레이싱(상세정보)',
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
          <HTextfield label={'도착지'} value={item.ARRIVAL_CODE_NAME} />
          <HTextfield label={'도착일자'} value={item.TRANS_END_DATE} />
        </HRow>
        <HRow>
          <HTextfield label={'출발지'} value={item.DEPART_CODE_NAME} />
          <HTextfield label={'출발일자'} value={item.TASK_STEP_NAME} />
        </HRow>
        <HRow>
          <HText value={item.TRN_NO} textStyle={{ fontWeight: 'bold' }} />
          <HText value={item.AP_TT_AMT} textStyle={{ fontWeight: 'bold' }} />
        </HRow>
      </HFormView>
    </Touchable>
  );

  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.TRANS_REQ_NO}
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
        <HRow between>
          <HText value={'총 합계 :'} textStyle={{ fontWeight: 'bold' }} />
          <HText
            value={this.state.data[0] ? this.state.data[0].AP_FIN_TT_CHARGE : 0}
            textStyle={{ fontWeight: 'bold' }}
          />
        </HRow>
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonInnerContainer: {
    flex: 1,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
  location: state.global.location,
});
/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
