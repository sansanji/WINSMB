/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import React from 'react';
import { bluecolor, Util, modelUtil } from 'libs';
/* *
 * Import node_modules
 * */
import MultilineTextInput from 'common/MultilineTextInput';
/**
 * 입력가능한 뷰 컴포넌트(입력할수 있음) 많은 줄의 데이터를 표현할때 쓰임
 * @param {styles} containerStyle - 스타일 파라미터
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {String} bind - 모델을 사용하도록함(모델명.컬럼명), 수정 가능
 * @param {Boolean} editable - value값이 없을때는 수정가능 여부를 판단(기본값 false)
 * @param {Number} numberOfLines - 글자 행수
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(text 리턴)
 * @param {All} all - 나머지 옵션은 Textinput과 동일
 * @param {Number} maxLength - 최대글자수
 * @example
 * <HInputView
 containerStyle={{ marginTop: 5 }}
 label={'Contents'}
 bind={'ADM010105.QNA_CONTENTS'}
 editable
 multiline
 numberOfLines={12}
/>
 */

class HInputView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { content: '' };
  }
  componentWillReceiveProps() {
    // 초기값 셋팅
    const { value, bind } = this.props;

    this.setState({
      content: String(value || modelUtil.getValue(bind)),
    });
  }

  render() {
    const { containerStyle, editable, value, bind } = this.props;
    const editabled = Util.checkEdit(editable, value);

    return (
      <View style={[containerStyle, styles.container]}>
        <MultilineTextInput
          editable={editabled}
          style={{
            fontSize: bluecolor.basicFontSize,
            flex: 1,
            textAlignVertical: 'top',
            // fontWeight: 'bold',
            color: bluecolor.basicBlueFontColor,
          }}
          value={this.state.content}
          onChangeText={content => {
            this.setState({ content });
            // const text = event.nativeEvent.text;
            modelUtil.setValue(bind, content);
            // 값이 변할때 이벤트 발생
            if (this.props.onChanged) {
              this.props.onChanged(content);
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
          {...this.props}
        />
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 5,
    padding: 5,
    backgroundColor: bluecolor.basicSoftGrayColor,
  },
});

/**
 * Wrapping with root component
 */
export default HInputView;
