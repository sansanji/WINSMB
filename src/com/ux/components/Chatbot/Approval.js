/* *
* Import Common
* */
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import {
  React,
  bluecolor,
} from 'libs';
import {
  HText,
} from 'ux';
/* *
* Import node_modules
* */
import store from 'libs/store';
/**
 *  결재 문서
 */
class Approval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.paramObj,
      html: this.props.paramObj.sbContents,
    };
  }

  // webView띄워주는 화면
  _approvalDetail(item) {
    if (item != null) {
      const { navigator } = store.getState().global;
      navigator.showOverlay({
        component: {
          name: 'common.ApprovalBox',
          passProps: {
            source: item,
          },
          options: {
            layout: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
            overlay: {
              interceptTouchOutside: true,
            },
          },
        },
      });
    }
  }

  // 실제로 화면을 그려준다.
  render() {
    return (
      <View style={styles.mainstyle}>
        <View style={{ backgroundColor: bluecolor.basicBluelightColor, padding: 10, borderTopRightRadius: 5, borderTopLeftRadius: 5 }}>
          <HText
            value={'결재 알림 도착'}
            textStyle={{ fontWeight: 'bold', fontSize: 15, color: 'black', textAlign: 'center' }}
          />
        </View>
        <View style={{ padding: 5, backgroundColor: bluecolor.basicTrans }}>
          <HText
            value={`${this.state.data.USER_NAME_LOC}의 ${this.state.data.APPROVALTYPE}에 대해 결재부탁드립니다.`}
          />
        </View>
        <TouchableOpacity
          style={styles.ResultButton}
          onPress={() => this._approvalDetail(this.state.html)}
        >
          <HText value={this.state.data.approvalTime} textStyle={{ color: bluecolor.basicDeepGrayColor }} />
          <Text style={styles.ResultAlerttext}>{ '결재 상세내역 보기' }</Text>
        </TouchableOpacity>
      </View>);
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
  },
  ResultButton: {
    padding: 1,
    margin: 5,
    width: 230,
    height: 45,
    borderColor: bluecolor.basicDeepGrayColor,
    borderWidth: 1,
    alignSelf: 'center',
    // text 상하 정렬
    alignItems: 'center',
    // text 좌우 정렬
    justifyContent: 'center',
    alignContent: 'center',
  },
  ResultAlertText: {
    padding: 1,
    color: bluecolor.basicBlueImpactColor,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

/**
 * Wrapping with root component
 */
export default Approval;
