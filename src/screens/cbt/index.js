import { Navigation } from 'react-native-navigation';

import CBT100101 from './CBT100101'; // CBT 무게스캔화면
import React from 'react';

export default (store, Provider) => {
  Navigation.registerComponent(
    'screen.CBT100101',
    () => props => (
      <Provider store={store}>
        <CBT100101 {...props} />
      </Provider>
    ),
    () => CBT100101,
  );
};
