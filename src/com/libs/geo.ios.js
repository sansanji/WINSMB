/* eslint comma-dangle: ["never"] */
import _ from 'lodash';

const get = (success = () => {}, failure = () => {}) => {
  console.log('get geo');
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude: lat, longitude: lon } = position.coords;
      success(lat, lon);
    },
    error => {
      failure(error);
    },
    { enableHighAccuracy: true, timeout: 500, maximumAge: 0 }
  );
};

const watch = (success = () => {}, failure = () => {}) => {
  const watchID = navigator.geolocation.watchPosition(
    position => {
      const { latitude: lat, longitude: lon } = position.coords;
      success(lat, lon);
    },
    error => {
      failure(error);
    },
    { enableHighAccuracy: true, timeout: 500, maximumAge: 0 }
  );

  return watchID;
};

export default {
  get,
  watch,
};
