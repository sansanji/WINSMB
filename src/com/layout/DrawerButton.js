/* *
 * Import Common
 * */
import { StyleSheet } from 'react-native';
import { React, bluecolor, Redux } from 'libs';
import { Touchable } from 'ux';
/* *
 * Import node_modules
 * */
import { Component } from 'react';
import { Icon } from 'react-native-elements';
/**
 * 서랍 Menu 버튼
 */
class DrawerButton extends Component {
  constructor(props) {
    super(props);
  }

  _toggleDrawer() {
    console.log('this.props.global', this.props.global);
    this.props.global.navigator.toggleDrawer({
      side: 'left', // the side of the drawer since you can have two, 'left' / 'right'
      animated: true, // does the toggle have transition animation or does it happen immediately (optional)
      // to: 'open',
    });
  }

  render() {
    return (
      <Touchable
        activeOpacity={1}
        style={[styles.buttonContainer]}
        onPress={() => this._toggleDrawer()}
      >
        <Icon name="menu" type="MaterialIcons" size={30} color={bluecolor.basicWhiteColor} />
      </Touchable>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});

// ------------------------------------
// Define properties to inject from store state
// ------------------------------------
const mapStateToProps = state => ({
  global: state.global,
});

export default Redux.connect(
  mapStateToProps,
  {},
)(DrawerButton);
