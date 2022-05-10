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
import debounce from 'debounce';
/**
* 출고 검수 스캔 화면
*/

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200102');
    this.state = {
      data: [],
      status: null,
      taskStep: this.props.params.GI_STATUS === 'F' ? '2' : '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      VENDOR_CODE: this.props.params.VENDOR_CODE,
      BUYER_CODE: this.props.params.BUYER_CODE,
      WH_CODE: this.props.params.WH_CODE,
      GI_NO: this.props.params.GI_NO,
      GI_DATE: this.props.params.GI_DATE,
      GI_STATUS: this.props.params.GI_STATUS,
      GI_STATUS_NAME: this.props.params.GI_STATUS_NAME,
      barcodeData1: null,
      barcodeData2: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      barcode1Focus: false,
      barcode2Focus: false,
      successCnt: 0,
      itemEditable: this.props.params.GI_STATUS !== 'F', // 확정된 데이터라면 스캔 필드 비 활성화
      itemTotalQty: 0,
      totalItemQty: 0,
      totalCheckItemQty: 0,
      GI_REF_DOC_NO: null,
      SCAN_USER_ID: null,
      serialTarget: 'N',
      serialList: [],
      currentIndex: null,
      barSeq: 0,
      barcodeFix: 'N',
      barcodeCheck: 'N',
    };
    Tts.setDefaultLanguage('ko');
    Tts.voices().then(voices => console.log('voices', voices));


    // 다중 터치 방지!
    this.giScanUserCansel = debounce(this.giScanUserCansel.bind(this), 1000, true);
    this.giScanUserSave = debounce(this.giScanUserSave.bind(this), 1000, true);
    // this.fetch = debounce(this.fetch.bind(this), 1000, true);
  }
  componentWillMount() {
    this.barcode = [];
    this.fetch(null);
  }
  shouldComponentUpdate() {
    return true;
  }
  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030320SVC', 'getDt', {
      body: JSON.stringify({
        DMS030320F1: {
          WH_CODE: this.state.WH_CODE,
          GI_NO: this.state.GI_NO,
          GI_DATE_FROM: this.state.GI_DATE,
          GI_DATE_TO: this.state.GI_DATE,
          GI_FLAG: 'Y',
        },
      }),
    });
    Util.openLoader(this.screenId, false);
    if (result) {
      let itemCheckQty = 0;
      for (let i = 0; i < result.DMS030320G2.length; i++) {
        itemCheckQty += result.DMS030320G2[i].SCAN_QTY;
      }
      // 정해진 데이터만 보여준다.
      this.setState(
        {
          data: result.DMS030320G2,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
          GI_REF_DOC_NO: result.DMS030320G2[0].GI_REF_DOC_NO,
          SCAN_USER_ID: result.DMS030320G2[0].SCAN_USER_ID,
          totalCheckItemQty: itemCheckQty,
        },
        callback,
      );
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('DMS200102', result.DMS030320G2);
      // 아이템 종 개수 구하기
      const itemQtyValue = result.DMS030320G2.map(item => item.ITEM_QTY);
      const itemQty = itemQtyValue.reduce((sum, currValue) => sum + currValue, 0);
      this.setState({ totalItemQty: itemQty });

      this.barcode1.clear();
      this.barcode2.clear();
      this.barcode1.focus();
      // this._keyboardDismiss();

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
    const result = await Fetch.request('DMS030320SVC', 'confirm', {
      body: JSON.stringify({
        DMS030320G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GI_NO: this.state.GI_NO,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
              GI_DATE: this.state.GI_DATE,
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
    const result = await Fetch.request('DMS030320SVC', 'cancel', {
      body: JSON.stringify({
        DMS030320G1: {
          data: [
            {
              WH_CODE: this.state.WH_CODE,
              GI_NO: this.state.GI_NO,
              // 클로즈 기능으로 신규추가
              VENDOR_CODE: this.state.VENDOR_CODE,
              BUYER_CODE: this.state.BUYER_CODE,
              GI_DATE: this.state.GI_DATE,
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
  async giScanUserSave() {
    const result = await Fetch.request('DMS030320SVC', 'giScanUserSave', {
      body: JSON.stringify({
        DMS030320G1: {
          data: [
            {
              COMPANY_CODE: this.state.COMPANY_CODE,
              WH_CODE: this.state.WH_CODE,
              GI_NO: this.state.GI_NO,
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
  async giScanUserCansel(confirmYN) {
    const result = await Fetch.request('DMS030320SVC', 'giScanUserCansel', {
      body: JSON.stringify({
        DMS030320G1: {
          data: [
            {
              COMPANY_CODE: this.state.COMPANY_CODE,
              WH_CODE: this.state.WH_CODE,
              GI_NO: this.state.GI_NO,
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
    const result = await Fetch.request('DMS030320SVC', 'grTempQtySave', {
      body: JSON.stringify({
        DMS030320G1: {
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
  // 검수 스캔 수량 임시저장 취소 처리
  async grTempQtyCancel(confirmYN) {
    // confirm 상태이면 검수 취소 불가
    if (this.props.params.GI_STATUS === 'F' && confirmYN === 'cancle') {
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

    const result = await Fetch.request('DMS030320SVC', 'grTempQtyCancel', {
      body: JSON.stringify({
        DMS030320G1: {
          data: this.state.data,
        },
      }),
    });

    if (result.TYPE === 1) {
      this.setState({
        totalCheckItemQty: 0,
      });

      if (confirmYN === 'confirmN' || confirmYN === 'cancle') {
        this.giScanUserCansel(confirmYN);
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
    const { config } = this.props.global;
    const dataLength = this.state.data.length;
    const serialTarget = this.state.serialTarget;

    const dataList = this.state.data;
    const user = this.props.global.session.USER_ID;

    let barcode1Data = null; // 첫번째 바코드값
    let barcode2Data = null; // 두번째 바코드값
    let currentIndex = null; // 현재 바코드스캔으로 선택된로우인덱스
    let barcodeValidYN = 'N';
    let barcodeCheck = 'N';

    if (Util.isEmpty(this.state.SCAN_USER_ID)) {
      Util.msgBox({
        title: 'Alert',
        msg: '검수 시작 버튼을 먼저 눌러주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    if (this.state.SCAN_USER_ID !== user) {
      Util.msgBox({
        title: 'Alert',
        msg: `현재 ${this.state.SCAN_USER_ID}작업자가 검수진행 중에 있습니다. 기존 검수 내역을 취소한 뒤 다시 진행 해주세요`,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }


    if (serialTarget === 'Y') {
      // 1 ------------------serial 스캔 할 경우 시작 --------------------
      if (targetType === 'barcodeField') {
        if (!Util.isEmpty(currentIndex) && this.state.data[currentIndex].barcodeCheck === 'Y') {
          this.barcode2.focus();
          return;
        }
        // 아이템 정보 스캔 후 시리얼 스캔 textInput으로 데이터 넘길때
        barcode1Data = this.barcode1._lastNativeText;
        if (scanData) {
          barcode1Data = scanData;
        }

        // 바코드값 없을 때,
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
                barcodeCheck = 'Y'; // check 여부에 따라 스킵할지 말지 결정
              }
            }
          }
        }

        // 1차적으로 아이템에 대한 데이터 유효성 체크해줌
        this._barcodeValidYN(barcodeValidYN, barcode1Data, currentIndex, barcodeCheck);

        // 바코드 이동이 잘 되지않아서 하나 더 추가 해줌
        if (barcodeValidYN === 'Y') {
          this.barcode2.focus();
          // this._keyboardDismiss();
          this._sound('s');
          Vibration.vibrate(500);
        } else {
          this._sound('f');
          Vibration.vibrate(2000);
        }

        // barcode 인덱스를 기억하기
        this.setState({
          currentIndex,
        });

        // this._sound('s');
        // Vibration.vibrate(500);
      } else {
        //  바코드 스캔 후, 시리얼번호 스캔 했을 때
        const index = this.state.currentIndex;
        // 현재까지 스캔된 시리얼 내역
        const serialScanList = dataList[index].SERIAL_NO || ''; // 현재바코드에서 스캔한 시리얼들
        const savedScanStr = dataList[index].SAVED_SERIAL_NO; // 백단에서 가져온 시리얼들

        // let savedScanList = null;
        barcode1Data = this.state.barcodeData1;
        barcode2Data = this.barcode2._lastNativeText;
        if (scanData) {
          barcode2Data = scanData;
        }

        // serialScanQty.push(barcode2Data);
        // 시리얼 입력 여부 확인
        if (serialScanList !== '' && barcode2Data.length !== dataList[index].SERIAL_LENGTH) {
          Util.msgBox({
            title: 'Alert',
            msg: '시리얼번호를 확인해주세요',
            buttonGroup: [
              {
                title: 'OK',
              },
            ],
          });
          Vibration.vibrate(2000);
          this._sound('f');
          this._onClearBarcode('barcode2');
          this.barcode2.focus();
          // this._keyboardDismiss();
          return;
        }

        // 아이템 바코드와 동일한 바코드가 스캔되었을때 check 해준다
        // 시리얼을 스캔할 차레이나 시리얼과 아이템 바코드가 가까이 있어서 아이템 바코드를 찍었을때 방지해준다.
        for (let i = 0; i < dataLength; i += 1) {
          const Itemvalues = this.state.data[i].BARCODE.toUpperCase().trim();
          if (barcode2Data.toUpperCase().trim() === Itemvalues) {
            Util.msgBox({
              title: 'Alert',
              msg: '아이템번호가 스캔되었습니다. 시리얼번호를 확인해주세요',
              buttonGroup: [
                {
                  title: 'OK',
                },
              ],
            });
            Vibration.vibrate(2000);
            this._sound('f');
            this._onClearBarcode('barcode2');
            this.barcode2.focus();
            return;
          }
        }


        // 중복값 확인
        let checkserialScanList = '';
        if (savedScanStr.length > 0) {
          checkserialScanList = `${serialScanList},${savedScanStr}`;
        } else {
          checkserialScanList = serialScanList;
        }
        const duplicateIndex = checkserialScanList.indexOf(barcode2Data);


        if (duplicateIndex > -1) {
          Util.msgBox({
            title: 'Notice.',
            msg: '기존에 입력된 시리얼 번호입니다. 확인해주세요.',
            buttonGroup: [
              {
                title: 'OK',
                onPress: () => {
                  this._onClearBarcode('barcode2');
                },
              },
            ],
          });
          this._sound('f');
          Vibration.vibrate(2000);
          return;
        }

        if (Util.isEmpty(dataList[index].SERIAL_NO)) {
          dataList[index].SERIAL_NO = `${barcode2Data}`;
          dataList[index].SERIAL_LENGTH = barcode2Data.length;
        } else {
          dataList[index].SERIAL_NO = `${serialScanList},${barcode2Data}`;
        }
        dataList[index].SERIAL_CNT += 1;

        Vibration.vibrate(500);
        this._sound('s');

        // dataList[index].serialLenght = barcode2Data.length;
        this.setState({
          data: dataList,
        });
      }
    } // 1 ------------------serial 스캔 할 경우 끝 --------------------
    if ((serialTarget === 'Y' && targetType !== 'barcodeField') || serialTarget === 'N') {
      Vibration.vibrate(500);

      let barcodeYN = 'N';
      const scanCnt = Number(this.state.successCnt);
      let g1ScanData = null;
      let targetG1ScanData = null;
      let SCAN_QTY = 0;
      let TOTAL_QTY = 0;

      let scanComplete = 'N'; // list row당 스캔이 완료됬을때 표시 해줌


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

      // 스캔 완료 처리
      for (let i = 0; i < dataLength; i += 1) {
        // 아이템마스터의 바코드로 스캔
        g1ScanData = this.state.data[i].BARCODE.toUpperCase().trim();
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
        dataList[currentIndex].SCAN_QTY = SCAN_QTY;
        targetG1ScanData = this.state.data[currentIndex].BARCODE.trim();
        if (TOTAL_QTY === SCAN_QTY) {
          // this.barcode1.clear();
          // this.barcode1.focus();
          this.setState({
            scanVaildData: `"${targetG1ScanData}" (${SCAN_QTY} / ${TOTAL_QTY}) 수량이 일치합니다.`,
            barcodeScanData: barcode1Data,
            barcodeScanIndex: currentIndex,
            data: dataList,
            successCnt: scanCnt,
            barcodeData1: null,
          });
          dataList[currentIndex].completed = 'Y';
          scanComplete = 'Y';
          this._setScanValidData('s');
          // this._keyboardDismiss();
          // this._sound('s');
        } else {
          this.setState({
            scanVaildData: `"${targetG1ScanData}" (${SCAN_QTY}/${TOTAL_QTY}) 수량이 일치하지 않습니다.`,
            barcodeScanData: barcode1Data,
            barcodeScanIndex: currentIndex,
            data: dataList,
          });
          if (TOTAL_QTY < SCAN_QTY) {
            this._sound('f');
            Vibration.vibrate(2000);
            return;
          }
          this._setScanValidData('f');
          // this._sound('s');
        }
        this.getTotalCheckItemQty();
        // this._keyboardDismiss(); // 키보드 닫기!
      } else {
        // 스캔 실패한 경우
        this.setState({
          scanVaildData: `"${barcode1Data}" (${SCAN_QTY} / ${TOTAL_QTY}) 스캔실패`,
          barcodeScanData: null,
          barcodeScanIndex: currentIndex,
          successCnt: 0,
          goRow: 0,
        });
        this._setScanValidData('f');
        this._sound('f');
        Vibration.vibrate(2000);
      }

      if (this.state.barcodeFix === 'Y' && scanComplete === 'N') {
        this.barcode2.focus();
      } else {
        this.barcode1.focus();
      }

      this._onClearBarcode('barcode1');

      // serial 체크하는 경우에만 삭제해줌
      if (this.state.serialTarget === 'Y') {
        this._onClearBarcode('barcode2');
      }

      // this._keyboardDismiss(); // 키보드 닫기!
    }
  }


  // _keyboardDismiss() {
  //   Keyboard.dismiss();
  // }
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
  _clear(item) {
    const user = this.props.global.session.USER_ID;
    if (Util.isEmpty(this.state.SCAN_USER_ID)) {
      Util.msgBox({
        title: 'Alert',
        msg: '검수 시작 버튼을 먼저 눌러주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    if (this.state.SCAN_USER_ID !== user) {
      Util.msgBox({
        title: 'Alert',
        msg: `현재 ${this.state.SCAN_USER_ID}작업자가 검수진행 중에 있습니다. 기존 검수 내역을 취소한 뒤 다시 진행 해주세요`,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    console.log(item);
    // this._keyboardDismiss();
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

  onSync() {
    const user = this.props.global.session.USER_ID;
    if (Util.isEmpty(this.state.SCAN_USER_ID)) {
      Util.msgBox({
        title: 'Alert',
        msg: '검수 시작 버튼을 먼저 눌러주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    if (this.state.SCAN_USER_ID !== user) {
      Util.msgBox({
        title: 'Alert',
        msg: `현재 ${this.state.SCAN_USER_ID}작업자가 검수진행 중에 있습니다. 기존 검수 내역을 취소한 뒤 다시 진행 해주세요`,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    if (this.state.barcodeScanIndex === null) {
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
    const dataList = this.state.data;
    dataList[this.state.barcodeScanIndex].scanChecked = 'Y';
    const ITEM_QTY = dataList[this.state.barcodeScanIndex].ITEM_QTY;
    dataList[this.state.barcodeScanIndex].SCAN_QTY = ITEM_QTY;
    const targetG1ScanData = dataList[this.state.barcodeScanIndex].BARCODE.trim();
    this.setState({
      scanVaildData: `"${targetG1ScanData}" (${ITEM_QTY} / ${ITEM_QTY}) 수량 수정 성공`,
      data: dataList,
    });
    this.getTotalCheckItemQty();
    this._setScanValidData('s');
    // this._sound('s');
  }
  // 전체 카운팅
  _onCheckPress(item, index) {
    const user = this.props.global.session.USER_ID;
    const data = this.state.data;
    const setScanQty = item.ITEM_QTY;
    const completed = item.completed;

    if (Util.isEmpty(this.state.SCAN_USER_ID)) {
      Util.msgBox({
        title: 'Alert',
        msg: '검수 시작 버튼을 먼저 눌러주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    if (this.state.SCAN_USER_ID !== user) {
      Util.msgBox({
        title: 'Alert',
        msg: `현재 ${this.state.SCAN_USER_ID}작업자가 검수진행 중에 있습니다. 기존 검수 내역을 취소한 뒤 다시 진행 해주세요`,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
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
    const user = this.props.global.session.USER_ID;
    const data = this.state.data;
    if (Util.isEmpty(this.state.SCAN_USER_ID)) {
      Util.msgBox({
        title: 'Alert',
        msg: '검수 시작 버튼을 먼저 눌러주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    if (this.state.SCAN_USER_ID !== user) {
      Util.msgBox({
        title: 'Alert',
        msg: `현재 ${this.state.SCAN_USER_ID}작업자가 검수진행 중에 있습니다. 기존 검수 내역을 취소한 뒤 다시 진행 해주세요`,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
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

  // vibrationPattern(result) {
  // if (result === false) {
  // for (let i = 0; i < 5; i += 1) {
  // setTimeout(() => { Vibration.vibrate(1000); }, 1000);
  // }
  // }
  // }
  // 출고 스캔 수량 저장
  async onSave(status, title, confirmYN) {
    const dataList = this.state.data;
    const dataLength = this.state.data.length;
    const reqList = [];
    const msg = null;
    const user = this.props.global.session.USER_ID;
    if (Util.isEmpty(this.state.SCAN_USER_ID)) {
      Util.msgBox({
        title: 'Alert',
        msg: '검수 시작 버튼을 먼저 눌러주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
    if (this.state.SCAN_USER_ID !== user) {
      Util.msgBox({
        title: 'Alert',
        msg: `현재 ${this.state.SCAN_USER_ID}작업자가 검수진행 중에 있습니다. 확인 후 다시 진행 해주세요`,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }
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

    // 임시저장 취소일때 status 값 넘어옴
    if (!Util.isEmpty(status)) {
      Util.msgBox({
        title,
        msg: '현재 검수 상태를 취소 하시겠습니까?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this.grTempQtyCancel(),
          },
        ],
      });
    } else {
      Util.msgBox({
        title,
        msg: '현재 검수 상태를 저장 하시겠습니까?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this.saveScanQty(reqList, confirmYN),
          },
        ],
      });
    }
  }
  _serialCheckAlert() {
    Util.msgBox({
      title: 'Alert',
      msg: '스캔 모드를 변경 하시겠습니까?',
      buttonGroup: [
        {
          title: '일반 스캔모드 변경',
          onPress: () => this._serialChecked(),
        },
        {
          title: '시리얼 스캔모드 변경',
          bStyle: { backgroundColor: bluecolor.basicOrangeColor },
          onPress: () => this._serialChecked('serial'),
        },
        {
          title: '스캔모드 변경취소',
        },
      ],
    });
  }


  _serialChecked(scanType) {
    this.setState({ serialTarget: this.state.serialTarget === 'Y' ? 'N' : 'Y' });
    if (!Util.isEmpty(scanType)) {
      this.setState({ barcodeFix: this.state.barcodeFix === 'Y' ? 'N' : 'Y' });
    }
    this._resetState();
    this.barcode1.focus();
    // this._keyboardDismiss();
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
  _barcodeValidYN(barcodeValidYN, barcode1Data, currentIndex, barcodeCheck) {
    if (barcodeValidYN === 'Y') {
      this.setState({
        scanVaildData: null,
        barcodeData1: barcode1Data,
        barcodeCheck,
        locationEditable: true,
      });

      this._onClearBarcode('barcode2');
      this.barcode2.focus();
      // this._keyboardDismiss();
      this._sound('s');
    } else {
      this.setState({
        scanVaildData: 'No matching data. Please, check again!',
        barcodeData1: null,
      });

      this.barcode1.focus();
      // this._keyboardDismiss();
      this._setScanValidData('f');
      this._sound('f');
      Vibration.vibrate(2000);
    }


    // if (this.state.data.every((data) => data.ITEM_QTY !== data.SCAN_QTY)) {
    //   this.state.data[currentIndex].scanChecked !== 'N';
    // }
  }

  _onClearBarcode(barcodeType) {
    if (barcodeType === 'barcode1' && this.state.barcodeFix !== 'Y') {
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
        name: 'screen.DMS200103',
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
          style={(this.state.barcodeFix === 'Y' ? styles.barcodeFixInput : styles.barcodeInput)}
          // ref="barcode1" // 빨간 줄 가도 무시하자!
          ref={c => {
            this.barcode1 = c;
          }}
          placeholder="Barcode"
          onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
          value={this.state.barcodeData1}
          autoFocus={this.state.GI_STATUS !== 'F'}
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
        <View style={styles.buttonStyle}>
          <HButton
            bStyle={{
              backgroundColor: bluecolor.basicGreenColor,
            }}
            onPress={() => this.onSync()}
            name={'key'}
          />
        </View>
      </View>
    );
  }
renderBody = (item, index, scanData, scanIndex) => (
  <View
    // style={[
    // item.scanChecked === 'Y' ? { backgroundColor: '#75d9ff' } : { backgroundColor: '#fafafa' },
    // ]}
    key={item.GR_NO + item.GI_SEQ_NO}
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
      </HRow>
      <HRow between>
        <HText
          style={(styles.barcodeInput, { flex: 1 })}
          value={item.BARCODE}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <View style={styles.barcodeStyle}>
          <View >
            <HButton
              disabled={this.props.params.GI_STATUS === 'F'}
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
              disabled={this.props.params.GI_STATUS === 'F'}
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
      title: '임시저장 취소', // 필수사항
      iconName: 'save', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.onSave('cancel', '현재상태 취소');
      },
    },
    {
      title: '임시저장', // 필수사항
      iconName: 'save', // 필수사항 // FontAwesome
      onPress: (title, param) => {
        this.onSave(null, '현재상태 저장');
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
            {this.state.GI_NO} ({this.state.GI_STATUS_NAME})
          </Text>
        </View>
        <Text style={styles.textDocStyle}>
          {this.state.GI_REF_DOC_NO}
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
          Util.isEmpty(this.state.SCAN_USER_ID) ? (
            <HButton
              onPress={() => { this.giScanUserSave(); }}
              title={' 검수 시작'}
              name={'play'}
              bStyle={{
                width: 120,
                paddingRight: 2,
                backgroundColor: bluecolor.basicRedColor,
              }}
            />
          ) : (
            <HButton
              onPress={() => { this.giScanUserCansel('cancle'); }}
              title={'검수 취소'}
              name={'stop'}
              bStyle={{
                width: 120,
                paddingRight: 2,
                backgroundColor: bluecolor.basicDeepGrayColor,
              }}
            />
          )
        }
        <View style={styles.spaceAroundStyle}>
          {
            this.props.params.GI_STATUS === 'F' ? (
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

        </View>


      </HRow>
      <HListView
        keyExtractor={item => item.GR_NO + item.GI_SEQ_NO}
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
    // justifyContent: 'center',
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
  barcodeFixInput: {
    height: 40,
    flex: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: bluecolor.basicBluelightColor,
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 5,
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
