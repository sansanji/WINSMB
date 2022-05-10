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
  ReduxStore,
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
    super(props, 'DMS100901');

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
      CONFIRM_YN: null,
    };
  }

  componentWillMount() {
    this._validCheckFunc('alert');

    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const companyCode = this.props.global.session.COMPANY_CODE;

    if (whCode) {
      modelUtil.setModelData('DMS100901', {
        COMPANY_CODE: companyCode,
        WH_CODE: whCode,
        AREA: '',
        STK_DATE: Util.getDateValue(),
        SEQ_NO: '',
        // STK_DATE: 20210614,
        ITEM_CODE: '',
        ITEM_NAME: '',
        LOCATION: '',
        VENDOR_CODE: '',
        SORT_FLAG: null,
        GR_DT: 'N',
        PLT_CHECK: 'Y',
        BOX_CHECK: 'N',
        ITEM_CHECK: 'N',
      });
    } else {
      modelUtil.setModelData('DMS100901', {
        AREA: '',
        STK_DATE: Util.getDateValue(),
        SEQ_NO: '',
        // STK_DATE: 20210614,
        SORT_FLAG: null,
        COMPANY_CODE: companyCode,
      });
    }
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.dmsValidCheckFunc(alertType);
  }

  componentDidMount() {
    // this.fetch(null);
    this.fetchArea();
  }

  async fetch(callback, seqno) {
    const reqData = modelUtil.getModelData('DMS100901');
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

    const area = reqData.AREA.toUpperCase();
    const { BUYER_CODE, BUYER_NAME, VENDOR_CODE, VENDOR_NAME } = this.props.global.dmsStockVendorcode;
    reqData.AREA = area;
    reqData.BUYER_CODE = BUYER_CODE;
    reqData.BUYER_NAME = BUYER_NAME;
    reqData.VENDOR_CODE = VENDOR_CODE;
    reqData.VENDOR_NAME = VENDOR_NAME;

    // if (reqData.SEQ_NO === '' || reqData.SEQ_NO === null) {
    //   Util.msgBox({
    //     title: 'Alert',
    //     msg: 'Please input Search Times!! ',
    //     buttonGroup: [
    //       {
    //         title: 'OK',
    //         onPress: () => {},
    //       },
    //     ],
    //   });
    //   return;
    // }

    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030510SVC', 'getDT', {
      body: JSON.stringify({
        DMS030510F1: reqData,
      }),
    });
    // 스캔 갯수 표시
    let count = 0;
    const totalcount = result.DMS030510G2.length;
    // let ingcount = 0;
    // let wrongcount = 0;
    // let todocount = 0;
    for (let i = 0; i < result.DMS030510G2.length; i += 1) {
      if (result.DMS030510G2[i].CHECK_YN === 'Y') {
        count += 1;
      }
      // else if (result.DMS030510G2[i].CHECK_YN > 0) {
      //   if (result.DMS030510G2[i].CHECK_YN < result.DMS030510G2[i].BASE_QTY) {
      //     ingcount += 1;
      //   } else {
      //     wrongcount += 1;
      //   }
      // }
    }
    // todocount = totalcount - count;
    if (result) {
      // 정해진 데이터만 보여준다.
      // const data = Util.getArrayData(result.FMS040112G1, env().listCnt);
      if (result.DMS030510G2.length > 0) {
        this.setState(
          {
            totalData: result.DMS030510G2,
            data: result.DMS030510G2,
            status: {
              TYPE: result.TYPE,
              MSG: `스캔완료(${count}/${totalcount})`,
              // MSG: `스캔완료(${count}/${totalcount}) 스캔중(${ingcount}/${todocount}) 스캔오류(${wrongcount}/${todocount})`,
            },
            confirmDate: result.DMS030510G2[0].CONFIRM_DATE,
            confirmUser: result.DMS030510G2[0].CONFIRM_USER_ID,
            CONFIRM_YN: result.DMS030510G2[0].CONFIRM_YN,
            count,
            totalcount,
          },
          callback,
        );

        // auto확정
        if (count === totalcount && (result.DMS030510G2[0].CONFIRM_USER_ID === '' || result.DMS030510G2[0].CONFIRM_USER_ID === null)) {
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
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const result = await Fetch.request('DMS030511SVC', 'getStor', {
      body: JSON.stringify({
        DMS030511F1: {
          WH_CODE: whCode,
        },
        DMS030511G1: {},
      }),
    });

    if (result.TYPE === 1) {
      const areaData = result.DMS030511G2;
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
    const TOTAL_QTY = 1;
    let listTotalCount = this.state.count || 0;

    barcode1Data = Util.onlyBigChar(barcode1Data);
    for (let i = 0; i < dataLength; i += 1) {
      g1ScanData = this.state.totalData[i].SCAN_NO.toUpperCase().trim();
      if (barcode1Data === g1ScanData) {
        barcodeYN = 'Y'; // 스캔 성공
        currentIndex = i;

        dataList[currentIndex].CHECK_YN = 'Y'; // renderBody list에 색 표기
        CHECK_QTY = dataList[currentIndex].CHECK_QTY || 0;

        listTotalCount += 1;
      //   if (
      //     dataList[currentIndex].CHECK_QTY === undefined ||
      //     dataList[currentIndex].CHECK_QTY === null
      //   ) {
      //     CHECK_QTY = 0;
      //   } else {
      //     CHECK_QTY = dataList[currentIndex].CHECK_QTY;
      //   }
      //   TOTAL_QTY = dataList[currentIndex].BASE_QTY;
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
          count: listTotalCount,
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
          count: listTotalCount,
        });

        this._setScanValidData('f');
        this._sound('f');
        Vibration.vibrate(2000);
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
        count: listTotalCount,
      });

      this._setScanValidData('f');
      this._sound('f');
      Vibration.vibrate(2000);
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
        'screen.DMS100902',
        {
          ...requestParam,
          onSaveComplete: callback => this.fetch(callback),
        },
        'Stock History',
      );
    } else if (this.state.scanData) {
      const scanData = this.state.scanData;
      requestParam = {
        ...modelUtil.getModelData('DMS100901'),
        SCAN_NO: scanData,
      };

      Navigation(
        navigator,
        'screen.DMS100601',
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
      if (dataList[i].CHECK_YN) {
        if (dataList[i].CHECK_YN === 'Y') {
          // dataList[i].CHECK_QTY = dataList[i].CHECK_QTY.toString();
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

    const result = await Fetch.request('DMS030510SVC', 'saveStock', {
      body: JSON.stringify({
        DMS030510G1: {
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
    const reqData = modelUtil.getModelData('DMS100901');
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
            onPress: () => this.fetchConfirm('N'),
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
            onPress: () => this.fetchConfirm('Y'),
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

    const data = modelUtil.getModelData('DMS100901');
    const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);
    const vendorName = _.get(this.props.global, 'dmsVendorcode.VENDOR_NAME', null);

    // const STK_DATE = modelUtil.getValue('DMS100901.STK_DATE');
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);

    const result = await Fetch.request('DMS030510SVC', 'insertStock', {
      body: JSON.stringify({
        DMS030510F1: {
          // reqData,
          STK_DATE: data.STK_DATE,
          WH_CODE: whCode,
          VENDOR_CODE: reqData.VENDOR_CODE,
          VENDOR_NAME: reqData.VENDOR_NAME,
          BUYER_CODE: reqData.BUYER_CODE,
          BUYER_NAME: reqData.BUYER_NAME,
          ITEM_CODE: reqData.ITEM_CODE,
          ITEM_NAME: reqData.ITEM_NAME,
          GR_DT: reqData.GR_DT,
          PLT_CHECK: reqData.PLT_CHECK,
          BOX_CHECK: reqData.BOX_CHECK,
          ITEM_CHECK: reqData.ITEM_CHECK,
        },
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
                modelUtil.setValue('DMS100901.SEQ_NO', result.data.SEQ_NO);
                modelUtil.setValue('DMS100901.SEQ_NO_NAME', result.data.SEQ_NO);
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
  async fetchConfirm(AUTO_YN) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const SEQ_NO = modelUtil.getValue('DMS100901.SEQ_NO');
    const STK_DATE = modelUtil.getValue('DMS100901.STK_DATE');
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const companyCode = this.props.global.session.COMPANY_CODE;

    const result = await Fetch.request('DMS030510SVC', 'confirmStock', {
      body: JSON.stringify({
        DMS030510F1: {
          COMPANY_CODE: companyCode,
          WH_CODE: whCode,
          STK_DATE,
          SEQ_NO,
          AUTO_YN,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.openLoader(this.screenId, false);
      Util.msgBox({
        title: 'Confirm',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.fetch(null);
            },
          },
        ],
      });
    } else {
      Util.openLoader(this.screenId, false);
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
    const SEQ_NO = modelUtil.getValue('DMS100901.SEQ_NO');
    const STK_DATE = modelUtil.getValue('DMS100901.STK_DATE');
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const companyCode = this.props.global.session.COMPANY_CODE;

    const result = await Fetch.request('DMS030510SVC', 'cancelStock', {
      body: JSON.stringify({

        DMS030510F1: {
          COMPANY_CODE: companyCode,
          WH_CODE: whCode,
          STK_DATE,
          SEQ_NO,
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
    let setScanQty = 0;
    let listTotalCount = this.state.count || 0;

    // if (item.CHECK_YN === 'Y') {
    //   setScanQty += 1;
    // }
    totalData.forEach(x => {
      if (x === item) {
        if (item.CHECK_YN === 'Y') {
          x.CHECK_YN = 'N';
          setScanQty = 0;
          listTotalCount -= 1;
        } else {
          x.CHECK_YN = 'Y';
          setScanQty += 1;
          listTotalCount += 1;
        }
      }
    });

    this.setState({
      totalData,
      count: listTotalCount,
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
        <HDatefield label={'Stock Date'} bind={'DMS100901.STK_DATE'} editable rowflex={1.5} />
        <HTextfield
          label={'Area'}
          bind={'DMS100901.AREA'}
          keyboardType="email-address"
          onChanged={() => {
            modelUtil.setValue('DMS100901.SEQ_NO', '');
            modelUtil.setValue('DMS100901.SEQ_NO_NAME', '');
          }}
          editable
        />
        <HCombobox
          label={'Times'}
          groupCode={'SP8947'}
          codeField={'SEQ_NO'}
          nameField={'SEQ_NO'}
          bindVar={{
            CD: 'DMS100901.SEQ_NO',
            NM: 'DMS100901.SEQ_NO_NAME',
          }}
          sql={modelUtil.getModelData('DMS100901')}
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
        <Touchable onPress={() => this.onViewVendor()}>
          <View>
            <HText textStyle={{ fontSize: 9, color: bluecolor.basicBlueImpactColor }}>Vendor▼</HText>
          </View>
          <HText textStyle={{ fontSize: 10 }}>{this.props.global.dmsStockVendorcode.DISP_VENDOR_NAME}</HText>
        </Touchable>
        <HTextfield
          label={'Item Code'}
          bind={'DMS100901.CREATE_ITEM_CODE'}
          keyboardType="email-address"
          onChanged={() => {
            modelUtil.setValue('DMS100901.SEQ_NO', '');
            modelUtil.setValue('DMS100901.SEQ_NO_NAME', '');
          }}
          editable
        />
        <HTextfield
          label={'Item Name'}
          bind={'DMS100901.CREATE_ITEM_NAME'}
          keyboardType="email-address"
          onChanged={() => {
            modelUtil.setValue('DMS100901.SEQ_NO', '');
            modelUtil.setValue('DMS100901.SEQ_NO_NAME', '');
          }}
          editable
        />
      </HRow>
      <HRow>
        <HCheckbox
          label={'GR Dt'}
          bind={'DMS100901.GR_DT'}
          toggle
          editable
          rowflex={1}
        />
        <HCheckbox
          label={'PLT'}
          bind={'DMS100901.PLT_CHECK'}
          toggle
          editable
          rowflex={1}
        />
        <HCheckbox
          label={'BOX'}
          bind={'DMS100901.BOX_CHECK'}
          toggle
          editable
          rowflex={1}
        />
        <HCheckbox
          label={'ITEM'}
          bind={'DMS100901.ITEM_CHECK'}
          toggle
          editable
          rowflex={1}
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
            CD: 'DMS100901.SORT_FLAG',
            NM: 'DMS100901.SORT_FLAG_NAME',
          }}
          editable
          rowflex={1.2}
        />
        <HButton onPress={() => this.fetch()} title={'Search'} rowflex={2} />
      </HRow>
    </View>
  );

  renderBody = (item, index, scanData, scanIndex) => (
    <View style={{ flex: 1 }} key={item.SCAN_NO}>
      <HFormView
        style={[
          { marginTop: 2 },
          item.CHECK_YN === 'Y'
            ? { backgroundColor: bluecolor.basicSkyLightBlueColor }
            : null,
        ]}
      >
        <HRow between>
          <HButton
            onPress={() => this._onCheckPress(item, index)}
            name={'check-square-o'}
            bStyle={{
              paddingLeft: 5,
              paddingRight: 5,
              backgroundColor: bluecolor.basicGreenColor,
            }}
          />
          <HText
            value={item.GR_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
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
          <HText value={item.VENDOR_NAME} />
          <HText value={item.BUYER_NAME} />
        </HRow>
        <HRow between >
          <HText>{item.DOC_NO}</HText>
          <HText value={item.ITEM_NAME} />
          <HText value={item.ITEM_CODE} />
        </HRow>
        <HRow>
          <HText value={item.LOCATION} />
          <HText value={item.GR_DATE} />
          <HText value={`Days : ${item.STOCK_DAYS || 0}`} />
          <HText
            value={item.CONFIRM_YN}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
        </HRow>
        <HRow>
          <HText
            textStyle={[
              item.CHECK_QTY > 0
                ? { color: bluecolor.basicRedColor, fontWeight: 'bold' }
                : { fontWeight: 'bold' },
            ]}
            value={`PLT :${item.PLT_QTY || 0} / BOX :${item.BOX_QTY} / ITEM :${item.ITEM_QTY} / GW :${item.GW}`}
            rowflex={1.5}
          />

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

  async onViewVendor() {
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const result = await Fetch.request('DMS030030SVC', 'get', {
      body: JSON.stringify({
        DMS030030F1: {
          WH_CODE: whCode,
        },
      }),
    });

    if (result) {
      const vendorList = [];
      result.DMS030030G1.forEach(item => {
        vendorList.push({
          ...item,
          DISP_VENDOR_NAME: `${item.VENDOR_NAME}\n(${item.BUYER_NAME})`,
        });
      });

      Util.openComboBox({
        label: 'Vendor Code',
        groupJson: vendorList,
        codeField: 'VENDOR_CODE',
        nameField: 'DISP_VENDOR_NAME',
        onChange: (value, comboValue) => {
          ReduxStore.dispatch({
            type: 'global.dmsStockVendorcode.set',
            dmsStockVendorcode: comboValue,
          });
        },
      });
    }
  }

  render() {
    const { session, whcode, vendorcode } = this.props.global;
    let vendorName = '';
    if (vendorcode) {
      if (vendorcode.VENDOR_NAME) {
        vendorName = vendorcode.VENDOR_NAME;
      }
    }
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
          keyExtractor={item => item.SCAN_NO}
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
          (this.state.CONFIRM_YN !== '' && this.state.CONFIRM_YN !== null) ?
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
