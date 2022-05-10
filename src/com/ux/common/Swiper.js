/* *
 * Import Common
 * */
import { View, React, Image, Dimensions } from 'react-native';
import { Component } from 'react';
/* *
 * Import node_modules
 * */
// import Swiper from 'react-native-swiper';
/**
 * 스위퍼 컴포넌트
 */
const { width } = Dimensions.get('window');
const loading = require('assets/images/loading.gif');

const styles = {
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width,
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingView: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,.5)',
  },

  loadingImage: {
    width: 60,
    height: 60,
  },
};

const Slide = props => (
  <View style={styles.slide}>
    <Image
      onLoad={props.loadHandle.bind(null, props.i)}
      style={styles.image}
      source={{ uri: props.uri,
        headers: {
          'X-CSRF-TOKEN': globalThis.gToken,
          Cookie: globalThis.gCookie,
          // withCredentials: true,
        } }}
    />
    {!props.loaded && (
      <View style={styles.loadingView}>
        <Image style={styles.loadingImage} source={loading} />
      </View>
    )}
  </View>
);

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgList: props.images || [],
      loadQueue: [0, 0, 0, 0],
    };
    this.loadHandle = this.loadHandle.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ imgList: nextProps.images });
  }
  loadHandle(i) {
    const loadQueue = this.state.loadQueue;
    loadQueue[i] = 1;
    this.setState({
      loadQueue,
    });
  }
  render() {
    return <View style={this.props.style} />;
  }
}
