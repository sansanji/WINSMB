import { React, bluecolor, ReduxStore } from 'libs';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';

class Loader extends React.Component {
  constructor(props) {
    super(props);
  }

  // 현재 소스 로직과는 상관 없지만,
  // 참조하면 좋은 Indicator Lib : https://github.com/n4kz/react-native-indicators
  render() {
    const { navigator } = ReduxStore.getState().global;
    // 형식에 맞지 않는 옵션명이므로 별도로 스타일 처리!
    const buttonIconStyle = {
      name: 'times-circle',
      type: 'font-awesome',
      color: bluecolor.basicBlueColor,
    };

    // Util.openLoader > showOverlay 로 처리되기 때문에 <Modal>이 필요 없음!
    return (
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator size="large" color={bluecolor.basicBlueColor} />
          <Button
            title={'Stop'}
            icon={buttonIconStyle}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={() => {
              navigator.dismissOverlay(this.props.componentId);
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: bluecolor.basicWhiteColorTrans, // '#00000040',
  },
  activityIndicatorWrapper: {
    backgroundColor: bluecolor.basicTrans, // '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonStyle: {
    backgroundColor: bluecolor.basicTrans,
  },
  buttonTitleStyle: {
    color: bluecolor.basicBlueColor,
    fontWeight: 'bold',
  },
});

export default Loader;
