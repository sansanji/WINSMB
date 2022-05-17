// import { ScreenVisibilityListener } from 'react-native-navigation';

/**
 * Import components for screen
 */
import layout from 'com/layout';
import common from 'com/ux/common';
import adm from 'screens/adm';
import fms from 'screens/fms';
import wms from 'screens/wms';
import tms from 'screens/tms';
import dms from 'screens/dms';
import cbt from 'screens/cbt';

export function registerScreens(store, Provider) {
  debugger;
  layout(store, Provider);
  common(store, Provider);
  adm(store, Provider);
  fms(store, Provider);
  wms(store, Provider);
  tms(store, Provider);
  dms(store, Provider);
  cbt(store, Provider);
}

// export function registerScreenVisibilityListener() {
//   new ScreenVisibilityListener({
//     willAppear: ({ screen }) => {
//       // console.log('ScreenVisibilityListener', `willAppear ${screen}`);
//     },
//     didAppear: ({ screen, startTime, endTime, commandType }) => {
//       // console.log('ScreenVisibilityListener', `didAppear ${screen}`);
//       // console.log(
//       //   'screenVisibility',
//       //   `Screen ${screen} displayed in ${endTime - startTime} millis [${commandType}]`,
//       // );
//     },
//     willDisappear: ({ screen }) => {
//       // console.log('ScreenVisibilityListener', `willDisappear ${screen}`);
//     },
//     didDisappear: ({ screen }) => {
//       // console.log('ScreenVisibilityListener', `didDisappear ${screen}`);
//     },
//   }).register();
// }
