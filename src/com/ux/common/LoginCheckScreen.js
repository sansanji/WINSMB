/* *
 * Import Common
 * */
import {AsyncStorage, View, Image} from 'react-native';
import {React, Util, env, bluecolor} from 'libs';
import {HFadeinView, HText} from 'ux';
/* *
 * Import node_modules
 * */
import Cookie from 'react-native-cookie';
import app from './../../../app';
import login from './../../../login';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
const lScreen = require('assets/images/back3.png');
/**
 * 로그인 체크 컴포넌트
 */
class LoginCheckScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
    };
  }

  async componentDidMount() {
    await AsyncStorage.getItem('cookie', (err, result) => {
      if (result !== null || result !== undefined) {
        globalThis.gCookie = result;
        AsyncStorage.getItem('token', (err1, result1) => {
          if (result1 !== null || result1 !== undefined) {
            globalThis.gToken = result1;
            // this.timeoutHandle = setTimeout(() => {
            console.log(`JAY CHECK TOKEN = ${globalThis.gToken}`);
            console.log(`JAY CHECK COOKIE = ${globalThis.gCookie}`);
            this.checkFetch();
            // }, 1000);
          }
        });
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutHandle); // This is just necessary in the case that the screen is closed before the timeout fires, otherwise it would cause a memory leak that would trigger the transition regardless, breaking the user experience.
  }

  async checkFetch() {
    try {
      Cookie.clear();
      const response = await fetch(`${fetchURL}/api/G1E000000SVC/getInitG1M`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': globalThis.gToken,
          Accept: 'application/json',
          AJAX: true,
          Cookie: globalThis.gCookie,
          'User-Agent': 'okhttp/3.4.1',
          'Content-Type': 'application/json;charset=UTF-8',
          credentials: 'omit',
          // withCredentials: true,
        },
        body: JSON.stringify({}),
        sslPinning: {
          cert: 'mycert', // cert file name without the `.cer`
        },
      });

      let result = null;
      if (response.url.indexOf('jsp') < 0) {
        result = await response.json();
      }

      console.log('loginCheck', response, result);
      console.log('loginCheckCookie=', globalThis.gCookie);

      if (result !== null) {
        if (result.TYPE !== null || result.TYPE !== undefined) {
          if (
            result.TYPE === 200111 ||
            result.TYPE === 200130 ||
            result.TYPE === 403 ||
            result.TYPE === -1 ||
            result.TYPE === null
          ) {
            login();
            Util.toastMsg(result.MSG);
          } else {
            // 서랍메뉴를 불러온다.
            const lfuncMenus = [];
            if (!Util.isEmpty(result.data.menu)) {
              const tmenu = Util.parseLmenu(result.data.menu);
              // 첫번째 화면이 홈화면
              lfuncMenus.push(tmenu[0]);
              app(lfuncMenus);
            }
            Util.toastMsg('Login Success');
            // 꼭 app() 보다 위에 위치 시킨다.
          }
        } else {
          login();
          Util.toastMsg(result.MSG);
        }
      } else {
        login();
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={lScreen}
          style={{
            flex: 1,
            position: 'absolute',
            resizeMode: 'stretch',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: bluecolor.basicTrans,
          }}
        />
        <HFadeinView>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}>
            <HText
              textStyle={{
                marginBottom: 15,
                fontSize: 40,
                fontStyle: 'italic',
                fontWeight: 'bold',
                color: bluecolor.basicWhiteColor,
              }}>
              WINS Mobile
            </HText>
          </View>
        </HFadeinView>
      </View>
    );
  }
}

export default LoginCheckScreen;
