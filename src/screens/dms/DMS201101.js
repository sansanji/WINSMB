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
import DMS201001 from './DMS201001';
import DMS100602 from './DMS100602';

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS201101');
    this.state = {};
  }

  render() {
    const { dmsVendorcode, config } = this.props.global;
    return (
      <HTabView>
        <View tabLabel="W/H Move" style={styles.tabContainer}>
          <DMS201001
            navigator={this.props.navigator}
            componentId={'screen.DMS201001'}
            {...this.props}
          />
        </View>
        <View tabLabel="Location(Lotte)" style={styles.tabContainer}>
          <DMS100602
            navigator={this.props.navigator}
            componentId={'screen.DMS100602'}
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
