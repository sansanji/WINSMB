/* *
 * Import Common
 * */
import {
  View,
  StyleSheet,
  AsyncStorage,
  // DeviceEventEmitter, WebView
} from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  initPushNotification,
  connectPushNotificationListeners,
  initSettings,
  initConfigure,
  initLocation,
  // initCommonCode,
  bluecolor,
  ReduxStore,
  initSettingsWins,
} from 'libs';
import {HBaseView} from 'ux';
import {Navigation} from 'react-native-navigation';
import app from 'src/app';

/* *
 * Import node_modules
 * */
// import Beacons from 'react-native-beacons-manager';

/** ***
 * Main Screen 화면
 * 2019.01.01
 * Develop by JKM
 **** */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'MainScreen');
    this.state = {
      DATE_FROM: null,
      DATE_TO: null,
      GRGI_FLAG: 'GI',
      keyword: null,
      scanVaildData: 'Ready',
      // uuid: '6c707c36-fe0e-4dca-be29-b79644026b9c',
      // identifier: 'altbeacon-2018-09-07',
      // major: 333,
      // minor: 444,
      uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
      identifier: 'MiniBeacon_16976',
      major: 40001,
      minor: 16976,
      openFlag: false,
      USER_AUTH: null,
    };
  }

  goToScreen = screenName => {
    Navigation.push(this.props.componentId, {
      component: {
        name: screenName,
      },
    });
  };

  componentWillReceiveProps(props) {
    // 기존에 띄웠던 화면으로 이동하기
    /* const { lmenu, activeTab } = props.global;
    if (activeTab !== 0 && lmenu.length > 0) {
      const mainMenu = [];
      mainMenu.push(lmenu[activeTab]);
      app(mainMenu);
    } */
    ReduxStore.dispatch({
      type: 'chat.message.add',
      message: null,
    });
    let homeScreen = 'screen.ADM010106';

    if (this.state.USER_AUTH === null) {
      if (props.global.session.USER_AUTH) {
        // 하나로일때..
        if (props.global.session.COMPANY_CODE.indexOf('HTNS') > -1) {
          // 기사용 메뉴 특화
          if (props.global.session.USER_AUTH === 'D') {
            homeScreen = 'screen.TMS100701';
          } else {
            // 하나로회사일경우 wins mode 활성화
            AsyncStorage.getItem('saveWINS', (err, result) => {
              if (result === 'Y') {
                initSettingsWins();
                app([
                  {
                    title: 'WINS',
                    swidget: 'WVWINS',
                    screen: 'com.layout.MainScreenWins',
                  },
                ]);
              }
            });
          }
        } else {
          // 타업체일때
          // eslint-disable-next-line no-lonely-if
          if (props.global.session.USER_AUTH === 'D') {
            homeScreen = 'screen.TMS100801';
          } else {
            homeScreen = 'screen.TMS100803';
          }
        }
        app([
          {
            title: '홈으로',
            screen: homeScreen,
          },
        ]);

        this.setState({
          USER_AUTH: props.global.session.USER_AUTH,
        });
      }
    }
  }

  componentDidMount() {
    // initPushNotification();
    // connectPushNotificationListeners();
  }

  async componentWillMount() {
    // 주석처리 부분은 해당 앱에는 당장 필요없는 설정이므로 잠시 보류!
    // 필요에 따라 주석 해제 바람!
    // 상단 import 부분도 주석하였으니 동시 처리 바람!
    initLocation();
    await initSettings();
    // initTrnStatus();
    // await initCommonCode();
    initConfigure();
    // 모델 초기화
    // await modelUtil.initModel();
    this.exitApp = false;
  }

  shouldComponentUpdate() {
    return true;
  }

  async _clear(msg, callback) {
    const {identifier, uuid, major, minor} = this.state;
    const region = {identifier, uuid, major, minor};
    // Range for beacons inside the region
    // Beacons.requestAlwaysAuthorization();
    // Beacons.startMonitoringForRegion(region);

    // Beacons.startRangingBeaconsInRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
    //   .then(() => console.log('Beacons ranging started succesfully'))
    //   .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
    // DeviceEventEmitter.addListener('beaconsDidRange', data => {
    //   console.log('Found beacons!', data.beacons);
    //   // console.log('Found beacons!', data);
    // });
  }

  render() {
    return (
      <HBaseView backimage scrollable={false}>
        <View style={styles.mainImage}>
          {/* <View
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: 'absolute',
              resizeMode: 'cover',
              width: '100%',
              height: '100%',
              backgroundColor: bluecolor.basicBlueLightTrans,
            }}
          >
            <WebView
              source={{ uri: 'https://htns.com' }}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
            </View> */}
          {/* <HYtransView>
            <Image
              source={tnsLogoImage}
              resizeMode={'contain'}
              style={{ marginBottom: 0, width: 300, height: 180 }}
            />
          </HYtransView> */}
        </View>
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  mainImage: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: bluecolor.basicTrans,
  },
  mainText: {
    color: bluecolor.basicBlueColor,
    fontSize: 30,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  mainSubText: {
    color: bluecolor.basicBlueColor,
    fontSize: 50,
    fontWeight: 'bold',
    alignItems: 'center',
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
