/* *
 * Import Common
 * */
import { Text, StyleSheet, TouchableOpacity, Alert, View } from 'react-native';
import { React, Redux, bluecolor, Navigation, Util, NavigationScreen } from 'libs';

/* *
 * Import node_modules
 * */
import Barcode from './Barcode';
/**
 * 푸쉬메세지 버튼 컴포넌트
 */
class ComBarcode extends NavigationScreen {
  constructor(props) {
    super(props);
    this.state = {
      viewAppear: false,
    };
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({ viewAppear: true });
    }, 10000);
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  _onBarCodeRead = e => {
    console.log(
      `e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${
        e.nativeEvent.data.code
      }`,
    );
    Util.toastMsg(e.nativeEvent.data.code);
    this._stopScan();
    // Alert.alert(e.nativeEvent.data.type, e.nativeEvent.data.code, [
    //   { text: 'OK', onPress: () => this._startScan() },
    // ]);

    Navigation(this.props.componentId, 'POP');
    this.props.onBarcodeScan(e.nativeEvent.data.code);
  };

  _startScan = e => {
    this._barCode.startScan();
  };

  _stopScan = e => {
    this._barCode.stopScan();
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Barcode
          style={{ flex: 1 }}
          ref={component => {
            this._barCode = component;
          }}
          onBarCodeRead={this._onBarCodeRead}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
    overlayColor: '#000000',
  },
  badgeText: {
    color: '#FFFFFF',
  },
  badge: {
    width: 20,
    height: 20,
    backgroundColor: 'orange',
    left: 10,
  },
});

// ------------------------------------
// Define actions to inject
// ------------------------------------

// ------------------------------------
// Define properties to inject from store state
// ------------------------------------

export default ComBarcode;
