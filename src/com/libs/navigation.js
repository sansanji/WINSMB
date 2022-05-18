import {Navigation} from 'react-native-navigation';
import {Platform} from 'react-native';
import bluecolor from 'styles/theme-color-blue';
/**
 * import nav styles
 */
import navigatorStyle from 'styles/navigator';
import Icon from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import debounce from 'debounce';

const pushMethod = 'showModal';
const popMethod = 'dismissModal';

async function prepareIcons() {
  const icons = await Promise.all([
    Icon.getImageSource('ios-arrow-back-circle', 25),
  ]);
  const [backIcon] = icons;
  return {backIcon};
}

const NAVIGATOR_HANDLERS = {
  LoginPage: (navigator, passProps) => {
    Navigation[pushMethod]({
      screen: 'com.layout.LoginPage',
      title: 'Login',
      passProps,
    });
  },
  FMS010101T: (navigator, passProps) => {
    Navigation[pushMethod]({
      screen: 'screen.FMS010101T',
      title: 'AE EDI List',
      passProps,
      navigatorStyle,
    });
  },
  FMS010105: (navigator, passProps) => {
    Navigation[pushMethod]({
      screen: 'screen.FMS010105',
      title: 'EDI Send History',
      passProps,
      navigatorStyle,
    });
  },
  /*
  G1M screen 모음 시작
  */

  /*
  G1M Mobile screen 모음 끝
  */
  ELSE: (navigator, passProps) => {
    Navi(navigator, 'ALERT', passProps);
  },
  ALERT: (navigator, passProps) => {
    // navigator.showLightBox({
    //   screen: 'common.LightBox',
    //   passProps,
    //   style: {
    //     backgroundBlur: 'dark',
    //     backgroundColor: 'rgba(0, 0, 0, 0.7)',
    //     tapBackgroundToDismiss: false, // 팝업 영역 밖에 터치 시에도 유지, 오직 "확인" 버튼을 눌렀을 때만 반응하기!
    //   },
    // });
    navigator.showOverlay({
      component: {
        name: 'common.LightBox',
        passProps,
        options: {
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
  },
  // CALENDAR: (navigator, passProps) => {
  //   Navigation[pushMethod]({
  //     screen: 'common.Calendar',
  //     title: 'Select Date',
  //     passProps,
  //     navigatorStyle,
  //   });
  // },
  POP: componentId => {
    Navigation[popMethod](componentId);
  },
};

const Navi = async (navigator, code, passProps, title) => {
  // 창이 실행 될때마다 prevScreen 값이 바뀌는데
  // 이전에 실행했던 screen값과 현재 실행한 screen 코드 값이 같으면
  // 두번 실행으로 간주하고 실행을 중단한다.
  // if (prevScreen === code) {
  //   return;
  // }
  console.log(
    '<----------------------Start------------------------->',
    title,
    `screen : ${code}`,
  );
  this.openNavi = debounce(this.openNavi.bind(this), 1000, true);
  if (NAVIGATOR_HANDLERS[code]) {
    // 다음지도는 전체 어플리케이션에서 하나만 유지 할 수 있다.
    // 지도를 표시하기 위해 이동하는 스크린 아이디를 리덕스에 Dispatch한다.
    // 스크린아이디가 해제 되면(화면이 다른곳으로 이동, 모달 또는 푸시)
    NAVIGATOR_HANDLERS[code](navigator, passProps);
  } else {
    this.openNavi(navigator, code, passProps, title);
  }
};

this.openNavi = async (navigator, code, passProps, title) => {
  const icons = await prepareIcons();
  Navigation[pushMethod]({
    stack: {
      children: [
        {
          component: {
            name: code,
            passProps,
            options: {
              modalPresentationStyle: 'overCurrentContext',
              topBar: {
                elevation: 0,
                visible: true,
                translucent: true,
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
                title: {
                  alignment: 'center',
                  text: title,
                  fontSize: 14,
                  color: bluecolor.basicWhiteColor,
                },
                leftButtons: [
                  {
                    id: 'backButton',
                    icon: icons.backIcon,
                    fontSize: 14,
                    color: bluecolor.basicWhiteColor,
                  },
                ],
              },
            },
          },
        },
      ],
    },
  });
};

export default Navi;
