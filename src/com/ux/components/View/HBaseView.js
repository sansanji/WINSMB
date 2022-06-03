/* *
 * Import Common
 * */
import {View, StyleSheet, ScrollView} from 'react-native';
import {React, bluecolor, KeepAwake} from 'libs';
import Spinner from 'common/Spinner';
import Touchable from 'common/Touchable';
import BackImage from 'common/BackImage.js';
import HIcon from 'components/Form/HIcon';
import ActionButton from 'components/Buttons/ActionButton/ActionButton';
/* *
 * Import node_modules
 * */
/**
 * 기본 뷰 컴포넌트
 * @param {Boolean} backimage - 백그라운드 이미지 표시 여부(true, false)
 * @param {Boolean} spinner - 스피너 표시 여부(true, false) - 20190620 이후로 state 값 처리가 아닌 showOveray 방식으로 변경
 * @param {Boolean} keepAwake - 화면 꺼짐 방지 여부(true, false)
 * @param {Boolean} scrollable - 화면 스크롤 여부(true, false)
 * @param {Function} button - 조회버튼 표시 여부 및 실행(button 조회 메소드)
 * @param {styles} style - 스타일 파라미터
 * @param {JSONArray} buttonGroup - 조회버튼 그룹 표시 여부 및 실행 (title : 아이콘 제목, iconName : 아이콘명, param : 받을 파라미터, onPress : title, param 리턴되는 실행 메소드)
 * @example
 * <HBaseView spinner={this.state.spinner} button={() => this.fetch(this.state.keyword)}>
 {...}
</HBaseView>
 */

class HBaseView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let Base = ScrollView;
    const {scrollable, style, backimage, spinner, children, keepAwake} =
      this.props;
    if (scrollable === false) {
      Base = View;
    }
    return (
      <View style={[styles.baseStyle, style]}>
        {keepAwake ? <KeepAwake /> : null}
        {/** Spinner -> Loader로 변경했지만,
        일부 화면에서 state로 처리되므로 당분간 이중(Spinner, Loader)으로 관리! */}
        {spinner ? <Spinner visible={spinner} /> : null}
        <Base style={[styles.baseStyle, style]}>
          {backimage ? <BackImage /> : null}
          {children}
        </Base>

        {this.props.button ? (
          <Touchable
            style={styles.searchButton}
            underlayColor={bluecolor.basicBlueColorTrans}
            onPress={() => this.props.button()}>
            <HIcon name={'search'} color={bluecolor.basicWhiteColor} />
          </Touchable>
        ) : null}
        {this.props.buttonGroup ? (
          <ActionButton
            position={'right'}
            elevation={1} // 화면에 가장 위에 표시!
            zIndex={1} // 화면에 가장 위에 표시!
            style={{overflow: 'visible'}}
            // bgColor={bluecolor.basicBlueLightTrans}
          >
            {this.props.buttonGroup.map(buttonGroupItem => (
              <ActionButton.Item
                key={buttonGroupItem.title}
                buttonColor={bluecolor.basicBluelightColor}
                title={buttonGroupItem.title}
                onPress={() =>
                  buttonGroupItem.onPress(
                    buttonGroupItem.title,
                    buttonGroupItem.param,
                  )
                }>
                <HIcon
                  name={buttonGroupItem.iconName}
                  color={bluecolor.basicWhiteColor}
                />
              </ActionButton.Item>
            ))}
          </ActionButton>
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  baseStyle: {
    flex: 1,
    // backgroundColor: bluecolor.basicSoftGrayColor,
    margin: 2,
    // borderRadius: 10,
  },
  searchButton: {
    backgroundColor: bluecolor.basicBluebtTrans,
    borderColor: bluecolor.basicBluebtTrans,
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 25,
    right: 20,
    shadowColor: bluecolor.basicBlueColor,
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
});

export default HBaseView;
