/* *
 * Import Common
 * */
import { Dimensions, View, Platform, ActivityIndicator } from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  bluecolor,
  // KeepAwake,
} from 'libs';
import {
  HBaseView,
} from 'ux';
import { WebView } from 'react-native-webview';
/**
 * 샘플 폼
 */
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPWEB');

    this.state = {
      h: 1920,
      w: 1080,
      isLoaded: false,
    };
    this.onMessage = this.onMessage.bind(this);
  }

  componentWillMount() {
    // this.fetch();
  }

  componentDidMount() {
    // this.init();
    // this.logon();
  }

  // 웹뷰로 부터 메세지 수신
  onMessage(e) {
    if (this.props.onMessage) {
      const data = JSON.parse(e.nativeEvent.data);
      this.props.onMessage(data);
    }
  }

  // 함수를 바인딩
  setFunction(param) {
    if (param) {
      this.myWebview.injectJavaScript(param);
    }
  }

  init() {
    let param = '';
    if (Platform.OS === 'android') {
      param = 'const meta = document.createElement(\'meta\');'
      + 'meta.setAttribute(\'content\', \'width=device-width, initial-scale=0, maximum-scale=2.0, user-scalable=yes\');'
      + 'meta.setAttribute(\'name\', \'viewport\');'
      + 'document.getElementsByTagName(\'head\')[0].appendChild(meta);'
      + 'document.login.USER_ID.value = \'sansanji\';'
      + 'document.login.PW.value=\'Jkm123451!\';';
    } else {
      param = 'const meta = document.createElement(\'meta\');'
      + 'meta.setAttribute(\'content\', \'initial-scale=0, maximum-scale=2.0, user-scalable=yes\');'
      + 'meta.setAttribute(\'name\', \'viewport\'); '
      + 'document.getElementsByTagName(\'head\')[0].appendChild(meta);'
      + 'document.login.USER_ID.value = \'sansanji\';'
      + 'document.login.PW.value=\'Jkm123451!\';'
      + 'true;';
    }
    this.setFunction(param);
  }


  // 로그인
  logon() {
    const param = 'log_on();';
    this.setFunction(param);
  }

  render() {
    // const jsCode = 'window.postMessage(document.cookie)';
    // if (this.state.isLoaded) {
    return (

      <WebView
        ref={webview => {
          this.myWebview = webview;
        }}
        javaScriptEnabled
        source={
          {
            uri: 'http://g1s.htns.com',
            // uri: 'http://customer.htns.com',
            // uri: 'http://naver.com',
          }
        }
        /* 기존 페이지
            useWebKit={Platform.OS === 'android'}
            scalesPageToFit={Platform.OS === 'ios'}
            */
        scalesPageToFit

        // injectedJavaScript={jsCode}

        onLoad={() => {
          if (this.props.onLoad) {
            this.props.onLoad();
          }
        }}
        injectedJavaScript={Platform.OS === 'android' ?
          'const meta = document.createElement(\'meta\');meta.setAttribute(\'content\', \'width=device-width, initial-scale=0, maximum-scale=2.0, user-scalable=yes\'); meta.setAttribute(\'name\', \'viewport\'); document.getElementsByTagName(\'head\')[0].appendChild(meta); document.login.USER_ID.value = \'sansanji\'; document.login.PW.value=\'Jkm123451!\';log_on();'
          : 'const meta = document.createElement(\'meta\'); meta.setAttribute(\'content\', \'initial-scale=0, maximum-scale=2.0, user-scalable=yes\'); meta.setAttribute(\'name\', \'viewport\'); document.getElementsByTagName(\'head\')[0].appendChild(meta);document.login.USER_ID.value = \'sansanji\'; document.login.PW.value=\'Jkm123451!\';log_on();true;'}
        onMessage={e => this.onMessage(e)}
        style={{
          flex: 1,
          height: screenHeight,
          width: screenWidth,
        }}
      />

    );
    // }

    // return (
    //   <View style={{ flex: 1 }}>
    //     <View style={{ height: 0, width: 0 }}>
    //       <WebView
    //         ref={webview => {
    //           this.myWebview = webview;
    //         }}
    //         source={
    //           {
    //             uri: 'http://g1s.htns.com',
    //           // uri: 'http://customer.htns.com',
    //           // uri: 'http://naver.com',
    //           }
    //         }
    //         onLoad={() => {
    //           this.setState({ isLoaded: true });
    //         }}
    //       />
    //     </View>
    //     <ActivityIndicator size="large" color={bluecolor.basicBlueColor} />
    //   </View>
    // );
  }
}
/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
