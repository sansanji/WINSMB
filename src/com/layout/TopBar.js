/* *
 * Import Common
 * */
import { View, Image } from 'react-native';
import { React, bluecolor } from 'libs';

const tScreen = require('assets/images/topBar.png');
/**
 * 로그인 체크 컴포넌트
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
    };
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={tScreen}
          style={{
            flex: 1,
            position: 'absolute',
            resizeMode: 'cover',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: bluecolor.basicTrans,
          }}
        />
      </View>
    );
  }
}

export default TopBar;
