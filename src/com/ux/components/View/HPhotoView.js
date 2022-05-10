/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, Image, Keyboard } from 'react-native';
import React from 'react';
import { bluecolor, env, Upload } from 'libs';
import Touchable from 'common/Touchable';
import HText from 'components/Form/Text/HText';
import HButton from 'components/Buttons/HButton';
import { HIcon } from 'ux';
/* *
 * Import node_modules
 * */
import ImagePicker from 'react-native-image-picker';
import ScrollableTabView, { ScrollableTabBar } from 'components/View/TabView';
import { Util } from 'src/com/libs';

const envConfig = env();
const fetchURL = envConfig.fetchURL;
/**
 * 기본 폼뷰 컴포넌트(사진을 볼수있는 이미지 뷰어)
 * @param {Function} onPressed - 사진이 눌러졌을때 이벤트(FILE_MGT_CODE값 리턴)
 * @param {Function} onSuccess - 사진업로드가 성공했을때 발생 이벤트(res, source값 리턴)
 * @param {Boolean} isAttachable - 버튼 표시 유무(기본값은 false)
 * @param {JSONObject} PhotoData - 사진정보를 넘긴다(COMPANY_CODE, FILE_MGT_CODE, ADD_DATE, ADD_USER_NAME)
 * @param {Styles} style - 뷰어의 컨테이너 스타일 지정
 * @example
 * <HPhotoView
 style={{ flex: 3.5 }}
 isAttachable
 PhotoData={modelUtil.getModelData('TEMPPHOTO')}
 onSuccess={() => {
   this.fetch('TIR19010002');
 }}
/>
 */

class HPhotoView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onSavePhoto() {
    Keyboard.dismiss();
    const { REF_NO } = this.props;
    const options = {
      title: 'Choose Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      onSuccess: (res, source) => {
        console.log('file uploaded success', res, source);
        this.props.onSuccess(res, source);
      },
    };

    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.uri;

        const fileConfig = {
          pickType: 'IMAGE',
          callView: 'HPhotoView',
          fileUri: response.uri,
          fileType: response.path,
          fileName: response.fileName,
          fileSize: response.fileSize || 0,
        };

        Upload({
          companyCode: 'HTNS',
          refNo: REF_NO, // 'cdyoo42',
          refType: 'RM',
          sFuncCode: 'MB',
          fileConfig,
          onProgress: progress => {
            if (options.onSuconProgresscess) {
              options.onProgress(progress, source);
            }
          },
          onSuccess: res => {
            console.log('file uploaded onSuccess', res);
            if (options.onSuccess) {
              options.onSuccess(res, source);
            }
          },
          onError: err => {
            console.log('file uploaded onError', err);
            if (options.onError) {
              options.onError(err, source);
            }
          },
        });
      }
    });
  }

  onImageBoxPopup(companyCode, fileMgtCode) {
    const title = 'ImageBox'; // 팝업 타이트 설정 값
    const source = `${fetchURL}/api/file/getDownload/${companyCode}/MB/${fileMgtCode}`;

    Util.imageBox(title, source, companyCode, fileMgtCode);
  }

  render() {
    const photoItem = this.props.photoList.map((item, i) => (
      <Touchable
        key={i}
        style={{
          height: '100%',
          width: Dimensions.get('window').width,
          alignItems: 'center',
        }}
        onPress={() => {
          if (this.props.onPressed) {
            this.props.onPressed(item, i);
          }
        }}
        tabLabel={`${i + 1}`}
      >
        <Image
          resizeMode={'stretch'}
          style={{
            height: Dimensions.get('window').height, // '100%',
            width: Dimensions.get('window').width,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 100,
          }}
          source={{
            uri: `${fetchURL}/api/file/getDownload/${item.COMPANY_CODE}/MB/${item.FILE_MGT_CODE}`,
            headers: {
              'X-CSRF-TOKEN': globalThis.gToken,
              Cookie: globalThis.gCookie,
              // withCredentials: true,
            },
          }}
        />
        <View style={styles.layoutText}>
          <HText textStyle={styles.textTitle}>{item.ADD_DATE}</HText>
          <HText textStyle={styles.textCaption}>{item.ADD_USER_NAME}</HText>
        </View>

        <Touchable
          style={styles.expandImageStyle}
          onPress={() => {
            this.onImageBoxPopup(item.COMPANY_CODE, item.FILE_MGT_CODE);
          }}
        >
          <HIcon name="search-plus" size={20} color={bluecolor.basicWhiteColor} />
        </Touchable>
      </Touchable>
    ));

    return (
      <View style={[styles.container, this.props.style]}>
        <ScrollableTabView
          tabBarPosition={'overlayBottom'}
          style={styles.tabContainer}
          tabBarBackgroundColor={bluecolor.basicBlueColorTrans}
          tabBarInactiveTextColor={bluecolor.basicWhiteColor}
          tabBarActiveTextColor={bluecolor.basicYellowColor}
          tabBarUnderlineStyle={{ backgroundColor: null }}
          renderTabBar={() => <ScrollableTabBar />}
          tabBarTextStyle={{ fontSize: 16 }}
          onChangeTab={selectTab => {
            // 탭을 선택할때 이벤트 발생
            if (this.props.onChangeTab) {
              this.props.onChangeTab(selectTab);
            }
          }}
        >
          {photoItem}
        </ScrollableTabView>
        {this.props.isAttachable ? (
          <HButton
            onPress={() => {
              this.onSavePhoto();
            }}
            name={'image'}
            title={'Take a Photo'}
            bStyle={{
              backgroundColor: bluecolor.basicRedColor,
            }}
          />
        ) : null}
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  repImage: {
    padding: 3,
    flex: 3.5,
  },
  tabContainer: {
    margin: 0,
  },
  layoutText: {
    position: 'absolute',
    paddingHorizontal: 15,
    bottom: 70,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  textTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'white',
  },
  textCaption: {
    fontWeight: '400',
    fontSize: 12,
    color: 'white',
  },
  expandImageStyle: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 10,
    right: '0%',
  },
});

/**
 * Wrapping with root component
 */
export default HPhotoView;
