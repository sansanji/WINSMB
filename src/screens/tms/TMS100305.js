/* *
 * Import Common
 * */
import { StyleSheet } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, Util, env, Navigation } from 'libs';
import { HBaseView, HRow, HFormView, HListView, HTexttitle, HText, Touchable } from 'ux';

/**
 * Tracing정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100305');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      TRN_NO: this.props.params.TRN_NO,
      TRANS_DATE: this.props.params.TRANS_DATE,
      P_COMPANY_CODE: this.props.params.COMPANY_CODE,
    };
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('TMS010101SVC', 'getTMTrcDtList', {
      body: JSON.stringify({
        TMS010101F1: this.state,
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

  _onPress(item) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.TMS100502',
      {
        onSaveComplete: callback => this.fetch(callback),
        REF_NO: item.TRN_NO,
        IRRE_SEQ_NO: '',
        REF_TYPE: item.TRACE_TYPE,
        IRRE_CODE: '',
        IRRE_NAME: '',
        IRRE_INFO: '',
        item,
      },
      '사고등록',
    );
  }

  renderBody = item => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.SEQ_NO}
      onPress={() => this._onPress(item)}
    >
      <HFormView style={{ marginTop: 2 }}>
        <HRow>
          <HTexttitle rowflex={5}>
            {item.SEQ_NO}. {item.TRACE_TYPE_NAME}
          </HTexttitle>
          <HText rowflex={1} value={item.IRRE_CNT === 0 ? '이상무' : `Irre: ${item.IRRE_CNT}`} />
        </HRow>
        <HText value={item.ADDR} />
        <HText value={item.TRACE_DATE} />
      </HFormView>
    </Touchable>
  );

  render() {
    return (
      <HBaseView scrollable={false}>
        <HText value={'각 해당 발생 내역을 선택하면 사고 정보를 등록할 수 있습니다.'} />
        <HListView
          keyExtractor={item => item.SEQ_NO}
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
});
/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
