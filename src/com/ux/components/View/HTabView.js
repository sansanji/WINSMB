/* *
 * Import Common
 * */
import {View, StyleSheet} from 'react-native';
import React from 'react';
import {bluecolor} from 'libs';
/* *
 * Import node_modules
 * */
import ScrollableTabView, {ScrollableTabBar} from 'components/View/TabView';

/**
 * 탭뷰 컴포넌트(탭형태의 뷰)
 * @param {styles} style - 스타일 파라미터
 * @param {Function} onChangeTab - 탭선택시 이벤트(선택한 탭을 리턴)
 * @example
 * <HTabView>
 <TEMPFORM navigator={this.props.navigator} tabLabel="TEMPFORM" />
 <TEMPLIST navigator={this.props.navigator} tabLabel="TEMPLIST" />
</HTabView>
 */

class HTabView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {style} = this.props;

    return (
      <View style={styles.container}>
        <ScrollableTabView
          style={[styles.tabContainer, style]}
          tabBarBackgroundColor={bluecolor.basicBlueColor}
          tabBarInactiveTextColor={bluecolor.basicWhiteColor}
          tabBarActiveTextColor={bluecolor.basicYellowColor}
          tabBarUnderlineStyle={{backgroundColor: null}}
          renderTabBar={() => <ScrollableTabBar />}
          onChangeTab={selectTab => {
            // 탭을 선택할때 이벤트 발생
            if (this.props.onChangeTab) {
              this.props.onChangeTab(selectTab);
            }
          }}>
          {this.props.children}
        </ScrollableTabView>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    margin: -4,
    marginTop: -3,
    flex: 1,
  },
  tabContainer: {
    margin: 0,
  },
});

/**
 * Wrapping with root component
 */
export default HTabView;
