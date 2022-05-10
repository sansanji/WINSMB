/* *
 * Import Common
 * */
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import {
  React,
  bluecolor,
  Util,
  Navigation,
} from 'libs';
import { HText, HRow, HTextfield, Touchable, HIcon, HFormView } from 'ux';
/* *
 * Import node_modules
 * */
import { Icon } from 'react-native-elements';

/**
 * 챗봇 연락처 조회 컴퍼넌트
 */

const winerImage = require('assets/images/WinnerOutline.png');


class RandomDrawer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { paramObj } = this.props;
    return (
      <View style={styles.mainstyle}>
        <View style={styles.navbarStyle}>
          <Text style={styles.styleTitle}>{ '당첨자 발표!'}</Text>
        </View>
        <View style={styles.titleView}>
          <Text style={styles.nameText}>{paramObj.MSG_OBJECTS}</Text>
          <Image
            source={winerImage}
            resizeMode={'contain'}
            style={{ width: 100, height: 100 }}
          />
          <HText textStyle={styles.titleText} value={paramObj.MSG_CONTENTS} />
        </View>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  mainstyle: {
    backgroundColor: bluecolor.basicWhiteColor,
    flexDirection: 'column',
    width: 300,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    marginStart: 3,
  },
  navbarStyle: {
    marginTop: 10,
    flexDirection: 'row',
  },
  nameText: {
    color: bluecolor.basicDeepGrayColor,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: '500',
    marginStart: 10,
    alignSelf: 'center',
  },
  titleView: {
    flexDirection: 'column',
    marginTop: 7,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: bluecolor.basicGrayColorTrans,
  },
  titleText: {
    color: bluecolor.basicOrangeColor,
    fontWeight: 'bold',
    fontSize: 16,
    paddingTop: 15,
  },
  styleTitle: {
    color: bluecolor.basicBlueColor,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

/**
 * Wrapping with root component
 */
export default RandomDrawer;
