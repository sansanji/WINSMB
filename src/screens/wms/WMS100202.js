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
import WMS100203 from './WMS100203'; // 세부상세
import WMS100204 from './WMS100204';
import WMS100205 from './WMS100205';

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100202');
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
          <View tabLabel="GI Ref Dt List" style={styles.tabContainer}>
            <WMS100203
              navigator={this.props.navigator}
              componentId={'screen.WMS100203'}
              {...this.props}
            />
          </View>
        ) : (
          <View tabLabel="GI Dt List" style={styles.tabContainer}>
            <WMS100204
              navigator={this.props.navigator}
              componentId={'screen.WMS100204'}
              {...this.props}
            />
          </View>
        )}
        <View tabLabel="GI Header Info" style={styles.tabContainer}>
          <WMS100205
            navigator={this.props.navigator}
            componentId={'screen.WMS100205'}
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
