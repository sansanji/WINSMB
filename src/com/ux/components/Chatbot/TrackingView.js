/* *
 * Import Common
 * */
import { View, StyleSheet, Text } from 'react-native';
import {
  React,
  bluecolor,
  Util,
} from 'libs';
import { HText, Touchable, HIcon } from 'ux';
/* *
 * Import node_modules
 * */

/**
 * 챗봇 트래킹 뷰 조회 컴퍼넌트
 */

class TrackingView extends React.Component {
  constructor(props) {
    super(props);
  }
  // 전화 걸기
  onOpenUrl(targeUrl) {
    Util.openURL(targeUrl);
  }

  render() {
    const { paramObj } = this.props;
    return (
      <View style={styles.serviceStyle}>
        <Text style={{ fontSize: 13, color: 'black' }}>아래 버튼을 눌러 확인해보세요</Text>
        <Touchable
          onPress={() => {
            this.onOpenUrl(paramObj.data.MSG);
          }}
        >
          <View style={styles.viewContainer}>
            <HIcon
              name={'globe'}
            />
            <HText textStyle={{ fontSize: 14 }} value={`${paramObj.data.REQ_NO}`} />
          </View>
        </Touchable>
      </View>);
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  serviceStyle: {
    width: 200,
    borderRadius: 10,
    padding: 10,
    backgroundColor: bluecolor.basicWhiteColor,
    fontSize: bluecolor.basicFontSize,
  },
  viewContainer: {
    width: 150,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: bluecolor.basicSkyBlueColorTrans,
    borderRadius: 10,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
  },
});

/**
 * Wrapping with root component
 */
export default TrackingView;
