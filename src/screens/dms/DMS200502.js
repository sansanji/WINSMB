/* *
* Import Common
* */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration, TouchableOpacity } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, bluecolor, modelUtil } from 'libs';
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
* 출고 상세 정보
*/
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200102');
    this.state = {
      data: [],
      status: null,
      taskStep: this.props.params.GR_STATUS === 'F' ? '2' : '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      // 클로즈 기능으로 신규추가
      VENDOR_CODE: this.props.params.VENDOR_CODE,
      BUYER_CODE: this.props.params.BUYER_CODE,
      WH_CODE: this.props.params.WH_CODE,
      GR_NO: this.props.params.GR_NO,
      GR_DATE: this.props.params.GR_DATE,
      GR_STATUS: this.props.params.GR_STATUS,
      GR_STATUS_NAME: this.props.params.GR_STATUS_NAME,
      barcodeData1: null,
      barcodeData2: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      barcode1Focus: false,
      barcode2Focus: false,
      successCnt: 0,
      itemEditable: this.props.params.GR_STATUS !== 'F', // 확정된 데이터라면 스캔 필드 비 활성화
      itemTotalQty: 0,
      totalItemQty: 0,
      totalCheckItemQty: 0,
      GR_REF_DOC_NO: null,
      SCAN_USER_ID: null,
      serialTarget: 'N',
      serialList: [],
      currentIndex: null,
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
    const result = await Fetch.request('DMS030050SVC', 'getDt', {
      body: JSON.stringify({
        DMS030050F1: {
          WH_CODE: this.state.WH_CODE,
          GR_NO: this.state.GR_NO,
          GR_DATE_FROM: this.state.GR_DATE,
          GR_DATE_TO: this.state.GR_DATE,
          GR_FLAG: 'Y',
        },
      }),
    });
    Util.openLoader(this.screenId, false);
    if (result) {
      // 백단에서 받아온 토탈 스캔 값을 받아온다.

      let itemCheckQty = 0;
      for (let i = 0; i < result.DMS030050G2.length; i++) {
        itemCheckQty += result.DMS030050G2[i].SCAN_QTY;
      }
      // 정해진 데이터만 보여준다.
      this.setState(
        {
          data: result.DMS030050G2,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
          GR_REF_DOC_NO: result.DMS030050G2[0].GR_REF_DOC_NO,
          SCAN_USER_ID: result.DMS030050G2[0].SCAN_USER_ID,
          totalCheckItemQty: itemCheckQty,
        },
        callback,
      );
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('DMS200102', result.DMS030050G2);
      // 아이템 종 개수 구하기
      const itemQtyValue = result.DMS030050G2.map(item => item.ITEM_QTY);
      const itemQty = itemQtyValue.reduce((sum, currValue) => sum + currValue, 0);
      this.setState({ totalItemQty: itemQty });

      this.barcode1.clear();
      this.barcode2.clear();
      this.barcode1.focus();

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
      this.onSave(null, '현재상태 저장', 'confirmY');

      // this._CONFIRM();
    }
    if (eventType === 'CANCEL') {
      Util.msgBox({
        title: 'Cancel',
        msg: '출고취소하시겠습니까?',
        buttonGroup: [
          {
            title: 'OK',
            // onPress: () => this._CANCEL(),
            onPress: () => this.onSave('cancel', '현재상태 취소', 'confirmN'),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
  }
  async _CONFIRM() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const reqList = [];
    const missList = [];
    for (let i = 0; i < dataLength; i += 1) {
      if (dataList[i].SCAN_QTY) {
        if (dataList[i].SCAN_QTY === dataList[i].ITEM_QTY) {
          reqList.push(dataList[i]);
        } else {
          missList.push(dataList[i]);
        }
      } else {
        missList.push(dataList[i]);
      }
    }
    if (missList.length > 0) {
      const msg = `스캔수량이 맞지않는 ${missList.length}건의 아이템이 존재합니다.`;
      Util.msgBox({
        title: '출고처리',
        msg,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      Util.openLoader(this.screenId, false);
      return;
    }

    const { componentId } = this.props;
    const result = await Fetch.request('DMS030050SVC', 'confirm', {
      body: JSON.stringify({
        DMS030050G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GR_NO: this.state.GR_NO,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
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
    const result = await Fetch.request('DMS030050SVC', 'cancel', {
      body: JSON.stringify({
        DMS030050G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GR_NO: this.state.GR_NO,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
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
  // 검수시작
  async grScanUserSave() {
    const result = await Fetch.request('DMS030050SVC', 'grScanUserSave', {
      body: JSON.stringify({
        DMS030050G1: {
          data: [
            {
              COMPANY_CODE: this.state.COMPANY_CODE,
              WH_CODE: this.state.WH_CODE,
              GR_NO: this.state.GR_NO,
            },
          ],
        },
      }),
    });
    if (result.TYPE === 1) {
      this.fetch(null);
    } else {
      Util.toastMsg(result.MSG);
    }
  }
  // scan user name 삭제 / 검수 시작 취소
  async grScanUserCansel(confirmYN) {
    const result = await Fetch.request('DMS030050SVC', 'grScanUserCansel', {
      body: JSON.stringify({
        DMS030050G1: {
          data: [
            {
              COMPANY_CODE: this.state.COMPANY_CODE,
              WH_CODE: this.state.WH_CODE,
              GR_NO: this.state.GR_NO,
            },
          ],
        },
      }),
    });
    if (result.TYPE === 1) {
      // 확정  취소 일 경우
      if (!Util.isEmpty(confirmYN) && confirmYN === 'confirmN') {
        this._CANCEL();
      } else {
        this.fetch(null);
        this.props.onSaveComplete();
      }
    } else {
      Util.toastMsg(result.MSG);
    }
  }

  // 검수 스캔 수량 임시저장 처리
  async saveScanQty(reqList, confirmYN) {
    const result = await Fetch.request('DMS030050SVC', 'grTempQtySave', {
      body: JSON.stringify({
        DMS030050G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      // 확정버튼클릭했을때
      if (!Util.isEmpty(confirmYN)) {
        this._CONFIRM();
      } else {
        // 확정이 아닌 임시저장만 할때
        this.setState({
          barcodeData1: null,
        });
        this.fetch(null);
        this.props.onSaveComplete();
      }
    } else {
      Util.toastMsg(result.MSG);
    }
  }

  // 스캔할때마다 저장 api 호출
  async eSaveScanQty(reqList) {
    const result = await Fetch.request('DMS030050SVC', 'grTempQtySave', {
      body: JSON.stringify({
        DMS030050G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      // 확정이 아닌 임시저장만 할때
      Util.toastMsg(result.MSG);
    } else {
      Util.toastMsg(result.MSG);
    }
  }

  // 검수 스캔 수량 임시저장 취소 처리
  async grTempQtyCancel(confirmYN) {
    // confirm 상태이면 검수 취소 불가
    if (this.props.params.GR_STATUS === 'F' && confirmYN === 'cancle') {
      Util.msgBox({
        title: 'Alert',
        msg: '이미 확정 된 데이터로 검수취소가 불가능합니다.',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    const result = await Fetch.request('DMS030050SVC', 'grTempQtyCancel', {
      body: JSON.stringify({
        DMS030050G1: {
          data: this.state.data,
        },
      }),
    });

    if (result.TYPE === 1) {
      this.setState({
        totalCheckItemQty: 0,
      });

      if (confirmYN === 'confirmN' || confirmYN === 'cancle') {
        this.grScanUserCansel(confirmYN);
      } else {
        this.fetch(null);
        this.props.onSaveComplete();
      }
    } else {
      Util.toastMsg(result.MSG);
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
  focusNextField(targetType, scanData) {
    const dataLength = this.state.data.length;
    const serialTarget = this.state.serialTarget;

    const dataList = this.state.data;

    let barcode1Data = null; // 첫번째 바코드값
    const barcode2Data = null; // 두번째 바코드값
    let currentIndex = null; // 현재 바코드스캔으로 선택된로우인덱스
    let barcodeValidYN = 'N';

    // 아이템 - 시리얼 스캔을 하기위해 토글버튼을 클릭하여 '시리얼 스캔모드'로 변경 했을 경우
    if (serialTarget === 'Y') {
      // 1 ------------------serial 스캔 할 경우 시작 --------------------
      if (targetType === 'barcodeField') {
        // 아이템 정보를 스캔하여 아이템코드 내역과 일치하는지 확인
        barcode1Data = this.barcode1._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }

        // 바코드 입력 예외 처리
        if (!barcode1Data) {
          this.setState({
            scanVaildData: '바코드를 입력해주세요',
          });
          this.scanVaildData.setNativeProps({
            style: styles.textVaildScanFailure,
          });
          this._sound('f');
          Vibration.vibrate(2000);
          return;
        }

        for (let i = 0; i < dataLength; i += 1) {
          const Itemvalue = this.state.data[i].BARCODE.toUpperCase().trim();
          if (barcode1Data.toUpperCase().trim() === Itemvalue) {
            if (Util.isEmpty(dataList[i].completed)) {
              if (this.state.data[i].ITEM_QTY === this.state.data[i].SCAN_QTY) {
                barcodeValidYN = 'A';
              } else {
                barcodeValidYN = 'Y';
                currentIndex = i;
              }
            }
          }
        }

        // 1차적으로 아이템에 대한 바코드를 찍겠지만, 아이템에 대한 데이터 유효성 뿐만 아니라
        // 로케이션 정보도 맞아야 하기 때문에 임시적으로 체크 처리
        this._barcodeValidYN(barcodeValidYN, barcode1Data);

        // 바코드 이동이 잘 되지않아서 바코드 포커스 이동 로직 추가
        if (barcodeValidYN === 'Y') {
          this.barcode2.focus();
        }

        this._sound('s');
        Vibration.vibrate(500);
      }
    } // 1 ------------------serial 스캔 할 경우 끝 --------------------
    // 바코드 번호 스캔했는지 확인 필요.
    if ((serialTarget === 'Y' && targetType !== 'barcodeField') || serialTarget === 'N') {
      // serial 스캔 했을 때, 카운트 진행
      Vibration.vibrate(500);

      let barcodeYN = 'N';
      let scanCnt = Number(this.state.successCnt);
      let g1ScanData = null;
      let targetG1ScanData = null;
      let SCAN_QTY = 0; // 스캔한 아이템 개수
      let TOTAL_QTY = 0; // 총아이템개수


      if (serialTarget === 'N') {
        barcode1Data = this.barcode1._lastNativeText;

        if (scanData) {
          barcode1Data = scanData;
        }


        if (!barcode1Data) {
          this.setState({
            scanVaildData: '바코드를 입력해주세요',
          });
          this.scanVaildData.setNativeProps({
            style: styles.textVaildScanFailure,
          });
          this._sound('f');
          Vibration.vibrate(2000);
          return;
        }
      }

      // 입고 등록시 시리얼을 등록한 경우,
      if (!Util.isEmpty(this.state.data[0].SAVED_SERIAL_NO) && targetType !== 'barcodeField') {
        barcode1Data = this.barcode2._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }
      }

      for (let i = 0; i < dataLength; i += 1) {
        // 아이템마스터의 바코드로 스캔
        // 시리얼이 백단에서 입력된 경우 시리얼과 list 내역 매칭
        if (this.state.data[0].SAVED_SERIAL_NO.length > 0 && targetType !== 'barcodeField') {
          g1ScanData = this.state.data[i].SAVED_SERIAL_NO.toUpperCase().trim();
        } else {
          // 시리얼이 백단에서 입력된 경우 아이템 list 내역 매칭
          g1ScanData = this.state.data[i].BARCODE.toUpperCase().trim();
        }

        // if (barcode1Data.toUpperCase().trim() === g1ScanData)
        if (barcode1Data.toUpperCase().trim() === g1ScanData) {
          if (Util.isEmpty(dataList[i].completed)) {
            currentIndex = i;
            barcodeYN = 'Y'; // 스캔 성공
            if (
              dataList[currentIndex].SCAN_QTY === undefined || dataList[currentIndex].SCAN_QTY === null
            ) {
              SCAN_QTY = 0;
            } else {
              SCAN_QTY = dataList[currentIndex].SCAN_QTY;
            }
            TOTAL_QTY = dataList[currentIndex].ITEM_QTY;
          }
        }
      }
      // 스캔 성공 여부에 따른 로직
      if (barcodeYN === 'Y') {
        // 스캔 성공한 경우
        // if (currentIndex !== null) {
        dataList[currentIndex].scanChecked = 'Y';
        // 스트링 값으로 오는 경우
        SCAN_QTY = parseInt(SCAN_QTY, 10);
        SCAN_QTY += 1;
        scanCnt += 1;
        dataList[currentIndex].SCAN_QTY = SCAN_QTY;
        targetG1ScanData = this.state.data[currentIndex].BARCODE.trim();
        if (TOTAL_QTY === SCAN_QTY) {
          this.setState({
            scanVaildData: `"${targetG1ScanData}" (${SCAN_QTY} / ${TOTAL_QTY}) 수량이 일치합니다.`,
            barcodeScanData: barcode1Data,
            barcodeScanIndex: currentIndex,
            data: dataList,
            successCnt: scanCnt,
          });
          dataList[currentIndex].completed = 'Y';
          this._setScanValidData('s');
          this.barcode1.focus();
          this.onSave('every');
        } else {
          this.setState({
            scanVaildData: `"${targetG1ScanData}" (${SCAN_QTY}/${TOTAL_QTY}) 수량이 일치하지 않습니다.`,
            barcodeScanData: barcode1Data,
            barcodeScanIndex: currentIndex,
            data: dataList,
            successCnt: scanCnt,
          });
          if (TOTAL_QTY < SCAN_QTY) {
            this._sound('f');
            Vibration.vibrate(2000);
            return;
          }
          this._setScanValidData('f');
        }
        // this.getTotalCheckItemQty();
        this.barcode1.focus();
      } else {
        // 스캔 실패한 경우
        this.setState({
          scanVaildData: `"${barcode1Data}" (${SCAN_QTY} / ${TOTAL_QTY}) 스캔실패`,
          barcodeScanData: null,
          barcodeScanIndex: currentIndex,
          successCnt: 0,
        });
        this._setScanValidData('f');
        this._sound('f');
        Vibration.vibrate(2000);
      }
      this._onClearBarcode('barcode1');

      // serial 체크하는 경우에만 삭제해줌
      if (this.state.serialTarget === 'Y') {
        this._onClearBarcode('barcode2');
      }

      Keyboard.dismiss(); // 키보드 닫기!
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
  _soundConfirm(type) {
    if (type === 's') {
      // 성공 시 알람
      Util.playConfirmSound('successSound');
    } else {
      // 실패 시 알람
      Util.playConfirmSound('failSound');
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
    Keyboard.dismiss();
    this.barcode1.clear();
    this.setState({
      barcodeData1: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
    });
    this.fetch(null);
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
      this.focusNextField('serialField', result);
    } else {
      this.focusNextField('barcodeField', result);
    }
  }

  // 전체 카운팅
  _onCheckPress(item, index) {
    const data = this.state.data;
    const setScanQty = item.ITEM_QTY;

    if (item.SCAN_QTY === item.ITEM_QTY) {
      data.forEach(x => {
        if (x === item) {
          x.SCAN_QTY = 0;
          x.scanChecked = 'N';
          x.completed = 'N';
          x.SERIAL_CNT = 0;
        }
      });
      Util.toastMsg('0개 스캔');
    } else {
      data.forEach(x => {
        if (x === item) {
          x.SCAN_QTY = setScanQty;
          x.scanChecked = 'Y';
          x.completed = 'Y';
        }
      });
      Util.toastMsg(`${setScanQty}개 스캔`);
    }

    this.setState({
      scanVaildData: null,
      data,
    });
    this.getTotalCheckItemQty();
    // this._sound('s');
  }
  // 매뉴얼로 카운팅
  _onCountPress(item, index) {
    const data = this.state.data;
    // const totalData = this.state.totalData;
    let setScanQty = item.SCAN_QTY || 0;
    setScanQty += 1;
    data.forEach(x => {
      if (x === item) {
        x.SCAN_QTY = setScanQty;
        x.scanChecked = 'Y';
      }
    });
    this.setState({
      data,
    });
    this.checkOverItemQty(item);
    // this._sound('s');
    Util.toastMsg(`${setScanQty}개 스캔`);
  }
  checkOverItemQty(item) {
    // SCAN_QTY 가 0인 경우 걸러내기
    const CheckValue = this.state.data.map(data => {
      if (data.SCAN_QTY === undefined || data.SCAN_QTY === null) {
        return { ...data, SCAN_QTY: 0 };
      }
      return data;
    });

    if (item.SCAN_QTY > item.ITEM_QTY) {
      // this._sound('f');
      this.getTotalCheckItemQty('overAlerm');
      return;
    }
    this.getTotalCheckItemQty();
  }
  // 아이템 check 개수 구하기
  getTotalCheckItemQty(overValue) {
    let checkItmeValue = null;
    // SCAN_QTY 가 0인 경우 걸러내기
    const CheckValue = this.state.data.map(data => {
      if (data.SCAN_QTY === undefined || data.SCAN_QTY === null) {
        return { ...data, SCAN_QTY: 0 };
      }
      return data;
    });
    // SCAN_QTY와 ITEM_QTY 다를 경우 total count가 같아도 _sound('f')로 나게해야됨.
    const getItmeStatus = this.state.data.map(data => {
      if (data.SCAN_QTY === data.ITEM_QTY) {
        return { ...data, checkItmeValue: true };
      }
      return { ...data, checkItmeValue: false };
    });
    if (getItmeStatus.every((data) => data.checkItmeValue === false)) {
      checkItmeValue = false;
    } else {
      checkItmeValue = true;
    }
    // total 합계를 얻기위해 사용
    const itemQtyValue = CheckValue.map(item => item.SCAN_QTY);
    const itemCheckQty = itemQtyValue.reduce((sum, currValue) => sum + currValue, 0);
    this.setState({ totalCheckItemQty: itemCheckQty });
    if (Util.isEmpty(overValue)) {
      this.soundCheck(itemCheckQty, checkItmeValue);
    } else {
      this._sound('f');
      Vibration.vibrate(2000);
    }
  }
  soundCheck(itemCheckQty, ItmeStatus) {
    // 여기까지
    if (!Util.isEmpty(itemCheckQty) && ItmeStatus) {
      if (itemCheckQty < this.state.totalItemQty) {
        Vibration.vibrate(500);
        this._sound('s');
      } else if (itemCheckQty === this.state.totalItemQty) {
        Vibration.vibrate(500);
        this._soundConfirm('s');
      } else {
        this._sound('f');
        Vibration.vibrate(2000);
      }
    } else if (itemCheckQty > this.state.totalItemQty) {
      this._sound('f');
      Vibration.vibrate(2000);
    } else {
      Vibration.vibrate(500);
      this._sound('s');
    }
  }


  // 출고 스캔 수량 저장
  async onSave(status, title, confirmYN) {
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const reqList = [];

    for (let i = 0; i < dataLength; i += 1) {
      if (dataList[i].scanChecked) {
        if (dataList[i].scanChecked === 'Y') {
          dataList[i].ITEM_QTY = dataList[i].ITEM_QTY.toString();
          dataList[i].SCAN_QTY = dataList[i].SCAN_QTY.toString();
          reqList.push(dataList[i]);
        }
      }
    }

    // 확정취소(cancle)일떄
    if (!Util.isEmpty(confirmYN) && confirmYN === 'confirmN') {
      this.grTempQtyCancel(confirmYN);
      return;
    }

    // 확정일떄
    if (!Util.isEmpty(confirmYN) && confirmYN === 'confirmY') {
      this.grTempQtyCancel(confirmYN);
      return;
    }

    // 상시 임시저장일떄
    if (status === 'every') {
      this.eSaveScanQty(reqList);
    }

    // 상시 임시저장일떄
    // if (status === 'temp') {
    //   this.SaveScanQty(reqList, confirmYN);
    // }
  }

  _serialCheckAlert() {
    Keyboard.dismiss(); // 키보드 닫기!
    Util.msgBox({
      title: 'Alert',
      msg: '스캔 모드를 변경 하시겠습니까?',
      buttonGroup: [
        {
          title: '스캔 모드 변경',
          onPress: () => this._changeSerialMode('changeSerialMode'),
        },
        {
          title: '스캔 모드 변경 취소',
          onPress: () => this._changeSerialMode('cancleSerialMode'),
        },
      ],
    });
  }

  // 아이템바코드 단건검수 vs (아이템바코드-시리얼) 검수진행모드 선택
  _changeSerialMode(param) {
    if (param === 'changeSerialMode') {
      this.setState({ serialTarget: 'Y' });
    } else {
      this.setState({ serialTarget: 'N' });
    }

    this._resetState();
    this.barcode1.focus();
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
      totalCheckItemQty: 0,
      // serialTarget: true,
      // barcode1Focus: false,
      barcode2Focus: false,
      locationEditable: false,
    });
    this.fetch(null);
  }

  // 첫번째 바코드 유효검사
  _barcodeValidYN(barcodeValidYN, barcode1Data) {
    if (barcodeValidYN === 'Y') {
      this.setState({
        scanVaildData: `${barcode1Data} 스캔 완료`,
        barcodeData1: barcode1Data,
        locationEditable: true,
      });

      this._onClearBarcode('barcode2');
      this.barcode2.focus();
      this._sound('s');
    } else {
      this.setState({
        scanVaildData: 'No matching data. Please, check again!',
        barcodeData1: null,
      });

      this.barcode1.focus();
      this._setScanValidData('f');
      this._sound('f');
      Vibration.vibrate(2000);
    }
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

  showSerialNo(item, index) {
    const { navigator } = this.props.global;
    const savedSerial = this.state.data[index].SAVED_SERIAL_NO;
    const scanSerial = Util.isEmpty(item.SERIAL_NO) ? '' : `,${item.SERIAL_NO}`;

    navigator.showOverlay({
      component: {
        name: 'screen.DMS200503',
        passProps: {
          title: `serial number(${item.BARCODE})`,
          item: savedSerial + scanSerial,
        },
        options: {
          layout: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
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
            this.focusNextField('barcodeField');
          }}
        />
        {this.state.serialTarget === 'Y' ? (
          <TextInput
            style={(styles.serialInput, { flex: 1 })}
            ref={c => {
              this.barcode2 = c;
            }}
            placeholder="Serial NO"
            onChangeText={barcodeData2 => this.setState({ barcodeData2 })}
            value={this.state.barcodeData2}
            keyboardType="email-address"
            editable={this.state.locationEditable}
            blurOnSubmit={this.state.barcode2Focus}
            onSubmitEditing={() => {
              this.focusNextField('serialField');
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
    // item.scanChecked === 'Y' ? { backgroundColor: '#75d9ff' } : { backgroundColor: '#fafafa' },
    // ]}
    key={item.GR_NO + item.GR_SEQ_NO}
  >
    <HFormView
      style={[
        { marginTop: 2 },
        item.SCAN_QTY === item.ITEM_QTY
          ? { backgroundColor: bluecolor.basicSkyLightBlueColor }
          : null,
      ]}
    >
      <HRow between>
        <HText
          value={item.BARCODE}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText
          value={item.SAVED_SERIAL_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
      </HRow>
      <HRow>
        <View style={styles.barcodeStyle}>
          <View >
            <HButton
              disabled={this.props.params.GR_STATUS === 'F'}
              onPress={() => this._onCountPress(item, index)}
              name={'plus'}
              bStyle={{
                width: 40,
                paddingLeft: 5,
                paddingRight: 5,
                backgroundColor: bluecolor.basicDeepGrayColor,
              }}
            />
          </View>
          <View>
            <HButton
              disabled={this.props.params.GR_STATUS === 'F'}
              onPress={() => this._onCheckPress(item, index)}
              name={'check-square-o'}
              bStyle={{
                width: 40,
                paddingLeft: 5,
                paddingRight: 5,
                backgroundColor: bluecolor.basicDeepGrayColor,
              }}
            />
          </View>
        </View>
      </HRow>
      <HRow>
        <HText
          textStyle={[
            item.SCAN_QTY !== item.ITEM_QTY
              ? { color: bluecolor.basicRedColor, fontWeight: 'bold' }
              : { color: bluecolor.basicWhiteColor, fontWeight: 'bold' },
          ]}
          value={`${item.SCAN_QTY || 0} / ${item.ITEM_QTY}`}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => this.showSerialNo(item, index)}
        >
          <HNumberfield
            label={'SR no'}
            value={item.SERIAL_CNT}
          />
        </TouchableOpacity>
        <HNumberfield label={'C/T'} value={item.BOX_QTY} editable />
        <HNumberfield label={'Plt'} value={item.PLT_QTY} />
        <HNumberfield label={'W/t:'} value={item.GW} />
      </HRow>
      <HRow between>
        <HText value={`${item.DOC_NO} / ${item.LOCATION_DESC}`} />
      </HRow>
    </HFormView>
  </View>
);
render() {
  const buttonGroup = [
    {
      title: '임시저장', // 필수사항
      iconName: 'save', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.onSave('temp', '현재상태 저장');
      },
    },
    {
      title: '조회', // 필수사항
      iconName: 'search', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.fetch(null);
      },
    },
  ];
  return (
    <HBaseView style={styles.container} scrollable={false} buttonGroup={buttonGroup}>
      {/* <Spinner visible={this.state.spinner} /> */}
      <View style={styles.spaceAroundStyle}>
        <View style={styles.spaceAroundStyle}>
          <HCheckbox
            style={{ marginStart: 10, paddingLeft: 4, paddingRight: 0 }}
            label={'serial No'}
            value={this.state.serialTarget}
            onChanged={() => this._serialCheckAlert()}
            editable
            toggle
          />
          <Text style={styles.textTopStyle}>
            {this.state.GR_NO} ({this.state.GR_STATUS_NAME})
          </Text>
        </View>
        <Text style={styles.textDocStyle}>
          {this.state.GR_REF_DOC_NO}
        </Text>
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
      <HRow between style={styles.countStyle}>
        {
          this.props.params.GR_STATUS === 'F' ? (
            <HText
              style={{ marginTop: 10 }}
              textStyle={[
                this.state.totalCheckItemQty !== this.state.totalItemQty
                  ? { color: bluecolor.basicRedColor, fontWeight: 'bold', fontSize: 20 }
                  : { color: bluecolor.basicGreenColor, fontWeight: 'bold', fontSize: 20 },
              ]}
            >
              {this.state.totalItemQty} / {this.state.totalItemQty}
            </HText>
          ) :
            <HText
              style={{ marginTop: 10 }}
              textStyle={[
                this.state.totalCheckItemQty !== this.state.totalItemQty
                  ? { color: bluecolor.basicRedColor, fontWeight: 'bold', fontSize: 20 }
                  : { color: bluecolor.basicGreenColor, fontWeight: 'bold', fontSize: 20 },
              ]}
            >
              {this.state.totalCheckItemQty} / {this.state.totalItemQty}
            </HText>
        }
        {this.state.itemEditable ?
          <Touchable
            style={{ width: 40, height: 40, backgroundColor: 'rgba(52,152,219,0.8)', borderRadius: 40 }}
            underlayColor={'rgba(63,119,161,0.8)'}
            onPress={() => this.onBarcodePopup()}
          >
            <HIcon
              name="barcode"
              size={15}
              color="#fff"
              style={{ alignItems: 'center',
                justifyContent: 'center',
                marginTop: 6 }}
            />
          </Touchable> : null
        }
      </HRow>
      <HListView
        keyExtractor={item => item.GR_NO + item.GR_SEQ_NO}
        renderHeader={null}
        renderItem={({ item, index }) =>
          this.renderBody(item, index, this.state.barcodeScanData, this.state.barcodeScanIndex)
        }
        onSearch={() => {}}
        onMoreView={null}
        data={this.state.data}
        // 조회된값
        totalData={this.state.data}
        // 하단에 표시될 메세지값
        status={this.state.status}
      />
      <View style={styles.buttonContainer}>{this.buttonControll(this.state.taskStep)}</View>
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
  },
  textTopStyle: {
    marginStart: 2,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#2c7bba',
    fontSize: 16,
    paddingLeft: 5,
    fontWeight: 'bold',
  },
  textDocStyle: {
    color: '#d03a3a',
    fontSize: 12,
    paddingLeft: 1,
    paddingRight: 1,
    marginStart: 0,
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
  barcodeStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 3,
    paddingLeft: 3,
  },
  countStyle: {
    backgroundColor: '#F6F6F6',
    borderTopWidth: 1,
    borderColor: '#d4d4d4',
    flexDirection: 'row',
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
  serialInput: {
    height: 5,
    flex: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 5,
  },
  buttonStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingRight: 1,
    paddingLeft: 1,
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
    bottom: 410,
    right: 120,
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
