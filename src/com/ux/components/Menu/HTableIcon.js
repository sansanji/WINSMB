/* *
 * Import Common
 * */
import {StyleSheet, View, Dimensions} from 'react-native';
import {Util, React, ReduxStore} from 'libs';
import Touchable from 'common/Touchable';
import HText from 'components/Form/Text/HText';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';
/**
 * 바둑판 아이콘 레이아웃 컴포넌트
 * @param {Number} activeIcon - 활성화시킬 아이콘 인덱스
 * @param {styles} iconStyle - 아이콘 스타일 사용자 정의
 * @param {styles} tableStyle - 아이콘 컨테이너 스타일
 * @param {JSONArray} iconList - 표시될 아이콘 정보 ( screen 띄어질 화면, title 라벨명, finalIcon 아이콘이름 )
 * @example
 * <HTableIcon
 iconList={lmenu}
 activeIcon={activeTab}
 onClick={(screen, index) => this._moveTab(screen, index)}
 iconStyle={styles.iconStyle}
/>
 */
class HTableIcon extends React.Component {
  render() {
    const {iconStyle, activeIcon, tableStyle} = this.props;
    const {theme} = ReduxStore.getState().global;
    const screenWidth = Dimensions.get('window').width / 3;

    if (!Util.isEmpty(this.props.iconList)) {
      const menuItem = this.props.iconList.map((item, i) => (
        <View
          key={i}
          style={{width: screenWidth, alignItems: 'center', paddingTop: 10}}>
          <Touchable
            activeOpacity={0.5}
            style={[styles.tabButton, iconStyle]}
            onPress={() => this.props.onClick(item.screen, i, item.title)}>
            <FontAwesome
              name={item.finalIcon}
              size={20}
              style={
                // iconStyle
                activeIcon === i
                  ? theme.tabIcomColorActive
                  : theme.tabIcomColorDeActive
              }
            />
            <HText
              numberOfLines={3} // ios에서 메뉴명이 길 경우 잘리는 경우가 발생하여 옵션 추가!
              multiline // ios에서 메뉴명이 길 경우 잘리는 경우가 발생하여 옵션 추가!
              adjustsFontSizeToFit // ios에서 메뉴명이 길 경우 잘리는 경우가 발생하여 옵션 추가!
              textStyle={[
                activeIcon === i
                  ? theme.tabIcomColorActive
                  : theme.tabIcomColorDeActive,
                styles.mText,
              ]}>
              {item.title}
            </HText>
          </Touchable>
        </View>
      ));

      return <View style={[tableStyle, styles.menucontainer]}>{menuItem}</View>;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  menucontainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
    // paddingLeft: 15,
    // paddingRight: 15,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  tabButton: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingTop: 30,
    paddingBottom: 20,
  },
  mText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    // color: '#424242',
  },
});

export default HTableIcon;
