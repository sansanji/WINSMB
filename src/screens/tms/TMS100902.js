/* *
 * Import Common
 * */
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Keyboard,
} from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  Upload,
  ReduxStore,
  Util,
  bluecolor,
  Fetch,
  modelUtil,
} from 'libs';
import { HRow, HButton, HGridCombobox, HTexttitle, HBaseView, HTextfield } from 'ux';
/* *
 * Import node_modules
 * */
import ImagePicker from 'react-native-image-picker';

/**
 *  OCR 카메라 기능을 활용하여 스캔한다!
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100902');

    // React에서 제공하는 createRef를 사용하여 참조를 초기화하고 나중에 카메라 동작에 사용할 카메라 변수에 할당
    this.state = {
      templateTypeCode: 'TAX_MASTER',
      templateTypeName: '세금계산서 양식',
      templateBzType: 'TAXINVOICE_TMS',
      photo: null,
      fileInfo: null,
    };
  }

  /**
   * NCP OCR에 설정된 어떤 도메인을 호출하여 쓸 것인지 결정
   * 즉, NCP OCR URL, Hearder, body 등의 정보
   * 이미지 건건이 처리할 때마다 반복적으로 호출하지 않기 위해 최초 화면이 그려질 때 한번만 변수로 처리하여 파라미터로 활용!
   */
  componentWillMount() {
    // const dateSet = Util.getDividedDateSet();
    // console.log('dateSet', dateSet);
    modelUtil.setModelData('TMS100902F1', {
      TEMPLATE_TYPE_CODE: 'TAX_MASTER',
      TEMPLATE_TYPE_NAME: '세금계산서 양식',
    });
    modelUtil.setModelData('TMS100902', {
      DT_DATE_FROM: Util.getDateValue(),
      DT_DATE_TO: Util.getDateValue(),
    }); // Model 선언!
  }

  /**
   * iOS 기기에서 멀티 태스킹 모드가 꺼져있을 때 초기 레이아웃을로드 한 후에 만 ​​componentDidMount() 내에서 카메라가 켜집니다.
   * 그렇지 않으면 turnOffCamera() 함수가 componentDidUpdate()에서 호출됩니다.
   * 또한 캡쳐 실패시 설정 될 imageProcessorTimeout 타이머는 componentWillUnmount() 함수 내에서 지워야합니다.
   */
  componentDidMount() {
    this.getNcpAPIInfo('TAX_MASTER');
    if (this.props.TAX_NO) {
      this.fetch(this.props.TAX_NO);
    }
  }

  componentWillUnmount() {
    if (this.props.onSaveComplete) {
    // 새로고침
      this.props.onSaveComplete();
    }
  }


  // 1111111111111 사진을 찍고 캐시했습니다. 이제 계속해서 사용할 수 있습니다.
  onPictureProcessed = (event) => {
    const photo = {
      uri: event,
      ADD_DATE: `${Util.getDateValue()} ${Util.formatTime()}`,
    };
    this.saveEvent(photo);
  }

  /**
   * 222222222222222
   * 서버에 스캔된 이미지를 저장한다.
   * 저장된 이미지를 기준으로 OCR 로직 처리!
   */
  saveEvent = (photo) => {
    if (!this.validCheck('templateTypeCode')) {
      return;
    }

    if (photo) {
      const { navigator, session, sysSetting } = ReduxStore.getState().global;
      Util.openLoader(this.screenId, true); // Loader View 열기!

      const fileConfig = {
        pickType: 'IMAGE', // 'OCR',
        callView: 'OcrScanner',
        fileUri: photo.uri, // Platform.OS === 'ios' ? result.pathName : `file://${encodeURI(result.pathName)}`,
        fileType: null,
        fileName: null,
        fileSize: 50, // 5MB이하만 업로드 처리가능하지만, 파일사이즈 정보를 알 수 없어서 "50KB"으로 정한다. (무조건적 Pass 처리!)
      };

        // https://wins.htns.com/api/apicall/getDownload/HTNS/MB/1603332238405
        // https://127.0.0.1:8080/api/apicall/getDownload/HTNS/MB/1605057797216
        // https://wins.htns.com/api/apicall/getDownload/HTNSHS/MB/1608618558037
      Upload({
        companyCode: session.COMPANY_CODE, // 'HTNS',
        refNo: `${this.state.templateBzType}_DT` || 'OCR_SCAN', // 'TAXINVOICE_TMS'// // 'SR190203666',
        sFuncCode: 'MB',
        refType: 'NCP', // 'RM',
        fileConfig,
        onProgress: progress => {
          console.log('fetch-log', 'file uploaded progress', progress);
        },
        onSuccess: (res, resJson) => {
          console.log('file uploaded onSuccess (res)', res);
          console.log('file uploaded onSuccess (resJson)', resJson);
          Util.toastMsg('1.Upload Success!');
          navigator.dismissOverlay(this.props.componentId || this.state.componentId);

          const fileInfo = {
            FILE_URL: `${sysSetting.G1E_SERVER_URL}api/apicall/getDownload/${resJson.data.COMPANY_CODE}/${resJson.data.S_FUNC_CODE}/${resJson.data.FILE_MGT_CODE}`,
            // 'https://wins.htns.com/api/apicall/getDownload/HTNS/CH/1599628143905', // --> 3M Invoice
            FILE_URL2: 'https://wins.htns.com/api/apicall/getDownload/HTNS/CH/1605511890257', // --> 종이세금계산서_모바일버전_샘플1_1060x720.png
            FILE_FORMAT: resJson.data.FILE_FORMAT,
            FILE_MGT_CODE: resJson.data.FILE_MGT_CODE,
            FILE_NAME: resJson.data.FILE_NAME,
            // FILE_SIZE: resJson.data.FILE_SIZE,
            // FILE_ABS_PATH: resJson.data.FILE_ABS_PATH,
          };

            // this.retryCapture();
          this.getNcpOcrTemplate(fileInfo);
        },
        onError: err => {
          console.log('fetch-log', 'file uploaded error', err);
          Util.toastMsg('1.Upload Failure!');
          Util.openLoader(this.screenId, false); // Loader View 닫기!
          navigator.dismissOverlay(this.props.componentId || this.state.componentId);
        },
      });
    }
  }

  /**
   * 33333333333333
   * 네이버 클라우드 플랫폼(NCP) 템플릿 기반 OCR 연계
   * G1시스템에 이미지 파일을 우선 선 저장한 후 이미지 url 정보를 파라미터로 하여 호출한다!
   */
  async getNcpOcrTemplate(fileInfo) {
    const { session } = ReduxStore.getState().global;
    const userId = session.USER_ID;
    const deptCode = session.DEPT_CODE;

    // 하나로S 어드민 계정 또는 정보전략팀 소속인 경우만 처리한다!
    if (userId !== 'hsuser' && deptCode !== 'M11721' && deptCode !== 'M11722') {
      Util.openLoader(this.screenId, false); // Loader View 열기!
      Util.msgBox({
        title: 'Warning!',
        msg: Util.getMultiText('A000000004') || '접근 권한이 없습니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {},
          },
        ],
      });

      return;
    }

    if (!this.validCheck('templateTypeCode')) {
      return;
    }

    const result = await Fetch.request('COM090103SVC', 'getNcpOcrTemplate', {
      body: JSON.stringify({
        TEMPLATE_ID: null, // '5265', // 템플릿 자동 분류 처리를 지원하므로 나중에는 null로 보내기! // templateTypeCode
        ...fileInfo, // file_url, file_format, file_mgt_code, file_name G1서버에 저장한 파일 속성 정보 매핑!
        ...this.state.ncpApiInfo, // api_method, api_header, api_url 등 api호출에 필요한 기본 정보 매핑!
      }),
    });

    if (result.TYPE === 1 && result.data) {
      if (result.data.images) {
        if (result.data.images[0].fields) {
          Util.toastMsg('2.OCR Scan Success!');
          this.readingResult(result.data, fileInfo);
        } else {
          this.getNcpResultMsg(result.data.images[0].message); // OCR 판독 실패 시!
        }
      } else {
        this.getNcpResultMsg(result.data.MSG); // OCR 판독 실패 시!
      }
    } else {
      this.getNcpResultMsg(result.MSG); // OCR 판독 실패 시!
    }
  }

  /**
   * 네이버 클라우드 플랫폼(NCP) 템플릿 기반 OCR 연계
   * G1시스템에 이미지 파일을 우선 선 저장한 후 이미지 url 정보를 파라미터로 하여 호출한다!
   */
  async getNcpAPIInfo(templateId) {
    if (Util.isEmpty(templateId)) {
      if (!this.validCheck(null)) {
        return;
      }
    }

    Util.openLoader(this.screenId, true);

    const result = await Fetch.request('COM090103SVC', 'getNcpAPIInfo', {
      body: JSON.stringify({
        NCP_API_ID: templateId, // '5265',
      }),
    });

    if (result.TYPE === 1) {
      this.setState({
        ncpApiInfo: result.data,
      });
    }
    Util.openLoader(this.screenId, false);
  }

  /**
   * 4444444444
   * OCR을 통해 판독된 결과물과 G1에 선 등록된 결과물을 비교하여 판독 결과를 알려준다.
   * 추가로 OCRTX001, OCRTX002 테이블에 데이터를 등록한다.
   */
  async readingResult(result, fileInfo) {
    const fetchResult = await Fetch.request('OCR010101SVC', 'setTmsTaxInvoice', {
      body: JSON.stringify({
        OCR010101F1: {
          APP_TYPE: 'G1M',
          OcrRequestId: result.requestId,
          OcrVersion: result.version,
          OcrTimestamp: result.timestamp,
          LINK_GROUP_CODE: 'OCR_TAX_INVOICE_KR', // 각 영역에 대한 설정값 처리 인자값!
          SEQ_NO: '12',
          OCR_TYPE: 'ACC',
          OBJ_TYPE: 'IMG',
          FILE_NAME: fileInfo.FILE_NAME,
          FILE_URL: fileInfo.FILE_URL,
        },
        OCR010101G1: {
          data: result.images[0].fields, // 실질적으로 판독 데이터가 담긴 객체
        },
      }),
    });

    let alertMsg = '';
    const noDataMsg = '해당 세금계산서는 G1에 등록된 정보가 없습니다.\n다시 한번 확인 바랍니다.';

    if (fetchResult.TYPE === 1) {
      Util.toastMsg('3.Save Success!');
      // 텍스번호 받고 조회 하기 JKM
      const TAX_NO = fetchResult.data.TAX_NO;
      this.fetch(TAX_NO);

      if (Util.isEmpty(fetchResult.data.CHK_LIST)) {
        alertMsg = noDataMsg;
      } else if (fetchResult.data.CHK_LIST.length > 0) {
        for (let i = 0; i < fetchResult.data.CHK_LIST.length; i += 1) {
          const dataSet = fetchResult.data.CHK_LIST[i];
          if (i === 0) {
            alertMsg += `운송일자: ${dataSet.TRANS_DATE}\n`;
          } else if (i > 1) {
            alertMsg += `\n * 그 외 ${fetchResult.data.CHK_LIST.length - 2}건 존재 *`;
            break;
          } else {
            alertMsg += '\n';
          }
          alertMsg += `${[i + 1]}. [${dataSet.CAR_NO}]에 대한 [${dataSet.DEPART_CODE_NAME} -> ${dataSet.ARRIVAL_CODE_NAME}] 경로 [${dataSet.AP_CUR}${dataSet.AP_AMT}] 배차 건 확인`;
        }
      }

      this.getNcpResultMsg(alertMsg, '성공(Success)');
    } else {
      alertMsg = noDataMsg;
      if (fetchResult.MSG.indexOf('이미') > -1) {
        alertMsg = fetchResult.MSG;
      }
      this.getNcpResultMsg(alertMsg);
    }
  }

  /**
   * 55555555
   * 판독되어 DB에 들어간 데이터를 조회해서 사용자가 수정할수 있도록 해준다.
   */
  async fetch(taxNo) {
    // 신규 건은 신규생성된 tax번호로 조회한다.
    const reqTaxNo = taxNo || modelUtil.getValue('TMS100902.TAX_NO');

    const result = await Fetch.request('TMS010181SVC', 'getOCR', {
      body: JSON.stringify({
        TMS010181F2: {
          DT_DATE_ACTIVE_FLAG: 'Y',
          DT_DATE_FROM: this.props.ADD_DATE || Util.getDateValue(),
          DT_DATE_TO: this.props.ADD_DATE || Util.getDateValue(),
          DT_DATE_TYPE: 'ADD',
          TAX_NO: this.props.TAX_NO || reqTaxNo,
        },
      }),
    });
    Util.openLoader(this.screenId, false); // Loader View 열기!
    if (result.TYPE === 1) {
      modelUtil.setModelData('TMS100902', result.TMS010181G2[0]);

      // modelUtil.setModelData('TMS100902', example.TMS010181G2[0]);
    }
    Util.toastMsg(result.MSG);
  }

  /**
   * 666666
   * 판독결과를 수정 한다.
   */
  async fetchSave() {
    Keyboard.dismiss();
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const reqData = modelUtil.getModelData('TMS100902');
    const checkMessage = this.checkSave(reqData);
    // 저장시 체크로직
    if (checkMessage !== null) {
      this.getNcpResultMsg(checkMessage);
      return;
    }
    const result = await Fetch.request('TMS010181SVC', 'saveOCR', {
      body: JSON.stringify({
        TMS010181G2: {
          data: [reqData],
        },
      }),
    });

    if (result.TYPE === 1) {
      this.fetch();
    } else {
      Util.toastMsg(result.MSG);
      Util.openLoader(this.screenId, false);
    }
  }

  /**
   * NCP API 호출 실패 및 호출 후 데이터 오류에 대한 알림 처리!
   */
  getNcpResultMsg(resultMsg, title) {
    let finalMsg = resultMsg;
    if (finalMsg.length > 100) {
      finalMsg = `${resultMsg.substring(0, 100)} .....`;
    }

    Util.msgBox({
      title: title || '실패(Fail)',
      msg: finalMsg,
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => {
            Util.openLoader(this.screenId, false);
          },
        },
      ],
    });
  }

  /**
   * 필수 항목 체크!
   */
  validCheck(checkColumn) {
    const selTempTypeMsgAlert = Util.getMultiText('A000000004'); // Template Type을 먼저 선택바랍니다.

    if (Util.isEmpty(checkColumn) || (checkColumn === 'templateTypeCode' && Util.isEmpty(this.state[checkColumn]))) {
      Util.msgBox({
        title: 'Check Validation',
        msg: selTempTypeMsgAlert, // 'Template Type을 먼저 선택바랍니다!',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
            },
          },
        ],
      });

      return false;
    }
    return true;
  }
  /**
   * 저장시 체크 로직
   */
  checkSave(reqData) {
    let msg = null;
    const STATUS = reqData.STATUS;
    const TAX_NO = reqData.TAX_NO;
    const CONFIRM_YN = reqData.CONFIRM_YN;

    if (CONFIRM_YN === 'Y') {
      msg = `확정 건은 수정이 불가합니다. (Ref No: ${TAX_NO})`;
    }
    if (STATUS === 'D') {
      msg = `삭제 건은 수정이 불가합니다. (Ref No: ${TAX_NO})`;
    }
    if (Util.isEmpty(reqData.TAX_DATE)) {
      msg = `[계산서 일자]은(는) 필수 값입니다. - Tax No. : ${TAX_NO}`;
    }
    if (Util.isEmpty(reqData.TOTAL_SUPPLY_AMT) || reqData.TOTAL_SUPPLY_AMT === '0') {
      msg = `[공급가액]은(는) 필수 값입니다. - Tax No. : ${TAX_NO}`;
    }
    if (Util.isEmpty(reqData.TOTAL_TAX_AMT) || reqData.TOTAL_TAX_AMT === '0') {
      msg = `[세액]은(는) 필수 값입니다. - Tax No. : ${TAX_NO}`;
    }
    if (Util.isEmpty(reqData.TOTAL_AMT) || reqData.TOTAL_AMT === '0') {
      msg = `[총금액]은(는) 필수 값입니다. - Tax No. : ${TAX_NO}`;
    }
    return msg;
  }

  onSavePhoto() {
    const options = {
      title: 'Choose Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      onSuccess: (res, source) => {
        console.log('file uploaded success', res, source);
      },
    };

    ImagePicker.launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.uri;
        this.onPictureProcessed(source);
      }
    });
  }

  onSavePhotoLibrary() {
    const options = {
      title: 'Choose Photo',
      quality: 1,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      onSuccess: (res, source) => {
        console.log('file uploaded success', res, source);
      },
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.uri;
        this.onPictureProcessed(source);
      }
    });
  }

  /**
   * 분리된 render 관련 Func의 모든 것을 결합하여 최종 UI를 렌더링 할 수 있습니다.
   * 여기에서 이미지 상태가 설정되어 있으면 미리보기 페이지로 리디렉션되고 그렇지 않은 경우 이미지를 캡처 할 수있는 카메라 뷰가 렌더링됩니다.
   */
  render() {
    return (
      <View style={{ flex: 1 }}>
        <HBaseView>
          {this.props.TAX_NO ? null :
            (<HGridCombobox
              label={'OCR 템플릿'}
              groupCode={'SP8949'}
              codeField={'DT_CODE'}
              nameField={'LOC_VALUE'}
              bindVar={{
                CD: 'TMS100902F1.TEMPLATE_TYPE_CODE',
                NM: 'TMS100902F1.TEMPLATE_TYPE_NAME',
              }}
              sql={{ ETC1: 'TAXINVOICE_TMS' }}
              editable
              require
              onChanged={(value) => {
                this.setState({
                  templateTypeCode: value.DT_CODE,
                  templateTypeName: value.LOC_VALUE,
                  templateBzType: value.ETC1,
                });
                this.getNcpAPIInfo(value.DT_CODE); // 템플릿타입을 선택하면 API 호출 정보를 가져온다!
              }}
            />)
          }

          <HTexttitle value={`판독결과 [${modelUtil.getValue('TMS100902.TAX_NO')}]`} />
          <HRow>
            <HTextfield label={'사업자번호'} bind={'TMS100902.SUPPLIER_IRS_NO'} editable />
            <HTextfield label={'대표자명'} bind={'TMS100902.SUPPLIER_CEO'} editable />
          </HRow>
          <HTextfield label={'상호(법인)'} bind={'TMS100902.SUPPLIER_NAME'} editable />
          <HTextfield label={'주소'} bind={'TMS100902.SUPPLIER_ADDR'} editable />
          <HRow>
            <HTextfield label={'계산서일자'} bind={'TMS100902.TAX_DATE'} editable />
            <HTextfield label={'공급가액'} bind={'TMS100902.TOTAL_SUPPLY_AMT'} editable />
          </HRow>
          <HRow>
            <HTextfield label={'세액'} bind={'TMS100902.TOTAL_TAX_AMT'} editable />
            <HTextfield label={'총금액'} bind={'TMS100902.TOTAL_AMT'} editable />
          </HRow>
          <Image
            resizeMode={'stretch'}
            style={{
              height: Dimensions.get('window').width / 2, // '100%',
              width: Dimensions.get('window').width,
              alignItems: 'center',
              justifyContent: 'center',
              // marginBottom: 100,
            }}
            source={{
              uri: modelUtil.getValue('TMS100902.FILE_URL'),
              headers: {
                'X-CSRF-TOKEN': globalThis.gToken,
                Cookie: globalThis.gCookie,
              // withCredentials: true,
              },
            }}
          />
        </HBaseView>
        <View style={styles.expandImageStyle}>
          <HButton
            onPress={() => {
              this.fetchSave();
            }}
            name={'save'}
            title={'Update'}
            disabled={!modelUtil.getValue('TMS100902.TAX_NO')}
            bStyle={{
              backgroundColor: bluecolor.basicRedColor,
            }}
          />
          {this.props.TAX_NO ? null :
            (<HRow>
              <HButton
                onPress={() => {
                  this.onSavePhoto();
                }}
                name={'camera'}
                title={'Camera'}
                bStyle={{
                  backgroundColor: bluecolor.basicSkyLightBlueColor,
                }}
              />
              <HButton
                onPress={() => {
                  this.onSavePhotoLibrary();
                }}
                name={'image'}
                title={'Gallary'}
                bStyle={{
                  backgroundColor: bluecolor.basicSkyLightBlueColor,
                }}
              />
            </HRow>)
          }
        </View>

      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
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
    justifyContent: 'flex-end',
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
  model: state.model,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
//
