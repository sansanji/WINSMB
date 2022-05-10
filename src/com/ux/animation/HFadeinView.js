/* *
 * Import Common
 * */
import {View} from 'react-native';
import {React} from 'libs';

/**
 * 페이드 효과 애니메이션
 */
class HFadeinView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 애니메이션
      // anim: new Animated.Value(0),
      time: this.props.time || 2,
    };
  }

  componentDidMount() {
    // Animated.timing(
    //   // Animate over time
    //   this.state.anim, // The animated value to drive
    //   {
    //     toValue: 1, // Animate to opacity: 1 (opaque)
    //     duration: this.state.time * 1000, // Make it take a while
    //     useNativeDriver: true,
    //   },
    // ).start(); // Starts the animation
  }

  shouldComponentUpdate() {
    return true;
  }

  render() {
    return (
      <View // Special animatable View</Animated.View>
        style={{
          opacity: this.state.anim, // Binds directly
        }}
        {...this.props}>
        {this.props.children}
      </View>
    );
  }
}
export default HFadeinView;
