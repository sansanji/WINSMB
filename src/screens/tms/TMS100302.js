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
 *  트레이싱(상세정보) 탭화면
 */
import TMS100303 from './TMS100303'; // 배차정보
import TMS100304 from './TMS100304'; // 요청상세정보
import TMS100305 from './TMS100305'; // Tracing정보

import TMS100702 from './TMS100702'; // 기사전용 배차정보

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100302');
    this.state = {};
  }

  render() {
    return (
      <HTabView>
        <View tabLabel="배차정보" style={styles.tabContainer}>
          {this.props.iot ?
            (<TMS100702
              navigator={this.props.navigator}
              componentId={'screen.TMS100702'}
              {...this.props}
            />) :
            (<TMS100303
              navigator={this.props.navigator}
              componentId={'screen.TMS100303'}
              {...this.props}
            />)
          }
        </View>
        <View tabLabel="요청상세정보" style={styles.tabContainer}>
          <TMS100304
            navigator={this.props.navigator}
            componentId={'screen.TMS100304'}
            {...this.props}
          />
        </View>
        <View tabLabel="Tracing정보" style={styles.tabContainer}>
          <TMS100305
            navigator={this.props.navigator}
            componentId={'screen.TMS100305'}
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
