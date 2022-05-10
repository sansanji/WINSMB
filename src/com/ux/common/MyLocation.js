/* *
 * Import Common
 * */
import { View, Text, Platform } from 'react-native';
import { React, Redux, Fetch, Util, beaconUtil } from 'libs';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackgroundTimer from 'react-native-background-timer';

/**
 * 위치 찾기 컴퍼넌트
 */
class Component extends React.Component {
  constructor(props) {
    super(props);
    // 1분 마다 위치를 전송함
    if (Platform.OS === 'ios') {
      this.term = 1; // 1분
    } else {
      this.term = 1; // 1분
    }
    this.lat = '';
    this.lon = '';
    this.CurrentPositionIntervally(this.term); // 기사 앱 통합에 따른 주석 해제 여부 판단!
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.location.lat !== nextProps.location.lat ||
      this.props.location.lon !== nextProps.location.lon
    );
  }

  // /* 기사 앱 통합에 따른 주석 해제 여부 판단! <시작>
  // 로그아웃할때 타이머 중지
  componentWillUnmount() {
    this.stopPositionInterval();
  }

  // 현재 위치 저장 10분간 위치정보를 수집
  async onSave() {
    // 테스트를 위해 실제 Save API를 호출하지 않고 console로 대체!
    const { location } = this.props;
    console.log(`BackgroundTimer Execute Date!: ${new Date()}`);
    console.log(`BackgroundTimer location.lon!: ${location.lon}`);
    console.log(`BackgroundTimer location.lat!: ${location.lat}`);
    const beacon = beaconUtil.getBeaconData();
    console.log('beacon this ? = ', beacon);
    // 같은 타입 여부 필터링
    let SAME = null;
    let REMARKS = null;
    // 장비마스터 API_CODE가 MB(휴대폰)일 경우에만 등록!!
    if (location && beacon.apiCode === 'MB') {
      if (this.lat === location.lat && this.lon === location.lon) {
        SAME = 'Y';
        REMARKS = 'SAME';
      }
      // const result = await Fetch.request('TMS010142SVC', 'savePosition', {
      const result = await Fetch.request('TMS010142SVC', 'savePosition', {
        body: JSON.stringify({
          TMS010142F1: {
            LONGITUDE: location.lon,
            LATITUDE: location.lat,
            // REMARKS: location.addr,
            TEMPERATURE: beacon.temp,
            HUMIDITY: beacon.humi,
            PLATFORM: Platform.OS,
            EDI_CODE: beacon.ediCode,
            SPEED: location.spd || 0,
            CURSER: location.head || 0,
            SAME,
            REMARKS,
          },
        }),
      });
      if (result) {
        // 초기화
        this.lat = location.lat;
        this.lon = location.lon;

        beaconUtil.initBeaconData();
        console.log('savePosition', result);
      }
    }
  }
  // 현재위치 저장 타이머
  CurrentPositionIntervally(minute) {
    if (Platform.OS === 'ios') {
      this.intervalId = setInterval(() => {
        console.log('positionInterval');
        Util.getLocation();
        this.onSave();
      }, 60000 * minute); // 필독! : 실제 적용 시 6000으로 !   1분 마다.
    } else {
      // Android
      this.intervalId = BackgroundTimer.setInterval(() => {
        console.log('positionInterval');
        Util.getLocation();
        this.onSave();
      }, 60000 * minute); // 필독! : 실제 적용 시 6000으로 ! 1분 마다.
    }
  }

  // 타이머 중지
  stopPositionInterval() {
    if (Platform.OS === 'ios') {
      clearInterval(this.intervalId);
    } else {
      BackgroundTimer.clearInterval(this.intervalId);
    }
  }
  // 기사 앱 통합에 따른 주석 해제 여부 판단! <끝> */

  render() {
    const { theme, location } = this.props;
    return (
      <View>
        {/* <View
          style={[
            // theme.locationView,
            { flexDirection: 'row' },
          ]}
        >
          <FontAwesome name="map-marker" size={15} style={theme.locationIcon} />
          <View style={{ flex: 1 }}>
            <Text style={theme.location}>
              {location.addr || `위치를 찾는 중입니다...(${location.lat}/${location.lon})`}
            </Text>
          </View>
        </View> */}
      </View>
    );
  }
}

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  theme: state.global.theme,
  location: state.global.location,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
