/* *
 * Import Common
 * */
import { View, StyleSheet, Vibration, AsyncStorage } from 'react-native';
import {
  React,
  bluecolor,
  Redux,
  NavigationScreen,
  Util,
  // KeepAwake,
} from 'libs';
import { HIcon, Touchable, HSpringView } from 'ux';
import store from 'libs/store';
import app from 'src/app';

import { WebView } from 'react-native-webview';
/**
 * 웹뷰 컴포넌트
 *  @param {Function} onMessage - 웹뷰에서 띄어진 웹사이트의 메세지를 받으면 실행되는 함수
 *  @param {Function} onLoad - 웹뷰가 로딩될때 실행되는 함수
 *  @param {String} source - 웹뷰에서 실행시킬 사이트 주소
 *  @param {String} mode - WINS 모드일 경우 안드로이드 자동 로그인, LOGIN 로그인 모드
 *  @param {Boolean} zoom - ZOOM으로 설정될 경우 사이트에서 설정된 확대정보를 따른다.
 *  @param {Boolean} backBt - 백버튼
 *  @param {Boolean} flexBt - 화면 조절 버튼
 *  @param {Boolean} winsBt - Wins 복귀 버튼
 * @example
 * Util.openWebView({
      mode: 'WINS',
      source: 'https://wins.htns.com/index.html#FMS010102V',
      onMessage: () => {
        console.log('TEMPFORM ON MESSAGE');
      },
      onLoad: (e) => {
        console.log('TEMPFORM ON LOAD', e);
      },
    });
 */
// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
class ComWebView extends NavigationScreen {
  constructor(props) {
    super(props);


    this.state = {
      h: '100%',
      w: '100%',
      // url: 'https://wins.htns.com/index.html#',
      param: `${'const meta = document.createElement(\'meta\');'
      + 'meta.setAttribute(\'name\', \'viewport\');'
      + 'meta.setAttribute(\'content\', \'width=device-width, initial-scale=0.5, maximum-scale=2, user-scalable=yes\');'
      + 'document.getElementsByTagName(\'head\')[0].appendChild(meta);'
      + 'document.login.USER_ID.value = \''}${this.props.id}';`
      + `document.login.PW.value='${this.props.pw}';`,
      uri: this.props.source,
      reload: false,
    };
    this.onMessage = this.onMessage.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onLoadEnd = this.onLoadEnd.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {

  }

  // 웹뷰로 부터 메세지 수신
  onMessage(e) {
    if (this.props.onMessage) {
      const data = JSON.parse(e.nativeEvent.data);
      this.props.onMessage(data);
    }
  }

  // 웹뷰 로딩함수
  onLoad(e) {
    if (!this.state.reload) {
      this.state.reload = true;
      if (this.props.onLoad) {
        this.props.onLoad(e);
      }
    }
  }

  // 페이지 완료 함수
  onLoadEnd(e) {
    const { mode } = this.props;
    if (mode !== null && mode === 'WINS') {
      console.log('WINS');
    } else if (mode === 'LOGIN') {
      this.logon();
    }
    if (this.props.onLoadEnd) {
      this.props.onLoadEnd(e);
    }
  }

  // 함수를 바인딩
  setFunction(param) {
    if (this.hWebview.injectJavaScript && param) {
      this.hWebview.injectJavaScript(param);
    }
  }


  // 로그인
  logon() {
    const param = 'log_on();';
    this.setFunction(param);
  }

  rotation() {
    Vibration.vibrate(100);
    if (this.state.h === '100%') {
      this.setState({
        h: '100.2%',
        w: '100.2%',
      });
    } else {
      this.setState({
        h: '100%',
        w: '100%',
      });
    }
  }

  close() {
    const { navigator } = store.getState().global;

    // if (this.exitApp === undefined || !this.exitApp) {
    //   Util.toastMsg('Please press again to exit');
    //   this.exitApp = true;

    //   this.timeout = setTimeout(
    //     () => {
    //       this.exitApp = false;
    //     },
    //     2000, // 2초
    //   );
    // } else {
    //   clearTimeout(this.timeout);
    navigator.dismissOverlay('webview');
    // }
  }

  async backWins() {
    Util.msgBox({
      title: 'WINS Mode',
      msg: 'Do you want to exist WINS Mode?',
      buttonGroup: [
        {
          title: 'Yes',
          onPress: item => {
            AsyncStorage.setItem('saveWINS', 'N');
            app([{
              title: '홈으로',
              screen: 'com.layout.MainScreen',
            }]);
          },
        },
        {
          title: 'No',
          onPress: item => {
          },
        },
      ],
    });
  }

  render() {
    const { zoom, backBt, flexBt, winsBt } = this.props;
    return (
      <View style={styles.baseStyle}>
        {/* <View style={mode === 'LOGIN' ? styles.loginStyle : styles.baseStyle}> */}
        <WebView
          ref={webview => {
            this.hWebview = webview;
          }}
          domStorageEnabled
          javaScriptEnabled
          source={
            {
              uri: this.state.uri,
              // uri: 'https://customer.htns.com',
              // uri: 'https://naver.com',
            }
          }
          scalesPageToFit
          cacheEnabled={false}
          /* 기존 페이지
          useWebKit={Platform.OS === 'android'}
          scalesPageToFit={Platform.OS === 'ios'}
          */
          useWebKit={false}
          // injectedJavaScript={jsCode}
          onLoadEnd={(e) => {
            this.onLoadEnd(e);
          }}
          onLoad={(e) => {
            this.onLoad(e);
          }}
          injectedJavaScript={zoom ? null : this.state.param}
          onMessage={e => this.onMessage(e)}
          style={{
            flex: 1,
            height: this.state.h,
            width: this.state.w,
          }}
        />
        { backBt ?
          <View style={styles.display}>
            <View style={{ justifyContent: 'flex-end',
              flexDirection: 'row',
              padding: 1,
              borderRadius: 50,
              backgroundColor: bluecolor.basicBluebtTrans }}
            >
              <Touchable
                onPress={() => this.rotation()}
              >
                <HIcon name="fullscreen" iconType="M" color={bluecolor.basicWhiteColor} size={30} />
              </Touchable>
            </View>
          </View>
          : null }

        {flexBt ?
          <View style={styles.backButton}>
            <View style={{ justifyContent: 'flex-end',
              flexDirection: 'row',
              padding: 1,
              borderRadius: 50,
              backgroundColor: bluecolor.basicBluebtTrans }}
            >
              <Touchable
                onPress={() => this.close()} // {() => this._goToBottom()} 이런식으로 하면 문제가 됨!
              >
                <HIcon name="arrow-back" iconType="M" color={bluecolor.basicRedColor} size={30} />
              </Touchable>
            </View>
          </View>
          : null }
        {winsBt ?
          <View style={styles.winsButton}>
            <HSpringView>
              <View style={{ justifyContent: 'flex-end',
                flexDirection: 'row',
                paddingTop: 5,
                paddingBottom: 5,
                paddingRight: 2,
                paddingLeft: 2,
                borderRadius: 50,
                backgroundColor: bluecolor.basicSkyLightBlueTrans }}
              >
                <Touchable
                  onPress={() => this.backWins()}
                >
                  <HIcon name="tablet-android" iconType="M" color={bluecolor.basicYellowColor} size={20} />
                </Touchable>
              </View>
            </HSpringView>
          </View>
          : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  baseStyle: {
    flex: 1,
  },
  loginStyle: {
    flex: 0,
  },
  display: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 50,
    right: 5, // 10,
  },
  backButton: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 50,
    left: 5, // 10,
  },
  winsButton: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 50,
    right: 15, // 10,
  },
});

/**
 * Inject redux actions and props
 */
// const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
  * Wrapping with root component
  */
export default Redux.connect(mapStateToProps)(ComWebView);
