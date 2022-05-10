/* *
 * Import Common
 * */
import { Text, StyleSheet } from 'react-native';
import { Util, React, Touchable, PropTypes } from 'libs';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 캘린더 입력 컴포넌트
 */

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Touchable
        style={styles.container}
        onPress={() => {
          Util.openCalendar({
            onChange: date => {
              this.props.onChange(date);
            },
          });
        }}
      >
        <Text style={styles.text}>{this.props.value}</Text>
        <FontAwesome name="calendar" size={30} color="#FE7013" style={styles.icon} />
      </Touchable>
    );
  }
}

Component.defaultProps = {
  value: null,
};

Component.propTypes = {
  value: PropTypes.string,
};
/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 15,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    textAlignVertical: 'center',
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    color: '#aaaaaa',
  },
  icon: { marginLeft: 5 },
});

export default Component;
