import { Navigation } from 'react-native-navigation';

// Xcode 10.2 버전업으로 인한 추가 (registerAppLaunchedListener)
Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setDefaultOptions({
    statusBar: {
      // backgroundColor: '#3f77a1',
      backgroundColor: '#000099'
    },
    layout: {
      direction: 'ltr', // Supported directions are: 'rtl', 'ltr'
      orientation: ['portrait'], // An array of supported orientations
    },
  });
});
// this will start our app
const login = () =>
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: 'com.layout.LoginPage',
              passProps: {
                text: 'stack with one child',
              },
              options: {
                topBar: {
                  elevation: 0,
                  visible: false,
                  drawBehind: true,
                  animate: false,
                },
              },
            },
          },
        ],
      },
    },
  });
// Navigation.startSingleScreenApp({
//   screen: {
//     screen: 'com.layout.LoginPage',
//     title: 'Login',
//     navigatorStyle: {},
//   },
//   navigatorStyle: {
//     drawUnderNavBar: true,
//     navBarHidden: true,
//     tabBarHidden: true, //
//   }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
// });

export default login;
