/* *
 * Import Common
 * */
import { React, bluecolor } from 'libs';
import { Image } from 'react-native';
/**
 * 백그라운드 이미지 관련 컴퍼넌트
 */
const loading = require('assets/images/feel-back6.png');
const loadingcar = require('assets/images/feel-back7.png');
const truck = require('assets/images/feel-back8.png');
const plane = require('assets/images/feel-back9.png');
const ship = require('assets/images/feel-back10.png');

const finalSource = [loading, loadingcar, truck, plane, ship];

const BackImage = () => {
  const D = new Date();
  // let soruce = _.get(finalSource, 'loading', '');
  const backIndex = D.getMinutes() % 4;
  const source = finalSource[backIndex];

  return (
    <Image
      source={source}
      style={{
        flex: 1,
        position: 'absolute',
        resizeMode: 'cover',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: bluecolor.basicTrans,
      }}
    />
  );
};

export default BackImage;
