/* *
 * Import Common
 * */
import {Text, StyleSheet, AsyncStorage} from 'react-native';
import {React, Redux, bluecolor, initSettingsWins, Util} from 'libs';
import {Touchable} from 'ux';
import app from 'src/app';

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
      winsMode: 'N',
    };
  }

  async componentWillMount() {
    await AsyncStorage.getItem('saveWINS', (err, result) => {
      this.setState({
        winsMode: result,
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  async _onPress() {
    // 기사가아닐경우만 Wins모드 선택 가능하다
    if (this.props.global.session.USER_AUTH !== 'D') {
      // WINS 저장여부
      if (this.state.winsMode === 'Y') {
        await AsyncStorage.setItem('saveWINS', 'N');
        app([
          {
            title: '홈으로',
            screen: 'com.layout.MainScreen',
          },
        ]);
      } else {
        await AsyncStorage.setItem('saveWINS', 'Y');
        await initSettingsWins();
        app([
          {
            title: 'WINS',
            swidget: 'WVWINS',
            screen: 'com.layout.MainScreenWins',
          },
        ]);
      }
    } else {
      Util.msgBox({
        title: 'Alert',
        msg: 'You can`t change WINS Mode!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }

  render() {
    const {messages} = this.props.chat;
    return (
      <Touchable
        onPress={() => this._onPress()}
        style={styles.container}
        renderToHardwareTextureAndroid>
        <IconBadge
          // cast-connected
          MainElement={
            <Icon
              name={
                this.state.winsMode === 'Y'
                  ? 'tablet-android'
                  : 'important-devices'
              }
              type="MaterialIcons"
              color={bluecolor.basicYellowColor}
            />
          }
          BadgeElement={<Text style={styles.badgeText}>{messages}</Text>}
          IconBadgeStyle={styles.badge}
          // Hidden={messages == null}
          Hidden
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
