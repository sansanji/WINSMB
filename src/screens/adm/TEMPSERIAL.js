/* *
 * Import Common
 * */
import { StyleSheet,
  Text,
  ScrollView,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  usbUtil,
  Util,
  // KeepAwake,
} from 'libs';
import {
  HButton,
  HTexttitle,
} from 'ux';
/**
 * 샘플 폼
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPSERIAL');
    this.state = ({
      output: 'Ready',
    });
  }

  async componentWillMount() {
    // this.fetch();
    const { navigator } = this.props.global;
    await usbUtil.initUSB();
    await usbUtil.findUSB();
    if (Platform.OS === 'ios') {
      Util.msgBox({
        title: 'Alert',
        msg: 'Serial is not support for IOS platform',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              navigator.dismissModal(this.props.componentId);
            },
          },
        ],
      });
    }
  }

  async componentDidMount() {
    await usbUtil.initUsbResult();
    // await usbUtil.startUSB();
    DeviceEventEmitter.addListener('ScanEvent', (event) => {
      this.setUsbResult(event.wtResult);
      // Add your Business Logic over here
    });
  }

  async startScan() {
    await usbUtil.findUSB();
    await usbUtil.startUSB();
  }
  componentWillUnmount() {
    usbUtil.clearUsb();
    DeviceEventEmitter.removeAllListeners();
  }

  setUsbResult(result) {
    this.setState({
      output: result,
    });
  }

  render() {
    // const jsCode = 'window.postMessage(document.cookie)';
    // if (this.state.isLoaded) {
    return (
      <ScrollView style={styles.body}>
        {/* <HButton onPress={() => usbUtil.initUSB()} name={'send'} title={'initUSB'} />
    <HButton onPress={() => usbUtil.findUSB()} name={'send'} title={'findUSB'} /> */}
        <HTexttitle>Auto</HTexttitle>
        <HButton onPress={() => this.startScan()} name={'send'} title={'startUSB'} />
        <HButton onPress={() => usbUtil.getUsbResult((result) => this.setUsbResult(result))} name={'send'} title={'getUsbResult'} />
        <HTexttitle>Manual</HTexttitle>
        <HButton onPress={() => this.findUSB()} name={'send'} title={'findUSB'} />
        <HButton onPress={() => this.startUSB()} name={'send'} title={'startUSB'} />
        <HButton onPress={() => usbUtil.getUsbResult((result) => this.setUsbResult(result))} name={'send'} title={'getUsbResult'} />

        <Text style={styles.title}>{this.state.output}</Text>
      </ScrollView>

    );
  }
}
const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 16,
    marginRight: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    // alignItems: "center"
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
  },
  line2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 50,
  },
  value: {
    marginLeft: 20,
  },
  output: {
    marginTop: 10,
    height: 300,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  inputContainer: {
    marginTop: 10,
    borderBottomWidth: 2,
  },
  textInput: {
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingLeft: 15,
    paddingRight: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#147efb',
    borderRadius: 3,
  },
  buttonText: {
    color: '#FFFFFF',
  },
});
/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
