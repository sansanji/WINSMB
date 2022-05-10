const devConfig = require('constants/config.dev.json');
const prdConfig = require('constants/config.prd.json');

// const config = __DEV__ !== true ? devConfig : prdConfig;
const config = prdConfig;

const env = () => config;
export default env;
