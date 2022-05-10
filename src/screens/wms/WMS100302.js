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
import WMS100303 from './WMS100303'; // 세부상세
import WMS100304 from './WMS100304';
import WMS100305 from './WMS100305';
import WMS100306 from './WMS100306'; // 세부상세(LOT용)

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100302');
    this.state = {};
  }

  render() {
    const { vendorcode, config } = this.props.global;

    let refDtYn = 'N';
    if (vendorcode) {
      if (vendorcode.REF_DT_YN) {
        refDtYn = vendorcode.REF_DT_YN;
      }
    }

    const LotYn = config.WMS_LOT_NO;

    return (
      <HTabView>
        {refDtYn === 'Y' ? (
          <View tabLabel="GR Ref Dt List" style={styles.tabContainer}>
            {LotYn === 'Y' ? (
              <WMS100306
                navigator={this.props.navigator}
                componentId={'screen.WMS100306'}
                {...this.props}
              />
            ) : (
              <WMS100303
                navigator={this.props.navigator}
                componentId={'screen.WMS100303'}
                {...this.props}
              />
            )}
          </View>
        ) : null}
        <View tabLabel="GR Dt List" style={styles.tabContainer}>
          <WMS100304
            navigator={this.props.navigator}
            componentId={'screen.WMS100304'}
            {...this.props}
          />
        </View>
        <View tabLabel="GR Header Info" style={styles.tabContainer}>
          <WMS100305
            navigator={this.props.navigator}
            componentId={'screen.WMS100305'}
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
