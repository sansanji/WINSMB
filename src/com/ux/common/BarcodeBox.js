/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions } from 'react-native';
import { React, bluecolor, ReduxStore } from 'libs';
/* *
 * Import node_modules
 * */
import Touchable from 'common/Touchable';
import { HIcon, HText } from 'ux';

import Barcode from 'react-native-barcode-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */


class BarcodeBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentId: this.props.componentId,
      title: 'Barcode Create',
      value: this.props.value,
      format: this.props.format,
    };
  }

  render() {
    const { navigator } = ReduxStore.getState().global;


    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <View style={styles.cancelBtnStyle}>
            <HText textStyle={{ fontWeight: 'bold' }}>{this.state.title}</HText>
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
              <Barcode
                value={this.props.value}
                format={this.props.format}
                singleBarWidth={this.props.options.singleBarWidth}
                maxWidth={screenWidth * 0.84}
                height={this.props.options.height}
                lineColor={this.props.options.lineColor}
                backgroundColor={this.props.options.backgroundColor}
                // onError={this.props.options.onError}
              />
              <HText textStyle={styles.barcodeText} value={this.props.value} />
            </View>
          </View>
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
  cancelBtnStyle: {
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.92,
    height: screenHeight * 0.35,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
  },
  innerContainerStyle: {
    backgroundColor: bluecolor.basicWhiteColor,
    width: screenWidth * 0.88,
    height: screenHeight * 0.3,
    borderRadius: 10,
  },
  barcodeStyle: {
    marginTop: 5,
    marginBottom: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeText: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 15,
    alignItems: 'center',
    color: 'black',
  },
});

export default BarcodeBox;
