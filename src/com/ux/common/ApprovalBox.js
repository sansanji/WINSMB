/* *
* Import Common
* */
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  React,
  bluecolor,
  ReduxStore,
} from 'libs';
import {
  HIcon,
  HText,
} from 'ux';
/* *
* Import node_modules
* */
import Touchable from 'common/Touchable';
import PortalWebView from 'layout/PortalWebView.js';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
/**
 *  결재 문서
 */
class Approval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: this.props.source,
    };
  }

  render() {
    const { navigator } = ReduxStore.getState().global;
    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <View style={styles.cancelBtnStyle}>
            <HText textStyle={{ fontWeight: 'bold' }}>{' 결재 알림'}</HText>
            <Touchable
              onPress={() => {
                navigator.dismissOverlay(this.props.componentId);
              }}
            >
              <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
            </Touchable>
          </View>
          <View style={styles.innerContainerStyle}>
            <View style={styles.barcodeStyle}>
              <PortalWebView
                componentId={'com.layout.PortalWebView'}
                navigator={this.props.navigator}
                // scalesPageToFit
                source={this.state.html}
                onLoad={() => {
                }}
                onLoadEnd={() => {
                  navigator.dismissOverlay(this.props.componentId);
                }}
              />
            </View>
          </View>
          <HText textStyle={styles.barcodeText} value={this.props.value} />
        </View>
      </View>
    );
  }
}
/**
  * Define component styles
  */
const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnStyle: {
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.92,
    height: screenHeight * 0.75,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 5,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
  },
  innerContainerStyle: {
    backgroundColor: bluecolor.basicWhiteColor,
    width: screenWidth * 0.88,
    height: screenHeight * 0.7,
    borderRadius: 10,
  },
  barcodeStyle: {
    marginTop: 5,
    marginBottom: 5,
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  barcodeText: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 15,
    alignItems: 'center',
    color: 'black',
  },
});

/**
 * Wrapping with root component
 */
export default Approval;
