/* *
 * Import Common
 * */
import { Text, StyleSheet } from 'react-native';
import { React, Touchable, PropTypes } from 'libs';
import { HRow } from 'ux';

/**
 * 라디오버튼 컴포넌트
 */
const RadioButton = props => (
  <Touchable
    style={[styles.radioButton, props.selected ? styles.selected : null]}
    onPress={() => props.onPress(props.value, props.title)}
  >
    <Text style={[styles.buttonText, props.selected ? styles.selectedButtonText : null]}>
      {props.title}
    </Text>
  </Touchable>
);

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (this.props.data.length < 1) {
      return null;
    }
    return (
      <HRow {...this.props}>
        {this.props.data.map(({ LOC_VALUE: title, DT_CODE: value }) => (
          <RadioButton
            key={value}
            title={title}
            value={value}
            selected={this.props.selected === value}
            onPress={(value, titile) => this.props.onChange(value, title)}
          />
        ))}
      </HRow>
    );
  }
}

Component.propTypes = {
  selected: PropTypes.string,
};

/**
 * Define component styles
 */
const basicBlueColor = '#517fa4';
const styles = StyleSheet.create({
  radioButton: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#aaaaaa',
  },
  selected: {
    borderColor: '#ffffff',
    borderWidth: 2,
    backgroundColor: basicBlueColor,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#696969',
    fontSize: 12,
  },
  selectedButtonText: {
    color: '#ffffff',
  },
});

export default Component;
