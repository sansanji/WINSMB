/* *
 * Import Common
 * */
import { Platform, View, StyleSheet, Text } from 'react-native';
import { React, Redux, bluecolor, modelUtil, Util } from 'libs';
/* *
 * Import node_modules
 * */
import { TextField } from 'rn-material-ui-textfield';

/**
 * 폼글자필드 컴포넌트
 * @param {String} label - 라벨값
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {String} bind - 모델을 사용하도록함(모델명.컬럼명), 수정 가능
 * @param {Boolean} editable - value값이 없을때는 수정가능 여부를 판단(기본값 false)
 * @param {Boolean} require - 필수값일때 true
 * @param {Boolean} bold - 강조하고 싶을때 true
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(text 리턴)
 * @param {String} all - 나머지 옵션은 Textinput과 동일
 * @param {String} keyboardType - 기본 키보드 타입을 변경할수 있다.
 * <br/>default/number-pad/decimal-pad/numeric/email-address/phone-pad
 * <br/>ex) keyboardType={'numeric'}
 * @param {Boolean} secureTextEntry - 패스워드 형태로 입력한 텍스트가 보이지 않음(기본값 false)
 * @example
 * <HTextfield label={'Fax.'} bind={'TEMPFORM.CONSIGNEE_FAX'} editable />
 */

class HTextfield extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { editable, value, bind, require, bold } = this.props;
    const editabled = Util.checkEdit(editable, value);
    let requireCheck = false;
    if (require) {
      if (value || modelUtil.getValue(bind)) {
        requireCheck = false;
      } else {
        requireCheck = true;
      }
    }
    return (
      <View>
        <TextField
          labelFontSize={bluecolor.basicFontSizeS}
          fontSize={bluecolor.basicFontSize}
          containerStyle={styles.containerStyle}
          activeLineWidth={1}
          labelHeight={20}
          inputContainerPadding={0}
          inputContainerStyle={{ flex: 1 }}
          textColor={bluecolor.basicBlueFontColor}
          style={
            bold ? { fontWeight: 'bold', alignItems: 'flex-start' } : { alignItems: 'flex-start' }
          }
          onChangeText={text => {
            modelUtil.setValue(bind, text);
            // 값이 변할때 이벤트 발생
            if (this.props.onChanged) {
              this.props.onChanged(text);
            }
          }}
          onEndEditing={event => {
            const text = event.nativeEvent.text;
            modelUtil.setValue(bind, text);
            // 값이 변할때 이벤트 발생
            if (this.props.onChanged) {
              this.props.onChanged(text);
            }
          }}
          multiline={Platform.OS !== 'ios'}
          lineWidth={0}
          value={String(value || modelUtil.getValue(bind))}
          editable={editabled}
          labelTextStyle={bold ? { fontWeight: 'bold' } : null}
          baseColor={editabled ? bluecolor.basicBluebt : bluecolor.basicDeepGrayColor}
          ellipsizeMode="tail"
          allowFontScaling={false}
          onSubmitEditing={() => {
            if (this.props.onSubmitEditing) {
              this.props.onSubmitEditing();
            }
          }}
          {...this.props}
        />
        {requireCheck ? (
          <Text
            style={{
              color: 'red',
              fontSize: 10,
              position: 'absolute',
              top: 27,
              left: 0,
            }}
          >
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
const mapStateToProps = state => ({ model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(HTextfield);
