import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import globalReducers from 'reducers/globalReducers';
// import filterReducers from 'reducers/filterReducers';
import chatReducers from 'reducers/chatReducers';
// import mapReducers from 'reducers/mapReducers';
import modelReducers from 'reducers/modelReducers';

import {persistStore, persistReducer} from 'redux-persist';
// import storage from 'redux-persist/es/storage'; // default: localStorage if web, AsyncStorage if react-native
import AsyncStorage from '@react-native-async-storage/async-storage';

const globalPersistConfig = {
  key: 'global',
  storage: AsyncStorage,
  // blacklist: [], // 저장하기 싫은 키들
  whitelist: [
    'token',
    'theme',
    'config',
    'location',
    'message',
    'activeTab',
    'vendorcode',
    'whcode',
    'vendorcode',
    'dmsWhcode',
    'dmsVendorcode',
  ], // 이 값들만 저장
};

const chatPersistConfig = {
  key: 'chat',
  storage: AsyncStorage,
  blacklist: [], // 저장하기 싫은 키들
  whitelist: ['messages', 'newalarm'],
};

const modelPersistConfig = {
  key: 'model',
  storage: AsyncStorage,
  blacklist: ['data'], // 저장하기 싫은 키들
  whitelist: [],
};

const rootReducers = combineReducers({
  // Add sync reducers here
  // global: globalReducers,
  // filter: filterReducers,
  // chat: chatReducers,
  global: persistReducer(globalPersistConfig, globalReducers),
  // filter: persistReducer(filterPersistConfig, filterReducers),
  chat: persistReducer(chatPersistConfig, chatReducers),
  // map: persistReducer(mapPersistConfig, mapReducers),
  model: persistReducer(modelPersistConfig, modelReducers),
});
const middlewares = [thunk];

if (__DEV__ === true) {
  middlewares.push(logger);
}

const store = createStore(rootReducers, {}, applyMiddleware(...middlewares));
const persistor = persistStore(store);

export default store;
