/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import React from 'react';
import { bluecolor } from 'libs';
import HText from 'components/Form/Text/HText';
/* *
 * Import node_modules
 * */
import { Icon } from 'react-native-elements';

/**
 * 글자 타이틀 컴포넌트( 폼에서 구역을 나누고 싶을때 쓰인다.)
 * @param {String} value - 표시할 값
 * @param {styles} style - 타이틀 글자의 스타일 변경시(색상 폰트크기 등등)
 * @example
 * <HTexttitle>Shipper</HTexttitle>
 */

class HTexttitle extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { style } = this.props;

    return (
      <View style={[styles.viewStyle, this.props.viewStyle]}>
        <Icon
          containerStyle={{ justifyContent: 'center' }}
          name="cube"
          type="font-awesome"
          color={bluecolor.basicBluebt}
          size={10}
        />
        <HText textStyle={[style, styles.text]} {...this.props} />
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  viewStyle: {
    marginLeft: 3,
    marginRight: 3,
    padding: 5,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    // backgroundColor: bluecolor.basicBlueLightTrans,
    borderBottomWidth: 1,
    borderColor: bluecolor.basicBlueLightTrans,
    // borderRadius: 5,
  },
  text: {
    marginBottom: 0,
    color: bluecolor.basicBluebt,
    fontSize: bluecolor.basicFontSize,
    fontWeight: 'bold',
  },
});

/**
 * Wrapping with root component
 */
export default HTexttitle;
