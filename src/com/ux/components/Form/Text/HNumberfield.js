/* *
 * Import Common
 * */
import {View, StyleSheet, Text} from 'react-native';
import {React, Redux, bluecolor, modelUtil, Util} from 'libs';
/* *
 * Import node_modules
 * */
import {TextField} from 'rn-material-ui-textfield';

/**
 * 폼숫자필드 컴포넌트(3자릿수 표현과 둘째자리 반올림 기능 포함)
 * 키보드가 숫자만 입력 가능하도록 보여짐
 * @param {String} label - 라벨값
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {String} bind - 모델을 사용하도록함(모델명.컬럼명), 수정 가능
 * @param {Boolean} editable - value값이 없을때는 수정가능 여부를 판단(기본값 false)
 * @param {Boolean} require - 필수값일때 true
 * @param {Boolean} bold - 강조하고 싶을때 true
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(text 리턴)
 * @param {Color} textColor - 글자 색상 변경
 * @param {All} all - 나머지 옵션은 Textinput과 동일
 * @example
 * <HNumberfield label={'G/W'} bind={'TEMPFORM.GW'} editable />
 */

class HNumberfield extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {editable, value, bind, require, bold, textColor} = this.props;
    const editabled = Util.checkEdit(editable, value);
    const height = 55;

    let requireCheck = false;
    if (require) {
      if (String(!Util.isEmpty(value) ? value : modelUtil.getValue(bind))) {
        requireCheck = false;
      } else {
        requireCheck = true;
      }
    }

    return (
      <View>
        <TextField
          {...this.props}
          labelFontSize={bluecolor.basicFontSizeS}
          fontSize={bluecolor.basicFontSize}
          containerStyle={styles.containerStyle}
          activeLineWidth={1}
          labelHeight={20}
          inputContainerPadding={0}
          keyboardType={'numeric'}
          inputContainerStyle={{height}}
          textColor={textColor || bluecolor.basicBlueFontColor}
          style={bold ? {fontWeight: 'bold'} : null}
          // 넘버포맷때문에 . 을 넣으면 없어지는 오류발생(아 예외처리!!??)
          // onChangeText={text => {
          //   const ntext = Util.formatNumber(text);
          //   modelUtil.setValue(bind, ntext, true);
          //   // 값이 변할때 이벤트 발생
          //   if (this.props.onChanged) {
          //     this.props.onChanged(ntext);
          //   }
          // }}
          onEndEditing={event => {
            const text = Util.formatNumber(event.nativeEvent.text);

            modelUtil.setValue(bind, text, true);
            // 값이 변할때 이벤트 발생
            if (this.props.onChanged) {
              this.props.onChanged(text);
            }
          }}
          lineWidth={0}
          value={Util.formatNumber(
            String(!Util.isEmpty(value) ? value : modelUtil.getValue(bind)),
          )}
          editable={editabled}
          labelTextStyle={bold ? {fontWeight: 'bold'} : null}
          baseColor={
            editabled ? bluecolor.basicBluebt : bluecolor.basicDeepGrayColor
          }
          allowFontScaling={false}
        />
        {requireCheck ? (
          <Text
            style={{
              color: 'red',
              fontSize: 10,
              position: 'absolute',
              top: 27,
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
  containerStyle: {
    marginTop: 0,
    marginLeft: 5,
    marginRight: 5,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({model: state.model});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(HNumberfield);
