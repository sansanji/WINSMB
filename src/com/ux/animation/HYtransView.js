/* *
 * Import Common
 * */
import { Animated } from 'react-native';
import { React } from 'libs';
/**
 * Y축 이동 효과 애니메이션
 */

/**
 * Y축으로 이동하는 컴포넌트
 */
class HYtransView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 애니메이션
      anim: new Animated.Value(0),
      time: this.props.time || 3,
    };
    Animated.timing(
      // Animate over time
      this.state.anim, // The animated value to drive
      {
        toValue: 1, // Animate to opacity: 1 (opaque)
        duration: this.state.time * 1000, // Make it take a while
        useNativeDriver: true,
      },
    ).start(); // Starts the animation
  }

  componentDidMount() {}

  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <Animated.View // Special animatable View</Animated.View>
        style={{
          opacity: this.state.anim, // Binds directly
          transform: [
            {
              translateY: this.state.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [150, 0], // 0 : 150, 0.5 : 75, 1 : 0
              }),
            },
          ],
        }}
        {...this.props}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
export default HYtransView;
