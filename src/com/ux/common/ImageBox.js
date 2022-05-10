/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, Image, Linking } from 'react-native';
import { React, bluecolor, env, Redux, NavigationScreen, Util } from 'libs';
/* *
 * Import node_modules
 * */
import Touchable from 'common/Touchable';
import { HIcon, ImageZoom } from 'ux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const envConfig = env();
const fetchURL = envConfig.fetchURL;

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */
class ImageBox extends NavigationScreen {
  constructor(props) {
    super(props);

    const { session } = props.global;

    this.state = {
      rotation: 0,
      componentId: this.props.componentId,
      title: this.props.title,
      source: this.props.source,
      companyCode: this.props.companyCode || session.COMPANY_CODE,
      fileMgtCode: this.props.fileMgtCode,
    };

    this.onDownloadImage = this.onDownloadImage.bind(this);
  }

  onDownloadImage() {
    // const sourceArr = this.state.source.split('/');
    // const fileMgtCode = sourceArr[sourceArr.length - 1];
    let sourceURL = this.state.source;
    // 우선 apicall로 다운받고 있지만 추후 변경 필요 JKM
    if (sourceURL && sourceURL.indexOf('file')) {
      sourceURL = Util.replaceAll(sourceURL, 'file', 'apicall');
    }
    Linking.openURL(
      // 'http://172.168.0.110:8080/api/file/getDownload/HTNS/MB/1561361881090',
      // `${Fetch.fetchURL}/api/file/getDownload/HTNS/MB/1564549320003`, // 1564468326234, 1561361881090, 1564549320003
      // 'https://wins.htns.com//api/file/getDownload/HTNS/TX/1564535402298',
      sourceURL,
    );
    Util.toastMsg('Download 폴더로 저장합니다.');
  }

  render() {
    const rotateLeftView = (
      <Touchable
        style={styles.rotationLeftStyle}
        onPress={() => {
          this.setState({
            rotation: this.state.rotation - 90,
          });
        }}
      >
        <HIcon name="rotate-left" size={20} color={bluecolor.basicWhiteColor} />
      </Touchable>
    );

    const rotateRightView = (
      <Touchable
        style={styles.rotationRightStyle}
        onPress={() => {
          this.setState({
            rotation: this.state.rotation + 90,
          });
        }}
      >
        <HIcon name="rotate-right" size={20} color={bluecolor.basicWhiteColor} />
      </Touchable>
    );

    const downloadView = (
      <Touchable
        style={styles.downloadStyle}
        onPress={() => {
          this.onDownloadImage();
        }}
      >
        <HIcon name="download" size={20} color={bluecolor.basicWhiteColor} />
      </Touchable>
    );

    return (
      <View style={styles.container}>
        {/* https://github.com/ascoders/react-native-image-zoom */}
        <ImageZoom
          cropWidth={screenWidth}
          cropHeight={screenHeight * 0.9}
          imageWidth={screenWidth}
          imageHeight={screenHeight}
          enableSwipeDown
          panToMove
        >
          <Image
            resizeMode={'contain'}
            style={{
              height: '100%',
              width: '100%', // Dimensions.get('window').width,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: `${this.state.rotation}deg` }],
            }}
            source={{
              uri: this.state.source
                ? this.state.source
                : `${fetchURL}/api/file/getDownload/${this.state.companyCode}/MB/${
                  this.state.fileMgtCode
                }`,
              headers: {
                'X-CSRF-TOKEN': globalThis.gToken,
                Cookie: globalThis.gCookie,
                // withCredentials: true,
              },
            }}
          />
        </ImageZoom>
        {rotateLeftView}
        {rotateRightView}
        {downloadView}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  rotationLeftStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: '3%',
    right: '10%',
  },
  rotationRightStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: '3%',
    right: '0%',
  },
  downloadStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    bottom: '3%',
    right: '0%',
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(ImageBox);
