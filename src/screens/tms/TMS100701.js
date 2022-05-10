/* *
 * Import Common
 * */
import { StyleSheet, View, Platform } from 'react-native';
import { React, Util, Redux, Fetch, Navigation, NavigationScreen, env, bluecolor, beaconUtil } from 'libs';
import {
  HBaseView,
  Touchable,
  HRow,
  HFormView,
  HText,
  HListView,
  WaveIndicator,
} from 'ux';
import BackgroundTimer from 'react-native-background-timer';
/**
 * 기사전용 배차 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100701');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      selectedCal: 0,
      selectedIndex: 0,
      spinner: false,
      visible: true,
      visibleTabCntr: this.props.visibleTabCntr !== false,
      carStatus: 'W',
      oneTime: false, // 센서를 한번만 셋팅하기 위함
      beacon: { tempNoTR: 0, humiNoTR: 0 },
      appIdenti: '',
      apiCode: '',
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

  // 로그아웃할때 타이머 중지
  componentWillUnmount() {
    this.stopDrive();
    if (this.state.oneTime) {
    // Beacon 종료
      beaconUtil.stopBeacon();
    }
  }

  async fetch(callback) {
    // 조회시 기존 수집 중지
    // this.stopDrive();
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('TMS010101SVC', 'getSimpleTRNList', {
      body: JSON.stringify({
        TMS010101F1: {
          TRANS_DATE_FROM: Util.getDateValue(null, 0),
          TRANS_DATE_TO: Util.getDateValue(null, 7),
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

    // 센서 실행 로직 처음 조회시 한번만 실행만 실행
    if (!this.oneTime) {
      // Mobile Identi를 받아서 비콘으로 스캔한다.
      beaconUtil.startBeacon();
      this.setState({
        oneTime: true,
      });
      // 배차정보와 상관없이 무조건 위치 수집
      // if (result.TMS010101G1.length === 0) {
      console.log('Location Start');
      this.startDrive(this.term);
      // } else {
      //   console.log('Location Stop');
      //   this.stopDrive(this.term);
      // }
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
        iot: true,
      },
      '트레이싱(상세정보)',
    );
  }

  // 현재 위치 저장 10분간 위치정보를 수집
  async onSave() {
    // 테스트를 위해 실제 Save API를 호출하지 않고 console로 대체!
    const { location } = this.props;
    console.log(`BackgroundTimer Execute Date!: ${new Date()}`);
    console.log(`BackgroundTimer location.lon!: ${location.lon}`);
    console.log(`BackgroundTimer location.lat!: ${location.lat}`);
    const beacon = beaconUtil.getBeaconData();
    const appIdenti = beaconUtil.getAppIdenti();

    this.setState({ beacon, appIdenti, apiCode: beacon.apiCode });
    console.log('beacon this ? = ', beacon);
    // 같은 타입 여부 필터링
    let SAME = null;
    let REMARKS = null;
    if (location && beacon.apiCode === 'MB') {
      if (this.lat === location.lat && this.lon === location.lon) {
        SAME = 'Y';
        REMARKS = 'SAME';
      }
      const result = await Fetch.request('TMS010142SVC', 'savePositionWithoutTRN', {
        body: JSON.stringify({
          TMS010142F1: {
            LONGITUDE: location.lon,
            LATITUDE: location.lat,
            // REMARKS: location.addr,
            TEMPERATURE: beacon.tempNoTR,
            HUMIDITY: beacon.humiNoTR,
            PLATFORM: Platform.OS,
            EDI_CODE: beacon.ediCode,
            SPEED: Math.round(location.spd || 0),
            CURSER: Math.round(location.head || 0),
            SAME,
            REMARKS,
          },
        }),
      });
      if (result) {
        if (result.TYPE === 1) {
          // 초기화
          this.lat = location.lat;
          this.lon = location.lon;

          beaconUtil.initBeaconDataNoTR();
          console.log('savePositionWithoutTRN', result);
          Util.toastMsg('Scan Success');
        } else {
          Util.toastMsg(`Scan Fail(${result.MSG})`);
        }
      } else {
        Util.toastMsg('Scan Fail');
      }
    } else {
      this.stopDrive(this.term);
    }
  }

  // 현재위치 저장 타이머
  startDrive(minute) {
    this.setState({
      carStatus: 'D',
    });
    if (Platform.OS === 'ios') {
      this.driveID = setInterval(() => {
        console.log('positionInterval');
        Util.getLocation();
        this.onSave();
      }, 60000 * minute); // 필독! : 실제 적용 시 6000으로 !   1분 마다.
    } else {
      // Android
      this.driveID = BackgroundTimer.setInterval(() => {
        console.log('positionInterval');
        Util.getLocation();
        this.onSave();
      }, 60000 * minute); // 필독! : 실제 적용 시 6000으로 ! 1분 마다.
    }
  }

  // 타이머 중지
  stopDrive() {
    this.setState({
      carStatus: 'W',
    });
    if (Platform.OS === 'ios') {
      clearInterval(this.driveID);
    } else {
      BackgroundTimer.clearInterval(this.driveID);
    }
  }

  // 배차번로가 없을때 버튼 컨트롤
  buttonField() {
    return (
      <View style={styles.stepButtonContainer}>
        <View style={styles.spinnerContainer}>
          {
            this.state.carStatus === 'W' ? (<View styles={{ height: 100 }} />) :
              (
                <WaveIndicator size={400} color="#559854" />
              )
          }
        </View>
        <View style={styles.stepButtonInnerConatainer}>
          <Touchable
            style={styles.stepButtonInner}
            onPress={
              () => {
                if (this.state.carStatus === 'W') {
                  this.startDrive(this.term);
                } else {
                  // 사용자가 강제로 멈춘뒤 배차를 시작할수 있으므로 우선 수집은 멈추지 않는다.
                  // this.stopDrive(this.term);
                }
              }
            }
          >
            <View style={[styles.stepButton, { backgroundColor: this.state.carStatus === 'W' ? '#D84329' : '#559854' }]}>
              <HText
                value={this.state.carStatus === 'W' ? '대기' : '운행중'}
                textStyle={[styles.oldText, { color: bluecolor.basicWhiteColor }]}
              />
            </View>
          </Touchable>
        </View>
      </View>
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

  renderBody = (item, index) => {
    let backColor = bluecolor.basicGrayColorTrans;

    if (item.TRACE_TYPE === 'TM0310') {
      // 도착
      backColor = '#D84329'; // red
    } else if (item.TRACE_TYPE === 'TM0100') {
      // 출발
      backColor = '#E1C310'; // yellow
    } else if (item.TRACE_TYPE === 'TM0010') {
      // 공차이동
      backColor = '#559854'; // green
    }

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
            <HText textStyle={styles.oldText} value={item.TRN_STAFF_NAME} />
            <HText textStyle={styles.deptText} value={`출) ${item.DEPART_CODE_NAME}`} />
          </HRow>
        </HFormView>
      </Touchable>
    );
  };
  render() {
    const { location } = this.props;
    const { tempNoTR, humiNoTR } = this.state.beacon;

    return (
      <HBaseView scrollable={false} keepAwake>
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
        {this.buttonField(this.props.params)}
        <View style={{ backgroundColor: '#4d4d4d', borderRadius: 5 }}>
          <HRow style={styles.rowPadding}>
            <HText textStyle={styles.labelText} value={this.state.apiCode} />
            <HText textStyle={styles.labelText} value={this.appIdenti} />
          </HRow>
          <HRow style={styles.rowPadding}>
            <HRow between>
              <HText textStyle={styles.labelText} value={'Lat'} />
              <HText textStyle={styles.valueText} value={Math.round(location.lat * 1000000) / 1000000} />
            </HRow>
            <HRow between>
              <HText textStyle={styles.labelText} value={'Lon'} />
              <HText textStyle={styles.valueText} value={Math.round(location.lon * 1000000) / 1000000} />
            </HRow>
          </HRow>
          <HRow style={styles.rowPadding}>
            <HRow between>
              <HText textStyle={styles.labelText} value={'냉동'} />
              <HText textStyle={styles.tempText} value={tempNoTR || 0} />
            </HRow>
            <HRow between>
              <HText textStyle={styles.labelText} value={'냉장'} />
              <HText textStyle={styles.tempText} value={humiNoTR || 0} />
            </HRow>
          </HRow>
        </View>
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
