/* *
 * Import Common
 * */
import {
  Platform,
  BackHandler,
  ToastAndroid,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {_, React, Redux, ReduxStore, Fetch, bluecolor, Navigation} from 'libs';
import {Touchable, HTableIcon, HBaseView, HText, HIcon, HRow} from 'ux';
import app from 'src/app';
/* *
 * Import node_modules
 * */
import {Icon} from 'react-native-elements';

/**
 * 서랍 Menu. 화면
 */

class Drawer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  // 이벤트 동작
  handleBackButton = () => {
    // 2000(2초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
    if (this.exitApp === undefined || !this.exitApp) {
      ToastAndroid.showWithGravity(
        'Please press BACK again to exit!',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
      this.exitApp = true;

      this.timeout = setTimeout(
        () => {
          this.exitApp = false;
        },
        2000, // 2초
      );
    } else {
      clearTimeout(this.timeout);

      BackHandler.exitApp(); // 앱 종료
    }
    return true;
  };

  _moveTab(screen, index) {
    const {lmenu} = this.props.global;
    // console.log(`index : ${index}`);
    // this.props.navigator.toggleDrawer({
    //   side: 'left',
    //   animated: true,
    //   to: 'hidden',
    // });
    const mainMenu = [];
    mainMenu.push(lmenu[index]);
    ReduxStore.dispatch({
      type: 'global.activeTab.set',
      activeTab: index,
    });
    app(mainMenu);
  }

  async logOut() {
    ReduxStore.dispatch({
      type: 'global.session.set',
      session: {},
    });
    await Fetch.logout();
  }

  openPopup(title, screen) {
    const {navigator} = this.props.global;

    Navigation(navigator, screen, {}, title);
  }

  render() {
    const {session, lmenu, activeTab} = this.props.global;
    let profileIcon = '';
    const profileSource = _.get(this.props.global, 'session.PHOTO_PATH', null);
    if (profileSource) {
      profileIcon = {
        uri: profileSource,
        headers: {
          'X-CSRF-TOKEN': globalThis.gToken,
          Cookie: globalThis.gCookie,
          // withCredentials: true,
        },
      };
    }
    const platform = Platform.OS;
    const parentContainer =
      platform !== 'ios' ? styles.containerAndroid : styles.containerIos;

    return (
      <View
        // style={[styles.container, platform !== "ios" ? "marginTop:50, width:95%" : " width:100%"]}
        style={parentContainer}>
        <View>
          <View style={styles.userContainer}>
            <View style={styles.userIconContainer}>
              {profileIcon !== '' ? (
                <Image source={profileIcon} style={styles.userIcon} />
              ) : (
                <Icon
                  name="face"
                  type="MaterialIcons"
                  color={bluecolor.basicBlueColor}
                  size={80}
                />
              )}
            </View>
            <View>
              <View style={styles.userLabelContainer}>
                {session !== null ? (
                  <HText textStyle={styles.userLabel}>
                    {session.USER_AUTH === 'D'
                      ? session.USER_ID
                      : session.USER_NAME_ENG}
                  </HText>
                ) : null}
              </View>
              <View style={styles.userStatus}>
                <HText textStyle={styles.userStatusLabel}>
                  {session != null ? session.EMP_ID : '연구소'}
                </HText>
              </View>
            </View>
          </View>
        </View>
        <HBaseView>
          <HTableIcon
            iconList={lmenu}
            activeIcon={activeTab}
            onClick={(screen, index) => this._moveTab(screen, index)}
            iconStyle={styles.iconStyle}
          />
        </HBaseView>
        <View>
          <HRow style={styles.bottomContainer} between>
            <Touchable style={styles.bottomGroup} onPress={() => this.logOut()}>
              <View>
                <HIcon
                  name="lock-open"
                  iconType="M"
                  color={bluecolor.basicBlueColor}
                  size={30}
                />
              </View>
              <View>
                <HText textStyle={styles.bottomBtText}>{'Logout'}</HText>
              </View>
            </Touchable>
            <HRow between>
              <Touchable
                style={styles.bottomGroup}
                onPress={() => this.openPopup('Q&A', 'screen.ADM010104')}>
                <View>
                  <HIcon
                    name="question-circle"
                    color={bluecolor.basicBlueColor}
                    size={30}
                    tableStyle={styles.menucontainer}
                  />
                </View>
                <View>
                  <HText textStyle={styles.bottomBtText}>{'Q&A'}</HText>
                </View>
              </Touchable>

              <Touchable
                style={styles.bottomGroup}
                onPress={() => this.openPopup('Setting', 'screen.ADM010101')}>
                <View>
                  <HIcon
                    name="settings-applications"
                    iconType="M"
                    color={bluecolor.basicBlueColor}
                    size={30}
                    tableStyle={styles.menucontainer}
                  />
                </View>
                <View>
                  <HText textStyle={styles.bottomBtText}>{'Setting'}</HText>
                </View>
              </Touchable>
            </HRow>
          </HRow>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerAndroid: {
    flex: 1,
    height: '100%',
    width: '95%',
    marginTop: '10%',
    backgroundColor: '#0e4d92',
    opacity: 0.8,
    borderRadius: 5,
  },
  containerIos: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#0e4d92',
    borderRadius: 5,
  },
  userContainer: {
    backgroundColor: bluecolor.basicGrayColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 20,
    borderRadius: 5,
  },
  userIconContainer: {
    borderRadius: 50,
    backgroundColor: bluecolor.basicWhiteColor,
    margin: 10,
  },
  userIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  userLabelContainer: {
    alignItems: 'center',
    flex: 1,
    // color: bluecolor.basicBlueColor,
  },
  userLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    margin: 10,
    fontWeight: 'bold',
    color: bluecolor.basicBlueColor,
  },
  userStatus: {
    // textAlign: 'center',
    borderRadius: 10,
    backgroundColor: bluecolor.basicBlueColor,
    padding: 10,
    overflow: 'hidden',
  },
  userStatusLabel: {
    textAlign: 'center',
    color: bluecolor.basicWhiteColor,
    fontSize: 13,
  },
  menucontainer: {
    backgroundColor: bluecolor.basicBlueColor,
  },
  mText: {
    fontSize: bluecolor.basicFontSizeS,
    fontWeight: 'bold',
    // color: '#424242',
  },
  bottomContainer: {
    backgroundColor: bluecolor.basicGrayColor,
  },
  bottomGroup: {
    margin: 10,
  },
  bottomBtText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: bluecolor.basicBlueColor,
  },
  iconStyle: {
    width: 60,
    paddingTop: 20,
    borderRadius: 50,
    margin: 20,
    // backgroundColor: bluecolor.basicSoftGrayColor,
  },
});

// ------------------------------------
// Define properties to inject from store state
// ------------------------------------
const mapStateToProps = state => ({
  global: state.global,
});

export default Redux.connect(mapStateToProps)(Drawer);
