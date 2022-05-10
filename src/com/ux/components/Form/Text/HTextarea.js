/* *
 * Import Common
 * */
import {View, StyleSheet, Text} from 'react-native';
import {React, Redux, bluecolor, modelUtil, Util} from 'libs';
/* *
 * Import node_modules
 * */
import {TextField} from 'rn-material-ui-textfield';
import debounce from 'debounce';

/**
 * 폼글자박스필드 컴포넌트(간단한 내용은 바로 편집 가능 / 2줄 이상은 HTextareaPopup 사용 권장)
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
 * <HTextarea
 label={'H/D Information'}
 bind={'TEMPFORM.HANDLE_INFO'}
 editable
 multiline
 numberOfLines={5}
/>
 */

class HTextarea extends React.Component {
  constructor(props) {
    super(props);
    this.onSubmitEditing = debounce(
      this.onSubmitEditing.bind(this),
      1000,
      true,
    );
    this.state = {
      textValue: '',
      selection: {start: 0, end: 0},
      allowEditing: true,
    };
  }

  componentWillReceiveProps() {
    // 초기값 셋팅
    this.setState({
      textValue: String(
        this.props.value || modelUtil.getValue(this.props.bind),
      ),
      allowEditing: true,
    });
  }

  onSubmitEditing() {
    const {textValue, selection} = this.state;
    let selectTemp = {start: 0, end: 0};
    if (selection) {
      selectTemp = selection;
    }
    let newText = textValue;
    const ar = newText.split('');
    ar.splice(selectTemp.start, 0, '\n');
    newText = ar.join('');
    if (selectTemp.start === textValue.length) {
      this.setState({textValue: newText});
    } else if (this.state.allowEditing) {
      this.setState({
        textValue: newText,
        selection: {
          start: selectTemp.start + 1,
          end: selectTemp.end + 1,
        },
        allowEditing: !this.state.allowEditing,
      });
    }
  }

  render() {
    const {editable, value, bind, numberOfLines, require, bold} = this.props;

    const editabled = Util.checkEdit(editable, value);
    let height = 55;

    if (numberOfLines) {
      height += (numberOfLines - 1) * 15;
    }

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
          ref={ref => {
            this.text = ref;
          }}
          labelFontSize={bluecolor.basicFontSizeS}
          fontSize={bluecolor.basicFontSize}
          containerStyle={styles.containerStyle}
          activeLineWidth={1}
          labelHeight={20}
          inputContainerPadding={0}
          inputContainerStyle={{height}}
          textColor={bluecolor.basicBlueFontColor}
          style={bold ? {fontWeight: 'bold'} : null}
          onEndEditing={event => {
            const text = event.nativeEvent.text;
            modelUtil.setValue(bind, text);
            // 값이 변할때 이벤트 발생
            if (this.props.onChanged) {
              this.props.onChanged(text);
            }
          }}
          lineWidth={0}
          value={this.state.textValue}
          editable={editabled}
          labelTextStyle={bold ? {fontWeight: 'bold'} : null}
          {...this.props}
          baseColor={
            editabled ? bluecolor.basicBluebt : bluecolor.basicDeepGrayColor
          }
          /* 멀티라인용 속성 시작 */
          onChangeText={text => {
            this.setState({textValue: text, allowEditing: true});
            // const text = event.nativeEvent.text;
            modelUtil.setValue(bind, text);
            // 값이 변할때 이벤트 발생
            if (this.props.onChanged) {
              this.props.onChanged(text);
            }
          }}
          multiline
          selection={this.state.selection}
          blurOnSubmit={false}
          onSubmitEditing={this.onSubmitEditing}
          onSelectionChange={event => {
            this.setState({
              selection: event.nativeEvent.selection,
              allowEditing: true,
            });
          }}
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
export default Redux.connect(mapStateToProps)(HTextarea);
