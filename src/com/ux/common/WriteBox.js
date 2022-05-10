/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, KeyboardAvoidingView } from 'react-native';
import { React, bluecolor, ReduxStore } from 'libs';
/* *
 * Import node_modules
 * */
import MultilineTextInput from 'common/MultilineTextInput';
// import HRow from 'components/View/HRow';
import HButton from 'components/Buttons/HButton';
import Touchable from 'common/Touchable';
import { HIcon, HText } from 'ux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */
class Writebox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { content: '' };
  }

  componentWillMount() {
    // 초기값 셋팅
    this.setState({
      content: String(this.props.textValue || ''),
    });
  }

  onCancel() {
    const { navigator } = ReduxStore.getState().global;
    navigator.dismissOverlay(this.props.componentId);
  }

  onSave() {
    this.props.onPost(this.state.content);
    const { navigator } = ReduxStore.getState().global;
    navigator.dismissOverlay(this.props.componentId);
  }

  render() {
    const { navigator } = ReduxStore.getState().global;

    return (
      <KeyboardAvoidingView style={styles.highContainer} behavior="height">
        <View style={styles.highContainer}>
          <View style={styles.container}>
            <View style={styles.cancelBtnStyle}>
              <HText textStyle={{ fontWeight: 'bold' }}>{this.props.label}</HText>
              <Touchable
                onPress={() => {
                  navigator.dismissOverlay(this.props.componentId);
                }}
              >
                <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
              </Touchable>
            </View>
            <MultilineTextInput
              style={{
                fontSize: bluecolor.basicFontSize,
                padding: 5,
                flex: 1,
                textAlignVertical: 'top',
                fontWeight: 'bold',
                borderWidth: 0.5,
                borderRadius: 5,
                borderColor: bluecolor.basicBlueColorTrans,
              }}
              value={this.state.content}
              onChangeText={content => {
                this.setState({ content });
              }}
            />
            <HButton
              onPress={() => {
                this.onSave();
              }}
              name={'check-circle-o'}
              title={'Confirm'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnStyle: {
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.7,
    height: screenHeight * 0.44,
    backgroundColor: bluecolor.basicWhiteColor,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
  },
});

export default Writebox;
