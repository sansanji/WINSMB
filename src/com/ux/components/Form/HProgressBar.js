/* *
 * Import Common
 * */
import { StyleSheet, View, Text } from 'react-native';
import { Util, React, bluecolor } from 'libs';
import Touchable from 'common/Touchable';

/* *
 * Import node_modules
 * */

/**
 * 프로그레스바  레이아웃 컴포넌트
 * @param {styles} tableStyle - 프로그레스바 컨테이너 스타일
 * @param {JSONArray} data - 표시될 프로그레스 정보를 넘긴다(title, value, barColor)
 * @param {Function} onPressed - 바가 눌러졌을때 이벤트(item, index값 리턴)
 * @example
 * <HProgressBar
 data={[
   {
     title: 'Sales 30%',
     value: 30,
     barColor: bluecolor.basicDeepGrayColor,
   },
   {
     title: 'Sales 20%',
     value: 20,
     barColor: bluecolor.basicBlueColor,
   },
   {
     title: 'Sales 50%',
     value: 50,
     barColor: bluecolor.basicRedColor,
   },
 ]}
/>
 */
class HProgressBar extends React.Component {
  render() {
    const { titleStyle, height } = this.props;

    if (!Util.isEmpty(this.props.data)) {
      const progressItem = this.props.data.map((item, i) => (
        <Touchable
          key={i}
          style={{ flex: item.value }}
          onPress={() => {
            if (this.props.onPressed) {
              this.props.onPressed(item, i);
            }
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={[
                {
                  fontSize: 10,
                  color: bluecolor.basicDeepGrayColor,
                },
                titleStyle,
              ]}
            >
              {item.title}
            </Text>
          </View>
          <View style={{ flex: 1, height: height || 20, backgroundColor: item.barColor }} />
        </Touchable>
      ));

      return <View style={styles.mainView}>{progressItem}</View>;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    borderRadius: 10,
    // borderWidth: 1,
    // justifyContent: 'flex-start',
  },
});

export default HProgressBar;
