/* *
 * Import Common
 * */
import { TouchableOpacity } from 'react-native';
import { React } from 'libs';
/* *
 * 터치 컴포넌트
 * */

class Touchable extends React.Component {
  render() {
    return (
      <TouchableOpacity
        shouldRasterizeIOS
        accessible
        accessibilityTraits="button"
        underlayColor={'#cccccc'}
        {...this.props}
      >
        {this.props.children}
      </TouchableOpacity>
    );
  }
}
module.exports = Touchable;
