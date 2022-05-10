/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import React from 'react';
import { bluecolor } from 'libs';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * 공통아이콘 컴포넌트(아이콘 사이트 : https://oblador.github.io/react-native-vector-icons/)
 * @param {String} name - 아이콘 이름.
 * @param {String} iconType - 아이콘 종류(현재는 2가지만 쓴다. 'F' : FontAwesome, 'M': MaterialIcons)
 * @param {String} color - 아이콘 색상
 * @param {Number} size - 아이콘 크기 기본은 basicIconSize 16임
 * @param {styles} style - 컨테이너 스타일
 * @param {styles} iconStyle - 아이콘스타일
 * @example
 * <HIcon name="flight-takeoff" iconType="M" />
 */

class HIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { iconType, name, style, color, size } = this.props;

    return (
      <View style={[styles.container, style]}>
        {iconType === 'M' ? (
          <MaterialIcons
            {...this.props}
            name={name}
            color={color || bluecolor.basicBlueColor}
            size={size || bluecolor.basicIconSize}
          />
        ) : (
          <FontAwesome
            {...this.props}
            name={name}
            color={color || bluecolor.basicBlueColor}
            size={size || bluecolor.basicIconSize}
          />
        )}
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
});

/**
 * Wrapping with root component
 */
export default HIcon;
