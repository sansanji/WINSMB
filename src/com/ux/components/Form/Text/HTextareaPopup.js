/* *
 * Import Common
 * */
import {View, StyleSheet, TextInput, Text} from 'react-native';
import {React, Redux, bluecolor, modelUtil, Util} from 'libs';
import Touchable from 'common/Touchable';
/* *
 * Import node_modules
 * */
import {TextField} from 'rn-material-ui-textfield';

/**
 * 폼글자박스필드 컴포넌트(입력시 팝업이 뜨게됨 / 5줄 이상은 HInputView 사용 권장)
 * @param {String} label - 라벨값
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {String} bind - 모델을 사용하도록함(모델명.컬럼명), 수정 가능
 * @param {Boolean} editable - value값이 없을때는 수정가능 여부를 판단(기본값 false)
 * @param {Boolean} require - 필수값일때 true
 * @param {Boolean} bold - 강조하고 싶을때 true
 * @param {Number} numberOfLines - 글자 행수
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(text 리턴)
 * @param {All} all - 나머지 옵션은 Textinput과 동일
 * @param {Number} maxLength - 최대글자수
 * @example
 * <HTextareaPopup
 label={'H/D Information'}
 bind={'TEMPFORM.HANDLE_INFO'}
 editable
 multiline
 numberOfLines={5}
/>
 */

class HTextareaPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textValue: '',
      height: 39,
    };
  }

  componentWillReceiveProps(props) {
    const {numberOfLines, value, bind} = this.props;
    let height = 55;

    if (numberOfLines) {
      height += (numberOfLines - 1) * 15;
    }
    // 초기값 셋팅
    this.setState({
      textValue: String(value || modelUtil.getValue(bind)),
      height,
    });
  }

  _onPress() {
    const {label} = this.props;

    if (this.props.editable) {
      Util.openWriteBox({
        label,
        onPost: textData => {
          modelUtil.setValue(this.props.bind, textData);
          // 값이 변할때 이벤트 발생
          if (this.props.onChanged) {
            this.props.onChanged(textData);
          }
        },
        textValue: this.state.textValue,
        maxLength: this.props.maxLength,
      });
    }
  }

  render() {
    const {editable, value, require, bold} = this.props;
    const editabled = Util.checkEdit(editable, value);
    let requireCheck = false;
    if (require) {
      if (this.state.textValue) {
        requireCheck = false;
      } else {
        requireCheck = true;
      }
    }
    return (
      <View>
        <TextField
          value={this.state.textValue}
          labelFontSize={bluecolor.basicFontSizeS}
          fontSize={bluecolor.basicFontSize}
          containerStyle={styles.containerStyle}
          activeLineWidth={1}
          labelHeight={20}
          inputContainerPadding={0}
          inputContainerStyle={{height: this.state.height}}
          textColor={bluecolor.basicBlueFontColor}
          style={bold ? {fontWeight: 'bold'} : null}
          lineWidth={0}
          labelTextStyle={bold ? {fontWeight: 'bold'} : null}
          {...this.props}
          editable={this.editabled}
          baseColor={
            editabled ? bluecolor.basicBluebt : bluecolor.basicDeepGrayColor
          }
          multiline
          blurOnSubmit={false}
          allowFontScaling={false}
          showSoftInputOnFocus={false}
          onFocus={() => this._onPress()}
        />
        {requireCheck ? (
          <Text
            style={{
              color: 'red',
              fontSize: 10,
              position: 'absolute',
              top: 8,
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
  inputBoxStyle: {
    height: 100,
    width: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: bluecolor.basicTrans,
    borderWidth: 0,
    padding: 0,
    marginTop: 25,
    marginLeft: -15,
    fontSize: bluecolor.basicFontSize,
    color: bluecolor.basicBlueFontColor,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({model: state.model});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(HTextareaPopup);
