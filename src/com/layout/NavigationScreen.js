/**
 * Import default modules
 */
import React from 'react';
import { ReduxStore, modelUtil } from 'libs';
import { Navigation } from 'react-native-navigation';
/**
 * 스크린에서 사용하는 공통 슈퍼 클래스
 */
class NavigationScreen extends React.Component {
  constructor(props, screenId) {
    super(props);
    Navigation.events().bindComponent(this);
    this.screenId = screenId;
    // ReduxStore.dispatch({
    //   type: 'global.navigator.set',
    //   navigator: this.props.navigator,
    // });

    // 윅스 네이티브 네비게이션의 이벤트를 바인딩하고 있다.
    // 아래의 이벤트는 화면이 숨겨지거나 보여지거나 할때 이벤트를 발생시킨다.
    // Navigation.setOnNavigatorEvent(e => this._onNavigatorEvent(e));
  }

  componentWillUnmount() {
    const { screenId } = this;
    // 모델 초기화
    modelUtil.delGlobalModel(screenId);
  }
  componentDidAppear(nextPros) {
    console.log(this.props);
    ReduxStore.dispatch({
      type: 'global.navigator.set',
      navigator: Navigation,
    });
  }

  // 네이티브 버튼 이벤트
  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'menuButton') {
      Navigation.mergeOptions('Drawer', {
        sideMenu: {
          left: {
            visible: true,
          },
        },
      });
    }

    if (buttonId === 'backButton') {
      Navigation.dismissModal(this.props.componentId);
    }
  }

  // _onNavigatorEvent(e) {
  //   // console.log('NavigationScreen', this.screenId, e);
  //   const { screenId } = this;
  //   // const { navigator } = this.props;

  //   console.log('NavigationScreen', screenId, e.id);

  //   // 윅스 네이티브 네비게이션에서 주는 이벤트
  //   if (e.id === 'willAppear') {
  //     // 더블 터치에 의한 두번 띄움 방지를 위한 로직
  //     // Navigation.setCurrentScreen(screenId);
  //     // if (this.props.testID === 'com.layout.MainScreen') {
  //     ReduxStore.dispatch({
  //       type: 'global.navigator.set',
  //       navigator: this.props.navigator,
  //     });
  //     // }
  //   }
  // }
}

export default NavigationScreen;
