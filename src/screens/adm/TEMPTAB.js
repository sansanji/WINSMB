/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, NavigationScreen } from 'libs';
import { BackImage, HTabView } from 'ux';
import TEMPLIST from 'adm/TEMPLIST';
import TEMPFORM from 'adm/TEMPFORM';
import TEMPTEST from 'adm/TEMPTEST';

/* *
 * Import node_modules
 * */
/**
 *  샘플 탭화면
 */
class TEMPTAB extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPTAB');
    this.state = {};
  }

  componentWillMount() {}

  shouldComponentUpdate() {
    return true;
  }

  // 실제로 화면을 그려준다.
  render() {
    return (
      <HTabView>
        <TEMPFORM
          navigator={this.props.navigator}
          componentId={'screen.TEMPFORM'}
          tabLabel="TEMPFORM"
        />
        <TEMPLIST
          navigator={this.props.navigator}
          componentId={'screen.TEMPLIST'}
          tabLabel="TEMPLIST"
        />
        <TEMPTEST
          navigator={this.props.navigator}
          componentId={'screen.TEMPTEST'}
          tabLabel="TEMPTEST"
        />
        <View style={styles.container} tabLabel="Menu1">
          <BackImage />
        </View>
        <View style={styles.container} tabLabel="Menu2">
          <BackImage />
        </View>
        <View style={styles.container} tabLabel="Menu3">
          <BackImage />
        </View>
        <View style={styles.container} tabLabel="Menu4">
          <BackImage />
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
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(TEMPTAB);
