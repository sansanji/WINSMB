import {Navigation} from 'react-native-navigation';

import DrawerButton from './DrawerButton';
import ChattingButton from './ChattingButton';
import NotificationButton from './NotificationButton';
import WinsButton from './WinsButton';
import Drawer from './Drawer';
import MainScreen from './MainScreen';
import MainScreenWins from './MainScreenWins';
import MainScreenPortal from './MainScreenPortal';
import LoginPage from './LoginPage';
import ComMenu from './ComMenu';
import TopBar from './TopBar';
import ComBarcode from './ComBarcode';
import ComWebView from './ComWebView';
import PortalWebView from './PortalWebView';
import React from 'react';

export default (store, Provider) => {
  Navigation.registerComponent(
    'com.layout.DrawerButton',
    () => props =>
      (
        <Provider store={store}>
          <DrawerButton {...props} />
        </Provider>
      ),
    () => DrawerButton,
  );
  Navigation.registerComponent(
    'com.layout.ChattingButton',
    () => props =>
      (
        <Provider store={store}>
          <ChattingButton {...props} />
        </Provider>
      ),
    () => ChattingButton,
  );
  Navigation.registerComponent(
    'com.layout.WinsButton',
    () => props =>
      (
        <Provider store={store}>
          <WinsButton {...props} />
        </Provider>
      ),
    () => WinsButton,
  );
  Navigation.registerComponent(
    'com.layout.NotificationButton',
    () => props =>
      (
        <Provider store={store}>
          <NotificationButton {...props} />
        </Provider>
      ),
    () => NotificationButton,
  );
  Navigation.registerComponent(
    'com.layout.Drawer',
    () => props =>
      (
        <Provider store={store}>
          <Drawer {...props} />
        </Provider>
      ),
    () => Drawer,
  );
  Navigation.registerComponent(
    'com.layout.MainScreen',
    () => props =>
      (
        <Provider store={store}>
          <MainScreen {...props} />
        </Provider>
      ),
    () => MainScreen,
  );
  Navigation.registerComponent(
    'com.layout.MainScreenWins',
    () => props =>
      (
        <Provider store={store}>
          <MainScreenWins {...props} />
        </Provider>
      ),
    () => MainScreenWins,
  );
  Navigation.registerComponent(
    'com.layout.MainScreenPortal',
    () => props =>
      (
        <Provider store={store}>
          <MainScreenPortal {...props} />
        </Provider>
      ),
    () => MainScreenPortal,
  );

  Navigation.registerComponent(
    'com.layout.LoginPage',
    () => props =>
      (
        <Provider store={store}>
          <LoginPage {...props} />
        </Provider>
      ),
    () => LoginPage,
  );
  Navigation.registerComponent(
    'com.layout.ComMenu',
    () => props =>
      (
        <Provider store={store}>
          <ComMenu {...props} />
        </Provider>
      ),
    () => ComMenu,
  );
  Navigation.registerComponent(
    'com.layout.TopBar',
    () => props =>
      (
        <Provider store={store}>
          <TopBar {...props} />
        </Provider>
      ),
    () => TopBar,
  );
  Navigation.registerComponent(
    'com.layout.ComBarcode',
    () => props =>
      (
        <Provider store={store}>
          <ComBarcode {...props} />
        </Provider>
      ),
    () => ComBarcode,
  );
  Navigation.registerComponent(
    'com.layout.ComWebView',
    () => props =>
      (
        <Provider store={store}>
          <ComWebView {...props} />
        </Provider>
      ),
    () => ComWebView,
  );
  Navigation.registerComponent(
    'com.layout.PortalWebView',
    () => props =>
      (
        <Provider store={store}>
          <PortalWebView {...props} />
        </Provider>
      ),
    () => PortalWebView,
  );

  // Navigation.registerComponentWithRedux(
  //   'com.layout.DrawerButton',
  //   () => DrawerButton,
  //   Provider,
  //   store,
  // );
  // Navigation.registerComponentWithRedux(
  //   'com.layout.ChattingButton',
  //   () => ChattingButton,
  //   Provider,
  //   store,
  // );
  // Navigation.registerComponentWithRedux(
  //   'com.layout.NotificationButton',
  //   () => NotificationButton,
  //   store,
  //   Provider,
  // );
  // Navigation.registerComponentWithRedux('com.layout.Drawer', () => Drawer, Provider, store);
  // Navigation.registerComponentWithRedux('com.layout.MainScreen', () => MainScreen, Provider, store);
  // Navigation.registerComponentWithRedux('com.layout.LoginPage', () => LoginPage, Provider, store);
  // Navigation.registerComponentWithRedux('com.layout.ComMenu', () => ComMenu, Provider, store);
};
