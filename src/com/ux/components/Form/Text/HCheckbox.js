/* *
 * Import Common
 * */
import {View, StyleSheet, Text} from 'react-native';
import {React, Redux, bluecolor, modelUtil, Util} from 'libs';
/* *
 * Import node_modules
 * */
import {TextField} from 'rn-material-ui-textfield';
import {CheckBox} from 'react-native-elements';

/**
 * 폼체크박스필드 컴포넌트
 * @param {String} label - 라벨값
 * @param {String} value - 표시할 값. 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {String} bind - 모델을 사용하도록함(모델명.컬럼명), 수정 가능
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(checkeValue 리턴 'Y'/'N')
 * @param {String} editable - value값이 없을때는 수정가능 여부를 판단
 * @param {Boolean} bold - 강조하고 싶을때 true
 * @param {Boolean} require - 필수값일때 true
 * @param {All} all - 나머지 옵션은 Textinput과 동일
 * @param {Boolean} toggle - 체크박스를 토글스위치 아이콘으로 변환 해줌
 * @example
 * <HCheckbox label={'Forward'} bind={'TEMPFORM.FORWARDING_YN'} editable />
 */

class HCheckbox extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {editable, value, bind, toggle, require, bold} = this.props;
    const editabled = Util.checkEdit(editable, value);
    const height = 55;

    // 아이콘 정의
    let iconSet = {
      checkedIcon: 'check-square-o',
      uncheckedIcon: 'square-o',
    };

    if (toggle) {
      iconSet = {
        checkedIcon: 'toggle-on',
        uncheckedIcon: 'toggle-off',
      };
    }

    let requireCheck = false;
    if (require) {
      if (value || modelUtil.getValue(bind)) {
        requireCheck = false;
      } else {
        requireCheck = true;
      }
    }

    return (
      <View style={styles.container}>
        <TextField
          {...this.props}
          labelFontSize={bluecolor.basicFontSizeS}
          fontSize={bluecolor.basicFontSize}
          containerStyle={styles.containerStyle}
          activeLineWidth={1}
          labelHeight={20}
          inputContainerPadding={0}
          inputContainerStyle={{height}}
          textColor={bluecolor.basicBlueFontColor}
          style={bold ? {fontWeight: 'bold'} : null}
          // onChangeText={text => {
          // }}
          onEndEditing={event => {
            const text = event.nativeEvent.text;
            modelUtil.setValue(bind, text);
          }}
          lineWidth={0}
          value={' '}
          editable={false}
          labelTextStyle={bold ? {fontWeight: 'bold'} : null}
          baseColor={
            editabled ? bluecolor.basicBluebt : bluecolor.basicDeepGrayColor
          }
          allowFontScaling={false}
        />
        <CheckBox
          iconRight
          center
          checkedColor="#428BCA"
          checkedIcon={iconSet.checkedIcon}
          uncheckedIcon={iconSet.uncheckedIcon}
          size={20}
          containerStyle={styles.checkboxStyle}
          checked={(value || modelUtil.getValue(bind)) === 'Y'}
          onPress={() => {
            let checkeValue = '';
            if (editabled) {
              const check = value || modelUtil.getValue(bind);
              if (check === 'Y') {
                modelUtil.setValue(bind, 'N');
                checkeValue = 'N';
              } else {
                modelUtil.setValue(bind, 'Y');
                checkeValue = 'Y';
              }
            }
            if (this.props.onChanged) {
              this.props.onChanged(checkeValue);
            }
          }}
        />
        {requireCheck ? (
          <Text
            style={{
              color: 'red',
              fontSize: 10,
              position: 'absolute',
              top: 7,
              left: 0,
            }}>
            *
          </Text>
        ) : null}
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerStyle: {
    marginTop: 0,
    marginLeft: 5,
    marginRight: 5,
  },
  checkboxStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: bluecolor.basicTrans,
    borderWidth: 0,
    padding: 0,
    marginTop: 25,
    // marginLeft: -15,
    marginLeft: 5,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({model: state.model});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(HCheckbox);
