/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { React, bluecolor, ReduxStore } from 'libs';
import HText from 'components/Form/Text/HText';
import HTexttitle from 'components/Form/Text/HTexttitle';
import HButton from 'components/Buttons/HButton';
import Touchable from 'common/Touchable';
import { HIcon } from 'ux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 공통코드를 활용한 MsgBox 컴포넌트
 */
class MsgBox extends React.Component {
  constructor(props) {
    super(props);
  }

  _onPress(button) {
    const { navigator } = ReduxStore.getState().global;
    navigator.dismissOverlay(this.props.componentId);
    if (button.onPress) {
      button.onPress(button);
    }
  }

  render() {
    const { buttonGroup, title, msg } = this.props;
    const { navigator } = ReduxStore.getState().global;

    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <Touchable
            style={styles.cancelBtnStyle}
            onPress={() => {
              navigator.dismissOverlay(this.props.componentId);
            }}
          >
            <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
          </Touchable>
          <View>
            <HTexttitle viewStyle={{ marginTop: 1 }}>{title}</HTexttitle>
            <HText textStyle={styles.msgStyle}>{msg}</HText>
          </View>
          <View style={styles.buttonGropuStyle}>
            <ScrollView>
              {buttonGroup.map(button => (
                <HButton
                  key={button.title}
                  title={button.title}
                  name={button.name}
                  iconType={button.iconType}
                  onPress={() => this._onPress(button)}
                  bStyle={button.bStyle}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginBottom: 3,
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
  buttonGropuStyle: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  msgStyle: {
    fontSize: bluecolor.basicFontSizeL,
  },
  textStyle: {
    color: bluecolor.basicBlueFontColor,
    fontWeight: 'bold',
  },
});

export default MsgBox;
