/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, bluecolor, Util, env, Navigation } from 'libs';
import { HBaseView, HRow, HFormView, HText, HTexttitle, HDatefield, HTextfield, HListView, HButton } from 'ux';

/**
 * 기사용 배차정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100802');
    this.state = {
      data: {},
      dataTrc: [],
      dataTrcTotal: [],
      status: null,
      TRN_NO: this.props.params.TRN_NO,
      TRANS_DATE: this.props.params.TRANS_DATE,
      lat: this.props.location.lat,
      lon: this.props.location.lon,
      addr: this.props.location.addr,
      P_COMPANY_CODE: this.props.params.COMPANY_CODE,
    };
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch() {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('TMS010101SVC', 'getTMDtOC', {
      body: JSON.stringify({
        TMS010101F1: this.state,
      }),
    });

    if (result) {
      this.fetchTrc(result.TMS010101F1);

      // Util.openLoader(this.screenId, false);
    } else {
      // Util.openLoader(this.screenId, false);
    }
  }

  // 자동출도착 정보를 가져온다.
  async fetchTrc(formData) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('TMS010101SVC', 'getTMTrcOC', {
      body: JSON.stringify({
        TMS010101F1: this.state,
      }),
    });

    if (result) {
      // 정해진 데이터만 보여준다.
      const dataTrc = Util.getArrayData(result.TMS010101G1, env().listCnt);
      this.setState(
        {
          data: formData,
          dataTrcTotal: result.TMS010101G1,
          dataTrc,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
      );
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  renderBody = item => (
    <View
      style={{ flex: 1 }}
      activeOpacity={0.7}

    >
      <HFormView style={{ marginTop: 2 }} >

        <HTexttitle rowflex={5}>
          {item.SEQ_NO}. {item.DA_CODE} {item.AREA_NAME}
        </HTexttitle>
        <HText value={item.ADDR} />
        <HText value={item.TRACE_DATE} />
      </HFormView>
    </View>
  );

  openMap() {
    Navigation(navigator, 'screen.TMS100804', { TRN_DATA: this.state }, '트레이싱(상세정보)');
  }


  render() {
    if (!this.state.data) {
      return <View />;
    }
    return (
      <HBaseView>
        <HText textStyle={styles.deptText} value={`출) ${this.state.data.DEPART_CODE_NAME}  ${this.state.data.DEPART_ADDR}`} />
        <HText textStyle={styles.arrText} value={`도) ${this.state.data.ARRIVAL_CODE_NAME}  ${this.state.data.ARRIVAL_ADDR}`} />
        <HTexttitle>{this.state.data.TRN_NO}</HTexttitle>
        <HText textStyle={styles.oldText} value={this.state.data.CUSTOMER_NAME} />
        <View style={{ margin: 5 }} />
        <HRow>
          <HTextfield
            label={'차종'}
            value={`${this.state.data.CAR_TYPE_NAME} / ${this.state.data.CAR_TON_NAME}`}
          />
          <HDatefield label={'등록'} value={this.state.data.ADD_DATE} />
        </HRow>
        <View style={styles.container}>
          <HListView
            keyExtractor={item => item.SEQ_NO}
            headerClose
            renderHeader={null}
            renderItem={({ item, index }) => this.renderBody(item, index)}
            onSearch={() => this.fetch()}
            onMoreView={this.onMoreView}
            // 그려진값
            data={this.state.dataTrc}
            // 조회된값
            totalData={this.state.dataTrcTotal}
            // 하단에 표시될 메세지값
            status={this.state.status}
          />
        </View>
        <HButton title={'경로보기'} name={'map-marker'} onPress={() => { this.openMap(); }} rowflex={1} />
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
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonInnerContainer: {
    flex: 1,
  },
  rowPadding: {
    marginBottom: 5,
  },
  oldText: {
    fontSize: 17,
    fontWeight: 'bold',
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
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 5,
  },
  stepButtonContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
    backgroundColor: '#4d4d4d',
    padding: 7,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'black',
  },
  stepButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 80,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
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
