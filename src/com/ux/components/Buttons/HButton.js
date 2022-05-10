/* *
 * Import Common
 * */
import { StyleSheet, Keyboard } from 'react-native';
import React from 'react';
import { bluecolor } from 'libs';
/* *
 * Import node_modules
 * */
import { Button } from 'react-native-elements';
/**
 * 공통버튼 컴포넌트
 * (보통 확인창을 띄우고 진행하기 때문에 Util.msgBox 와 같이 쓰임)
 * @param {String} title - 버튼명
 * @param {String} name - 아이콘 이름
 * @param {String} iconType - 아이콘 종류(현재는 2가지만 쓴다. 'F' : FontAwesome, 'M': MaterialIcons)
 * @param {Function} onPress - 버튼 눌렀을때 이벤트
 * @param {Function} onLongPress - 버튼을 길게눌렀을 때이벤트(설정되어있지 않으면 onPress와 동일한 이벤트발생)
 * @param {Boolean} disabled - 버튼 클릭 방지
 * @param {styles} style - 컨테이너 스타일
 * @param {styles} bStyle - 버튼 스타일
 * @example
 * <HButton
 onPress={() => {
   Util.msgBox({
     title: 'Cancel',
     msg: 'Do you want to cancel?',
     buttonGroup: [
       {
         title: 'OK',
         onPress: item => {
           Util.toastMsg(`${item.title}취소 완료`);
         },
       },
       {
         title: 'Back',
         onPress: item => {
           Util.toastMsg(`${item.title}취소 취소`);
         },
       },
     ],
   });
 }}
 name={'undo'}
 title={'Cancel'}
 bStyle={{
   backgroundColor: bluecolor.basicRedColor,
 }}
/>
 */

class HButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { iconType, bStyle, style, name } = this.props;
    let type = 'font-awesome';
    if (iconType === 'M') {
      type = 'material';
    }

    return (
      <Button
        containerStyle={[styles.container, style]}
        buttonStyle={[styles.buttonStyle, bStyle]}
        icon={{ name, type, size: bluecolor.basicFontSize, color: bluecolor.basicWhiteColor }}
        fontSize={bluecolor.basicFontSize}
        // fontWeight={'bold'}
        {...this.props}
        onPress={() => {
          this.props.onPress();
        }}
        onLongPress={() => {
          if (this.props.onLongPress) {
            this.props.onLongPress();
          } else {
            this.props.onPress();
          }
        }}
        color={bluecolor.basicWhiteColor}
      />
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  buttonStyle: {
    borderRadius: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: bluecolor.basicBluebtTrans,
  },
});

/**
 * Wrapping with root component
 */
export default HButton;
