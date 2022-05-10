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
import WMS100402 from './WMS100402'; // 세부상세
import WMS100403 from './WMS100403';
import WMS100404 from './WMS100404';

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100302');
    this.state = {};
  }

  render() {
    const { vendorcode } = this.props.global;
    let refDtYn = 'N';
    if (vendorcode) {
      if (vendorcode.REF_DT_YN) {
        refDtYn = vendorcode.REF_DT_YN;
      }
    }
    return (
      <HTabView>
        {refDtYn === 'Y' ? (
          <View tabLabel="Stock Dt List" style={styles.tabContainer}>
            <WMS100402
              navigator={this.props.navigator}
              componentId={'screen.WMS100402'}
              params={this.props.item}
              properties={this.props}
            />
          </View>
        ) : null}
        <View tabLabel="Stock List" style={styles.tabContainer}>
          <WMS100403
            navigator={this.props.navigator}
            componentId={'screen.WMS100403'}
            params={this.props.item}
            properties={this.props}
          />
        </View>
        <View tabLabel="Stock Daily" style={styles.tabContainer}>
          <WMS100404
            params={this.props.item}
            navigator={this.props.navigator}
            componentId={'screen.WMS100404'}
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
