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
import DMS100404 from './DMS100404'; // Daily
import DMS100405 from './DMS100405'; // stock flow
import DMS100402 from './DMS100402'; // PLT
import DMS100406 from './DMS100406'; // BOX
import DMS100407 from './DMS100407'; // ITEM

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100302');
    this.state = {};
  }

  render() {
    const { dmsVendorcode } = this.props.global;
    return (
      <HTabView>
        <View tabLabel="Daily" style={styles.tabContainer}>
          <DMS100404
            navigator={this.props.navigator}
            componentId={'screen.DMS100404'}
            params={this.props.item}
            properties={this.props}
          />
        </View>
        <View tabLabel="Stock Flow" style={styles.tabContainer}>
          <DMS100405
            params={this.props.item}
            navigator={this.props.navigator}
            componentId={'screen.DMS100405'}
            properties={this.props}
          />
        </View>
        <View tabLabel="PLT" style={styles.tabContainer}>
          <DMS100402
            params={this.props.item}
            navigator={this.props.navigator}
            componentId={'screen.DMS100402'}
            properties={this.props}
          />
        </View>
        <View tabLabel="BOX" style={styles.tabContainer}>
          <DMS100406
            params={this.props.item}
            navigator={this.props.navigator}
            componentId={'screen.DMS100406'}
            properties={this.props}
          />
        </View>
        <View tabLabel="ITEM" style={styles.tabContainer}>
          <DMS100407
            params={this.props.item}
            navigator={this.props.navigator}
            componentId={'screen.DMS100407'}
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
