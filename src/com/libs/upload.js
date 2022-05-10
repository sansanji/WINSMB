/* *
 * Import Common
 * */
import { Image } from 'react-native';
import { Fetch, Util } from 'libs';
/* *
 * Import node_modules
 * */
import Cookie from 'react-native-cookie';
import ImageResizer from 'react-native-image-resizer';
/*
 * 업로드 관련 라이브러리
 *
 */
const upload = async ({
  companyCode,
  refNo,
  refType,
  sFuncCode,
  fileConfig,
  onProgress,
  onSuccess,
  onError,
}) => {
  const pickType = fileConfig.pickType;
  const callView = fileConfig.callView;
  const fileUri = fileConfig.fileUri;
  const fileType = fileConfig.fileType;
  const fileName = fileConfig.fileName;
  // const { config } = ReduxStore.getState().global;

  // 이미지 사이즈(가로, 세로) 정보
  await Image.getSize(fileUri, (width, height) => {
    console.log('Image_width', width);
    console.log('Image_height', height);
  });

  let fileSize = fileConfig.fileSize;

  let finalFile = fileUri;
  // let rotation = config.ROTATION === 'Y' ? 0 : 90;
  let rotation = 0; // 세로사진을 갤러리 이용시 그대로
  let resizeWidth = 800;
  let resizeHeight = 600;
  let resizeQuality = 80;
  // let resizeKeepMeta = false;
  if (fileUri.indexOf('root') > -1) {
    // 세로사진을 카메라 이용시 90도 회전,
    rotation = 90;
  }
  if (callView === 'SignBox') {
    // sign 이미지 일 경우는 회전 0 처리!
    rotation = 0;
  }
  if (callView === 'OcrScanner'
      && (refNo === 'TEMPSCANNER' || refNo === 'TAXINVOICE_TMS_DT')) {
    // 사각탐지스캐너 기능을 활용하여 사진을 찍을 경우 대부분 디바이스를 가로로 하여 찍기 때문에 90도 회전 별도 처리!
    rotation = 0; // ok
    resizeWidth = 1060; // 1920
    resizeHeight = 720; // 1080
    resizeQuality = 100;
    // resizeKeepMeta = true;
  }

  // 이미지 파일인 경우만 리사이즈 처리!
  // or FILE로 Picker 한 경우 fileType이 image를 포함하면 예외 처리할지 생각해 보자!
  console.log('fileType', fileType);
  if (pickType === 'IMAGE') {
    await ImageResizer.createResizedImage(fileUri, resizeWidth, resizeHeight, 'JPEG', resizeQuality, rotation, null)
      .then(response => {
        finalFile = response;
        fileSize = response.size;
        // response.uri is the URI of the new image that can now be displayed, uploaded...
        // response.path is the path of the new image
        // response.name is the name of the new image with the extension
        // response.size is the size of the new image
      })
      .catch(err => {
        // Oops, something went wrong. Check that the filename is correct and
        // inspect err to get more details.
        console.log('ImageResizer.createResizedImage Error', err);
      });
  }

  // 파일사이즈 허용! 5MB 이하만!
  if (fileSize > 5242880) {
    // 5mb : 5242880b, 4mb : 4194304, 3mb : 3145728b
    const alertMsg =
      '파일사이즈가 허용 범위를 초과하였습니다.\nThe file size exceeds the allowable range.\n(Less than 5MB available!)';
    Util.toastMsg(alertMsg);
    Util.msgBox({
      title: 'Alert',
      msg: alertMsg,
      buttonGroup: [
        {
          title: 'OK',
        },
      ],
    });
    onError(alertMsg);
  } else {
    const year = new Date().getFullYear(); // Current Year
    let month = new Date().getMonth() + 1; // Current Month
    if (month.toString().length === 1) {
      month = `0${month}`;
    }
    const date = new Date().getDate(); // Current Date
    const hour = new Date().getHours(); // Current Hours
    const min = new Date().getMinutes(); // Current Minutes
    const sec = new Date().getSeconds(); // Current Seconds
    // const dateSet = Util.getDividedDateSet();
    // const currentDate = `_${dateSet.year}${dateSet.month}${dateSet.day}${dateSet.hour}${dateSet.min}${dateSet.sec}`;
    const currentDate = `_${year}${month}${date}${hour}${min}${sec}`;
    const finalFileName = fileName || `${refNo + currentDate}.png`; // 다른 파일이지만, 기존에 같은 이름으로 처리되는 부분 -> Date 추가로 구분 처리!
    const data = new FormData();
    data.append('COMPANY_CODE', companyCode); // you can append anyone.
    data.append('REF_NO', refNo); // you can append anyone.
    data.append('REF_TYPE', refType); // you can append anyone.
    data.append('S_FUNC_CODE', sFuncCode); // you can append anyone.
    data.append('JOB_NO', 'N'); // you can append anyone.
    data.append('REMARKS', ''); // you can append anyone.
    data.append('PUBLIC_YN', 'N'); // you can append anyone.
    data.append('file', {
      // HPhotoView에서 넘어올경우 finalFile안에 uri 존재!
      // uri: Platform.OS === 'ios' ? fileUri : `file://${fileUri}`,
      uri: Util.isEmpty(finalFile.uri) ? finalFile : finalFile.uri,
      type: 'image/png', // or photo.type
      name: finalFileName, // `${refNo + currentDate}.png`,
    });

    try {
      Cookie.clear();

      const resUpload = await fetch(
        `${Fetch.fetchURL}/api/file/upload`,
        {
          method: 'post',
          body: data,
          headers: {
            AJAX: true,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            'X-CSRF-TOKEN': globalThis.gToken,
            Cookie: globalThis.gCookie,
          },
        },
        progressEvent => {
          const progress = progressEvent.loaded / progressEvent.total;
          onProgress(progress);
        },
      );

      const responseJson = await resUpload.json();
      onSuccess(resUpload, responseJson);
    } catch (error) {
      onError(error);
    }
  }
};
export default upload;
