/* *
 * Import Common
 * */
import ReduxStore from 'libs/store';
import { Util } from 'libs';
/* *
 * Import node_modules
 * */

/*
 * 모델 유틸 관련 라이브러리
 *
 */

// 모델 초기화
const initModel = () => {
  ReduxStore.dispatch({
    type: 'model.data.set',
    model: {},
  });
};
// 모델값 Json형태로 셋팅
const setModelData = (modelKey, pdata) => {
  const { data } = ReduxStore.getState().model;

  if (modelKey) {
    ReduxStore.dispatch({
      type: 'model.data.set',
      model: { [modelKey]: pdata },
    });
    // 한번더 전체 데이터에 기존데이터와 함께 넣어주는 작업 필요(화면에 변화를 일으키기위함)
    setGlobalModel(data, { [modelKey]: pdata });
  }
};

// 모델값 Json형태로 리턴
const getModelData = modelKey => {
  if (modelKey) {
    const { data } = ReduxStore.getState().model;
    let result = {};
    if (data) {
      result = data[modelKey];
    }
    return result;
  }
};

// 바인드값 리턴
const getValue = tagetBind => {
  let result = '';
  if (tagetBind) {
    const { data } = ReduxStore.getState().model;
    const modelKeyValue = getKeyName(tagetBind);
    const modelKey = modelKeyValue.modelKey;
    const name = modelKeyValue.name;
    if (data) {
      if (data[modelKey]) {
        result = data[modelKey][name];
      }
    }
    if (Util.isEmpty(result) || result === undefined) {
      result = '';
    }

    return result;
  }
  return result;
};

// 바인드된 키랑 값 리턴
const getKeyName = tagetBind => {
  if (tagetBind) {
    const modelKey = tagetBind.slice(0, tagetBind.indexOf('.'));
    const name = tagetBind.slice(tagetBind.indexOf('.') + 1);

    return { modelKey, name };
  }
};

// 모델에 데이터 셋팅
const setValue = (bind, newValue, isNumber) => {
  if (bind) {
    const { data } = ReduxStore.getState().model;
    const modelKeyValue = getKeyName(bind);
    const modelKey = modelKeyValue.modelKey;
    const name = modelKeyValue.name;

    const parentData = data[modelKey];
    let result = newValue;
    if (isNumber) {
      result = Util.replaceAll(newValue, ',', '');
      result = Number(result);
    }

    if (parentData) {
      // Object.assign(parentData, { [name]: result });
      ReduxStore.dispatch({
        type: 'model.data.set',
        model: { ...data, ...{ [modelKey]: { ...parentData, [name]: result } } },
      });
      // 한번더 전체 데이터에 기존데이터와 함께 넣어주는 작업 필요
      // setGlobalModel(data, { [modelKey]: { ...parentData, [name]: result } });
    }
  }
};

// 기존 모델 데이터와 합쳐준다.
const setGlobalModel = (oldData, newData) => {
  // if (oldData) {
  //   Object.assign(oldData, newData);
  ReduxStore.dispatch({
    type: 'model.data.set',
    model: { ...oldData, ...newData },
  });
  // }
};

// 데이터 모델을 지워준다.
const delGlobalModel = targetModel => {
  const { data } = ReduxStore.getState().model;
  if (data) {
    if (Object.keys(data).length > 0) {
      delete data[targetModel];

      ReduxStore.dispatch({
        type: 'model.data.set',
        model: { ...data },
      });
    }
  }
  // }
};

export default {
  initModel,
  setModelData,
  getModelData,
  getValue,
  getKeyName,
  setValue,
  setGlobalModel,
  delGlobalModel,
};
