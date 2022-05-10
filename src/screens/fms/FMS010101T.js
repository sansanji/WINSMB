/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, NavigationScreen } from 'libs';
import { HBaseView } from 'ux';

/* *
 * Import node_modules
 * */
// import ScrollableTabView from 'react-native-scrollable-tab-view';
import ScrollableTabView from 'components/View/TabView';

/**
 * import tab screens
 */
import FMS010102 from './FMS010102'; // 인천공항 스케줄 정보
import FMS010103 from './FMS010103'; // 항공수출 GSCL(IV) EDI LIST
import FMS010104 from './FMS010104'; // 항공수출 GERP EDI LIST
import TEMPLATE from './TEMPLATE'; // Common Component Template! - AE GSCL(CELLO) EDI List

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'FMS010101T');
    this.state = {};
  }

  render() {
    const { session } = this.props.global;

    // 마지막 tab은 테스트 용이므로 연구소 담당자만 보일 수 있도록 처리 <시작>
    let deptCode = null;
    let testViewVisible = false;

    if (session !== null || session !== undefined) {
      deptCode = session.DEPT_CODE;

      if (deptCode === 'M10701' || deptCode === 'M10702') {
        testViewVisible = true;
      }
    }
    // 마지막 tab은 테스트 용이므로 연구소 담당자만 보일 수 있도록 처리 <끝>

    return (
      <HBaseView>
        {/* <TabContainer activeTab={1} navigator={this.props.navigator} /> */}
        <ScrollableTabView style={[{ marginTop: 1 }]} initialPage={0}>
          <View tabLabel="ICN Schedule" style={styles.tabContainer}>
            <FMS010102
              navigator={this.props.navigator}
              params={this.props.item}
              properties={this.props}
            />
          </View>
          <View tabLabel="GSCL(IV)" style={styles.tabContainer}>
            <FMS010103
              navigator={this.props.navigator}
              sparams={this.props.item}
              properties={this.props}
            />
          </View>
          <View tabLabel="GERP" style={styles.tabContainer}>
            <FMS010104
              navigator={this.props.navigator}
              params={this.props.item}
              properties={this.props}
            />
          </View>
          {testViewVisible ? (
            <View tabLabel="Dev." style={styles.tabContainer}>
              <TEMPLATE
                navigator={this.props.navigator}
                params={this.props.item}
                properties={this.props}
              />
            </View>
          ) : null}
        </ScrollableTabView>
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
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
