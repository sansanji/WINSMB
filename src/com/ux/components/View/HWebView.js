/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
  React,
  bluecolor,
  Util,
  // KeepAwake,
} from 'libs';
import { HIcon, Touchable } from 'ux';
import store from 'libs/store';

import { WebView } from 'react-native-webview';
/**
 * 웹뷰 컴포넌트
 *  @param {Function} onMessage - 웹뷰에서 띄어진 웹사이트의 메세지를 받으면 실행되는 함수
 *  @param {Function} onLoad - 웹뷰가 로딩될때 실행되는 함수
 *  @param {String} source - 웹뷰에서 실행시킬 사이트 주소
 *  @param {String} mode - WINS 모드일 경우 자동 로그인
 *
 * @example
 * <HFormView
      style={this.props.headerStyle}
      renderHeader={this.props.renderHeader}
      headerClose
   />
 */

class HWebView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      h: '100%',
      w: '100%',
      isLoaded: false,
      // url: 'https://wins.htns.com/index.html#',
      param: 'const meta = document.createElement(\'meta\');'
      + 'meta.setAttribute(\'content\', \'width=device-width, initial-scale=0.5, maximum-scale=2.0, user-scalable=yes\');'
      + 'meta.setAttribute(\'name\', \'viewport\');'
      + 'document.getElementsByTagName(\'head\')[0].appendChild(meta);'
      + 'document.login.USER_ID.value = \'sansanji\';'
      + 'document.login.PW.value=\'Jkm123451!\';',
      uri: this.props.source,
      reload: false,
      // url: 'http://192.168.0.10:1841/webos/mobile.html',
    };
    this.onMessage = this.onMessage.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onPageFinished = this.onPageFinished.bind(this);
  }

  componentWillMount() {
    // this.fetch();
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
    const { mode } = this.props;
    console.log('webview onLoad', e.nativeEvent.url);
    // WINS 모드일 경우 자동 로그인 현재 안드로이드만 가능함
    if (mode !== null && mode === 'WINS') {
      if ((e.nativeEvent.url.indexOf('#') < 0)) {
        if (!this.state.reload) {
          this.state.reload = true;
          this.logon();
          setTimeout(() => {
            this.setFunction(`document.location='${this.state.uri}'`);
            // const { navigator } = store.getState().global;
            // navigator.dismissOverlay('webview');
          }, 2000);
        }
      }
    } else if (mode === 'LOGIN') {
      if (!this.state.reload) {
        this.state.reload = true;
        this.logon();
        setTimeout(() => {
          const { navigator } = store.getState().global;
          navigator.dismissOverlay('webview');
        }, 2000);
      }
    }

    if (this.props.onLoad) {
      this.props.onLoad(e);
    }
  }

  // 페이지 완료 함수
  onPageFinished(e) {
    console.log('webview onPageFinished', e);
    if (this.props.onPageFinished) {
      this.props.onPageFinished(e);
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
    if (this.state.h === '100%') {
      this.setState({
        h: '100.1%',
        w: '100.1%',
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

    if (this.exitApp === undefined || !this.exitApp) {
      Util.toastMsg('Please press again to exit');
      this.exitApp = true;

      this.timeout = setTimeout(
        () => {
          this.exitApp = false;
        },
        2000, // 2초
      );
    } else {
      clearTimeout(this.timeout);
      navigator.dismissOverlay('webview');
    }
  }

  render() {
    const { mode } = this.props;
    return (
      <View style={mode === 'LOGIN' ? styles.loginStyle : styles.baseStyle}>
        <WebView
          ref={webview => {
            this.hWebview = webview;
          }}
          // nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
          source={
            {
              uri: this.state.uri,
            }
          }
          // cacheEnabled
          // mixedContentMode={'always'}
          // javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          useWebKit
          injectedJavaScript={this.state.param}
          onLoad={e => this.onLoad(e)}
          onPageFinished={e => this.onPageFinished(e)}
          style={{
            flex: 1,
            height: this.state.h,
            width: this.state.w,
          }}
          onMessage={e => this.onMessage(e)}
        />
        <View style={styles.scrollctrlCntr}>
          <View style={{ justifyContent: 'flex-end',
            flexDirection: 'row',
            padding: 1,
            borderRadius: 5,
            backgroundColor: bluecolor.basicBlueLightTrans }}
          >
            <Touchable
              style={styles.scrollCtrlBtn}
              onPress={() => this.rotation()}
            >
              <HIcon name="fullscreen" iconType="M" color={bluecolor.basicWhiteColor} size={30} />
            </Touchable>
            <Touchable
              style={styles.scrollCtrlBtn}
              onPress={() => this.close()} // {() => this._goToBottom()} 이런식으로 하면 문제가 됨!
            >
              <HIcon name="exit-to-app" iconType="M" color={bluecolor.basicRedColor} size={30} />
            </Touchable>
          </View>
        </View>
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
  scrollctrlCntr: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 50,
    right: 5, // 10,
  },
});

/**
 * Inject redux actions and props
 */
// const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default HWebView;
