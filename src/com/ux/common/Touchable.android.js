/* *
 * Import Common
 * */
import { TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import { React } from 'libs';
/* *
 * 터치 컴포넌트
 * */
const Button = props => (
  <TouchableOpacity
    delayPressIn={0}
    activeOpacity={0.5}
    background={TouchableNativeFeedback.SelectableBackground()} // eslint-disable-line new-cap
    {...props}
  >
    {props.children}
  </TouchableOpacity>
);

module.exports = Button;
