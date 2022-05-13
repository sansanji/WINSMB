/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, NavigationScreen } from 'libs';
import { HTabView } from 'ux';

/* *
 * Import node_modules
 * */
/**
 *  재고 탭화면
 */
import DMS201302 from './DMS201302'; // GR in 입고
import DMS201303 from './DMS201303'; // GI out 출고

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100302');
    this.state = {};
  }

  render() {
    return (
      <HTabView>
        <View tabLabel="GR Scan" style={styles.tabContainer}>
          <DMS201302
            navigator={this.props.navigator}
            componentId={'screen.DMS201302'}
            params={this.props.item}
            properties={this.props}
          />
        </View>
        <View tabLabel="GI Scan" style={styles.tabContainer}>
          <DMS201303
            params={this.props.item}
            navigator={this.props.navigator}
            componentId={'screen.DMS201303'}
            properties={this.props}
          />
        </View>
      </HTabView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  tabContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonInnerContainer: {
    flex: 1,
    margin: 5,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
