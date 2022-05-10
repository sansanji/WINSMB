/* *
* Import Common
* */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  Util,
  bluecolor,
  _,
  ReduxStore,
} from 'libs';
import {
  HBaseView,
  Touchable,
  HIcon,
  HRow,
  HFormView,
  HText,
  HListView,
  HNumberfield,
  HButton,
  HCheckbox,
} from 'ux';
/* *
* Import node_modules
* */
// import Tts from 'react-native-tts';
/**
* 입고 상세 정보
*/
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100304');
    this.state = {
      data: [],
      status: null,
      spinner: false,
      taskStep: this.props.params.GR_STATUS === 'F' ? '2' : '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      // 클로즈 기능으로 신규추가
      VENDOR_CODE: this.props.params.VENDOR_CODE,
      VENDOR_PLANT_CODE: this.props.params.VENDOR_PLANT_CODE,
      BUYER_CODE: this.props.params.BUYER_CODE,
      BUYER_PLANT_CODE: this.props.params.BUYER_PLANT_CODE,
      WH_CODE: this.props.params.WH_CODE,
      GR_NO: this.props.params.GR_NO,
      GR_DATE: this.props.params.GR_DATE,
      GR_STATUS: this.props.params.GR_STATUS,
      GR_STATUS_NAME: this.props.params.GR_STATUS_NAME,
      WH_URGENT: this.props.params.WH_URGENT,
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      barcodeData4: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
      locationTarget: 'N',
      docTarget: 'N',
      remarkTarget: 'N',
      barcode1Focus: false,
      barcode2Focus: false,
      barcode3Focus: false,
      itemEditable: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 스캔 필드 비 활성화
      locationEditable: false,
      docEditable: false,
      locSwitch: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 location scan 콤보박스 비 활성화
      docSwitch: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 location scan 콤보박스 비 활성화
      remarkSwitch: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 location scan 콤보박스 비 활성화
      reqAreaIgnore: null,
      locationSaveYN: false,
      barcodeZoneCode: null,
      PLT_CHECK: this.props.params.PLT_CHECK,
      BOX_CHECK: this.props.params.BOX_CHECK,
      ITEM_CHECK: this.props.params.ITEM_CHECK,
      GR_DT: this.props.params.GR_DT,
    };
    // Tts.setDefaultLanguage('ko');
    // Tts.voices().then(voices => console.log('voices', voices));
  }
  componentWillMount() {
    this.fetch(null);
  }
  shouldComponentUpdate() {
    return true;
  }
  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030050SVC', 'getScan', {
      body: JSON.stringify({
        DMS030050F1: {
          WH_CODE: this.state.WH_CODE,
          GR_NO: this.state.GR_NO,
          GR_DATE_FROM: this.state.GR_DATE,
          GR_DATE_TO: this.state.GR_DATE,
          PLT_CHECK: this.state.PLT_CHECK,
          BOX_CHECK: this.state.BOX_CHECK,
          ITEM_CHECK: this.state.ITEM_CHECK,
          GR_DT: this.state.GR_DT,
          GR_FLAG: 'Y',
        },
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      this.setState(
        {
          data: result.DMS030050G2,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
        callback,
      );
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }
  // 버튼 이벤트에 대한 조건 처리
  _eventBtnBranch(eventType) {
    if (eventType === 'CONFIRM') {
      // this.tts('Do you want to Confrim?');
      Util.msgBox({
        title: 'Confirm',
        msg: 'Do you want to Confrim?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._CONFIRM_CHECK(),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
    if (eventType === 'CANCEL') {
      Util.msgBox({
        title: 'Cancel',
        msg: 'Do you want to Cancel?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._CANCEL(),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
  }
  // 확정 조건 여부 체크
  _CONFIRM_CHECK() {
    // const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const successCnt = this.state.successCnt;
    // 베트남법인은 무조건 바코드 스캔 후 확정처리! 그러나 다른 법인들은 어떻게 할지 정해진 것이 없으므로 잠시 보류
    // const companyCode = _.get(this.props.global, 'session.COMPANY_CODE', null);
    if (dataLength !== successCnt) {
      Alert.alert(
        // me.showError(Util.getLocaleValue('F000000249')); //조회한 데이터와 바코드 스캔한 데이터 수가 상이합니다.
        'Please, Scan the others',
        `${successCnt}/${dataLength}`,
        [{ text: 'Yes', onPress: () => console.log('cancel'), style: 'cancel' }],
        { cancelable: false },
      );
      this.setState({
        scanVaildData: `Please, Scan the others(${successCnt}/${dataLength})`,
        spinner: false,
      });
      this._setScanValidData('f');
      this._sound('f');
    } else if (this.state.locationSaveYN && this.state.docSaveYN) {
      this._saveLocation();
    } else if (this.state.locationSaveYN) {
      this._saveLocation();
    } else if (this.state.docSaveYN) {
      this._saveDoc();
    } else {
      this._CONFIRM();
    }
  }
  async _saveLocation() {
    const { config } = this.props.global;
    const dmsBlockDup = config.DMS_BLOCK_DUP; // 로케이션 중복 허용 설정
    // const dmsBlockDup = _.get(this.props.global, 'config.DMS_BLOCK_DUP', null);
    const tabCode = 'MOBILE';
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const resultLoc = await Fetch.request('DMS030510SVC', 'saveLoc', {
      body: JSON.stringify({
        DMS030510F1: {
          TAB_CODE: tabCode, // 모바일 상세정보(기존LOCATION여부 체크)
        },
        DMS030510G1: {
          data: this.state.data,
        },
      }),
    });
    // 이부분 중복으로 처리되는 문제 보완해야함
    // resultLoc.MSG.replace('[','').split(']')[0];
    if (resultLoc.TYPE === 1) {
      Util.openLoader(this.screenId, false);
      this._CONFIRM(); // 로케이션 정보 저장 후 확정 일괄 처리
    } else {
      Util.msgBox({
        title: 'Save Alert',
        msg: resultLoc.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
              this._resetState();
            },
          },
        ],
      });
    }
  }
  async _saveDoc() {
    const { config } = ReduxStore.getState().global;
    // const dmsBlockDup = _.get(this.props.global, 'config.DMS_BLOCK_DUP', null);
    const tabCode = 'MOBILE';
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const resultLoc = await Fetch.request('DMS030510SVC', 'saveDoc', {
      body: JSON.stringify({
        DMS030510F1: {
          TAB_CODE: tabCode, // 모바일 상세정보(기존LOCATION여부 체크)
        },
        DMS030510G1: {
          data: this.state.data,
        },
      }),
    });
    // resultLoc.MSG.replace('[','').split(']')[0];
    if (resultLoc.TYPE === 1) {
      Util.openLoader(this.screenId, false);
      this._CONFIRM();
      // this._saveLocation(); // 로케이션 정보 저장 후 확정 일괄 처리
    } else {
      Util.msgBox({
        title: 'doc save Alert',
        msg: resultLoc.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
              this._resetState();
            },
          },
        ],
      });
    }
  }

  async _saveRemark() {
    const { config } = ReduxStore.getState().global;
    // const dmsBlockDup = _.get(this.props.global, 'config.DMS_BLOCK_DUP', null);
    const tabCode = 'MOBILE';
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const resultLoc = await Fetch.request('DMS030510SVC', 'saveRemarks', {
      body: JSON.stringify({
        DMS030510F1: {
          TAB_CODE: tabCode, // 모바일 상세정보(기존LOCATION여부 체크)
        },
        DMS030510G1: {
          data: this.state.data,
        },
      }),
    });
    // resultLoc.MSG.replace('[','').split(']')[0];
    if (resultLoc.TYPE === 1) {
      // Util.openLoader(this.screenId, false);
      this._CONFIRM();
      // this._saveLocation(); // 로케이션 정보 저장 후 확정 일괄 처리
    } else {
      Util.msgBox({
        title: 'doc save Alert',
        msg: resultLoc.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
              this._resetState();
            },
          },
        ],
      });
    }
  }

  async _CONFIRM() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const { componentId } = this.props;
    const result = await Fetch.request('DMS030050SVC', 'confirm', {
      body: JSON.stringify({
        DMS030050G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GR_NO: this.state.GR_NO,
              WH_URGENT: this.state.WH_URGENT,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              VENDOR_PLANT_CODE: this.state.VENDOR_PLANT_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
              BUYER_PLANT_CODE: this.state.BUYER_PLANT_CODE,
              GR_DATE: this.state.GR_DATE,
            },
          ],
        },
      }),
    });
    if (result.TYPE === 1) {
      Util.openLoader(this.screenId, false);
      Util.msgBox({
        title: 'Confrim Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Confrim Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }
  // 확정 취소 처리
  async _CANCEL() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const { componentId } = this.props;
    const result = await Fetch.request('DMS030050SVC', 'cancel', {
      body: JSON.stringify({
        DMS030050G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GR_NO: this.state.GR_NO,
              WH_URGENT: this.state.WH_URGENT,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              VENDOR_PLANT_CODE: this.state.VENDOR_PLANT_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
              BUYER_PLANT_CODE: this.state.BUYER_PLANT_CODE,
              GR_DATE: this.state.GR_DATE,
            },
          ],
        },
      }),
    });
    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Cancel Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Cancel Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }
  // 하단 버튼 컨트롤
  buttonControll(btnType) {
    const btn = {
      1: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._eventBtnBranch('CONFIRM')} title={'Confirm'} />
        </View>
      ),
      2: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._eventBtnBranch('CANCEL')} title={'Cancel'} />
        </View>
      ),
      3: (
        <View style={styles.buttonGroupContainer}>
          <View style={[styles.buttonInnerContainer]}>
            <HButton onPress={() => this._eventBtnBranch('CONFIRM')} title={'Confirm'} />
          </View>
          <View style={[styles.buttonInnerContainer]}>
            <HButton onPress={() => this._eventBtnBranch('CANCEL')} title={'Cancel'} />
          </View>
        </View>
      ),
    };
    return btn[btnType];
  }
  // 바코드 스캔 처리 로직rr
  async focusNextField(targetType, scanData) {
    Vibration.vibrate(500);
    const { config } = this.props.global;
    const dataLength = this.state.data.length;
    const locationTarget = this.state.locationTarget;
    const docTarget = this.state.docTarget;
    const remarkTarget = this.state.remarkTarget;
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    let barcode1Data = null; // 첫번째 바코드값
    let barcode2Data = null; // 두번째 바코드값
    let barcode3Data = null; // 세번째 바코드값
    let barcode4Data = null; // 네번째 바코드값
    let barcodeYN = 'N'; // 'Y'바코드스캔성공, 'N'바코드스캔 실패, 'A'바코드스캔중복, 'LA'중복방지했는지중본된경우
    let currentIndex = null; // 현재 바코드스캔으로 선택된로우인덱스
    let barcodeValidYN = 'N';
    let locationSaveYN = false;
    let docSaveYN = false;
    let remarkSaveYN = false;
    if (locationTarget === 'N' && docTarget === 'N' && remarkTarget === 'N') {
      // location 스캔 안 할 경우
      // 로케이션 관리를 하지 않는 경우 처리
      this._onClearBarcode('barcode1');
      barcode1Data = this.barcode1._lastNativeText;
      if (scanData) {
        barcode1Data = scanData;
      }
      if (!barcode1Data) {
        // null check
        this._validCheck('item', 'nullCheck', 'barcode1Data');
        return;
      }
      for (let i = 0; i < dataLength; i += 1) {
        let scanNo = this.state.data[i].SCAN_NO.toUpperCase().trim();
        // 심플스캔일때는 아이템번호로 체크
        if (config.DMS_SIMPLE_YN) {
          if (config.DMS_SIMPLE_YN === 'Y') {
            scanNo = this.state.data[i].ITEM_CODE.toUpperCase().trim();
          }
        }
        if (barcode1Data.toUpperCase().trim() === scanNo) {
          if (this.state.data[i].scanChecked !== 'Y') {
            currentIndex = i;
            barcodeYN = 'Y'; // 스캔 성공
          } else {
            barcodeYN = 'A'; // 스캔 중복
            // 심플스캔일때는 중복허용
            if (config.DMS_SIMPLE_YN) {
              if (config.DMS_SIMPLE_YN === 'Y') {
                barcodeYN = 'Y';
              }
              currentIndex = i;
            } else {
              currentIndex = i;
            }
          }
        }
      }
      locationSaveYN = false; // 로케이션 정보가 수정되었는지 체크
      docSaveYN = false; // doc 정보가 수정되어있는지 체크
      remarkSaveYN = false; // remark정보가 수정되어있는지 체크
      // 아이템 및 로케이션 정보까지 찍었을 경우에 최종 조건 로직으로 이동
      /*
* 스캔 성공 여부에 따른 공통 로직 시작
*/
      this._finalCheckDisplay(barcodeYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      /*
* 스캔 성공 여부에 따른 공통 로직 끝
*/
    } else if (locationTarget === 'N' && docTarget === 'N' && remarkTarget === 'Y') {
      if (targetType === 'itemField') {
        // item 스캔할 때
        barcode1Data = this.state.barcodeData1;
        // barcode4Data = this.barcode4._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let r = 0; r < dataLength; r += 1) {
          let scanNo = this.state.data[r].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[r].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[r].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = r;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = r;
              } else {
                currentIndex = r;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = true;

        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode4');
          this.barcode4.focus();
        }
      } else {
        // remark 스캔 시작
        barcode1Data = this.state.barcodeData1;
        barcode4Data = this.state.barcodeData4;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode4Data = scanData;
        }
        if (!barcode4Data) {
          // null check
          this._validCheck('remark', 'nullCheck', 'barcode4Data');
          return;
        }
        locationSaveYN = false;
        docSaveYN = false;
        remarkSaveYN = true;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    } else if (locationTarget === 'Y' && docTarget === 'N' && remarkTarget === 'N') {
      // location 스캔 할 경우
      if (targetType === 'itemField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.barcode2._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let k = 0; k < dataLength; k += 1) {
          let scanNo = this.state.data[k].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[k].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[k].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = k;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = k;
              } else {
                currentIndex = k;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false;

        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode2');
          this.barcode2.focus();
        }
      } else {
        // 로케이션에 대한 스캔 데이터를 제어한다.
        // if (targetType === 'itemField')
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.state.barcodeData2;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode2Data = scanData;
        }
        if (!barcode2Data) {
          // null check
          this._validCheck('location', 'nullCheck', 'barcode2Data');
          return;
        }
        // 로케이션 포맷 셋팅
        if (config.DMS_LOC_FORMAT) {
          if (config.DMS_LOC_FORMAT === 'Y') {
            if (barcode2Data.indexOf('-') < 1 || barcode2Data.length !== 9) {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              return;
            }
            if (barcode2Data.substr(3, 1) !== '-' || barcode2Data.substr(6, 1) !== '-') {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              this.failScan();
            }
          }
        }
        locationSaveYN = true;
        docSaveYN = false;
        remarkSaveYN = false;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    } else if (locationTarget === 'Y' && docTarget === 'N' && remarkTarget === 'Y') {
      if (targetType === 'itemField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode1Data = this.state.barcodeData1;
        // barcode2Data = this.barcode2._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let l = 0; l < dataLength; l += 1) {
          let scanNo = this.state.data[l].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[l].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[l].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = l;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = l;
              } else {
                currentIndex = l;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = true;

        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode2');
          this.barcode2.focus();
        }
      } else if (targetType === 'locField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode2Data = this.barcode2._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode2Data = scanData;
        }
        if (!barcode2Data) {
          // null check
          this._validCheck('location', 'nullCheck', 'barcode2Data');
          return;
        }
        // 로케이션 포맷 셋팅
        if (config.DMS_LOC_FORMAT) {
          if (config.DMS_LOC_FORMAT === 'Y') {
            if (barcode2Data.indexOf('-') < 1 || barcode2Data.length !== 9) {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              return;
            }
            if (barcode2Data.substr(3, 1) !== '-' || barcode2Data.substr(6, 1) !== '-') {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              this.failScan();
            }
          }
        }
        this.setState({
          barcodeValidYN,
        });
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = true;
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data);
        } else {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data);
        }

        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode4');
          this.barcode4.focus();
        }
      } else {
        // 리마크 스캔로직 시작
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.state.barcodeData2;
        barcode4Data = this.barcode4._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode4Data = scanData;
        }
        if (!barcode4Data) {
          // null check
          this._validCheck('remark', 'nullCheck', 'barcode4Data');
          return;
        }
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = true;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    } else if (locationTarget === 'N' && docTarget === 'Y' && remarkTarget === 'N') {
      if (targetType === 'itemField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode1Data = this.state.barcodeData1;
        barcode3Data = this.barcode3._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let j = 0; j < dataLength; j += 1) {
          let scanNo = this.state.data[j].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[j].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[j].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = j;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = j;
              } else {
                currentIndex = j;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true;
        remarkSaveYN = true;
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode3');
          this.barcode3.focus();
        }
      } else {
        // 로케이션에 대한 스캔 데이터를 제어한다.
        // if (targetType === 'itemField')
        barcode1Data = this.state.barcodeData1;
        barcode3Data = this.barcode3._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode3Data = scanData;
        }
        if (!barcode3Data) {
          // null check
          this._validCheck('doc', 'nullCheck', 'barcode3Data');
          return;
        }
        locationSaveYN = false;
        docSaveYN = true;
        remarkSaveYN = false;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    } else if (locationTarget === 'N' && docTarget === 'Y' && remarkTarget === 'Y') {
      if (targetType === 'itemField') {
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.barcode1._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let y = 0; y < dataLength; y += 1) {
          let scanNo = this.state.data[y].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[y].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[y].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = y;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = y;
              } else {
                currentIndex = y;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode3');
          this.barcode3.focus();
        }
      } else if (targetType === 'docField') {
        // 로케이션에 대한 스캔 데이터를 제어한다.
        // if (targetType === 'itemField')
        barcode1Data = this.state.barcodeData1;
        barcode3Data = this.barcode3._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode3Data = scanData;
        }
        if (!barcode3Data) {
          // null check
          this._validCheck('doc', 'nullCheck', 'barcode3Data');
          return;
        }
        locationSaveYN = false;
        docSaveYN = true;
        remarkSaveYN = true;
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode4');
          this.barcode4.focus();
        }
      } else {
        // remark 스캔할 때,
        barcode1Data = this.state.barcodeData1;
        barcode3Data = this.state.barcodeData3;
        barcode4Data = this.barcode4._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode4Data = scanData;
        }
        if (!barcode4Data) {
          // null check
          this._validCheck('remark', 'nullCheck', 'barcode3Data');
          return;
        }
        locationSaveYN = false;
        docSaveYN = true;
        remarkSaveYN = true;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    } else if (locationTarget === 'Y' && docTarget === 'Y' && remarkTarget === 'N') {
      // location 스캔 할 경우
      if (targetType === 'itemField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.barcode1._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let f = 0; f < dataLength; f += 1) {
          let scanNo = this.state.data[f].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[f].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[f].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = f;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = f;
              } else {
                currentIndex = f;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode2');
          this.barcode2.focus();
        }
      } else if (targetType === 'locField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode2Data = this.barcode2._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode2Data = scanData;
        }
        if (!barcode2Data) {
          // null check
          this._validCheck('location', 'nullCheck', 'barcode2Data');
          return;
        }
        // 로케이션 포맷 셋팅
        if (config.DMS_LOC_FORMAT) {
          if (config.DMS_LOC_FORMAT === 'Y') {
            if (barcode2Data.indexOf('-') < 1 || barcode2Data.length !== 9) {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              return;
            }
            if (barcode2Data.substr(3, 1) !== '-' || barcode2Data.substr(6, 1) !== '-') {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              this.failScan();
            }
          }
        }
        this.setState({
          barcodeValidYN,
        });
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data);
        } else {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode3');
          this.barcode3.focus();
        }
      } else {
        // 로케이션에 대한 스캔 데이터를 제어한다.
        // if (targetType === 'itemField')
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.state.barcodeData2;
        barcode3Data = this.barcode3._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode3Data = scanData;
        }
        if (!barcode3Data) {
          // null check
          this._validCheck('doc', 'nullCheck', 'barcode3Data');
          return;
        }
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    } else if (locationTarget === 'Y' && docTarget === 'Y' && remarkTarget === 'Y') {
      // location 스캔 할 경우
      if (targetType === 'itemField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.barcode1._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck', 'barcode1Data');
          return;
        }
        for (let z = 0; z < dataLength; z += 1) {
          let scanNo = this.state.data[z].SCAN_NO.toUpperCase().trim();
          // 심플스캔일때는 아이템번호로 체크
          if (config.DMS_SIMPLE_YN) {
            if (config.DMS_SIMPLE_YN === 'Y') {
              scanNo = this.state.data[z].ITEM_CODE.toUpperCase().trim();
            }
          }
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[z].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = z;
            } else {
              barcodeValidYN = 'A';
              // 심플스캔일때는 중복허용
              if (config.DMS_SIMPLE_YN) {
                if (config.DMS_SIMPLE_YN === 'Y') {
                  barcodeValidYN = 'Y';
                }
                currentIndex = z;
              } else {
                currentIndex = z;
              }
            }
          }
        }
        this.setState({
          barcodeValidYN,
          currentIndex,
        });
        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data);
        }

        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode2');
          this.barcode2.focus();
        }
      } else if (targetType === 'locField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode2Data = this.barcode2._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode2Data = scanData;
        }
        if (!barcode2Data) {
          // null check
          this._validCheck('location', 'nullCheck', 'barcode2Data');
          return;
        }
        // 로케이션 포맷 셋팅
        if (config.DMS_LOC_FORMAT) {
          if (config.DMS_LOC_FORMAT === 'Y') {
            if (barcode2Data.indexOf('-') < 1 || barcode2Data.length !== 9) {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              return;
            }
            if (barcode2Data.substr(3, 1) !== '-' || barcode2Data.substr(6, 1) !== '-') {
              this._validCheck('location', 'formatCheck', 'barcode2Data');
              this.failScan();
            }
          }
        }
        this.setState({
          barcodeValidYN,
        });
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false; // 로케이션 정보가 수정되었는지 체크
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data);
        } else {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode3');
          this.barcode3.focus();
        }
      } else if (targetType === 'docField') {
        // 로케이션에 대한 스캔 데이터를 제어한다.
        // if (targetType === 'itemField')
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.state.barcodeData2;
        barcode3Data = this.barcode3._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode3Data = scanData;
        }
        if (!barcode3Data) {
          // null check
          this._validCheck('doc', 'nullCheck', 'barcode3Data');
          return;
        }
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = false;
        if (barcodeValidYN === 'Y' || barcodeValidYN === 'A') {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data, barcode3Data);
        } else {
          this._barcodeValidYN2(barcodeValidYN, barcode2Data, barcode3Data);
        }
        if (barcodeValidYN === 'Y') {
          this._onClearBarcode('barcode4');
          this.barcode4.focus();
        }
      } else {
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.state.barcodeData2;
        barcode3Data = this.state.barcodeData3;
        barcode4Data = this.barcode4._lastNativeText;
        barcodeValidYN = this.state.barcodeValidYN;
        currentIndex = this.state.currentIndex;
        if (scanData) {
          barcode4Data = scanData;
        }
        if (!barcode4Data) {
          // null check
          this._validCheck('remark', 'nullCheck', 'barcode4Data');
          return;
        }
        locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        docSaveYN = true; // 로케이션 정보가 수정되었는지 체크
        remarkSaveYN = true;
        this._finalCheckDisplay(barcodeValidYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN);
      }
    }
  }
  // 마지막으로 화면처리 및 state 저장처리
  _finalCheckDisplay(barcodeYN, currentIndex, barcode1Data, barcode2Data, barcode3Data, barcode4Data, locationSaveYN, docSaveYN, remarkSaveYN) {
    const autoConfirmYN = this.props.global.config.DMS_AUTO_CONFIRM_YN;
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const targetG1ScanData =
currentIndex !== null ? this.state.data[currentIndex].ITEM_CODE.trim() : barcode1Data;
    let scanCnt = Number(this.state.successCnt);
    let refNoTarger = null;
    if (barcodeYN === 'Y' || barcodeYN === 'A') {
      refNoTarger = targetG1ScanData;
    } else {
      refNoTarger = barcode1Data;
    }
    if (barcodeYN === 'Y') {
      if (currentIndex !== null) {
        // 스캔 성공한 경우
        dataList[currentIndex].scanChecked = 'Y';
        if (locationSaveYN) {
          if (barcode2Data) {
            dataList[currentIndex].LOCATION = barcode2Data.toUpperCase().trim();
          }
        }
        if (docSaveYN) {
          if (barcode3Data) {
            dataList[currentIndex].DOC_NO = barcode3Data.toUpperCase().trim();
          }
        }
        if (remarkSaveYN) {
          if (barcode4Data) {
            dataList[currentIndex].REMARKS = barcode4Data.toUpperCase().trim();
          }
        }
        scanCnt += 1;
        this.setState({
          scanVaildData: `"${refNoTarger}" Scan Success! [${scanCnt}/${dataLength}]`,
          barcodeScanData: barcode1Data,
          barcodeScanIndex: currentIndex,
          data: dataList,
          successCnt: scanCnt,
          locationSaveYN,
          docSaveYN,
          remarkSaveYN,
        });
        this._setScanValidData('s');
        this._sound('s');
        // 아이템 갯수와 성공한 갯수가 같으면 자동확정
        if (dataLength === scanCnt) {
          if (autoConfirmYN === 'Y') {
            if (locationSaveYN && docSaveYN && remarkSaveYN) {
              this._saveLocation(); // saveLoc만 타도 remark 저장된다하여서, saveLoc만 태움
            } else if (locationSaveYN && remarkSaveYN) {
              this._saveLocation(); // saveLoc만 타도 remark 저장된다하여서, saveLoc만 태움
            } else if (docSaveYN && remarkSaveYN) {
              this._saveLocation(); // saveLoc만 타도 remark 저장된다하여서, saveLoc만 태움
              // remark api
            } else if (locationSaveYN && docSaveYN) {
              this._saveLocation(); // saveLoc만 타도 remark 저장된다하여서, saveLoc만 태움
            } else if (locationSaveYN && remarkSaveYN) {
              this._saveLocation(); // saveLoc만 타도 remark 저장된다하여서, saveLoc만 태움
            } else if (locationSaveYN) {
              this._saveLocation();
            } else if (docSaveYN) {
              this._saveDoc();
            } else if (remarkSaveYN) {
              this._saveLocation(); // saveLoc만 타도 remark 저장된다하여서, saveLoc만 태움
            } else {
              this._CONFIRM();
            }
          }
        } else {
          this._onClearBarcode('barcode1');
          if (locationSaveYN) {
            this._onClearBarcode('barcode2');
          }
          if (docSaveYN) {
            this._onClearBarcode('barcode3');
          }
          if (remarkSaveYN) {
            this._onClearBarcode('barcode4');
          }
          this.barcode1.focus();
        }
      }
    } else if (barcodeYN === 'A' || barcodeYN === 'N') {
      // 스캔 성공 하였지만, 중복 스캔 된 경우 또는 잘못 된 스캔 데이터
      this.setState({
        scanVaildData:
barcodeYN === 'A'
  ? `"${refNoTarger}" already scanned! [${scanCnt}/${dataLength}]`
  : `"${refNoTarger}" Scan Failure! [${scanCnt}/${dataLength}]`,
        locationSaveYN,
      });
      this._setScanValidData('f');
      this._sound('f');
    } else if (barcodeYN === 'LA') {
      // 로케이션 중복 허용되지 않을 경우 처리
      this.setState({
        scanVaildData: `"${barcode2Data}" Location already scanned!`,
        locationSaveYN,
      });
      this._onClearBarcode('barcode2');
      this.barcode2.focus();
      this._setScanValidData('f');
      this._sound('f');
    }
  }
  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
  }
  failScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
  }
  _keyboardDismiss() {
    this.setState({
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      barcodeData4: null,
      barcodeZoneCode: null,
    });
    Keyboard.dismiss();
  }
  _locationChecked() {
    this.setState({ locationTarget: this.state.locationTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }
  _docChecked() {
    this.setState({ docTarget: this.state.docTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }
  _remarkChecked() {
    this.setState({ remarkTarget: this.state.remarkTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }
_reqAreaIgnoreSet = () => {
  Util.msgBox({
    title: 'Do you want to proceed?',
    msg: 'The requested location differs from the scanned location',
    buttonGroup: [
      {
        title: 'No',
        onPress: () =>
          this.setState({
            reqAreaIgnore: 'N',
          }),
      },
      {
        title: 'Yes',
        onPress: () =>
          this.setState({
            reqAreaIgnore: 'Y',
          }),
      },
    ],
  });
};
_validCheck(text, validType, focusTarget) {
  if (validType === 'nullCheck') {
    this.setState({
      scanVaildData: `Please, Input the ${text} barcode data!`,
    });
  } else if (validType === 'lengthCheck') {
    this.setState({
      scanVaildData: `It is not ${text} information! Check again`,
      barcodeData1: text === 'item' ? null : this.state.barcodeData1,
      barcodeData2: text === 'location' ? null : this.state.barcodeData2,
      barcodeData3: text === 'doc' ? null : this.state.barcodeData3,
      barcodeData4: text === 'remark' ? null : this.state.barcodeData4,
    });
  } else if (validType === 'formatCheck') {
    this.setState({
      scanVaildData: `Please scan Correct ${text} Location format`,
      barcodeData1: text === 'item' ? null : this.state.barcodeData1,
      barcodeData2: text === 'location' ? null : this.state.barcodeData2,
      barcodeData3: text === 'doc' ? null : this.state.barcodeData3,
      barcodeData4: text === 'remark' ? null : this.state.barcodeData4,
    });
  }
  // 오류 났을때 포커스가 안움직임 버그인가..
  if (focusTarget === 'barcode1Data') {
    this._onClearBarcode('barcode1');
    this.barcode1.focus();
  } else if (focusTarget === 'barcode2Data') {
    this._onClearBarcode('barcode2');
    this.barcode2.focus();
  } else if (focusTarget === 'barcode3Data') {
    this._onClearBarcode('barcode3');
    this.barcode3.focus();
  } else {
    this._onClearBarcode('barcode4');
    this.barcode4.focus();
  }
  this._setScanValidData('f');
  this._sound('f');
}
// 첫번째 바코드 유효검사
_barcodeValidYN(barcodeValidYN, barcode1Data, barcode2Data, barcode3Data, barcode4Data) {
  if (barcodeValidYN === 'Y') {
    this.setState({
      scanVaildData: null,
      barcodeData1: barcode1Data,
      barcodeData2: barcode2Data,
      barcodeData3: barcode3Data,
      barcodeData4: barcode4Data,
      locationEditable: true,
      docEditable: true,
    });
    // if (locationSaveYN) {
    // this._onClearBarcode('barcode2');
    // this.barcode2.focus();
    // } else if (docSaveYN) {
    // this._onClearBarcode('barcode3');
    // this.barcode3.focus();
    // }
    // this._sound('s');
  } else if (barcodeValidYN === 'A') {
    this.setState({
      scanVaildData: 'already scaned! Check again!',
      barcodeData1: null,
    });
    this._setScanValidData('f');
    this._sound('f');
  } else {
    this.setState({
      scanVaildData: 'No matching data. Please, check again!',
      barcodeData1: null,
    });
    this.barcode1.focus();
    this._setScanValidData('f');
    this._sound('f');
  }
}
// 두번째 바코드 유효검사
_barcodeValidYN2(barcodeValidYN, barcode2Data, barcode3Data) {
  if (barcodeValidYN === 'Y') {
    this.setState({
      scanVaildData: null,
      barcodeData2: barcode2Data,
      barcodeData3: barcode3Data,
    });
    // this._onClearBarcode('barcode3');
    // this.barcode3.focus();
    this._sound('s');
  } else {
    this.setState({
      scanVaildData: 'Please check LOT No!',
      barcodeData2: null,
    });
    // this.barcode3.focus();
    this._setScanValidData('f');
    this._sound('f');
  }
}

// 해당 화면의 데이터 초기화
_resetState() {
  this.setState({
    barcodeData1: null,
    barcodeData2: null,
    barcodeData3: null,
    barcodeData4: null,
    scanVaildData: null,
    barcodeScanData: null,
    barcodeScanIndex: null,
    successCnt: 0,
    // locationTarget: true,
    barcode1Focus: false,
    barcode2Focus: false,
    barcode3Focus: false,
    locationEditable: false,
    docEditable: false,
    reqAreaIgnore: null,
    locationSaveYN: false,
    barcodeZoneCode: null,
  });
  this.fetch(null);
  this.barcode1.focus();
}

// tts(message) {
// if (this.props.global.config.CTM_TTS_YN !== 'Y') {
// return;
// }
// Tts.speak(message);
// }
_sound(type) {
  if (type === 's') {
    // 성공 시 알람
    Util.playSound('successSound');
  } else {
    // 실패 시 알람
    Util.playSound('failSound');
  }
}
_setScanValidData(type) {
  if (type === 'f') {
    // 실패 시 문구 표시
    this.scanVaildData.setNativeProps({
      style: styles.textVaildScanFailure,
    });
  } else {
    // 성공 시 문구 표시
    this.scanVaildData.setNativeProps({
      style: styles.textVaildScanSucess,
    });
  }
}
_clear() {
  this._keyboardDismiss();
  this._resetState();
}
_onClearBarcode(barcodeType) {
  if (barcodeType === 'barcode1') {
    this.barcode1.clear();
    this.setState({
      barcodeData1: null,
    });
  } else if (barcodeType === 'barcode2') {
    this.barcode2.clear();
    this.setState({
      barcodeData2: null,
    });
  } else if (barcodeType === 'barcode3') {
    this.barcode3.clear();
    this.setState({
      barcodeData3: null,
    });
  } else {
    this.barcode4.clear();
    this.setState({
      barcodeData4: null,
    });
  }
}
onBarcodePopup() {
  const { navigator } = this.props;
  Navigation(
    navigator,
    'com.layout.ComBarcode',
    {
      onBarcodeScan: result => this._onBarcodeScan(result),
    },
    'Barcode Scan',
  );
}
// onBarcodeScan(result) {
//   if (this.state.barcodeData2) {
//     this.focusNextField('locField', result);
//   } else if (this.state.barcodeData3) {
//     this.focusNextField('docField', result);
//   } else if (this.state.barcodeData4) {
//     this.focusNextField('remarkField', result);
//   } else {
//     this.focusNextField('itemField', result);
//   }
// }

_onBarcodeScan(result) {
  if (!this.state.barcodeData1) {
    // item이 스캔 되지 않았을 때는 무조건 아이템을 스캔 해준다.
    this.focusNextField('itemField', result);
  } else if (this.state.barcodeData1) {
    // 아이템이 스캔되어있을 경우
    if (this.state.locationTarget === 'N' && this.state.docTarget === 'N' && this.state.remarkTarget === 'Y') {
      this.focusNextField('remarkField', result);
    } else if (this.state.locationTarget === 'Y' && this.state.docTarget === 'N' && this.state.remarkTarget === 'Y') {
      if (this.state.barcodeData2) {
        this.focusNextField('remarkField', result);
      } else {
        this.focusNextField('locField', result);
      }
    } else if (this.state.locationTarget === 'Y' && this.state.docTarget === 'N' && this.state.remarkTarget === 'N') {
      this.focusNextField('locField', result);
    } else if (this.state.locationTarget === 'N' && this.state.docTarget === 'Y' && this.state.remarkTarget === 'Y') {
      if (this.state.barcodeData3) {
        this.focusNextField('remarkField', result);
      } else {
        this.focusNextField('docField', result);
      }
    } else if (this.state.locationTarget === 'N' && this.state.docTarget === 'Y' && this.state.remarkTarget === 'N') {
      this.focusNextField('docField', result);
    } else if (this.state.locationTarget === 'Y' && this.state.docTarget === 'Y' && this.state.remarkTarget === 'Y') {
      if (this.state.barcodeData2 && !this.state.barcodeData3 && !this.state.barcodeData4) {
        this.focusNextField('docField', result);
      } else if (this.state.barcodeData2 && this.state.barcodeData3 && !this.state.barcodeData4) {
        this.focusNextField('remarkField', result);
      } else {
        this.focusNextField('locField', result);
      }
    } else if (this.state.locationTarget === 'Y' && this.state.docTarget === 'Y' && this.state.remarkTarget === 'N') {
      if (this.state.barcodeData2) {
        this.focusNextField('docField', result);
      } else {
        this.focusNextField('locField', result);
      }
    }
  }
}


renderBarcode() {
  return (
    <View>
      <View style={styles.spaceAroundStyle}>
        <TextInput
          style={(styles.barcodeInput, { flex: 1 })}
          // ref="barcode1" // 빨간 줄 가도 무시하자!
          ref={c => {
            this.barcode1 = c;
          }}
          placeholder="Barcode"
          onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
          value={this.state.barcodeData1}
          autoFocus={this.state.GR_STATUS !== 'F'}
          // autoFocus
          blurOnSubmit={this.state.barcode1Focus}
          keyboardType="email-address"
          onSubmitEditing={() => {
            this.focusNextField('itemField');
          }}
        />
        <View style={styles.buttonStyle}>
          <HButton onPress={() => this._clear()} name={'refresh'} />
        </View>
      </View>
      <View style={styles.spaceAroundStyle}>
        {this.state.locationTarget === 'Y' ? (
          <TextInput
            style={(styles.barcodeInput, { flex: 1 })}
            ref={c => {
              this.barcode2 = c;
            }}
            placeholder="Location"
            onChangeText={barcodeData2 => this.setState({ barcodeData2 })}
            value={this.state.barcodeData2}
            keyboardType="email-address"
            // editable={this.state.locationEditable}
            // blurOnSubmit={this.state.barcode2Focus}
            onSubmitEditing={() => {
              this.focusNextField('locField');
            }}
          />
        ) : null}
        {this.state.docTarget === 'Y' ? (
          <TextInput
            style={(styles.barcodeInput, { flex: 1 })}
            ref={c => {
              this.barcode3 = c;
            }}
            placeholder="Doc No"
            onChangeText={barcodeData3 => this.setState({ barcodeData3 })}
            value={this.state.barcodeData3}
            keyboardType="email-address"
            // editable={this.state.docEditable}
            // blurOnSubmit={this.state.barcode3Focus}
            onSubmitEditing={() => {
              this.focusNextField('docField');
            }}
          />
        ) : null}
        {this.state.remarkTarget === 'Y' ? (
          <TextInput
            style={(styles.barcodeInput, { flex: 1 })}
            ref={c => {
              this.barcode4 = c;
            }}
            placeholder="Remark"
            onChangeText={barcodeData4 => this.setState({ barcodeData4 })}
            value={this.state.barcodeData4}
            keyboardType="email-address"
            // editable={this.state.docEditable}
            // blurOnSubmit={this.state.barcode3Focus}
            onSubmitEditing={() => {
              this.focusNextField('remarkField');
            }}
          />
        ) : null}
      </View>
    </View>
  );
}
renderBody = (item, index, scanData, scanIndex) => (
  <View
    // style={[
    // item.scanChecked === 'Y' ? { backgroundColor: '#75d9ff' } : { backgroundColor: '#fafafa' },
    // ]}
    key={item.SCAN_NO}
  >
    <HFormView
      style={[
        { marginTop: 2 },
        item.scanChecked === 'Y'
          ? { backgroundColor: '#75d9ff' }
          : { backgroundColor: '#fafafa' },
      ]}
    >
      <HRow between>
        <HText
          value={item.ITEM_CODE}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText
          value={item.ITEM_NAME}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText value={`Spec: ${item.SPECIFICATION}`} />
      </HRow>
      <HRow>
        <HText
          value={item.SCAN_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
      </HRow>
      <HRow>
        <HNumberfield label={'Item'} value={item.ITEM_QTY} />
        <HNumberfield label={'C/T'} value={item.BOX_QTY} />
        <HNumberfield label={'Plt'} value={item.PLT_QTY} />
        <HNumberfield label={'W/t:'} value={item.GW} />
      </HRow>
      <HRow between>
        <HText value={`${item.LOCATION} /${item.DOC_NO}/ ${item.REMARKS}`} />
      </HRow>
    </HFormView>
  </View>
);
render() {
  return (
    <HBaseView style={styles.container} scrollable={false}>
      {/* <Spinner visible={this.state.spinner} /> */}
      <View style={styles.spaceAroundStyle}>
        <Text style={styles.textTopStyle}>
          {this.state.GR_NO} ({this.state.GR_STATUS_NAME})
        </Text>
        {this.state.locSwitch === true ? (
          <View style={{ justifyContent: 'center', height: 20 }}>
            <HCheckbox
              label={'Loc'}
              value={this.state.locationTarget}
              onChanged={() => this._locationChecked()}
              editable
              toggle
            />
          </View>
        ) : null}
        {this.state.docSwitch === true ? (
          <View style={{ justifyContent: 'center', height: 20 }}>
            <HCheckbox
              label={'Doc'}
              value={this.state.docTarget}
              onChanged={() => this._docChecked()}
              editable
              toggle
            />
          </View>
        ) : null}
        {this.state.remarkSwitch === true ? (
          <View style={{ justifyContent: 'center', height: 20 }}>
            <HCheckbox
              label={'remark'}
              value={this.state.remarkTarget}
              onChanged={() => this._remarkChecked()}
              editable
              toggle
            />
          </View>
        ) : null}
      </View>
      {/* 바코드 스캔입력부분 제어 */}
      {this.state.itemEditable ? this.renderBarcode() : null}
      <Text
        style={styles.textVaildScan}
        ref={c => {
          this.scanVaildData = c;
        }}
      >
        {this.state.scanVaildData}
      </Text>
      <HListView
        keyExtractor={item => item.SCAN_NO}
        renderHeader={null}
        renderItem={({ item, index }) =>
          this.renderBody(item, index, this.state.barcodeScanData, this.state.barcodeScanIndex)
        }
        onSearch={() => this.fetch()}
        onMoreView={null}
        data={this.state.data}
        // 조회된값
        totalData={this.state.data}
        // 하단에 표시될 메세지값
        status={this.state.status}
      />
      <View style={styles.buttonContainer}>{this.buttonControll(this.state.taskStep)}</View>
      {/* 바코드 스캔입력부분 제어 */}
      {this.state.itemEditable ? (
        <Touchable
          style={styles.searchButton}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.onBarcodePopup()}
        >
          <HIcon name="barcode" size={20} color="#fff" />
        </Touchable>
      ) : null}
    </HBaseView>
  );
}
}
/**
* Define component styles
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonGroupContainer: {
    flex: 1,
    paddingRight: 5,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonInnerContainer: {
    flex: 1,
    margin: 5,
  },
  textTopStyle: {
    color: '#2c7bba',
    fontSize: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  textVaildScan: {
    color: '#000000',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  textVaildScanSucess: {
    color: '#3333ce',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  textVaildScanFailure: {
    color: '#d03a3a',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  spaceAroundStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 3,
    paddingLeft: 3,
  },
  barcodeInput: {
    height: 40,
    flex: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingRight: 3,
    paddingLeft: 3,
  },
  searchButton: {
    backgroundColor: 'rgba(52,152,219,0.8)',
    borderColor: 'rgba(52,152,219,0.8)',
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 200,
    right: 20,
    shadowColor: '#3f77a1',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
});
/**
* Inject redux actions and props
*/
const mapStateToProps = state => ({
  global: state.global,
});
/**
* Wrapping with root component
*/
export default Redux.connect(mapStateToProps)(Component);
