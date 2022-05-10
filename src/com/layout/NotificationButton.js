/* *
 * Import Common
 * */
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { React, Redux, bluecolor, Navigation } from 'libs';
import { Component } from 'react';
/* *
 * Import node_modules
 * */
import IconBadge from 'react-native-icon-badge';
import { Icon } from 'react-native-elements';
/**
 * 푸쉬메세지 버튼 컴포넌트
 */
class NotificationButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 'N',
      visibleTabCntr: false,
    };
  }

  _onPress() {
    const { navigator } = this.props.global;
    Navigation(
      navigator,
      'screen.ADM010109',
      {
        visibleTabCntr: this.state.visibleTabCntr,
      },
      'Notice Report',
    );
  }

  render() {
    const { newalarm } = this.props.chat;

    return (
      <TouchableOpacity onPress={() => this._onPress()} style={styles.container}>
        <IconBadge
          // type (defaults to material, options are material-community, zocial,
          // font-awesome, octicon, ionicon, foundation, evilicon,
          // simple-line-icon, feather or entypo)
          MainElement={<Icon name="mail" type="MaterialIcons" color={bluecolor.basicWhiteColor} />}
          BadgeElement={<Text style={styles.badgeText}>{newalarm}</Text>}
          IconBadgeStyle={styles.badge}
          Hidden={newalarm == null}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#999999',
    overlayColor: '#999999',
  },
  badgeText: {
    color: '#FFFFFF',
  },
  badge: {
    width: 20,
    height: 20,
    backgroundColor: 'orange',
    left: 10,
  },
});

// ------------------------------------
// Define actions to inject
// ------------------------------------

// ------------------------------------
// Define properties to inject from store state
// ------------------------------------
const mapStateToProps = state => ({
  global: state.global,
  chat: state.chat,
});

export default Redux.connect(mapStateToProps)(NotificationButton);
