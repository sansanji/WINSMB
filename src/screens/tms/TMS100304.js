/* *
 * Import Common
 * */
import { StyleSheet, View } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, Util, env, bluecolor } from 'libs';
import { HBaseView, HRow, HFormView, HListView, HTexttitle, HTextfield, HText } from 'ux';

/**
 * 요청상세정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100303');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      TRN_NO: this.props.params.TRN_NO,
      TRANS_DATE: this.props.params.TRANS_DATE,
      // 최종 하차가 완료되기 전에는 경유지, 하차 버튼이 같이 보이도록
      taskStep: this.props.params.TASK_STEP === '3' ? '2' : this.props.params.TASK_STEP,
      lat: this.props.location.lat,
      lon: this.props.location.lon,
      addr: this.props.location.addr,
      P_COMPANY_CODE: this.props.params.COMPANY_CODE,
    };
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('TMS010101SVC', 'getTMReqList', {
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

  renderBody = (item, index) => (
    <View style={{ flex: 1 }} activeOpacity={0.7} key={item.TRANS_REQ_NO}>
      <HFormView style={{ marginTop: 2 }}>
        <HText textStyle={styles.deptText} value={`출) ${item.DEPART_ADDR}`} />
        <View style={{ margin: 5 }} />
        <HText textStyle={styles.oldText} value={item.DEPART_REQ_DATE_TIME} />
        <HText textStyle={styles.oldText} value={`${item.DEPART_STAFF_NAME}(Tel.${item.DEPART_STAFF_TEL})`} />
        <View style={{ margin: 5 }} />
        <HText textStyle={styles.arrText} value={`도) ${item.ARRIVAL_ADDR}`} />
        <View style={{ margin: 5 }} />
        <HText textStyle={styles.oldText} value={item.ARRIVAL_UNLOAD_REQ_DATE_TIME} />
        <HText textStyle={styles.oldText} value={`${item.ARRIVAL_STAFF_NAME}(Tel.${item.ARRIVAL_STAFF_TEL})`} />
        <HTexttitle>기타 정보</HTexttitle>
        <HText textStyle={styles.oldText} value={item.TRANS_REQ_NO} />
        <HText textStyle={styles.arrText} value={item.REQ_INFO} />
        <View style={{ margin: 5 }} />
        <HText textStyle={styles.oldText} value={item.CUSTOMER_NAME} />
        <HRow>
          <HTextfield label={'W/T'} value={`${item.WEIGHT}Kg`} />
          <HTextfield label={'Mix'} value={item.REQ_MIX_YN_NAME} />
          <HTextfield label={'Day'} value={item.DAY_UNLOAD_YN_NAME} />
          <HTextfield label={'Commodity'} value={item.COMMODITY} />
        </HRow>
      </HFormView>
    </View>
  );

  render() {
    return (
      <HBaseView scrollable={false}>
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
  deptText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: bluecolor.basicBlueImpactColor,
  },
  arrText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: bluecolor.basicRedColor,
  },
  oldText: {
    fontSize: 17,
    fontWeight: 'bold',
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
