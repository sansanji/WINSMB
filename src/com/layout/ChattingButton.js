/* *
 * Import Common
 * */
import {Text, StyleSheet, AsyncStorage} from 'react-native';
import {React, Redux, Navigation, bluecolor, ReduxStore} from 'libs';
import {Touchable} from 'ux';

/* *
 * Import node_modules
 * */
import IconBadge from 'react-native-icon-badge';
import {Icon} from 'react-native-elements';

/**
 * 채팅 버튼 컴포넌트
 */
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 'N',
      visibleTabCntr: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  _onPress() {
    const {navigator} = this.props.global;

    ReduxStore.dispatch({
      type: 'chat.message.add',
      message: null,
    });
    AsyncStorage.removeItem('message');

    Navigation(
      navigator,
      'screen.ADM010106',
      {
        visibleTabCntr: this.state.visibleTabCntr,
        noMain: true,
      },
      '채팅방',
    );
  }

  render() {
    const {messages} = this.props.chat;

    return (
      <Touchable
        onPress={() => this._onPress()}
        style={styles.container}
        renderToHardwareTextureAndroid>
        <IconBadge
          MainElement={
            <Icon
              name="group"
              type="MaterialIcons"
              color={bluecolor.basicWhiteColor}
            />
          }
          BadgeElement={<Text style={styles.badgeText}>{messages}</Text>}
          IconBadgeStyle={styles.badge}
          Hidden={messages == null}
        />
      </Touchable>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    width: 42,
    paddingRight: 10,
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
    backgroundColor: 'red',
    left: 10,
  },
});
/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({global: state.global, chat: state.chat});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
