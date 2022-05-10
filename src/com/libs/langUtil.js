/* *
 * Import Common
 * */
import ReduxStore from 'libs/store';
import _ from 'lodash';
/* *
 * Import node_modules
 * */

/*
 * 모델 유틸 관련 라이브러리
 *
 */

// 다국어 처리할 msgId에 대한 Name을 리턴한다.
const get = (cmp, msgId) => {
  let message = null;
  if (cmp) {
    if (cmp.props.global) {
      message = cmp.props.global.message;
    }
  } else {
    message = ReduxStore.getState().global.message;
  }

  let msgContents = null;
  msgContents = _.get(message, `[${msgId}].msg_contents`, null);

  return msgContents;
};

export default {
  get,
};
