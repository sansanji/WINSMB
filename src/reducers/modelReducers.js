import { combineReducers } from 'redux';

const data = (state = {}, action) => {
  switch (action.type) {
    case 'model.data.set':
      return action.model;
    default:
      return state;
  }
};

export default combineReducers({
  data,
});
