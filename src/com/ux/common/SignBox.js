/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { React, bluecolor, ReduxStore, Util, Upload } from 'libs';
/* *
 * Import node_modules
 * */
import HButton from 'components/Buttons/HButton';
import Touchable from 'common/Touchable';
import { HIcon, HText } from 'ux';

import SignatureCapture from 'react-native-signature-capture';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */
class SignBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentId: this.props.componentId,
      refType: this.props.refType,
      sFuncCode: this.props.sFuncCode,
      title: this.props.title,
      refNo: this.props.refNo,
      companyCode: this.props.companyCode,
    };
    this._onSaveEvent = this._onSaveEvent.bind(this);
    this.signRef = null;
  }

  _onSaveEvent(result) {
    // result.encoded - for the base64 encoded png
    // result.pathName - for the file path name
    // console.log(result);

    const { navigator, session } = ReduxStore.getState().global;
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const fileConfig = {
      pickType: 'IMAGE',
      callView: 'SignBox',
      fileUri: Platform.OS === 'ios' ? result.pathName : `file://${encodeURI(result.pathName)}`,
      fileType: null,
      fileName: null,
      fileSize: 50, // 5MB이하만 업로드 처리가능하지만, Sign 정보는 파일사이즈 정보를 알 수 없어서 "50KB"으로 정한다. (무조건적 Pass 처리!)
    };

    Upload({
      refType: this.props.refType || 'RM',
      sFuncCode: this.props.sFuncCode || 'MB',
      companyCode: this.props.companyCode || session.COMPANY_CODE, // 'HTNS',
      refNo: this.props.refNo || this.state.refNo, // 'SR190203666',
      fileConfig,
      onProgress: progress => {
        console.log('fetch-log', 'file uploaded progress', progress);
      },
      onSuccess: (res, resJson) => {
        console.log('file uploaded onSuccess (res)', res);
        console.log('file uploaded onSuccess (resJson)', resJson);
        Util.toastMsg('Execution Success!');
        Util.openLoader(this.screenId, false); // Loader View 닫기!
        navigator.dismissOverlay(this.props.componentId || this.state.componentId);
      },
      onError: err => {
        console.log('fetch-log', 'file uploaded error', err);
        Util.toastMsg('Execution Failure!');
        Util.openLoader(this.screenId, false); // Loader View 닫기!
        navigator.dismissOverlay(this.props.componentId || this.state.componentId);
      },
    });
  }

  _onDragEvent() {
    // This callback will be called when the user enters signature
    // console.log('dragged');
  }

  saveSign() {
    this.signRef.saveImage();
    if (this.props.onSaveComplete) {
      this.props.onSaveComplete();
    }
  }

  resetSign() {
    this.signRef.resetImage();
  }

  render() {
    const { navigator } = ReduxStore.getState().global;

    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <View style={styles.cancelBtnStyle}>
            <HText textStyle={{ fontWeight: 'bold' }}>{this.props.title}</HText>
            <Touchable
              onPress={() => {
                navigator.dismissOverlay(this.props.componentId);
              }}
            >
              <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
            </Touchable>
          </View>

          <SignatureCapture
            style={styles.signature}
            ref={ref => {
              this.signRef = ref;
            }}
            onSaveEvent={this._onSaveEvent}
            onDragEvent={this._onDragEvent}
            // saveImageFileInExtStorage={false}
            // https://github.com/RepairShopr/react-native-signature-capture/pull/88
            /* ==> In Android, the signature PNG file is never saved to the file system
            unless the saveImageFileInExtStorage prop is set to true. This is not currently true of iOS,
            though. In iOS, the image file is always saved to the file system, even if
            saveImageFileInExtStorage is set to false. (This is especially problematic is
              there are legal restrictions for an app that prevent the signature from
              being saved to the device's file system.) */
            saveImageFileInExtStorage
            showNativeButtons={false}
            showTitleLabel={false}
            viewMode={'portrait'}
          />

          <View style={styles.buttonGropuStyle}>
            <HButton
              title={'Clear'}
              name={'undo'}
              onPress={() => this.resetSign()}
              bStyle={{
                backgroundColor: bluecolor.basicRedColor,
              }}
            />
            <HButton title={'Confirm'} name={'check-circle-o'} onPress={() => this.saveSign()} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnStyle: {
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.7,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
  },
  buttonGropuStyle: {
    // flex: 1,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // 'flex-end',
  },
  signature: {
    flex: 1,
    borderColor: '#000033',
    borderWidth: 1,
  },
});

export default SignBox;
