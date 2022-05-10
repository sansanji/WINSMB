/* *
 * Import Common
 * */
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { bluecolor } from 'libs';
/* *
 * Import node_modules
 * */

/**
 * 글자 컴포넌트(단순히 글자만 표시하고싶을때 사용)
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {styles} textStyle - 글자 스타일 적용
 * @example
 * <HText>{this.state.data.PKG_UNIT}</HText>
 */

class HText extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { textStyle, value, children } = this.props;
    return (
      <View style={styles.container}>
        <Text {...this.props} style={[styles.text, textStyle]} allowFontScaling={false}>
          {value || children}
        </Text>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    marginLeft: 5,
    marginRight: 5,
  },
  text: {
    marginBottom: 0,
    color: bluecolor.basicBlueFontColor,
    // fontWeight: 'bold',
    fontSize: bluecolor.basicFontSize,
  },
});

/**
 * Wrapping with root component
 */
export default HText;
