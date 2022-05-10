/* *
 * Import Common
 * */
import { StyleSheet, View, Platform } from 'react-native';
import { React, Util, Redux, Fetch, Navigation, NavigationScreen, env, bluecolor, modelUtil } from 'libs';
import {
  HBaseView,
  Touchable,
  HRow,
  HFormView,
  HText,
  HListView,
  HTextfield,
} from 'ux';
/**
 * 타업체 전용 대리점 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100803');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      selectedCal: 0,
      selectedIndex: 0,
      spinner: false,
    };
    this.callapsed = false;

    if (Platform.OS === 'ios') {
      this.term = 1; // 1분
    } else {
      this.term = 1; // 1분
    }
    this.lat = '';
    this.lon = '';
  }

  async componentDidAppear() {
    this.fetch(null);
    // ReduxStore.dispatch({
    //   type: 'chat.message.add',
    //   message: null,
    // });
    // AsyncStorage.removeItem('message');
  }

  async componentWillMount() {
    modelUtil.setModelData('TMS100803', {
      CAR_NO: null,
    });
  }

  async fetch(callback) {
    // 조회시 기존 수집 중지
    // this.stopDrive();
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const { session } = this.props.global;
    const carNo = modelUtil.getValue('TMS100803.CAR_NO');
    const result = await Fetch.request('TMS010101SVC', 'getSimpleTRNListOC', {
      body: JSON.stringify({
        TMS010101F1: {
          TRANS_DATE_FROM: Util.getDateValue(null, 0),
          TRANS_DATE_TO: Util.getDateValue(null, 7),
          CAR_NO: carNo,
          STEL_NO: session.USER_ID,
        },
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
      // Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      // Util.openLoader(this.screenId, false);
    }
  }

  _onPress(item) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.TMS100802',
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

  // 리스트 헤더 화면
  renderHeader = () => (
    <View>
      <HTextfield
        label={'Search Car No'}
        bind={'TMS100803.CAR_NO'}
        onSubmitEditing={() => {
          this.fetch();
        }}
        editable
      />
    </View>
  );
  renderBody = (item, index) => {
    const backColor = bluecolor.basicGrayColorTrans;

    // if (item.TRACE_TYPE === 'TM0310') {
    //   // 도착
    //   backColor = '#D84329'; // red
    // } else if (item.TRACE_TYPE === 'TM0100') {
    //   // 출발
    //   backColor = '#E1C310'; // yellow
    // } else if (item.TRACE_TYPE === 'TM0010') {
    //   // 공차이동
    //   backColor = '#559854'; // green
    // }

    return (
      <Touchable
        style={{ flex: 1 }}
        activeOpacity={0.7}
        key={item.TRN_NO}
        onPress={() => this._onPress(item)}
      >
        <HFormView style={{ marginTop: 2, backgroundColor: backColor }}>
          <HRow between style={styles.rowPadding}>
            <HText textStyle={styles.arrText} value={`도) ${item.ARRIVAL_CODE_NAME}`} />
            <HText textStyle={styles.oldText} value={item.TRANS_DATE_FORM} />
          </HRow>
          <HRow between style={styles.rowPadding}>
            <HText textStyle={styles.oldText} value={item.CUSTOMER_NAME} />
            <HText textStyle={styles.oldText} value={item.TRN_NO} />
          </HRow>
          <HRow between style={styles.rowPadding}>
            <HText textStyle={styles.oldText} value={item.CAR_NO} />
            <HText textStyle={styles.deptText} value={`출) ${item.DEPART_CODE_NAME}`} />
          </HRow>
        </HFormView>
      </Touchable>
    );
  };
  render() {
    return (
      <HBaseView scrollable={false} keepAwake button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.TRN_NO}
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
  labelText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: bluecolor.basicGreenColor,
  },
  valueText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: bluecolor.basicYellowColor,
  },
  tempText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: bluecolor.basicYellowColor,
  },
  rowPadding: {
    marginBottom: 5,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 10,
  },
  stepButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
  stepButtonInnerConatainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 50,
  },
  stepButtonInner: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
    backgroundColor: '#4d4d4dbd',
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
