import {Navigation} from 'react-native-navigation';
// this will start our app
const loginCheck = type => {
  // 처음 화면 오픈시에는 registerAppLaunchedListener 가 필요
  if (type) {
    Navigation.setRoot({
      root: {
        stack: {
          children: [
            {
              component: {
                name: 'screen.common.LoginCheckScreen',
                options: {
                  topBar: {
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
  } else {
    Navigation.events().registerAppLaunchedListener(() => {
      Navigation.setRoot({
        root: {
          stack: {
            children: [
              {
                component: {
                  name: 'screen.common.LoginCheckScreen',
                  options: {
                    topBar: {
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
    });
  }
};

// Navigation.startSingleScreenApp({
//   screen: {
//     screen: 'screen.common.LoginCheckScreen',
//     title: 'Login',
//     navigatorStyle: {},
//   },
//   navigatorStyle: {
//     drawUnderNavBar: true,
//     navBarHidden: true,
//     tabBarHidden: true, //
//   }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
// });

export default loginCheck;
