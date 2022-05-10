/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, bluecolor, _ } from 'libs';
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
import Tts from 'react-native-tts';

/**
 * 입고 세부상세 정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100303');

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
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
      locationTarget: 'Y',
      barcode1Focus: false,
      barcode2Focus: false,
      itemEditable: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 스캔 필드 비 활성화
      locationEditable: false,
      locSwitch: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 location scan 콤보박스 비 활성화
      reqAreaIgnore: null,
      locationSaveYN: false,
      barcodeZoneCode: null,
    };

    Tts.setDefaultLanguage('ko');
    Tts.voices().then(voices => console.log('voices', voices));
  }

  componentWillMount() {
    this.fetch(null);
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('WMS010205SVC', 'getRef', {
      body: JSON.stringify({
        WMS010205F1: {
          WH_CODE: this.state.WH_CODE,
          GR_NO: this.state.GR_NO,
          GR_DATE_FROM: this.state.GR_DATE,
          GR_DATE_TO: this.state.GR_DATE,
          GR_FLAG: 'Y',
        },
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.

      this.setState(
        {
          data: result.WMS010205G3,
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
      this.tts('Do you want to Confrim?');
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
    } else if (this.state.locationSaveYN) {
      this._saveLocation(); // this._saveLocationCheck();
    } else {
      this._CONFIRM();
    }
  }

  async _saveLocation() {
    const { config } = this.props.global;
    const wmsBlockDup = config.WMS_BLOCK_DUP; // 로케이션 중복 허용 설정
    // const wmsBlockDup = _.get(this.props.global, 'config.WMS_BLOCK_DUP', null);

    let tabCode = 'M_REF_DT';
    if (wmsBlockDup) {
      if (wmsBlockDup === 'Y') {
        tabCode = 'M_GR_REF_DT';
      }
    }
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { navigator } = this.props;
    const resultLoc = await Fetch.request('WMS010205SVC', 'saveLoc', {
      body: JSON.stringify({
        WMS010205F1: {
          TAB_CODE: tabCode, // 모바일 상세정보(기존LOCATION여부 체크)
        },
        WMS010205G1: {
          data: this.state.data,
        },
      }),
    });

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

  async _CONFIRM() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { componentId } = this.props;
    const result = await Fetch.request('WMS010205SVC', 'confirm', {
      body: JSON.stringify({
        WMS010205G1: {
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
        title: 'Confrim Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
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

    const result = await Fetch.request('WMS010205SVC', 'cancel', {
      body: JSON.stringify({
        WMS010205G1: {
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

  // 바코드 스캔 처리 로직
  async focusNextField(targetType, scanData) {
    Vibration.vibrate(500);

    const { config } = this.props.global;
    const dataLength = this.state.data.length;
    const locationTarget = this.state.locationTarget;
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);

    let barcode1Data = null; // 첫번째 바코드값
    let barcode2Data = null; // 두번째 바코드값
    let barcodeYN = 'N'; // 'Y'바코드스캔성공, 'N'바코드스캔 실패, 'A'바코드스캔중복, 'LA'중복방지했는지중본된경우
    let currentIndex = null; // 현재 바코드스캔으로 선택된로우인덱스
    let barcodeValidYN = 'N';
    let locationSaveYN = false;
    const barcodeZoneCode = this.state.barcodeZoneCode;

    if (locationTarget === 'Y') {
      // location 스캔 할 경우
      if (targetType === 'itemField') {
        // 아이템 정보 스캔 후 로케이션 스캔 textInput으로 데이터 넘길 때
        barcode1Data = this.barcode1._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }

        if (!barcode1Data) {
          // null check
          this._validCheck('item', 'nullCheck');
          return;
        }

        if (Util.checkBarcode(barcode1Data) === 'LOC') {
          // length check
          this._validCheck('item', 'lengthCheck');
          return;
        }

        for (let i = 0; i < dataLength; i += 1) {
          const scanNo = this.state.data[i].SCAN_NO.toUpperCase().trim();
          if (barcode1Data.toUpperCase().trim() === scanNo) {
            if (this.state.data[i].scanChecked !== 'Y') {
              barcodeValidYN = 'Y';
              currentIndex = i;
            } else {
              barcodeValidYN = 'A';
            }
          }
        }

        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        if (barcodeValidYN === 'Y') {
          this._barcodeValidYN(barcodeValidYN, barcode1Data);
        } else {
          this._barcodeValidYN(barcodeValidYN, barcode1Data);
          return;
        }

        locationSaveYN = false; // 로케이션 정보가 수정되었는지 체크

        const targetG1ZoneCode = this.state.data[currentIndex].ZONE_CODE.trim();
        this.setState({
          barcodeZoneCode: targetG1ZoneCode,
        });
      } else {
        // 로케이션에 대한 스캔 데이터를 제어한다.
        // if (targetType === 'itemField')
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.barcode2._lastNativeText;
        if (scanData) {
          barcode2Data = scanData;
        }

        if (!barcode2Data) {
          // null check
          this._validCheck('location', 'nullCheck');
          return;
        }

        if (
          Util.checkBarcode(barcode2Data) === 'REF' ||
          Util.checkBarcode(barcode2Data) === 'PLT'
        ) {
          // length check
          this._validCheck('location', 'lengthCheck');
          return;
        }

        // 로케이션 포맷 셋팅
        if (config.WMS_LOC_FORMAT) {
          if (config.WMS_LOC_FORMAT === 'Y') {
            if (barcode2Data.indexOf('-') < 1 || barcode2Data.length !== 9) {
              this._validCheck('location', 'formatCheck');
              return;
            }

            if (barcode2Data.substr(3, 1) !== '-' || barcode2Data.substr(6, 1) !== '-') {
              this._validCheck('location', 'formatCheck');
              this.failScan();
              return;
            }
          }
        }

        if (barcodeZoneCode) {
          // 로케이션 및 존 코드 비교
          // async await 처리 : 비동기식으로 가지만 존 정보 체크 시에는 잠시 await로 홀딩 후 처리
          // const zoneValid = await this._getZoneValid(whCode, barcode2Data, barcodeZoneCode);

          // 존코드를 비교하기 위해 백단을 호출하기 때문에 spinner 처리
          this.setState({
            spinner: true,
          });

          const zoneValid = await Fetch.getZoneValid(whCode, barcode2Data, barcodeZoneCode);

          // 요청한 존과 배치랑 로케이션 정보가 다를 경우 경고창
          if (zoneValid === 'N') {
            // 경고창을 통해 정말 진행 여부 묻기!
            await this._zoneValidAlert(barcode1Data, barcode2Data);
          } else {
            // 존 정보가 같다면 다음 단계로 진행! (스피너 false처리 있음)
            this._zoneValidAlertSet('continue', barcode1Data, barcode2Data);
          }
        } else {
          // 요청 존 정보 없을 경우 체크 로직 스킵 처리! (스피너 false처리 있음)
          this._zoneValidAlertSet('continue', barcode1Data, barcode2Data);
        }
      }
    } else {
      // location 스캔 안 할 경우
      // 로케이션 관리를 하지 않는 경우 처리
      this._onClearBarcode('barcode1');

      barcode1Data = this.barcode1._lastNativeText;
      if (scanData) {
        barcode1Data = scanData;
      }
      if (!barcode1Data) {
        // null check
        this._validCheck('item', 'nullCheck');
        return;
      }

      if (Util.checkBarcode(barcode1Data) === 'LOC') {
        // length check
        this._validCheck('item', 'lengthCheck');
        return;
      }

      for (let i = 0; i < dataLength; i += 1) {
        const scanNo = this.state.data[i].SCAN_NO.toUpperCase().trim();
        if (barcode1Data.toUpperCase().trim() === scanNo) {
          console.log('scanNo : ', scanNo);
          currentIndex = i;
          if (this.state.data[i].scanChecked !== 'Y') {
            barcodeYN = 'Y'; // 스캔 성공
          } else {
            barcodeYN = 'A'; // 스캔 중복
          }
        }
      }
      console.log('barcode1Data.toUpperCase().trim() : ', barcode1Data.toUpperCase().trim());
      console.log('barcodeYN : ', barcodeYN);
      locationSaveYN = false; // 로케이션 정보가 수정되었는지 체크
      // 아이템 및 로케이션 정보까지 찍었을 경우에 최종 조건 로직으로 이동
      /*
       * 스캔 성공 여부에 따른 공통 로직 시작
       */
      this._finalCheckDisplay(barcodeYN, currentIndex, barcode1Data, barcode2Data, locationSaveYN);
      /*
       * 스캔 성공 여부에 따른 공통 로직 끝
       */
    }
  }

  // 마지막으로 화면처리 및 state 저장처리
  _finalCheckDisplay(barcodeYN, currentIndex, barcode1Data, barcode2Data, locationSaveYN) {
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const targetG1ScanData =
      currentIndex !== null ? this.state.data[currentIndex].REF_DT_NO.trim() : barcode1Data;

    let scanCnt = Number(this.state.successCnt);
    let refNoTarger = null;

    if (barcodeYN === 'Y' || barcodeYN === 'A') {
      refNoTarger = targetG1ScanData;
    } else {
      refNoTarger = barcode1Data;
    }

    if (barcodeYN === 'Y') {
      // 스캔 성공한 경우
      dataList[currentIndex].scanChecked = 'Y';
      if (barcode2Data) {
        dataList[currentIndex].LOCATION = barcode2Data.toUpperCase().trim();
      }
      scanCnt += 1;
      this.setState({
        scanVaildData: `"${refNoTarger}" Scan Success! [${scanCnt}/${dataLength}]`,
        barcodeScanData: barcode1Data,
        barcodeScanIndex: currentIndex,
        data: dataList,
        successCnt: scanCnt,
        locationSaveYN,
      });

      this._setScanValidData('s');
      this._sound('s');
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

  _keyboardDismiss() {
    this.setState({
      barcodeData1: null,
      barcodeData2: null,
      barcodeZoneCode: null,
    });

    Keyboard.dismiss();
  }

  _locationChecked() {
    this.setState({ locationTarget: this.state.locationTarget === 'Y' ? 'N' : 'Y' });
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

  _validCheck(text, validType) {
    if (validType === 'nullCheck') {
      this.setState({
        scanVaildData: `Please, Input the ${text} barcode data!`,
      });
    } else if (validType === 'lengthCheck') {
      this.setState({
        scanVaildData: `It is not ${text} information! Check again`,
        barcodeData1: text === 'item' ? null : this.state.barcodeData1,
        barcodeData2: text === 'location' ? null : this.state.barcodeData2,
      });
    } else if (validType === 'formatCheck') {
      this.setState({
        scanVaildData: `Please scan Correct ${text} format`,
        barcodeData1: text === 'item' ? null : this.state.barcodeData1,
        barcodeData2: text === 'lot' ? null : this.state.barcodeData2,
        barcodeData3: text === 'location' ? null : this.state.barcodeData3,
      });
    }

    this._setScanValidData('f');
    this._sound('f');
  }

  // 첫번째 바코드 유효검사
  _barcodeValidYN(barcodeValidYN, barcode1Data) {
    if (barcodeValidYN === 'Y') {
      this.setState({
        scanVaildData: null,
        barcodeData1: barcode1Data,
        locationEditable: true,
      });

      this._onClearBarcode('barcode2');
      this.barcode2.focus();

      this._sound('s');
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

  // 해당 화면의 데이터 초기화
  _resetState() {
    this.setState({
      barcodeData1: null,
      barcodeData2: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
      // locationTarget: true,
      barcode1Focus: false,
      barcode2Focus: false,
      locationEditable: false,
      reqAreaIgnore: null,
      locationSaveYN: false,
      barcodeZoneCode: null,
    });
    this.fetch(null);
    this.barcode1.focus();
  }

  // 요청 존 정보와의 불 일치할 경우 경고창을 통해 진행 여부 확인
  _zoneValidAlert(barcode1Data, barcode2Data) {
    Util.msgBox({
      title: 'Do you want to proceed?',
      msg: 'Request zone and location mismatch',
      buttonGroup: [
        {
          title: 'No',
          onPress: () => this._zoneValidAlertSet('cancel', barcode1Data, barcode2Data),
        },
        {
          title: 'Yes',
          onPress: () => this._zoneValidAlertSet('continue', barcode1Data, barcode2Data),
        },
      ],
    });
  }

  // 요청 존 정보와의 불 일치할 경우 경고창을 통해 진행 여부 확인 후 로직 처리
  _zoneValidAlertSet(type, barcode1Data, barcode2Data) {
    const { config } = this.props.global;
    const wmsBlockDup = config.WMS_BLOCK_DUP; // 로케이션 중복 허용 설정
    const dataLength = this.state.data.length;
    let barcodeYN = 'N';
    let currentIndex = null;
    let locationSaveYN = false;

    if (type === 'cancel') {
      this.setState({
        scanVaildData: 'Request zone and location mismatch.\nPlease move to another location.',
        spinner: false,
        barcodeData2: null,
      });

      this.barcode2.focus();
      this._setScanValidData('f');
      this._sound('f');
    } else {
      for (let i = 0; i < dataLength; i += 1) {
        const scanNo = this.state.data[i].SCAN_NO.toUpperCase().trim();
        const scanLoc = this.state.data[i].LOCATION.toUpperCase().trim();

        if (barcode1Data.toUpperCase().trim() === scanNo) {
          currentIndex = i;
          if (this.state.data[i].scanChecked !== 'Y') {
            barcodeYN = 'Y'; // 스캔 성공
          } else {
            barcodeYN = 'A'; // 스캔 중복
          }
        }

        // 로케이션 중복 건 처리
        if (wmsBlockDup && wmsBlockDup === 'Y') {
          if (barcode2Data === scanLoc) {
            barcodeYN = 'LA';
            currentIndex = i;

            break; // 중복 건이 발생되면 빠져 나감.
          }
        }

        // 로케이션 중복은 나중에 공통 처리 부분으로 변경
        if (barcodeYN !== 'LA') {
          this._onClearBarcode('barcode1');
          this._onClearBarcode('barcode2');
          this.barcode1.focus();
        }
      }

      locationSaveYN = true; // 로케이션 정보가 수정되었는지 체크

      this.setState({
        spinner: false,
      });

      // 아이템 및 로케이션 정보까지 찍었을 경우에 최종 조건 로직으로 이동
      this._finalCheckDisplay(barcodeYN, currentIndex, barcode1Data, barcode2Data, locationSaveYN);
    }
  }

  tts(message) {
    if (this.props.global.config.CTM_TTS_YN !== 'Y') {
      return;
    }
    Tts.speak(message);
  }

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
    } else {
      this.barcode2.clear();
      this.setState({
        barcodeData2: null,
      });
    }
  }

  onBarcodePopup() {
    const { navigator } = this.props;
    Navigation(
      navigator,
      'com.layout.ComBarcode',
      {
        onBarcodeScan: result => this.onBarcodeScan(result),
      },
      'Barcode Scan',
    );
  }

  onBarcodeScan(result) {
    if (this.state.barcodeData1) {
      this.focusNextField('locField', result);
    } else {
      this.focusNextField('itemField', result);
    }
  }

  renderBarcode() {
    return (
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
            editable={this.state.locationEditable}
            blurOnSubmit={this.state.barcode2Focus}
            onSubmitEditing={() => {
              this.focusNextField('locField');
            }}
          />
        ) : null}
        <View style={styles.buttonStyle}>
          <HButton onPress={() => this._clear()} name={'refresh'} />
        </View>
      </View>
    );
  }

  renderBody = (item, index, scanData, scanIndex) => (
    <View
      // style={[
      //   item.scanChecked === 'Y' ? { backgroundColor: '#75d9ff' } : { backgroundColor: '#fafafa' },
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
            value={`${item.REF_DT_NO}(${item.PARTITION_SEQ_NO})`}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HText value={item.REF_NO} />
        </HRow>
        <HRow>
          <HNumberfield label={'Item'} value={item.ITEM_QTY} />
          <HNumberfield label={'C/T'} value={item.CT_QTY} />
          <HNumberfield label={'Plt'} value={item.PLT_QTY} />
          <HNumberfield label={'W/t:'} value={item.WEIGHT} />
        </HRow>
        <HRow between>
          <HText value={`${item.ZONE_CODE} / ${item.LOCATION} / ${item.LOT_NO}`} />
          <HText value={item.GOODS_NAME_15} />
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
