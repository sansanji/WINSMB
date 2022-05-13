/* *
 * Import Common
 * */
import {
  View,
  Image,
  Text,
  TextInput,
  StyleSheet,
  AsyncStorage,
  KeyboardAvoidingView,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {_, React, Redux, Fetch, NavigationScreen, bluecolor, Util} from 'libs';
import {Touchable, HText} from 'ux';
/* *
 * Import node_modules
 * */
import {CheckBox} from 'react-native-elements';
import loginCheck from 'src/loginCheck';
import {Icon} from 'react-native-elements';
/**
 * 로그인 화면
 */
const tnsLogoImage = require('assets/images/feel-back11.png');
const backImage = require('assets/images/feel-back12.png');

/**
 * 로그인(Login) 컴포넌트
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'LoginPage');
    this.state = {
      csrf: null,
      id: null,
      password: null,
      saveID: true,
      savePW: true,
      saveWINS: null,
      saveCOUNTRY: true,
      countryName: null,
      countryCode: null,
      alertT: 'Remember ID',
      alertT2: 'Remember PW',
      saveTerms: null,
      saveUseTerm: null,
      savePersonalTerm: null,
    };
    this.isPhoneNo = true;
    AsyncStorage.getItem('', (err, result) => {
      if (result) {
        this.isPhoneNo = false;
      }
    });
    this.initLogin = true;
  }

  componentWillMount() {
    // this.props.navigator.toggleNavBar({
    //   to: 'hidden',
    // });
    this.getPhoneNo();
    if (Platform.OS === 'android') {
      AsyncStorage.getItem('permission', (err, result) => {
        if (!result) {
          this.checkPermission();
        }
      });
    }
  }

  componentDidMount() {
    // this.getToken();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      id: nextID,
      password: nextPassword,
      saveID: nextCheckID,
      savePW: nextCheckPW,
      saveWINS: nextCheckWINS,
      saveCOUNTRY: nextCheckCOUNTRY,
      countryName: nextCountryName,
    } = nextState;

    const {
      id: currID,
      password: currPassword,
      saveID: currCheckID,
      savePW: currCheckPW,
      saveWINS: currCheckWINS,
      saveCOUNTRY: currCheckCOUNTRY,
      countryName: currCountryName,
    } = this.state;

    return (
      currID !== nextID ||
      currPassword !== nextPassword ||
      currCheckID !== nextCheckID ||
      currCheckPW !== nextCheckPW ||
      currCheckWINS !== nextCheckWINS ||
      currCheckCOUNTRY !== nextCheckCOUNTRY ||
      currCountryName !== nextCountryName
    );
  }
  checkPermission() {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]).then(result => {
      if (
        result['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
        result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
        result['android.permission.CAMERA'] === 'granted' &&
        result['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
        result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
      ) {
        this.permission = true;
      } else {
        this.permission = false;
        const message =
          'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue';
        Alert.alert(
          'Please, Check Permissions!',
          message,
          [
            {text: 'OK', onPress: () => this.checkPermission()},
            {cancelable: false},
          ],
          {
            cancelable: false,
          },
        );
      }
      console.log('setpermission', this.permission);
      AsyncStorage.setItem('permission', this.permission);
    });
  }
  async getPhoneNo() {
    await AsyncStorage.getItem('poneNo', (err, result) => {
      if (result) {
        this.setState({
          id: result,
          saveID: true,
          saveTerms: 'Y',
          saveUseTerm: 'Y',
          savePersonalTerm: 'Y',
        });
        AsyncStorage.setItem('Terms', 'Y');
      } else {
        this.setState({
          id: null,
          saveID: true,
          saveTerms: 'N',
          saveUseTerm: 'N',
          savePersonalTerm: 'N',
        });
      }
    });
    await AsyncStorage.getItem('password', (err, result) => {
      if (result) {
        this.setState({
          password: result,
          savePW: true,
        });
      } else {
        this.setState({
          password: null,
          savePW: true,
        });
      }
    });
    await AsyncStorage.getItem('saveWINS', (err, result) => {
      if (result === 'Y') {
        this.setState({
          saveWINS: 'Y',
        });
      } else {
        this.setState({
          saveWINS: 'N',
        });
      }
    });
    await AsyncStorage.getItem('countryName', (err, result) => {
      if (result) {
        this.setState({
          countryName: result,
        });
      } else {
        this.setState({
          countryName: 'Korea',
        });
      }
    });
    await AsyncStorage.getItem('countryCode', (err, result) => {
      if (result) {
        this.setState({
          countryCode: result,
        });
      } else {
        this.setState({
          countryCode: 'KO',
        });
      }
    });
    await AsyncStorage.getItem('Terms', (err, result) => {
      if (result) {
        this.setState({
          saveTerms: 'Y',
          saveUseTerm: 'Y',
          savePersonalTerm: 'Y',
        });
      } else {
        this.setState({
          saveTerms: 'N',
          saveUseTerm: 'N',
          savePersonalTerm: 'N',
        });
      }
    });
  }

  async logOut() {
    await Fetch.logout();
  }

  async fetchToken() {
    const result = await Fetch.token();
    return result;
  }

  async fetchLogin(csrf, id, password) {
    const result = await Fetch.login(csrf, id, password);
    return result;
  }

  async login() {
    const savetermsYN = this.state.saveTerms;
    // const saveUserTerm = this.state.saveUseTerm;
    // const savePersonalTerm = this.state.savePersonalTerm;

    if (savetermsYN === 'N') {
      Util.TosBox(this.state.saveUseTerm, this.state.savePersonalTerm);
      this.setState({
        saveTerms: 'Y',
        saveUseTerm: 'Y',
        savePersonalTerm: 'Y',
      });
      AsyncStorage.setItem('Terms', 'Y');
      return;
    }

    // console.log('login button pressed');
    if (Util.isEmpty(this.state.countryCode)) {
      await AsyncStorage.removeItem('countryName');
      await AsyncStorage.removeItem('countryCode');
      Util.toastMsg('Please Check Country');
      return;
    }
    // fetch부분은 Token 호출하기 전에 save 해줌 WINS country별접속  저장여부
    if (this.state.saveCOUNTRY) {
      await AsyncStorage.setItem('countryName', this.state.countryName);
      await AsyncStorage.setItem('countryCode', this.state.countryCode);
    } else {
      await AsyncStorage.removeItem('countryName');
      await AsyncStorage.removeItem('countryCode');
    }
    const tokenp = await this.fetchToken();
    // if (!token) {
    //   return;
    // }

    // this.state.id = Util.replaceAll(this.state.id, '-', '');
    // this.state.password = Util.replaceAll(this.state.password, '-', '');
    // this.state.id = Util.replaceAll(this.state.id, ' ', '');
    // this.state.password = Util.replaceAll(this.state.password, ' ', '');
    const csrf = _.get(tokenp, 'signaldata.X-CSRF-TOKEN');
    // const csrf = _.get(tokenp, 'Set-Cookie');
    console.log(csrf);
    const result = await this.fetchLogin(
      csrf,
      this.state.id,
      this.state.password,
    );
    const message = _.get(result, 'MSG');
    // const status = _.get(result, 'STATUS');
    const type = _.get(result, 'TYPE');
    if (type === 200111 || type === 200130 || type === 403) {
      if (this.initLogin) {
        this.login();
        this.initLogin = false;
      } else {
        // this.initLogin = true;
        // Alert.alert('Please, Try it again!', message, [{ text: 'OK' }, { cancelable: false }], {
        //   cancelable: false,
        // });
        this.loginRetry();
        this.initLogin = false;
      }
    } else {
      loginCheck('ok');
      // id 저장여부
      if (this.state.saveID) {
        await AsyncStorage.setItem('poneNo', this.state.id);
      } else {
        await AsyncStorage.removeItem('poneNo');
      }
      // pw 저장여부
      if (this.state.savePW) {
        await AsyncStorage.setItem('password', this.state.password);
      } else {
        await AsyncStorage.removeItem('password');
      }

      // WINS 저장여부
      if (this.state.saveWINS === 'Y') {
        await AsyncStorage.setItem('saveWINS', 'Y');
      } else {
        await AsyncStorage.removeItem('saveWINS');
      }
    }
    // } else {
    //   ReduxStore.dispatch({
    //     type: 'global.token.set',
    //     token: this.tokenLocal,
    //   });
    // }
  }

  async loginRetry() {
    if (Util.isEmpty(this.state.countryCode)) {
      await AsyncStorage.removeItem('countryName');
      await AsyncStorage.removeItem('countryCode');
      Util.toastMsg('Please Check Country');
      return;
    }
    // fetch부분은 Token 호출하기 전에 save 해줌 WINS country별접속  저장여부
    if (this.state.saveCOUNTRY) {
      await AsyncStorage.setItem('countryName', this.state.countryName);
      await AsyncStorage.setItem('countryCode', this.state.countryCode);
    } else {
      await AsyncStorage.removeItem('countryName');
      await AsyncStorage.removeItem('countryCode');
    }

    const tokenp = await this.fetchToken();

    const csrf = _.get(tokenp, 'signaldata.X-CSRF-TOKEN');
    console.log(csrf);
    const result = await this.fetchLogin(
      csrf,
      this.state.id,
      this.state.password,
    );
    const message = _.get(result, 'MSG');

    const type = _.get(result, 'TYPE');
    if (type === 200111 || type === 200130 || type === 403) {
      if (this.initLogin) {
        this.login();
        this.initLogin = false;
      } else {
        this.initLogin = true;
        Alert.alert(
          'Please, Try it again!',
          message,
          [{text: 'OK'}, {cancelable: false}],
          {
            cancelable: false,
          },
        );
      }
    } else {
      loginCheck('ok');
      // id 저장여부
      if (this.state.saveID) {
        await AsyncStorage.setItem('poneNo', this.state.id);
      } else {
        await AsyncStorage.removeItem('poneNo');
      }
      // pw 저장여부
      if (this.state.savePW) {
        await AsyncStorage.setItem('password', this.state.password);
      } else {
        await AsyncStorage.removeItem('password');
      }
      // WINS 저장여부
      if (this.state.saveWINS === 'Y') {
        await AsyncStorage.setItem('saveWINS', 'Y');
      } else {
        await AsyncStorage.removeItem('saveWINS');
      }
    }
  }

  getCountry() {
    Util.openComboBox({
      label: 'Country',
      groupCode: null,
      groupJson: [
        {DT_CODE: 'KO', LOC_VALUE: 'Korea'},
        {DT_CODE: 'EU', LOC_VALUE: 'Europe'},
        {DT_CODE: 'CN', LOC_VALUE: 'China'},
      ],
      sql: null,
      codeField: 'DT_CODE', // 기본적으로 DT_CODE
      nameField: 'LOC_VALUE', // 기본적으로 LOC_VALUE
      selected: null,
      onChange: (value, comboValues) => {
        this.setState({
          countryName: value.name,
          countryCode: value.code,
        });
        // 값이 변할때 이벤트 발생
        if (this.props.onChanged) {
          this.props.onChanged(value, comboValues);
        }
      },
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: bluecolor.basicWhiteColor,
        }}>
        <Image
          source={backImage}
          style={{
            flex: 1,
            position: 'absolute',
            resizeMode: 'cover',
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
        <KeyboardAvoidingView style={styles.container} behavior="height">
          <View style={{height: 260, width: '70%'}}>
            <Image
              source={tnsLogoImage}
              resizeMode={'contain'}
              style={{marginBottom: 0, width: '100%'}}
            />
          </View>
          <TouchableOpacity
            style={{
              height: 80,
              width: '70%',
              // marginBottom: 15,
              // alignItems: 'flex-end',
              alignItems: 'center',
            }}
            onPress={() => this.getCountry()}>
            <HText
              value={`${this.state.countryName}  ▼`}
              textStyle={styles.textWithShadow}
            />
          </TouchableOpacity>
          <View style={styles.inputIdContainer}>
            <TextInput
              style={styles.inputId}
              onChangeText={text => this.setState({id: text})}
              keyboardType="email-address"
              placeholder="ID"
              underlineColorAndroid={'transparent'}
              autoCapitalize={'none'}
              value={this.state.id}
              // editable={this.isPhoneNo === true}
            />
            <TextInput
              style={styles.inputId}
              secureTextEntry
              onChangeText={text => this.setState({password: text})}
              underlineColorAndroid={'transparent'}
              placeholder="Password"
              autoCapitalize={'none'}
              value={this.state.password}
            />
          </View>
          <Touchable onPress={() => this.login()} style={styles.buttonLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </Touchable>
          <View style={styles.check}>
            <CheckBox
              iconRight
              center
              // iconType="material"
              // checkedIcon="clear"
              // uncheckedIcon="add"
              checkedColor={bluecolor.basicBlueColor}
              // uncheckedColor="#003366"
              containerStyle={{
                height: 35,
                backgroundColor: bluecolor.basicTrans,
                borderColor: 'transparent',
              }}
              textStyle={{
                alignItems: 'center',
                color: bluecolor.basicBlueFontColor,
                fontSize: 11,
              }}
              title={'WINS Mode'}
              size={15}
              checked={this.state.saveWINS === 'Y'}
              onPress={() => {
                this.setState({
                  saveWINS: this.state.saveWINS === 'Y' ? 'N' : 'Y',
                });
              }}
            />
          </View>
        </KeyboardAvoidingView>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'flex-end',
            margin: 5,
          }}>
          <Touchable
            activeOpacity={0.5}
            onPress={() => {
              Util.TosBox(this.state.saveUseTerm, this.state.savePersonalTerm);
              this.setState({
                saveTerms: 'Y',
                saveUseTerm: 'Y',
                savePersonalTerm: 'Y',
              });
              AsyncStorage.setItem('Terms', 'Y');
            }}>
            <Text
              style={{
                fontSize: 10,
              }}>
              {'이용약관/개인정보 수집 동의'}
            </Text>
          </Touchable>
          <Text
            style={{
              fontSize: 10,
            }}>
            Copyright © Hanaro TNS All rights reserved.
          </Text>
        </View>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  textWithShadow: {
    color: 'rgba(255,255,230,0.9)',
    textShadowColor: bluecolor.basicBlueFontColor,
    // textShadowOffset: { width: 1, height: 0 },
    // textShadowRadius: 10,
    fontSize: 12,
    fontWeight: '400',
  },
  container: {
    flex: 1,
    // backgroundColor: bluecolor.basicGrayColorTrans,
    alignItems: 'center',
    justifyContent: 'center',
    // margin: 20,
    // marginTop: 60,
    // marginBottom: 60,
    // borderRadius: 10,
  },
  check: {
    marginTop: 3,
    backgroundColor: bluecolor.basicTrans,
    flexDirection: 'row',
    // alignSelf: 'stretch',
    alignItems: 'flex-start',
    // justifyContent: 'space-between',
    // marginLeft: 10,
    // marginRight: 10,
  },
  inputIdContainer: {
    width: '70%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  inputId: {
    width: '100%',
    height: 40,
    // backgroundColor: bluecolor.basicGrayColorTrans,
    backgroundColor: '#3e7ce7',
    color: bluecolor.basicWhiteColor,
    paddingLeft: 10,
    fontSize: 15,
    borderRadius: 10,
    margin: 5,
  },
  buttonLogin: {
    width: '70%',
    height: 40,
    backgroundColor: bluecolor.basicWhiteColorTrans,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 50,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: bluecolor.basicBlueFontColor,
    fontWeight: 'bold',
  },
  image: {
    borderWidth: 1,
    width: '100%',
  },
  text: {
    fontSize: 16,
  },

  // checkGroup: {
  //   backgroundColor: '#ffffff',
  //   flexDirection: 'column',
  // },
  // buttonLoginGroup: {
  //   height: 50,
  //   backgroundColor: '#517fa4',
  //   alignSelf: 'stretch',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 10,
  // },
  // buttonContainer: {
  //   flexDirection: 'row',
  //   padding: 1,
  // },
  // buttonInnerContainer: {
  //   flex: 1,
  //   marginTop: 5,
  //   alignItems: 'center',
  // },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({global: state.global, phone: state.phone});

export default Redux.connect(mapStateToProps)(Component);
