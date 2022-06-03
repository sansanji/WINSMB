/* *
 * Import Common
 * */
import {Text, StyleSheet, TouchableOpacity, Alert, View} from 'react-native';
import {
  React,
  Redux,
  bluecolor,
  Navigation,
  Util,
  NavigationScreen,
} from 'libs';

/* *
 * Import node_modules
 * */
import {RNCamera} from 'react-native-camera';
/**
 * 푸쉬메세지 버튼 컴포넌트
 */
class ComBarcode extends NavigationScreen {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      // viewAppear: false,
      camera: {
        type: RNCamera.Constants.Type.back,
        // flashMode: RNCamera.Constants.FlashMode.auto,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
    };
  }

  componentDidMount() {
    // this.timer = setTimeout(() => {
    //   this.setState({viewAppear: true});
    // }, 10000);
  }
  componentWillUnmount() {
    // clearTimeout(this.timer);
  }

  _onBarCodeRead = e => {
    let result = e.nativeEvent ? e.nativeEvent.data.code : e.data;
    Util.toastMsg(result);

    // this._stopScan();
    // Alert.alert(e.nativeEvent.data.type, e.nativeEvent.data.code, [
    //   { text: 'OK', onPress: () => this._startScan() },
    // ]);
    if (result != null) {
      if (this.state.result === null) {
        this.state.result = result;
        Navigation(this.props.componentId, 'POP');
        this.props.onBarcodeScan(result);
      }
    }
    return;
  };

  _startScan = e => {
    this._barCode.startScan();
  };

  _stopScan = e => {
    this._barCode.stopScan();
  };

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <RNCamera
          style={styles.container}
          ref={component => {
            this._barCode = component;
          }}
          defaultTouchToFocus
          flashMode={this.state.camera.flashMode}
          mirrorImage={false}
          onBarCodeRead={this._onBarCodeRead}
          onFocusChanged={() => {}}
          onZoomChanged={() => {}}
          type={this.state.camera.type}
          captureAudio={false}
        />
        <View style={styles.barcodeLine} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    height: 300,
  },
  barcodeLine: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderColor: 'green',
    borderWidth: 2,
    margin: 15,
    left: 0,
    right: 0,
    height: 100,
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
