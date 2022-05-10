/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Keyboard, Vibration } from 'react-native';
import {
  _,
  React,
  Util,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  ReduxStore,
  bluecolor,
  modelUtil,
} from 'libs';
import { HBaseView, Touchable, HButton, HIcon, HTexttitle, HCombobox, HCheckbox, HRow, HText } from 'ux';

/**
 * 신버전 위치이동 버전
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100601');
    this.state = {
      GR_NO: null,
      VENDOR_NAME: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      REMARKS: null,
      spinner: false,
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      barcodeData4: null,
      scanVaildData: null,
      barcodeStatus: null,
      data: null,
      docTarget: 'N',
      locationTarget: 'Y',
      remarkTarget: 'N',
      barSeq: 0,
      barcode1Data: null,
      itemScanYN: 'N',
      saveLoc: 'N',
    };

    modelUtil.setModelData('DMS100601', {
      CHANGE_TYPE: 'LOCATION',
      CHANGE_TYPE_NAME: 'Location',
      fixDoc: 'N',
      fixLoc: 'N',
      fixRemark: 'N',
    });

    // modelUtil.setModelData('DMS100601', { CHANGE_TYPE: 'LOCATION', CHANGE_TYPE_NAME: 'Location' });
  }

  componentWillMount() {
    this.barcode = [];
    // this._validCheckFunc(null); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  componentDidMount() {
    const { SCAN_NO } = this.props;
    if (SCAN_NO) {
      this._focusNextField(SCAN_NO);
    }
  }

  // 포커스 이동
  _focusNextField(scanData, locSeq) {
    let barSeq = locSeq || this.state.barSeq;
    let barcodeData = this.barcode[barSeq]._lastNativeText;
    let barcodeData1 = this.state.barcodeData1;
    let barcodeData2 = this.state.barcodeData2;
    let barcodeData3 = this.state.barcodeData3;
    let barcodeData4 = this.state.barcodeData4;

    const docTarget = this.state.docTarget;
    const remarkTarget = this.state.remarkTarget;
    const locationTarget = this.state.locationTarget;

    if (scanData) {
      barcodeData = scanData;
    }
    if (!barcodeData) {
      this.deleteAll('Please, Input the barcode data!');
      this.failScan();
      return;
    }


    if ((locationTarget === 'N' || Util.isEmpty(locationTarget)) && (docTarget === 'N' || Util.isEmpty(docTarget)) && (remarkTarget === 'N' || Util.isEmpty(remarkTarget))) {
      this.fetchOnlyItem(barcodeData);
      return;
      // this._resetState(this.fetch(barcodeData1));
    }


    // 스캔된 바코드를 화면에 입력해 주는 부분
    if (barSeq === 0) {
      barcodeData1 = barcodeData;
    } else if (barSeq === 1) {
      barcodeData2 = barcodeData;
    } else if (barSeq === 2) {
      barcodeData3 = barcodeData;
    } else {
      barcodeData4 = barcodeData;
    }

    this.setState({
      barcodeData1,
      barcodeData2,
      barcodeData3,
      barcodeData4,
    });

    // ********** focus 이동 부분 시작 ****************
    // 스캔 순서 : 아이템 - 로케이션 - 디오씨- 리마크
    // 아이템은 default값으로 없는경우 스캔해 준다.
    if (Util.isEmpty(this.state.barcode1Data)) {
      this.fetch(barcodeData1);
      if (this.state.itemScanYN === 'Y' && barSeq !== 0) {
        // 아이템을 스캔했을때,
        barSeq += 1;


        this.barcode[barSeq].clear();
        this.barcode[barSeq].focus();

        this.setState({
          barSeq,
        });
      }
      return;
    }

    // toggle값에 따른 포커스 이동 부분
    if (locationTarget === 'N' && docTarget === 'N' && remarkTarget === 'Y') {
      if (Util.isEmpty(this.state.barcodeData4) && Util.isEmpty(barcodeData4)) {
        barSeq += 3;
      } else {
        this.fetch(this.state.barcode1Data, null, null, barcodeData4);
        return;
      }
    } else if (locationTarget === 'Y' && docTarget === 'N' && remarkTarget === 'N') {
      if (Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData2)) {
        barSeq += 1;
      } else {
        this.fetch(this.state.barcode1Data, barcodeData2, null, null);
        return;
      }
    } else if (locationTarget === 'N' && docTarget === 'Y' && remarkTarget === 'N') {
      if (Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData3)) {
        barSeq += 2;
      } else {
        this.fetch(this.state.barcode1Data, null, barcodeData3, null);
        return;
      }
    } else if (locationTarget === 'Y' && docTarget === 'N' && remarkTarget === 'Y') {
      if (Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData2)) {
        barSeq += 1;
      } else if (!Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData4)) {
        barSeq += 3;
      } else if (Util.isEmpty(this.state.barcodeData4) && Util.isEmpty(barcodeData4)) {
        barSeq += 2;
      } else {
        this.fetch(this.state.barcode1Data, barcodeData2, null, barcodeData4);
        return;
      }
    } else if (locationTarget === 'N' && docTarget === 'Y' && remarkTarget === 'Y') {
      if (Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData3)) {
        barSeq += 2;
      } else if (Util.isEmpty(this.state.barcodeData4) && Util.isEmpty(barcodeData4)) {
        barSeq += 1;
      } else {
        this.fetch(this.state.barcode1Data, null, barcodeData3, barcodeData4);
        return;
      }
    } else if (locationTarget === 'Y' && docTarget === 'Y' && remarkTarget === 'N') {
      if (Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData2)) {
        barSeq += 1;
      } else if (!Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData3)) {
        barSeq += 2;
      } else if (Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData3)) {
        barSeq += 1;
      } else {
        this.fetch(this.state.barcode1Data, barcodeData2, barcodeData3, null);
        return;
      }
    } else if (locationTarget === 'Y' && docTarget === 'Y' && remarkTarget === 'Y') {
      if (Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData2)) {
        barSeq += 1;
      } else if (!Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData3)) {
        barSeq += 2;
      } else if (!Util.isEmpty(this.state.barcodeData2) && !Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData4)) {
        barSeq += 3;
      } else if (Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData3)) {
        barSeq += 1;
      } else if (Util.isEmpty(this.state.barcodeData4) && Util.isEmpty(barcodeData4)) {
        barSeq += 1;
      } else {
        this.fetch(this.state.barcode1Data, barcodeData2, barcodeData3, barcodeData4);
        return;
      }
    }
    this.barcode[barSeq].clear();
    this.barcode[barSeq].focus();

    this.setState({
      barSeq,
    });
    // ********** focus 이동 부분 끝 ****************
  }


  async fetch(barcodeData1, barcodeData2, barcodeData3, barcodeData4) {
    const blockDup = this.props.global.config.DMS_BLOCK_DUP;
    // const { config } = ReduxStore.getState().global;
    const changeType = modelUtil.getValue('DMS100601.CHANGE_TYPE');
    let tabCode = null;
    Vibration.vibrate(500);
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const fixLoc = modelUtil.getValue('DMS100601.fixLoc');
    const fixDoc = modelUtil.getValue('DMS100601.fixDoc');
    const fixRemark = modelUtil.getValue('DMS100601.fixRemark');
    const saveLoc = this.state.saveLoc;

    const barSeq = this.state.barSeq;

    // const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);
    // const vendorPlantCode = _.get(this.props.global,
    // 'dmsVendorcode.VENDOR_PLANT_CODE', null); barcode1Data = 'ITWH13180329000221';

    // 로케이션이 fix인 경우 fetch가 된 후 자동으로 한번 스캔 넘어가 준다.
    // if (fixLoc === 'Y' && this.state.barcodeData2) {
    //   this._focusNextField();
    //   return;
    // }

    // || (fixLoc === 'Y' && saveLoc === 'Y')
    if (!Util.isEmpty(this.state.data)) {
      // tabCode가 GR_DT일 경우 로케이션 중복검사를 하지않는다.M_GR_DT은 중복검사한다.
      // 상세인지 세부상세인지 STK_NO의 유무를 보고 판단
      if (this.state.data[0].TYPE === 'DT') {
        tabCode = 'DT';
      } else if (this.state.data[0].TYPE === 'PLT') {
        tabCode = 'PLT';
      } else if (this.state.data[0].TYPE === 'BOX') {
        tabCode = 'BOX';
      } else if (this.state.data[0].TYPE === 'ITM') {
        tabCode = 'ITEM';
      }

      // 스캔된재고아이템에 로케이션 등록
      // this.state.data[0][changeType] = barcode1Data;
      this.state.data[0].LOCATION = barcodeData2;
      this.state.data[0].DOC_NO = barcodeData3;
      this.state.data[0].REMARKS = barcodeData4;

      // if (barcodeData1 !== null && barcodeData1 !== '') {
      //   if (
      //     Util.dmsCheckBarcode(barcodeData1) === 'ITEM' ||
      //     Util.dmsCheckBarcode(barcodeData1) === 'PLT' ||
      //     Util.dmsCheckBarcode(barcodeData1) === 'BOX'
      //   ) {
      //     // 스캔 실패한 경우
      //     this.deleteLoc(
      //       `Please scan ${modelUtil.getValue('DMS100601.CHANGE_TYPE_NAME')} Barcord.`,
      //     );
      //     this.failScan();
      //     return;
      //   }
      // }

      // Location format 체크로직
      if (!Util.isEmpty(barcodeData2)) {
        if (barcodeData2.indexOf('-') < 1 || barcodeData2.length !== 9) {
          this.deleteLoc('Please scan Correct Location format');
          this.failScan();
          return;
        }

        if (barcodeData2.substr(3, 1) !== '-' || barcodeData2.substr(6, 1) !== '-') {
          this.deleteLoc('Please scan Correct Location format');
          this.failScan();
          return;
        }
      }
      // 타입별로 저장하는 컬럼을 변경
      // let reqService = 'saveLoc';
      // if (changeType === 'DOC_NO') {
      //   reqService = 'saveDoc';
      // }
      // if (changeType === 'REMARKS') {
      //   reqService = 'saveRemarks';
      // }
      const result = await Fetch.request('DMS030510SVC', 'saveLoc', {
        body: JSON.stringify({
          DMS030510F1: {
            WH_CODE: whCode,
            TAB_CODE: tabCode,
            CHANGE_TYPE: changeType,
            DMS_BLOCK_DUP: blockDup,
            LOCATION: barcodeData2,
            DOC_NO: barcodeData3,
            REMARKS: barcodeData4,
          },
          DMS030510G1: {
            data: this.state.data,
          },
        }),
      });

      if (result) {
        if (result.TYPE === 1) {
          // 스캔 성공한 경우
          this.setState({
            scanVaildData: `"${this.state.SCAN_NO}" change to "${barcodeData1}" Success!`,
            MOVED_LOCATION: barcodeData1,
            spinner: false,
            data: null,
            barcode1Data: null,
          });
          if (fixLoc === 'Y') {
            this.setState({
              saveLoc: 'Y',
            });
          }

          // 바코드 초기화
          this._onClearBarcode('barcode1');

          if (barcodeData2 && fixLoc === 'N') {
            this._onClearBarcode('barcode2');
          }
          if (barcodeData3 && fixDoc === 'N') {
            this._onClearBarcode('barcode3');
          }
          if (barcodeData4 && fixRemark === 'N') {
            this._onClearBarcode('barcode4');
          }

          this.setState({
            barSeq: 0,
          });
          this.barcode[0].focus();
          this.successScan();
        } else {
          this.deleteLoc(result.MSG);
          this.failScan();
        }
      } else {
        // 스캔 실패한 경우
        this.deleteLoc('Move Fail \n Please contact manager.');
        this.failScan();
      }
    } else {
      // 맨처음 화면을 띄우고 스캔할때에는 data에 값이 널이므로 이 프로세스를 탄다
      // 재고아이템을 찾아와서 스캔여부 확인

      // 바코드번호를 입력하지 않았으면 초기화
      if (!barcodeData1) {
        this.deleteAll('Please, Input the barcode data!');
        this.failScan();
        return;
      }

      if (Util.checkBarcode(barcodeData1) === 'LOC') {
        // 스캔 실패한 경우
        this.deleteLoc('Please scan Item Barcord.');
        this._onClearBarcode('barcode1');
        this.failScan();


        this.barcode[0].focus();
        return;
      }

      const result2 = await Fetch.request('DMS030511SVC', 'getStockAll', {
        body: JSON.stringify({
          DMS030511F1: {
            WH_CODE: whCode,
            SCAN_NO: barcodeData1,
            EXIST_YN: 'Y',
            GRGI_DAY: 'GR',
            GR_FLAG: 'N',
            LOC_YN: 'N',
          },
        }),
      });

      if (result2) {
        if (result2.DMS030511G6[0]) {
          result2.DMS030511G6[0].SCAN_NO = barcodeData1;
          // 스캔 성공한 경우
          this.setState({
            scanVaildData: `"${result2.DMS030511G6[0].SCAN_NO}" Scan Success!`,
            VENDOR_NAME: result2.DMS030511G6[0].VENDOR_NAME,
            BUYER_NAME: result2.DMS030511G6[0].BUYER_NAME,
            GR_NO: result2.DMS030511G6[0].GR_NO,
            DOC_NO: result2.DMS030511G6[0].DOC_NO,
            LOCATION: result2.DMS030511G6[0].LOCATION,
            REMARKS: result2.DMS030511G6[0].REMARKS,
            STOCK_DAYS: result2.DMS030511G6[0].STOCK_DAYS,
            SCAN_NO: result2.DMS030511G6[0].SCAN_NO,
            TYPE: result2.DMS030511G6[0].TYPE,

            GR_DATE_TIME: result2.DMS030511G6[0].GR_DATE_TIME,
            GR_REF_NO: result2.DMS030511G6[0].GR_REF_NO,
            REF_NO: result2.DMS030511G6[0].REF_NO,
            ITEM_CODE: result2.DMS030511G6[0].ITEM_CODE,
            PLT_QTY: result2.DMS030511G6[0].PLT_QTY,
            BOX_QTY: result2.DMS030511G6[0].BOX_QTY,
            ITEM_QTY: result2.DMS030511G6[0].ITEM_QTY,
            GW: result2.DMS030511G6[0].GW,

            MOVED_LOCATION: null,
            spinner: false,
            data: result2.DMS030511G6,
            barcode1Data: barcodeData1,
            itemScanYN: 'Y',
          });
          this._focusNextField(barcodeData1, 0);
          this.successScan();
        }
      } else {
        // 데이터가 없는 경우
        this.deleteAll('This item is not exist now. \n Please contact manager.');
        this.failScan();
      }
    }
  }

  async fetchOnlyItem(barcodeData1) {
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);

    const result2 = await Fetch.request('DMS030511SVC', 'getStockAll', {
      body: JSON.stringify({
        DMS030511F1: {
          WH_CODE: whCode,
          SCAN_NO: barcodeData1,
          EXIST_YN: 'Y',
          GRGI_DAY: 'GR',
          GR_FLAG: 'N',
          LOC_YN: 'N',
        },
      }),
    });

    if (result2.TYPE === 1) {
      if (result2.DMS030511G6[0]) {
        result2.DMS030511G6[0].SCAN_NO = barcodeData1;
        // 스캔 성공한 경우
        this.setState({
          scanVaildData: `"${result2.DMS030511G6[0].SCAN_NO}" Scan Success!`,
          VENDOR_NAME: result2.DMS030511G6[0].VENDOR_NAME,
          BUYER_NAME: result2.DMS030511G6[0].BUYER_NAME,
          GR_NO: result2.DMS030511G6[0].GR_NO,
          DOC_NO: result2.DMS030511G6[0].DOC_NO,
          LOCATION: result2.DMS030511G6[0].LOCATION,
          REMARKS: result2.DMS030511G6[0].REMARKS,
          STOCK_DAYS: result2.DMS030511G6[0].STOCK_DAYS,
          SCAN_NO: result2.DMS030511G6[0].SCAN_NO,
          TYPE: result2.DMS030511G6[0].TYPE,

          GR_DATE_TIME: result2.DMS030511G6[0].GR_DATE_TIME,
          GR_REF_NO: result2.DMS030511G6[0].GR_REF_NO,
          REF_NO: result2.DMS030511G6[0].REF_NO,
          ITEM_CODE: result2.DMS030511G6[0].ITEM_CODE,
          PLT_QTY: result2.DMS030511G6[0].PLT_QTY,
          BOX_QTY: result2.DMS030511G6[0].BOX_QTY,
          ITEM_QTY: result2.DMS030511G6[0].ITEM_QTY,
          GW: result2.DMS030511G6[0].GW,


          MOVED_LOCATION: null,
          spinner: false,
          data: result2.DMS030511G6,
          barcode1Data: barcodeData1,
          itemScanYN: 'Y',
        });
        this.successScan();
      }
    } else {
      // 데이터가 없는 경우
      this.deleteAll('This item is not exist now. \n Please contact manager.');
      this.failScan();
    }
    this.barcode[0].clear();
    this.barcode[0].focus();
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.validCheckFunc(alertType);

    if (validCheck) {
      this.fetch('', null);
    }
  }


  _keyboardDissmiss() {
    this.setState({
      GR_NO: null,
      VENDOR_NAME: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      spinner: false,
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      barcodeData4: null,
      barcode1Data: null,
      scanVaildData: null,
      barcodeStatus: null,
      data: null,
      barSeq: 0,
    });
    if (!Util.isEmpty(this.barcode[0])) {
      this.barcode[0].clear();
    }
    if (!Util.isEmpty(this.barcode[1])) {
      this.barcode[1].clear();
    }
    if (!Util.isEmpty(this.barcode[2])) {
      this.barcode[2].clear();
    }
    if (!Util.isEmpty(this.barcode[3])) {
      this.barcode[3].clear();
    }
    this.barcode[0].focus();
    Keyboard.dismiss();
  }

  _onClearBarcode(barcodeType) {
    if (barcodeType === 'barcode1') {
      this.barcode[0].clear();
      this.setState({
        barcodeData1: null,
      });
    } else if (barcodeType === 'barcode2') {
      this.barcode[1].clear();
      this.setState({
        barcodeData2: null,
      });
    } else if (barcodeType === 'barcode3') {
      this.barcode[2].clear();
      this.setState({
        barcodeData3: null,
      });
    } else {
      this.barcode[3].clear();
      this.setState({
        barcodeData4: null,
      });
    }
  }

  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
    // this.barcode[1].focus();
  }

  failScan() {
    this.barcode[0].focus();
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
  }

  deleteAll(msg) {
    this.setState({
      scanVaildData: msg,
      VENDOR_NAME: null,
      GR_NO: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      spinner: false,
      data: null,
    });
  }

  deleteLoc(msg) {
    this.setState({
      scanVaildData: msg,
      MOVED_LOCATION: null,
      spinner: false,
    });
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
    this._focusNextField(result);
  }


  _locationChecked() {
    this.setState({ locationTarget: this.state.locationTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }

  _remarkChecked() {
    this.setState({ remarkTarget: this.state.remarkTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }

  _docChecked() {
    this.setState({ docTarget: this.state.docTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }

  // 해당 화면의 데이터 초기화
  _resetState(barcodeData1) {
    this.setState({
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      barcodeData4: null,
      scanVaildData: null,
      // locationTarget: true,
      barcode1Focus: false,
      barcode2Focus: false,
      barcode3Focus: false,
      locationEditable: false,
      docEditable: false,
      reqAreaIgnore: null,
      locationSaveYN: false,
      barcodeZoneCode: null,

      // 조회된 data값 null로 초기화 시키기
      DOC_NO: null,
      SCAN_NO: null,
      TYPE: null,
      GR_DATE_TIME: null,
      GR_REF_NO: null,
      ITEM_CODE: null,
      PLT_QTY: null,
      BOX_QTY: null,
      ITEM_QTY: null,
      GW: null,
      REMARKS: null,
      // this.state.값 초기화
      GR_NO: null,
      VENDOR_NAME: null,
      REF_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      MOVED_LOCATION: null,
      spinner: false,
      barcodeStatus: null,
      data: null,
      barSeq: 0,
      barcode1Data: null,
      itemScanYN: 'N',
      saveLoc: 'N',

    });
    if (!Util.isEmpty(this.barcode[0])) {
      this.barcode[0].clear();
    }
    if (!Util.isEmpty(this.barcode[1])) {
      this.barcode[1].clear();
    }
    if (!Util.isEmpty(this.barcode[2])) {
      this.barcode[2].clear();
    }
    if (!Util.isEmpty(this.barcode[3])) {
      this.barcode[3].clear();
    }
    // this.fetch(null);
    this.barcode[0].focus();
    if (!Util.isEmpty(barcodeData1)) {
      barcodeData1();
    }
  }


  render() {
    return (
      <View style={{ flex: 1 }}>
        <View>
          <View style={styles.spaceAroundStyle}>
            <TextInput
              style={(styles.barcodeInput, { flex: 1 })}
              ref={c => {
                this.barcode[0] = c;
              }}
              placeholder="Barcode"
              onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
              value={this.state.barcodeData1}
              autoFocus={this.state.GI_STATUS !== 'F'}
              keyboardType="email-address" // autoFocus
              blurOnSubmit={false}
              onSubmitEditing={() => {
                this._focusNextField();
              }}
            />
            <View style={styles.buttonStyle}>
              <HButton onPress={() => this._resetState()} name={'refresh'} />
            </View>
          </View>
          <View style={styles.spaceAroundStyle}>
            {this.state.locationTarget === 'Y' ? (
              <TextInput
                style={(styles.barcodeInput, { flex: 1 })}
                ref={c => {
                  this.barcode[1] = c;
                }}
                placeholder="Location"
                onChangeText={barcodeData2 => this.setState({ barcodeData2 })}
                value={this.state.barcodeData2}
                keyboardType="email-address"
                // editable={this.state.locationEditable}
                // blurOnSubmit={this.state.barcode2Focus}
                onSubmitEditing={() => {
                  this._focusNextField();
                }}
              />
            ) : null}
            {this.state.docTarget === 'Y' ? (
              <TextInput
                style={(styles.barcodeInput, { flex: 1 })}
                ref={c => {
                  this.barcode[2] = c;
                }}
                placeholder="Doc No"
                onChangeText={barcodeData3 => this.setState({ barcodeData3 })}
                value={this.state.barcodeData3}
                keyboardType="email-address"
                // editable={this.state.docEditable}
                // blurOnSubmit={this.state.barcode3Focus}
                onSubmitEditing={() => {
                  this._focusNextField();
                }}
              />
            ) : null}
            {this.state.remarkTarget === 'Y' ? (
              <TextInput
                style={(styles.barcodeInput, { flex: 1 })}
                ref={c => {
                  this.barcode[3] = c;
                }}
                placeholder="Remark"
                onChangeText={barcodeData4 => this.setState({ barcodeData4 })}
                value={this.state.barcodeData4}
                keyboardType="email-address"
                // editable={this.state.docEditable}
                // blurOnSubmit={this.state.barcode3Focus}
                onSubmitEditing={() => {
                  this._focusNextField();
                }}
              />
            ) : null}
          </View>
          <View style={styles.spaceAroundStyle}>
            <HCheckbox
              label={'Loc'}
              value={this.state.locationTarget}
              onChanged={() => this._locationChecked()}
              toggle
            />
            <HCheckbox label={'Loc fix'} bind={'DMS100601.fixLoc'} editable={this.state.locationTarget === 'Y'} />
            <HCheckbox
              label={'Doc no'}
              value={this.state.docTarget}
              onChanged={() => this._docChecked()}
              editable
              toggle
            />
            <HCheckbox label={'Doc fix'} bind={'DMS100601.fixDoc'} editable={this.state.docTarget === 'Y'} />
            <HCheckbox
              label={'remark'}
              value={this.state.remarkTarget}
              onChanged={() => this._remarkChecked()}
              editable
              toggle
            />
            <HCheckbox label={'remark fix'} bind={'DMS100601.fixRemark'} editable={this.state.remarkTarget === 'Y'} />
          </View>
        </View>
        <HBaseView style={styles.container} scrollable={false}>
          <View style={styles.spaceAroundStyle} />
          <Text
            style={styles.textVaildScan}
            ref={c => {
              this.scanVaildData = c;
            }}
          >
            {this.state.scanVaildData}
          </Text>
          <HTexttitle>From</HTexttitle>

          {
            this.state.data !== null ?
              <View style={styles.scanArea}>
                <HRow>
                  <HText value={` ${this.state.VENDOR_NAME}`} textStyle={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center' }} />
                </HRow>
                <HRow>
                  <HText value={` ${this.state.BUYER_NAME}`} textStyle={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center' }} />
                </HRow>
                <HRow between>
                  <HText value={this.state.GR_NO} textStyle={{ fontSize: 12 }} />
                  <HText value={this.state.GR_DATE_TIME} textStyle={{ fontSize: 12 }} />
                </HRow>
                <HRow between>
                  <HText value={`ITEM_CODE : ${this.state.ITEM_CODE}`} textStyle={{ fontSize: 12 }} />
                  <HText value={`LOCATION : ${this.state.LOCATION}`} textStyle={{ fontSize: 12 }} />
                </HRow>
                <HRow between>
                  <HText value={`DOC_NO : ${this.state.DOC_NO}`} textStyle={{ fontSize: 12 }} />
                  <HText value={`REMARKS : ${this.state.REMARKS}`} textStyle={{ fontSize: 12 }} />
                </HRow>
                <HRow between>
                  <HText value={`GR_REF_NO : ${this.state.GR_REF_NO}`} textStyle={{ fontSize: 12 }} />
                  <HText value={`REF_NO : ${this.state.REF_NO}`} textStyle={{ fontSize: 12 }} />
                </HRow>
                <HRow between>
                  <HText value={`Item : ${this.state.ITEM_QTY}`} textStyle={{ fontSize: 12 }} />
                  <HText value={`Weight : ${this.state.GW}`} textStyle={{ fontSize: 12 }} />
                  <HText value={`PLT : ${this.state.PLT_QTY}`} textStyle={{ fontSize: 12 }} />
                  <HText value={`Box : ${this.state.BOX_QTY}`} textStyle={{ fontSize: 12 }} />
                </HRow>
                <Text>
                  {this.state.STOCK_DAYS ? `${this.state.STOCK_DAYS} Days` : null}
                </Text>
              </View> :
              <View style={styles.scanArea} />
            // !Util.isEmpty(this.state.data[0]) ? <View style={styles.scanArea} /> : null

          }
          <HButton onPress={() => this.fetch('')} name={'import-export'} iconType={'M'} />
          <HTexttitle>To</HTexttitle>
          <View style={styles.scanArea}>
            <Text style={styles.textTopStyle}>{this.state.MOVED_LOCATION}</Text>
          </View>
          {/* 바코드 스캔입력부분 제어 */}
          <Touchable
            style={styles.searchButton}
            underlayColor={'rgba(63,119,161,0.8)'}
            onPress={() => this.onBarcodePopup()}
          >
            <HIcon name="barcode" size={20} color="#fff" />
          </Touchable>
        </HBaseView>
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
    color: '#ffffff',
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
    justifyContent: 'center',
  },
  scanArea: {
    justifyContent: 'center', // borderColor: color,
    borderWidth: 1,
    margin: 5,
    borderColor: bluecolor.basicSkyLightBlueColor,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: bluecolor.basicSkyLightBlueColor,
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
