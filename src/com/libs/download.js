import Cookie from 'react-native-cookie';

import Fetch from './fetch';
import futch from './futch';

const download = async ({
  companyCode,
  sFuncCode,
  fileMgtCode,
  // token,
  onProgress,
  onSuccess,
  onError,
}) => {
  const data = new FormData();
  data.append('COMPANY_CODE', companyCode); // you can append anyone.
  data.append('SEARCH_COMPANY_CODE', companyCode); // you can append anyone.
  data.append('S_FUNC_CODE', sFuncCode); // you can append anyone.
  data.append('FILE_MGT_CODE', fileMgtCode); // you can append anyone.

  Cookie.clear();
  // futch(
  //   `${Fetch.fetchURL}/api/file/download`,
  //   {
  //     method: 'post',
  //     body: data,
  //     headers: {
  //       AJAX: true,
  //       Accept: 'application/octet-stream; charset=UTF-8', // 'application/json',
  //       'Content-Type': 'multipart/form-data',
  //       'X-CSRF-TOKEN': globalThis.gToken, // token,
  //       Cookie: globalThis.gCookie,
  //     },
  //   },
  //   progressEvent => {
  //     const progress = progressEvent.loaded / progressEvent.total;
  //     onProgress(progress);
  //   },
  // ).then(res => onSuccess(res), e => onError(e));

  try {
    Cookie.clear();

    const resDownload = await futch(
      `${Fetch.fetchURL}/api/file/download`,
      {
        method: 'post',
        body: data,
        headers: {
          AJAX: true,
          Accept: 'application/octet-stream; charset=UTF-8',
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

    const responseJson = null; // await resDownload.json();
    onSuccess(resDownload, responseJson);
  } catch (error) {
    onError(error);
  }
};

export default download;

// onSucess 내부 구현
// console.log('fetch-log', 'file download success', res);
// console.log('fetch-log', res.response);
// const blob = new Blob([res.response], { type: 'image/jpeg' });
// const image = new Image();
// image.src = URL.createObjectURL(blob);
// console.log('fetch-log', image);
