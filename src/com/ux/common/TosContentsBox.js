/* *
 * Import Common
 * */
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import { React, bluecolor, ReduxStore } from 'libs';

/* *
 * Import node_modules
 * */
import Touchable from 'common/Touchable';
import { HIcon, HText } from 'ux';

import { CheckBox } from 'react-native-elements';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */

// 개인정보 & 이용약관 동의
class TosContentsBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentId: this.props.componentId,
      title: this.props.title,
      // 이용약관 동의 여부
      termContent: this.props.termContent,
      // 개인정보 수집 및 이용 동의 여부
      termType: this.props.termType,
      saveTerm: this.props.saveTerm,
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
            <ScrollView style={styles.innerTextStyle}>
              <Text textStyle={{ fontWeight: '400' }}>
                {this.state.termContent}
              </Text>
            </ScrollView>
            <View style={{ padding: 5 }}>
              <CheckBox
                iconLeft
                center
                // iconType="material"
                // checkedIcon="clear"
                // uncheckedIcon="add"
                checkedColor={bluecolor.basicBlueColor}
                // uncheckedColor="#003366"
                containerStyle={{
                  // height: 20,
                  backgroundColor: bluecolor.basicTrans,
                  borderColor: 'transparent',
                }}
                textStyle={{
                  marginBottom: 5,
                  alignItems: 'flex-start',
                  fontSize: 18,
                }}
                title={`${this.state.title} 동의`}
                size={20}
                checked={this.state.saveTerm === 'Y'}
                onPress={() => {
                  this.props.saveTermYN(this.state.termType, this.state.saveTerm === 'Y' ? 'N' : 'Y');
                  this.setState({ saveTerm: this.state.saveTerm === 'Y' ? 'N' : 'Y' });
                }}
              />
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
    marginBottom: 1,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.92,
    height: screenHeight * 0.92,
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
    height: screenHeight * 0.85,
    borderRadius: 10,
  },
  innerTextStyle: {
    marginTop: 5,
    flex: 1,
  },
  barcodeText: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 15,
    alignItems: 'center',
    color: 'black',
  },
});

export default TosContentsBox;
