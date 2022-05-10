/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { React, bluecolor, ReduxStore } from 'libs';
import Touchable from 'common/Touchable';
import HText from 'components/Form/Text/HText';
import { HIcon } from 'ux';
/**
 * 콤보박스 컴포넌트
 */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Option = props => (
  <Touchable
    style={[styles.option, props.selected ? styles.selected : null]}
    onPress={props.onPress}
  >
    <HText textStyle={props.value === '' ? styles.textAllStyle : styles.textStyle}>
      {props.label}
    </HText>
  </Touchable>
);
/**
 * 공통코드를 활용한 콤보박스 컴포넌트
 */
class ComboBox extends React.Component {
  constructor(props) {
    super(props);
  }

  _onPress(value, comboValues) {
    const { navigator } = ReduxStore.getState().global;
    navigator.dismissOverlay(this.props.componentId);
    this.props.onChange(value, comboValues);
  }

  render() {
    const { navigator } = ReduxStore.getState().global;

    return (
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
          <ScrollView style={styles.scroll}>
            <Option
              label={'ALL(전체)'}
              key={''}
              value={''}
              onPress={() => {
                this._onPress(
                  {
                    name: '',
                    code: '',
                  },
                  null,
                );
              }}
            />
            {this.props.comboValues.map(option => (
              <Option
                label={option[this.props.nameField]}
                key={option[this.props.codeField]}
                value={option[this.props.codeField]}
                selected={this.props.selected === option[this.props.codeField]}
                onPress={() => {
                  this._onPress(
                    {
                      name: option[this.props.nameField],
                      code: option[this.props.codeField],
                    },
                    option,
                  );
                }}
              />
            ))}
          </ScrollView>
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
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.44,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: bluecolor.basicBlueLightTrans,
  },
  scroll: {
    flex: 1,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: bluecolor.basicWhiteColor,
    borderColor: bluecolor.basicWhiteColor,
  },
  selected: {
    backgroundColor: bluecolor.basicGrayColorTrans,
  },
  textStyle: {
    color: bluecolor.basicBlueFontColor,
    // fontWeight: 'bold',
  },
  textAllStyle: {
    color: bluecolor.basicRedColor,
    // fontWeight: 'bold',
  },
});

export default ComboBox;
