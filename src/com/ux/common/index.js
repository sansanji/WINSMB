import { Navigation } from 'react-native-navigation';

import Calendar from './Calendar';
import ComboBox from './ComboBox';
import GridComboBox from './GridComboBox';
import LightBox from './LightBox';
import MsgBox from './MsgBox';
import WriteBox from './WriteBox';
import LoginCheckScreen from './LoginCheckScreen';
import Loader from './Loader';
import SignBox from './SignBox';
import BarcodeBox from './BarcodeBox';
import ApprovalBox from './ApprovalBox';
import ImageBox from './ImageBox';
import React from 'react';

export default (store, Provider) => {
  Navigation.registerComponent(
    'common.Calendar',
    () => props => (
      <Provider store={store}>
        <Calendar {...props} />
      </Provider>
    ),
    () => Calendar,
  );
  Navigation.registerComponent(
    'common.ComboBox',
    () => props => (
      <Provider store={store}>
        <ComboBox {...props} />
      </Provider>
    ),
    () => ComboBox,
  );
  Navigation.registerComponent(
    'common.GridComboBox',
    () => props => (
      <Provider store={store}>
        <GridComboBox {...props} />
      </Provider>
    ),
    () => GridComboBox,
  );
  Navigation.registerComponent(
    'common.LightBox',
    () => props => (
      <Provider store={store}>
        <LightBox {...props} />
      </Provider>
    ),
    () => LightBox,
  );
  Navigation.registerComponent(
    'common.MsgBox',
    () => props => (
      <Provider store={store}>
        <MsgBox {...props} />
      </Provider>
    ),
    () => MsgBox,
  );
  Navigation.registerComponent(
    'common.WriteBox',
    () => props => (
      <Provider store={store}>
        <WriteBox {...props} />
      </Provider>
    ),
    () => WriteBox,
  );
  Navigation.registerComponent(
    'screen.common.LoginCheckScreen',
    () => props => (
      <Provider store={store}>
        <LoginCheckScreen {...props} />
      </Provider>
    ),
    () => LoginCheckScreen,
  );
  Navigation.registerComponent(
    'common.Loader',
    () => props => (
      <Provider store={store}>
        <Loader {...props} />
      </Provider>
    ),
    () => Loader,
  );
  Navigation.registerComponent(
    'common.SignBox',
    () => props => (
      <Provider store={store}>
        <SignBox {...props} />
      </Provider>
    ),
    () => SignBox,
  );
  Navigation.registerComponent(
    'common.BarcodeBox',
    () => props => (
      <Provider store={store}>
        <BarcodeBox {...props} />
      </Provider>
    ),
    () => BarcodeBox,
  );
  Navigation.registerComponent(
    'common.ApprovalBox',
    () => props => (
      <Provider store={store}>
        <ApprovalBox {...props} />
      </Provider>
    ),
    () => ApprovalBox,
  );
  Navigation.registerComponent(
    'common.ImageBox',
    () => props => (
      <Provider store={store}>
        <ImageBox {...props} />
      </Provider>
    ),
    () => ImageBox,
  );
};
