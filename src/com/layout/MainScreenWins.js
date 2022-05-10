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
  // initCommonCode,
  bluecolor,
} from 'libs';
import { BallIndicator } from 'ux';
import { Navigation } from 'react-native-navigation';
import ComWebView from 'layout/ComWebView';

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
    super(props, 'MainScreenWins');
    this.state = {
      id: null,
      pw: null,
      status: 'Please wait..',
    };
  }

  goToScreen = screenName => {
    Navigation.push(this.props.componentId, {
      component: {
        name: screenName,
      },
    });
  };

  componentWillMout() {

  }

  async componentDidMount() {
    await AsyncStorage.getItem('poneNo', (err, result) => {
      this.setState({
        id: result,
      });
    });
    await AsyncStorage.getItem('password', (err, result) => {
      this.setState({
        pw: result,
      });
    });
  }


  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.stepButtonContainer}>
          {this.state.status !== 'WINS Mode' ?
            <View style={styles.spinnerContainer}>
              <BallIndicator size={100} color={'#00c4ff'} borderWd={10} />
            </View> : null}
        </View>
        { (this.state.id && this.state.pw) ?
          <ComWebView
            componentId={'com.layout.ComWebView'}
            navigator={this.props.navigator}
            mode="LOGIN"
            scalesPageToFit
            source="http://wins-s.htns.com"
            id={this.state.id}
            pw={this.state.pw}
            winsBt
            onLoad={() => {

            }}
            onLoadEnd={() => {
              this.setState({
                status: 'WINS Mode',
              });
            }}

          /> : null }
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
  mainLoad: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0000004a',
  },
  mainSubText: {
    color: bluecolor.basicWhiteColor,
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    backgroundColor: '#2a5a89',
  },
  mainSubTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stepButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  favButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    bottom: 0,
    margin: 10,
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
