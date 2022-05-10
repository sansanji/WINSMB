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
 *  입고상세 탭화면
 */
import DMS100304 from './DMS100304';
import DMS100305 from './DMS100305';

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100302');
    this.state = {};
  }

  render() {
    const { dmsVendorcode, config } = this.props.global;
    return (
      <HTabView>
        <View tabLabel="GR Dt List" style={styles.tabContainer}>
          <DMS100304
            navigator={this.props.navigator}
            componentId={'screen.DMS100304'}
            {...this.props}
          />
        </View>
        <View tabLabel="GR Header Info" style={styles.tabContainer}>
          <DMS100305
            navigator={this.props.navigator}
            componentId={'screen.DMS100305'}
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
