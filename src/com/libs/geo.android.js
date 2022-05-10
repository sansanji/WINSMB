/* eslint comma-dangle: ["never"] */
import _ from 'lodash';

const get = (success = () => {}, failure = () => {}) => {
  // console.log('get geo');
  success(0, 0);
};

const watch = (success = () => {}, failure = () => {}) => {


  return watchID;
};

export default {
  get,
  watch,
};
