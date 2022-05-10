/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Keyboard, Vibration } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  Util,
  bluecolor,
  modelUtil,
  _,
} from 'libs';
import {
  HBaseView,
  Touchable,
  HIcon,
  HRow,
  HFormView,
  HText,
  HListView,
  HDatefield,
  HCombobox,
  HButton,
  HTextfield,
  HCheckbox,
} from 'ux';
/* *
 * Import node_modules
 * */

/**
 * 재고조사
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100901');

    this.state = {
      areaData: [],
      totalData: [],
      data: [],
      status: null,
      barcodeData1: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      searchFilter: null,
      successCnt: 0,
      goRow: 0,
      scanData: null,
      confirmDate: null,
      confirmUser: null,
      count: 0,
      totalcount: 0,
    };
  }

  componentWillMount() {
    this._validCheckFunc('alert');

    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'vendorcode.VENDOR_CODE', null);
    const vendorPlantCode = _.get(this.props.global, 'vendorcode.VENDOR_PLANT_CODE', null);

    if (whCode && vendorCode && vendorPlantCode) {
      modelUtil.setModelData('WMS100901', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        VENDOR_PLANT_CODE: vendorPlantCode,
        AREA: '',
        STK_DATE: Util.getDateValue(),
        SEQ_NO: '',
        SORT_FLAG: null,

      });
    } else {
      modelUtil.setModelData('WMS100901', {
        AREA: '',
        STK_DATE: Util.getDateValue(),
        SEQ_NO: '',
        SORT_FLAG: null,
      });
    }
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.wmsValidCheckFunc(alertType);
  }

  componentDidMount() {
    // this.fetch(null);
    this.fetchArea();
  }

  async fetch(callback, seqno) {
    const reqData = modelUtil.getModelData('WMS100901');
    if (seqno) {
      reqData.SEQ_NO = seqno;
    }

    if (reqData.SORT_FLAG !== null) {
      if (reqData.SORT_FLAG === 'OK') {
        reqData.OK_SORT = 'Y';
        reqData.ERROR_SORT = null;
      } else if (reqData.SORT_FLAG === 'ERROR') {
        reqData.OK_SORT = null;
        reqData.ERROR_SORT = 'Y';
      }
    }

    if (reqData.AREA === '' || reqData.AREA === null) {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please input Area!! ',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {},
          },
        ],
      });
      return;
    }
    const area = reqData.AREA.toUpperCase();
    reqData.AREA = area;

    if (reqData.SEQ_NO === '' || reqData.SEQ_NO === null) {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please input Search Times!! ',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {},
          },
        ],
      });
      return;
    }

    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('WMS010214SVC', 'getDT', {
      body: JSON.stringify({
        WMS010214F1: reqData,
      }),
    });
    // 스캔 갯수 표시
    let count = 0;
    let ingcount = 0;
    let wrongcount = 0;
    const totalcount = result.WMS010214G2.length;
    let todocount = 0;
    for (let i = 0; i < result.WMS010214G2.length; i += 1) {
      if (result.WMS010214G2[i].CHECK_QTY === result.WMS010214G2[i].BASE_QTY) {
        count += 1;
      } else if (result.WMS010214G2[i].CHECK_QTY > 0) {
        if (result.WMS010214G2[i].CHECK_QTY < result.WMS010214G2[i].BASE_QTY) {
          ingcount += 1;
        } else {
          wrongcount += 1;
        }
      }
    }
    todocount = totalcount - count;
    if (result) {
      // 정해진 데이터만 보여준다.
      // const data = Util.getArrayData(result.FMS040112G1, env().listCnt);
      if (result.WMS010214G2.length > 0) {
        this.setState(
          {
            totalData: result.WMS010214G2,
            data: result.WMS010214G2,
            status: {
              TYPE: result.TYPE,
              MSG: `스캔완료(${count}/${totalcount}) 스캔중(${ingcount}/${todocount}) 스캔오류(${wrongcount}/${todocount})`,
            },
            confirmDate: result.WMS010214G2[0].CONFIRM_DATE,
            confirmUser: result.WMS010214G2[0].CONFIRM_USER_ID,
            count,
            totalcount,
          },
          callback,
        );

        // auto확정
        if (count === totalcount && (result.WMS010214G2[0].CONFIRM_USER_ID === '' || result.WMS010214G2[0].CONFIRM_USER_ID === null)) {
          this.onConfirm();
        }
      }
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // AREA 구하기
  async fetchArea() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const result = await Fetch.request('WMS010218SVC', 'getStor', {
      body: JSON.stringify({
        WMS010218F1: {
          WH_CODE: whCode,
        },
        WMS010218G1: {},
      }),
    });

    if (result.TYPE === 1) {
      const areaData = result.WMS010218G2;
      if (areaData.length > 0) {
        this.setState({
          areaData,
        });
        Util.openLoader(this.screenId, false);
      } else {
        this.setState({
          areaData,
        });
        Util.openLoader(this.screenId, false);
      }
    } else {
      Util.openLoader(this.screenId, false);
    }
  }

  // 바코드 스캔 처리 로직
  focusNextField(scanData) {
    Vibration.vibrate(500);
    const dataList = this.state.totalData;
    const dataLength = this.state.totalData.length;

    this.barcode1.clear();

    let barcode1Data = this.barcode1._lastNativeText;
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

      return;
    }

    let barcodeYN = 'N';
    let currentIndex = null;
    const scanCnt = Number(this.state.successCnt);
    let g1ScanData = null;
    let targetG1ScanData = null;
    let CHECK_QTY = 0;
    let TOTAL_QTY = 0;

    barcode1Data = Util.onlyBigChar(barcode1Data);
    for (let i = 0; i < dataLength; i += 1) {
      // if (barcode1Data.toUpperCase().trim() === this.state.data[i].REF_NO.toUpperCase().trim()) {
      // 1. 바코드 스캐너 기존 REF_NO에서 대상 컬럼 변경
      //  - wh_code + gr_no + gr_seq_no
      //  - WH13 + GR2018041900001 + 1
      //  - 최종 예시 : 13180419000011
      g1ScanData = this.state.totalData[i].SCAN_NO.toUpperCase().trim();
      if (barcode1Data === g1ScanData) {
        barcodeYN = 'Y'; // 스캔 성공
        currentIndex = i;
        if (
          dataList[currentIndex].CHECK_QTY === undefined ||
          dataList[currentIndex].CHECK_QTY === null
        ) {
          CHECK_QTY = 0;
        } else {
          CHECK_QTY = dataList[currentIndex].CHECK_QTY;
        }
        TOTAL_QTY = dataList[currentIndex].BASE_QTY;
      }
    }

    // 스캔 성공 여부에 따른 로직
    if (barcodeYN === 'Y') {
      // 스캔 성공한 경우
      dataList[currentIndex].scanChecked = 'Y';

      CHECK_QTY += 1;
      dataList[currentIndex].CHECK_QTY = CHECK_QTY;
      targetG1ScanData = this.state.totalData[currentIndex].SCAN_NO.trim();

      if (TOTAL_QTY === CHECK_QTY) {
        this.setState({
          scanVaildData: `"${targetG1ScanData}" (${CHECK_QTY} / ${TOTAL_QTY}) Matched`,
          barcodeScanData: barcode1Data,
          barcodeScanIndex: currentIndex,
          data: dataList,
          successCnt: scanCnt,
          goRow: currentIndex,
          scanData: targetG1ScanData,
        });

        this._setScanValidData('s');
        this._sound('s');
        // this._onPress(this.state.totalData[currentIndex]);
      } else {
        this.setState({
          scanVaildData: `"${targetG1ScanData}" (${CHECK_QTY}/${TOTAL_QTY}) Qty is not matched`,
          barcodeScanData: barcode1Data,
          barcodeScanIndex: currentIndex,
          data: dataList,
          scanData: targetG1ScanData,
        });

        this._setScanValidData('f');
        this._sound('f');
      }
    } else {
      // 패한 경우
      this.setState({
        scanVaildData: `"${barcode1Data}" (${CHECK_QTY} / ${TOTAL_QTY}) Fail`,
        barcodeScanData: null,
        barcodeScanIndex: null,
        successCnt: 0,
        goRow: 0,
        scanData: barcode1Data,
      });

      this._setScanValidData('f');
      this._sound('f');
    }
  }

  _keyboardDismiss() {
    Keyboard.dismiss();
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
    this.barcode1.clear();
    this.setState({
      barcodeData1: null,
      scanVaildData: null,
      barcodeScanData: null,
      barcodeScanIndex: null,
      successCnt: 0,
      filterText: null,
      scanData: null,
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
    this.focusNextField(result);
  }

  _onPress(item) {
    const { navigator } = this.props;
    let requestParam = item;
    if (requestParam) {
      Navigation(
        navigator,
        'screen.WMS100902',
        {
          ...requestParam,
          onSaveComplete: callback => this.fetch(callback),
        },
        'Stock History',
      );
    } else if (this.state.scanData) {
      const scanData = this.state.scanData;
      requestParam = {
        ...modelUtil.getModelData('WMS100901'),
        SCAN_NO: scanData,
      };

      Navigation(
        navigator,
        'screen.WMS100601',
        {
          ...requestParam,
        },
        'Move',
      );
    } else {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please input Barcord',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }

  // 재고 스캔 수량 저장
  async onSave() {
    const dataList = this.state.totalData;
    const dataLength = this.state.totalData.length;
    const reqList = [];
    for (let i = 0; i < dataLength; i += 1) {
      if (dataList[i].scanChecked) {
        if (dataList[i].scanChecked === 'Y') {
          dataList[i].CHECK_QTY = dataList[i].CHECK_QTY.toString();
          reqList.push(dataList[i]);
        }
      }
    }

    this.fetchSave(reqList);

    // const msg = 'Do you want to save?';
    // Util.msgBox({
    //   title: 'Save',
    //   msg,
    //   buttonGroup: [
    //     {
    //       title: 'OK',
    //       onPress: () => this.fetchSave(reqList),
    //     },
    //   ],
    // });
  }

  // 스캔 저장
  async fetchSave(reqList) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010214SVC', 'saveStock', {
      body: JSON.stringify({
        WMS010214G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'SAVE',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch();
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'SAVE',
        msg: result.MSG,
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
  }

  // 신규 스캔 데이터 생성
  async onNew() {
    const reqData = modelUtil.getModelData('WMS100901');

    if (reqData.AREA === '' || reqData.AREA === null) {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please input Area!! ',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {},
          },
        ],
      });
      return;
    }
    const area = reqData.AREA.toUpperCase();
    reqData.AREA = area;

    if (reqData.STK_DATE === '' || reqData.STK_DATE === null) {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please input Stock Date!! ',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {},
          },
        ],
      });
      return;
    }
    const msg = 'Do you want to scan the new stock data?';
    Util.msgBox({
      title: 'New Scan',
      msg,
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchCreate(reqData),
        },
      ],
    });
  }

  // 재고 데이터 확정
  async onConfirm() {
    if (this.state.totalData.length <= 0) {
      Util.msgBox({
        title: 'Confirm',
        msg: 'Please search first!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    const dataList = this.state.totalData;
    if (this.state.count !== this.state.totalcount) {
      const msg = `Scan count is different!(${this.state.count}/${this.state.totalcount})\nDo you want to confirm?`;
      Util.msgBox({
        title: 'Confirm',
        msg,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this.fetchConfirm(dataList, 'N'),
          },
        ],
      });
    } else {
      const msg = `Good, Scan count is matched!(${this.state.count}/${this.state.totalcount})\nDo you want to confirm?`;
      Util.msgBox({
        title: 'Auto Confirm',
        msg,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this.fetchConfirm(dataList, 'Y'),
          },
        ],
      });
    }
  }

  // 재고 데이터 확정취소
  async onCancel() {
    const dataList = this.state.totalData;

    if (dataList.length <= 0) {
      Util.msgBox({
        title: 'Cancel',
        msg: 'Please search first!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    const msg = 'Do you want to cancel?';
    Util.msgBox({
      title: 'Cancel',
      msg,
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchCancel(dataList),
        },
      ],
    });
  }

  // 신규 스캔 데이터 생성
  async fetchCreate(reqData) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('WMS010214SVC', 'insertStock', {
      body: JSON.stringify({
        WMS010214F1: reqData,
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'New Scan',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch(() => {
                modelUtil.setValue('WMS100901.SEQ_NO', result.data.SEQ_NO);
                modelUtil.setValue('WMS100901.SEQ_NO_NAME', result.data.SEQ_NO);
              }, result.data.SEQ_NO);
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'New Scan',
        msg: result.MSG,
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
  }

  // 재고 데이터 확정
  async fetchConfirm(reqList, AUTO_YN) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010214SVC', 'confirmStock', {
      body: JSON.stringify({
        WMS010214F1: {
          AUTO_YN,
        },
        WMS010214G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Confirm',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch(null);
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Confirm',
        msg: result.MSG,
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
  }

  // 재고 데이터 취소
  async fetchCancel(reqList) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010214SVC', 'cancelStock', {
      body: JSON.stringify({
        WMS010214G1: {
          data: reqList,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Cancel',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch(null);
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Cancel',
        msg: result.MSG,
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
  }

  _onCheckPress(item, index) {
    const data = this.state.data;
    const totalData = this.state.totalData;
    let setScanQty = item.BASE_QTY;

    if (item.CHECK_QTY === item.BASE_QTY) {
      setScanQty = 0;
    }
    totalData.forEach(x => {
      if (x === item) {
        x.CHECK_QTY = setScanQty;
        x.scanChecked = 'Y';
      }
    });

    data.forEach(dt => {
      if (dt === item) {
        dt.CHECK_QTY = setScanQty;
        dt.scanChecked = 'Y';
      }
    });

    this.setState({
      data,
      totalData,
    });

    Util.toastMsg(`${setScanQty}개 스캔`);
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
          autoFocus
          // autoFocus
          blurOnSubmit={false}
          keyboardType="email-address"
          onSubmitEditing={() => {
            this.focusNextField();
          }}
        />
        <View style={styles.buttonStyle}>
          <HButton onPress={() => this._clear()} title={'Clear'} />
        </View>
        <View style={styles.buttonStyle}>
          <HButton
            onPress={() => this._onPress()}
            title={'Check'}
            disabled={!this.state.scanData}
          />
        </View>
      </View>
    );
  }

  // 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
  // onMoreView = getRtnData => {
  //   // 리턴 된 값이 있을 경우만 setState 처리!
  //   if (!Util.isEmpty(getRtnData)) {
  //     this.setState({
  //       data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
  //     });
  //   }
  // };
  // FLAT LIST 내부에 넣으면 키보드가 닫히는 이슈발생으로 ..
  renderHeader = () => (
    <View>
      <HRow>
        <HDatefield label={'Stock Date'} bind={'WMS100901.STK_DATE'} editable rowflex={1.5} />
        <HTextfield
          label={'Area'}
          bind={'WMS100901.AREA'}
          keyboardType="email-address"
          onChanged={() => {
            modelUtil.setValue('WMS100901.SEQ_NO', '');
            modelUtil.setValue('WMS100901.SEQ_NO_NAME', '');
          }}
          editable
        />
        <HCombobox
          label={'Times'}
          groupCode={'SP8967'}
          codeField={'SEQ_NO'}
          nameField={'SEQ_NO'}
          bindVar={{
            CD: 'WMS100901.SEQ_NO',
            NM: 'WMS100901.SEQ_NO_NAME',
          }}
          sql={modelUtil.getModelData('WMS100901')}
          editable
        />
        <HButton
          onPress={() => this.onNew()}
          title={'New'}
          bStyle={{
            backgroundColor: bluecolor.basicRedColor,
          }}
        />

      </HRow>
      <HRow>
        <Touchable
          style={styles.button}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.onConfirm()}
          rowflex={1.2}
        >
          <HText value="Confirm" textStyle={[{ fontWeight: 'bold', color: bluecolor.basicRedColor }]} />
        </Touchable>
        <Touchable
          style={styles.button}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.onCancel()}
          rowflex={1.2}
        >
          <HText value="Cancel" textStyle={[{ fontWeight: 'bold', color: bluecolor.basicRedColor }]} />
        </Touchable>
        <HCombobox
          label={'Sort'}
          groupJson={[{
            DT_CODE: 'OK',
            LOC_VALUE: 'OK',
          }, {
            DT_CODE: 'ERROR',
            LOC_VALUE: 'ERROR',
          }]}
          bindVar={{
            CD: 'WMS100901.SORT_FLAG',
            NM: 'WMS100901.SORT_FLAG_NAME',
          }}
          editable
          rowflex={1.2}
        />
        <HButton onPress={() => this.fetch()} title={'Search'} rowflex={2} />
      </HRow>
    </View>
  );

  renderBody = (item, index, scanData, scanIndex) => (
    <View style={{ flex: 1 }} key={item.STK_NO + item.PARTITION_SEQ_NO}>
      <HFormView
        style={[
          { marginTop: 2 },
          item.CHECK_QTY === item.BASE_QTY
            ? { backgroundColor: bluecolor.basicSkyLightBlueColor }
            : null,
        ]}
      >
        <HRow>
          <HButton
            onPress={() => this._onCheckPress(item, index)}
            name={'check-square-o'}
            bStyle={{
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: bluecolor.basicGreenColor,
            }}
          />
          <HText value={item.REF_SCAN_NO} textStyle={[{ fontWeight: 'bold' }]} rowflex={4} />
          <HText value={item.LOCATION} rowflex={1.5} />
        </HRow>
        <HRow>
          <HText
            textStyle={[
              item.CHECK_QTY > 0
                ? { color: bluecolor.basicRedColor, fontWeight: 'bold' }
                : { fontWeight: 'bold' },
            ]}
            value={`${item.CHECK_QTY || 0} / ${item.BASE_QTY}`}
            rowflex={1.5}
          />
          <HText value={item.GR_DATE_TIME} rowflex={4} />
          <HButton
            onPress={() => this._onPress(item)}
            name={'share-square-o'}
            bStyle={{
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: bluecolor.basicDeepGrayColor,
            }}
          />
        </HRow>
      </HFormView>
    </View>
  );

  render() {
    return (
      <HBaseView style={styles.container} scrollable={false}>
        {this.renderBarcode()}
        <Text
          style={styles.textVaildScan}
          ref={c => {
            this.scanVaildData = c;
          }}
        >
          {this.state.scanVaildData}
        </Text>
        <HListView
          keyExtractor={item => item.STK_NO + item.PARTITION_SEQ_NO}
          renderHeader={this.renderHeader}
          renderItem={({ item, index }) =>
            this.renderBody(item, index, this.state.barcodeScanData, this.state.barcodeScanIndex)
          }
          onSearch={() => this.fetch()}
          onMoreView={null}
          data={this.state.data}
          // 조회된값
          totalData={this.state.totalData}
          // 하단에 표시될 메세지값
          status={this.state.status}
        />
        {/* 바코드 스캔입력부분 제어 */}
        <Touchable
          style={styles.barButton}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.onBarcodePopup()}
        >
          <HIcon name="barcode" size={20} color="#fff" />
        </Touchable>
        {
          (this.state.confirmUser !== '' && this.state.confirmUser !== null) ?
            (<View
              style={[styles.saveButton, { backgroundColor: bluecolor.basicDeepGrayColor, borderColor: bluecolor.basicDeepGrayColor }]}
              underlayColor={bluecolor.basicDeepGrayColor}
            >
              <HText value="Fix" textStyle={[{ fontWeight: 'bold', color: '#fff' }]} />
            </View>) :
            (<Touchable
              style={styles.saveButton}
              underlayColor={'rgba(63,119,161,0.8)'}
              onPress={() => this.onSave()}
            >
              <HText value="SAVE" textStyle={[{ fontWeight: 'bold', color: '#fff' }]} />
            </Touchable>)
        }
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
  filterInput: {
    flex: 1,
    marginTop: 10,
  },
  buttonStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingRight: 3,
    paddingLeft: 3,
  },
  barButton: {
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
  saveButton: {
    backgroundColor: 'rgba(52,152,219,0.8)',
    borderColor: 'rgba(52,152,219,0.8)',
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 25,
    right: 20,
    shadowColor: '#3f77a1',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
  button: {
    borderColor: 'rgba(52,152,219,0.8)',
    borderWidth: 1,
    flex: 0.5,
    height: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
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
