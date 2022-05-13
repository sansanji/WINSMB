import {Navigation} from 'react-native-navigation';
import bluecolor from 'styles/theme-color-blue';
import Icon from 'react-native-vector-icons/Ionicons';
import {Platform} from 'react-native';

// const menuIcon =
//   Platform.OS === 'android'
//     ? require('./assets/images/navicon_menu_ios.png')
//     : require('./assets/images/navicon_menu_ios.png');

async function prepareIcons() {
  const icons = await Promise.all([
    Icon.getImageSource('ios-menu', 25),
    Icon.getImageSource('ios-search', 20),
    Icon.getImageSource('ios-add-circle', 20),
    Icon.getImageSource('ios-heart', 20),
    Icon.getImageSource('ios-person', 20),
  ]);
  const [menuIcon, explore, create, notifications, profile] = icons;
  return {menuIcon, explore, create, notifications, profile};
}

const app = async paramMenu => {
  const icons = await prepareIcons();
  console.log('menuIcon', icons.menuIcon);
  if (paramMenu) {
    // 웹뷰버튼 유무 체크
    let winButton = [];
    if (
      paramMenu[0].screen === 'screen.ADM010106' ||
      paramMenu[0].screen === 'com.layout.ComMenu'
    ) {
      winButton = [
        {
          id: 'winsButton',
          component: {
            name: 'com.layout.WinsButton',
          },
        },
        {
          id: 'chatButton',
          component: {
            name: 'com.layout.ChattingButton',
          },
        },
        {
          id: 'notifiButton',
          component: {
            name: 'com.layout.NotificationButton',
          },
        },
      ];
    }

    Navigation.setDefaultOptions({
      statusBar: {
        backgroundColor: bluecolor.basicBlueColor,
      },
      layout: {
        direction: 'ltr', // Supported directions are: 'rtl', 'ltr'
        // 회전 방지
        // orientation: ['portrait'], // An array of supported orientations
      },
      // 웹뷰일때 탑바 제거
      topBar:
        paramMenu[0].swidget && paramMenu[0].swidget.indexOf('WV') > -1
          ? {
              visible: false,
              drawBehind: true,
              animate: false,
            }
          : {
              elevation: 0,
              noBorder: true,
              background: {
                color: bluecolor.basicBlueColor,
              },
              // background: Platform.OS !== 'ios' ? {
              //   // color: bluecolor.basicBlueColor,
              //   component: {
              //     name: 'com.layout.TopBar',
              //   },
              // } : {
              //   color: bluecolor.basicSkyLightBlueColor,
              // },
            },
    });
    await Navigation.setRoot({
      root: {
        sideMenu: {
          left: {
            component: {
              id: 'Drawer',
              name: 'com.layout.Drawer',
              passProps: {},
            },
          },

          center: {
            stack: {
              children: [
                {
                  component: {
                    name: paramMenu[0].screen,
                    passProps: {
                      text: 'stack with one child',
                    },
                    options: {
                      // 웹뷰일때 탑바 제거
                      topBar:
                        paramMenu[0].swidget &&
                        paramMenu[0].swidget.indexOf('WV') > -1
                          ? {
                              visible: false,
                              drawBehind: true,
                              animate: false,
                            }
                          : {
                              visible: true,
                              translucent: true,
                              title: {
                                alignment: 'center',
                                text: paramMenu[0].title,
                                fontSize: 14,
                                color: bluecolor.basicWhiteColor,
                              },
                              rightButtons: winButton,
                              leftButtons: [
                                {
                                  id: 'menuButton',
                                  icon: icons.menuIcon,
                                  color: bluecolor.basicWhiteColor,
                                },
                              ],
                            },
                      background: {
                        component: {
                          name: 'screen.common.LoginCheckScreen',
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    });
    //   Navigation.setRoot({
    //     root: {
    //       bottomTabs: {
    //         children: [
    //           {
    //             stack: {
    //               children: [
    //                 {
    //                   component: {
    //                     name: 'com.layout.MainScreen',
    //                     passProps: {
    //                       text: 'This is tab 1',
    //                     },
    //                   },
    //                 },
    //               ],
    //               options: {
    //                 bottomTab: {
    //                   text: 'HOME',
    //                   icon: mainTabIcons.home,
    //                   testID: 'FIRST_TAB_BAR_BUTTON',
    //                 },
    //               },
    //             },
    //           },
    //         ],
    //       },
    //       sideMenu: {
    //         left: {
    //           component: {
    //             name: 'com.layout.Drawer',
    //             passProps: {
    //               text: 'This is a left side menu screen',
    //             },
    //           },
    //         },
    //       },
    //     },
    //   });
  }
};
export default app;
