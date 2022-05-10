/* *
 * Import Common
 * */
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import {
  React,
  bluecolor,
} from 'libs';
import { HText, HRow, HIcon } from 'ux';
/* *
 * Import node_modules
 * */
import { Icon } from 'react-native-elements';

/**
 * 챗봇 연락처 조회 컴퍼넌트
 */

class PressToVote extends React.Component {
  constructor(props) {
    super(props);
  }

  onPress() {
    this.props.onVoting(this.props.paramObj);
  }

  render() {
    const { paramObj } = this.props;
    return (
      <View style={styles.mainstyle}>
        <View style={styles.navbarStyle}>
          <View style={{ marginRight: 1 }}>
            { paramObj.PHOTO_PATH ?
              <Image
                source={{ uri: paramObj.PHOTO_PATH }}
                style={styles.ImageStyle}
                rowflex={1}
              /> : <Icon name="face" type="MaterialIcons" color={bluecolor.basicBlueColor} size={40} />
            }
          </View>
          <Text style={styles.nameText}>{ paramObj.VOTE_TITLE}</Text>
        </View>
        <View style={styles.titleView}>
          <HText textStyle={styles.titleText} value={'미투표 인원 안내'} />
          <View style={{ flexDirection: 'row', alignSelf: 'auto' }}>
            <HIcon name="play" color={bluecolor.basicBlueColor} size={10} style={{ marginTop: 10 }} />
            <HText
              textStyle={{ marginTop: 16 }}
              value={paramObj.disVotPart}
            />
          </View>
        </View>
        <HRow style={{ justifyContent: 'space-around' }}>
          <TouchableOpacity onPress={() => this.onPress()} activeOpacity={0.8} style={styles.ResultAlertButton}>
            <Text style={styles.ResultAlerttext}>{'빨리 투표 하러 가기' }</Text>
          </TouchableOpacity>
        </HRow>
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
  ImageStyle: {
    marginStart: 10,
    width: 40,
    height: 40,
    borderRadius: 30,
  },
  nameText: {
    color: bluecolor.basicRedColor,
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
    color: bluecolor.basicBlueFontColorTrans,
    fontWeight: 'bold',
    fontSize: 16,
    padding: 5,
  },
  ResultAlertText: {
    fontWeight: 'bold',
    color: bluecolor.basicRedColor,
  },
  ResultAlertButton: {
    margin: 10,
    flex: 0.6,
    width: 100,
    height: 35,
    borderRadius: 20,
    borderColor: bluecolor.basicBlueColor,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    // text 상하 정렬
    alignItems: 'center',
    // text 좌우 정렬
    justifyContent: 'center',
    alignContent: 'center',
  },
});

/**
 * Wrapping with root component
 */
export default PressToVote;
