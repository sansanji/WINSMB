import {PermissionsAndroid, Platform, AsyncStorage, Alert} from 'react-native';
import {Provider} from 'react-redux';
import ReduxStore from 'libs/store';
import {registerScreens} from 'src/routes';
import logincheck from './loginCheck';
// registerScreenVisibilityListener();
console.disableYellowBox = true;
global.gToken = null;
global.gCookie = null;
this.permission = false;
registerScreens(ReduxStore, Provider);
logincheck();
function checkPermission() {
  PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ]).then(result => {
    if (
      result['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
      result['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
      result['android.permission.CAMERA'] === 'granted' &&
      result['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
      result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    ) {
      this.permission = true;
      logincheck('ok');
    } else {
      this.permission = false;
      const message =
        'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue';
      Alert.alert(
        'Please, Check Permissions!',
        message,
        [{text: 'OK', onPress: () => checkPermission()}, {cancelable: false}],
        {
          cancelable: false,
        },
      );
    }
    console.log('setpermission', this.permission);
    AsyncStorage.setItem('permission', this.permission);
  });
}
if (Platform.OS === 'android') {
  AsyncStorage.getItem('permission', (err, result) => {
    if (result) {
      this.permission = result;
    } else {
      this.permission = false;
    }
  });
  console.log('permission', this.permission);
  if (this.permission) {
    logincheck();
  } else {
    checkPermission();
  }
} else {
  logincheck();
}
