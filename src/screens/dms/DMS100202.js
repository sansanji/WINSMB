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
 *  출고상세 탭화면
 */
import DMS100204 from './DMS100204';
import DMS100205 from './DMS100205';

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100202');
    this.state = {};
  }

  render() {
    const { dmsVendorcode } = this.props.global;
    return (
      <HTabView>
        <View tabLabel="GI Dt List" style={styles.tabContainer}>
          <DMS100204
            navigator={this.props.navigator}
            componentId={'screen.DMS100204'}
            {...this.props}
          />
        </View>
        <View tabLabel="GI Header Info" style={styles.tabContainer}>
          <DMS100205
            navigator={this.props.navigator}
            componentId={'screen.DMS100205'}
            {...this.props}
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
