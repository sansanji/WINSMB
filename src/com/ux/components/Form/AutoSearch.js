/* *
 * Import Common
 * */
import { View, Text, StyleSheet } from 'react-native';
import { Util, React } from 'libs';
import { Touchable, HRow } from 'ux';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 자동검색 컴퍼넌트
 */
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _onPress(item) {}

  render() {
    return (
      <Touchable style={styles.container} onPress={() => this._onPress()}>
        <HRow>
          <View style={styles.iconContainer}>
            <FontAwesome name="search" size={15} color="#aaaaaa" />
          </View>
          <View style={styles.keyword}>
            <Text>{this.props.keyword}</Text>
          </View>
        </HRow>
      </Touchable>
    );
  }
}

/**
 * Define component styles
 */
const deepBlueColor = '#003366';
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f1f1',
    borderRadius: 3,
    borderColor: '#bbbbbb',
  },
  icon: {},
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e7e7',
    padding: 7,
    width: 30,
    height: 30,
  },
  keyword: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingLeft: 10,
    height: 30,
  },
  input: {
    borderBottomColor: deepBlueColor,
    borderBottomWidth: 0,
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
    fontSize: 15,
    color: 'gray',
  },
});

export default Component;
