/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  bluecolor,
} from 'libs';
import store from 'libs/store';

import { WebView } from 'react-native-webview';
/**
 * 웹뷰 컴포넌트
 *  @param {Function} onMessage - 웹뷰에서 띄어진 웹사이트의 메세지를 받으면 실행되는 함수
 *  @param {Function} onLoad - 웹뷰가 로딩될때 실행되는 함수
 *  @param {String} source - 웹뷰에서 실행시킬 사이트 주소
 *  @param {Boolean} zoom - ZOOM으로 설정될 경우 사이트에서 설정된 확대정보를 따른다.
 * @example
 *  const { navigator } = store.getState().global;

    navigator.showOverlay({
      component: {
        name: 'com.layout.PoltalWebView',
        passProps: {
          source : html소스,
        },
        options: {
          layout: {
            backgroundColor: bluecolor.basicRedColorTransLow,
            componentBackgroundColor: bluecolor.basicRedColorTransLow,
          },
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
 */
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

class PortalWebView extends NavigationScreen {
  constructor(props) {
    super(props);


    this.state = {
      h: '100%',
      w: '100%',
      param: `${'const meta = document.createElement(\'meta\');'
      + 'meta.setAttribute(\'name\', \'viewport\');'
      + 'meta.setAttribute(\'content\', \'width=device-width, initial-scale=0.7, maximum-scale=2, user-scalable=yes\');'
      + 'document.getElementsByTagName(\'head\')[0].appendChild(meta);'}`,
      html: this.props.source,
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
    if (this.props.onLoadEnd) {
      if (e.nativeEvent.url.indexOf('blank') < 0) {
        this.props.onLoadEnd();
      }
    }
  }

  // 함수를 바인딩
  setFunction(param) {
    if (this.hWebview.injectJavaScript && param) {
      this.hWebview.injectJavaScript(param);
    }
  }


  close() {
    const { navigator } = store.getState().global;
    navigator.dismissOverlay('webview');
  }


  render() {
    const { zoom } = this.props;
    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <WebView
            ref={webview => {
              this.hWebview = webview;
            }}
            domStorageEnabled
            javaScriptEnabled
            source={
              {
                html: this.state.html,
              }
            }
            scalesPageToFit
            cacheEnabled={false}
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
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
    backgroundColor: bluecolor.basicWhiteColor,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
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
 * Wrapping with root component
 */
/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
  * Wrapping with root component
  */
export default Redux.connect(mapStateToProps)(PortalWebView);
