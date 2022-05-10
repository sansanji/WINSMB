/* *
 * Import Common
 * */
import { View, ActivityIndicator } from 'react-native';
import { React, bluecolor } from 'libs';
/* *
 * Import node_modules
 * */
import Spinner from 'react-native-loading-spinner-overlay';
import { Button } from 'react-native-elements';

const component = props => (
  <Spinner
    ref={ref => {
      this.spinnerRef = ref;
    }}
    visible={props.visible}
    textContent={'Loading...'}
    textStyle={{ color: bluecolor.basicBlueColor }}
    animation={'none'}
    overlayColor={bluecolor.basicWhiteColorTrans} // {'rgba(104, 151, 187, 0.25)'}
    color={bluecolor.basicBlueColor}
    size={'large'}
    children={
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={bluecolor.basicBlueColor} />
        <Button
          title={'Stop'}
          icon={{ name: 'times-circle', type: 'font-awesome', color: bluecolor.basicBlueColor }}
          buttonStyle={{
            backgroundColor: bluecolor.basicTrans,
          }}
          fontWeight={'bold'}
          color={bluecolor.basicBlueColor}
          titleStyle={{ color: bluecolor.basicBlueColor }}
          onPress={() => {
            this.spinnerRef.setState({
              visible: false,
            });
          }}
        />
      </View>
    }
  />
);

export default component;
