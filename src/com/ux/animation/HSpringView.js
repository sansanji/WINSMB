/* *
 * Import Common
 * */
import { Animated } from 'react-native';
import { React } from 'libs';

/**
 * 스프링 효과 애니메이션
 */

const SPRING_CONFIG = { tension: 2, friction: 3 };
/**
 * Y축으로 이동하는 컴포넌트
 */
class HSpringView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 애니메이션
      anim: new Animated.Value(0),
      time: this.props.time || 1,
    };
  }

  componentDidMount() {
    Animated.spring(
      // Animate over time
      this.state.anim, // The animated value to drive
      {
        toValue: 1, // Animate to opacity: 1 (opaque)
        friction: 1, // Make it take a while
        useNativeDriver: true,
      },
    ).start(); // Starts the animation
  }

  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <Animated.View // Special animatable View</Animated.View>
        style={{ transform: [{ scale: this.state.anim }] }}
        {...this.props}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
export default HSpringView;
