import { combineReducers } from 'redux';

const messages = (state = null, action) => {
  switch (action.type) {
    case 'chat.message.add':
      return action.message;
    default:
      return state;
  }
};

const newalarm = (state = null, action) => {
  switch (action.type) {
    case 'chat.newalarm.add':
      return action.newalarm;
    default:
      return state;
  }
};

export default combineReducers({
  messages,
  newalarm,
});
