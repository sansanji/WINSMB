/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import {
  _,
  React,
  Util,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  bluecolor,
  modelUtil,
} from 'libs';
import {
  HBaseView,
  Touchable,
  HButton,
  HIcon,
  HTexttitle,
  HListView,
  HNumberfield,
  HTextfield,
  HRow,
  HText,
  HFormView,
  HCheckbox } from 'ux';

/**
 * 위치이동
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200202');
    this.state = {
      // getStockInfo 부분 변수 시작
      VENDOR_NAME: null,
      GR_NO: null,
      DOC_NO: null,
      LOCATION: null,
      STOCK_DAYS: null,
      SCAN_NO: null,
      TYPE: null,
      MOVED_LOCATION: null,
      spinner: false,
      infoData: null,
      // info부분 변수 끝
      REF_NO: null,
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
      scanVaildData: null,
      barcodeStatus: null,
      data: this.props.params,
      dataTotal: this.props.params,
      barcodeScanIndex: null,
      BOX_CHECK: this.props.BOX_CHECK,
      ITEM_CHECK: this.props.ITEM_CHECK,
      PLT_CHECK: this.props.PLT_CHECK,
      GR_DT: this.props.GR_DT,
      barcode: this.props.barcode,
      successCnt: 0,
      taskStep: this.props.params.GR_STATUS === 'F' ? '2' : '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      totalDataLenght: this.props.params.length,
      locationTarget: 'N',
      remarkTarget: 'N',
      barSeq: 0,
    };

    modelUtil.setModelData('DMS200202', {
      fixLoc: 'N',
      fixRemark: 'N',
      checkAll: 'N',
      setScanCnt: 1,
      CHANGE_TYPE: 'DOC_NO', // LOCATION/REMARKS
    });
  }

  componentWillMount() {
    this.barcode = [];
    // mina
    // this.getStockInfo(this.props.barcode);
    // this._validCheckFunc(null); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  componentDidMount() {
    const { SCAN_NO } = this.props;
    if (SCAN_NO) {
      this.focusNextField(SCAN_NO);
    }
  }

  // 관련된 파레트 정보를 보여준다
  async getStockInfo(barcode1Data) {
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const result2 = await Fetch.request('DMS030511SVC', 'getStockMapping', {
      body: JSON.stringify({
        DMS030511F1: {
          WH_CODE: whCode,
          SCAN_NO: barcode1Data,
          EXIST_YN: 'Y',
          GRGI_DAY: 'GR',
          GR_FLAG: 'N',
          LOC_YN: 'N',
        },
      }),
    });

    if (result2) {
      if (result2.DMS030511G6[0]) {
        // 스캔 성공한 경우
        this.setState({
          VENDOR_NAME: result2.DMS030511G6[0].VENDOR_NAME,
          GR_NO: result2.DMS030511G6[0].GR_NO,
          DOC_NO: result2.DMS030511G6[0].DOC_NO,
          LOCATION: result2.DMS030511G6[0].LOCATION,
          STOCK_DAYS: result2.DMS030511G6[0].STOCK_DAYS,
          SCAN_NO: barcode1Data,
          TYPE: result2.DMS030511G6[0].TYPE,
          MOVED_LOCATION: null,
          spinner: false,
          infoData: result2.DMS030511G6,
          REF_NO: result2.DMS030511G6[0].REF_NO,
        });
        this.successScan();
      } else {
        // 스캔 실패한 경우
        this.deleteAll('This item is not exist now. \n Please contact manager.');
        this.failScan();
      }
    } else {
      // 데이터가 없는 경우
      this.deleteAll('This item is not exist now. \n Please contact manager.');
      this.failScan();
    }
  }

  // DOC_NO, LOCATION, REMARK 정보 입력값으로 update
  async _saveLocation(checkNumber) {
    const { config } = this.props.global;
    const blockDup = this.props.global.config.DMS_BLOCK_DUP || '';
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const changeType = modelUtil.getValue('DMS200202.CHANGE_TYPE');
    const tabCode = 'MOBILE';
    // let tabCode = '';

    // if (this.state.data[0].TYPE === 'DT') {
    //   tabCode = 'DT';
    // } else if (this.state.data[0].TYPE === 'PLT') {
    //   tabCode = 'PLT';
    // } else if (this.state.data[0].TYPE === 'BOX') {
    //   tabCode = 'BOX';
    // } else if (this.state.data[0].TYPE === 'ITM') {
    //   tabCode = 'ITEM';
    // }

    if (checkNumber === 1) {
      Util.openLoader(this.screenId, true); // Loader View 열기!
    }

    const result = await Fetch.request('DMS030510SVC', 'saveLoc', {
      body: JSON.stringify({
        DMS030510F1: {
          WH_CODE: whCode,
          TAB_CODE: tabCode,
          CHANGE_TYPE: changeType,
          DMS_BLOCK_DUP: blockDup,
        },
        DMS030510G1: {
          data: this.state.data,
        },
      }),
    });

    if (checkNumber === 1) {
      Util.openLoader(this.screenId, false);
    }

    if (result.TYPE === 1) {
      this.fetch(this.state.barcode);
      Navigation(this.props.componentId, 'POP');
      Util.toastMsg('save completed');
      // this._CONFIRM(); // 로케이션 정보 저장 후 확정 일괄 처리
    } else {
      Util.msgBox({
        title: 'Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }


  // 조회
  async fetch(barcode1Data) {
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const COMPANY_CODE = this.props.global.session.COMPANY_CODE;

    if (Util.isEmpty(barcode1Data)) {
      this.setState({
        scanVaildData: 'Please, Input Box/Item No.',
      });
      this.failScan();
      return;
    }

    const result = await Fetch.request('DMS030050SVC', 'getScan', {
      body: JSON.stringify({
        DMS030050F1: {
          COMPANY_CODE,
          SCAN_NO: barcode1Data,
          WH_CODE: whCode,
          GR_FLAG: 'Y',
          BOX_CHECK: this.state.BOX_CHECK,
          ITEM_CHECK: this.state.ITEM_CHECK,
          PLT_CHECK: this.state.PLT_CHECK,
          GR_DT: this.state.GR_DT,
        },
      }),
    });


    if (result.TYPE === 1) {
      this.setState({
        scanVaildData: 'SAVE COMPLETED!',
        data: result.DMS030050G2,
      });
    } else {
      this.setState({
        scanVaildData: 'SAVE FAIL',
        data: result.DMS030050G2,
      });
    }
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.validCheckFunc(alertType);

    if (validCheck) {
      this.fetch('', null);
    }
  }

  // 포커스 이동
  _focusNextField(scanData) {
    let barSeq = this.state.barSeq;
    let barcodeData = this.barcode[barSeq]._lastNativeText;
    let barcodeData1 = this.state.barcodeData1;
    let barcodeData2 = this.state.barcodeData2;
    let barcodeData3 = this.state.barcodeData3;

    if (scanData) {
      barcodeData = scanData;
    }
    if (!barcodeData) {
      this.deleteAll('Please, Input the barcode data!');
      this.failScan();
      return;
    }

    // 스캔된 바코드를 화면에 입력해 주는 부분
    if (barSeq === 0) {
      barcodeData1 = barcodeData;
    } else if (barSeq === 1) {
      barcodeData2 = barcodeData;
    } else if (barSeq === 2) {
      barcodeData3 = barcodeData;
    }

    this.setState({
      barcodeData1,
      barcodeData2,
      barcodeData3,
    });

    // ********** focus 이동 부분 시작 ****************
    // 1차:  target 부분으로 toggle 값  Y,N 여부 확인 후 Y일 경우 포커스 이동 , 2차: 스캔된 바코드 정보 넘겨줌
    if (this.state.locationTarget === 'Y' && this.state.remarkTarget === 'N') {
      // doc 입력 후 loc 스캔하는 경우
      if (Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData2)) {
        barSeq += 1;
      } else {
        this.scanBarcode(barcodeData1, barcodeData2, barcodeData3);
        return;
      }
    } else if (this.state.locationTarget === 'Y' && this.state.remarkTarget === 'Y') {
      // doc 입력 후 loc - remark 스캔하는 경우
      if (Util.isEmpty(this.state.barcodeData2) && Util.isEmpty(barcodeData2)) {
        barSeq += 1;
      } else if (Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData3)) {
        barSeq += 1;
      } else {
        this.scanBarcode(barcodeData1, barcodeData2, barcodeData3);
        return;
      }
    } else if (this.state.locationTarget === 'N' && this.state.remarkTarget === 'Y') {
      // doc 입력 후 remark 스캔하는 경우
      if (Util.isEmpty(this.state.barcodeData3) && Util.isEmpty(barcodeData3)) {
        barSeq += 2;
      } else {
        this.scanBarcode(barcodeData1, barcodeData2, barcodeData3);
        return;
      }
    } else {
      // doc 만 스캔하는 경우
      this.scanBarcode(barcodeData1, barcodeData2, barcodeData3);
      return;
    }

    this.barcode[barSeq].clear();
    this.barcode[barSeq].focus();

    this.setState({
      barSeq,
    });
    // ********** focus 이동 부분 끝 ****************
  }


  // 바코드 스캔 처리 로직
  async scanBarcode(barcodeData1, barcodeData2, barcodeData3) {
    const autoConfirmYN = this.props.global.config.DMS_AUTO_CONFIRM_YN;
    const dataLenght = this.state.dataTotal.length;
    const dataList = this.state.data;
    let currentIndex = null;
    let scanCnt = Number(this.state.successCnt);
    const fixLoc = modelUtil.getValue('DMS200202.fixLoc');
    const fixRemark = modelUtil.getValue('DMS200202.fixRemark');

    let setCnt = modelUtil.getValue('DMS200202.setScanCnt'); // 사용자가 설정한 한번에 스캔하고자하는 값
    let cnt = 0; // 사용자가 설정한 값 만큼 for문을 돌기위해 counting 해줌

    // 숫자로 변경
    setCnt = parseInt(setCnt, 10);

    // 사용자 입력 값이 list row 수보다 많을 때, 알람 메세지
    if (setCnt > dataLenght || Util.isEmpty(setCnt) || setCnt <= 0) {
      Util.msgBox({
        title: 'Alert',
        msg: 'You can only scan values within the total number of items in the list at one time..',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    // 스캔한 DOC 각 데이터 LIST에 넣어줌
    // default 값으로 1개의 DOC NO가 스캔
    for (let i = 0; i < dataLenght; i += 1) {
      if (Util.isEmpty(dataList[i].completed) || dataList[i].completed === 'N') {
        currentIndex = i;
        dataList[i].DOC_NO = barcodeData1;
        dataList[i].LOCATION = barcodeData2;
        dataList[i].REMARKS = barcodeData3;
        dataList[currentIndex].completed = 'Y';
        // total count를 세주는 변수로 전체 스캔됬을때, auto confirm을 위한 변수
        scanCnt += 1;
        // 사용자가 세팅한 개수를 세주기 위한 변수
        cnt += 1;

        // 스캔 성공했을 때,
        this.setState({
          scanVaildData: `  "${setCnt} scan success.`,
          barcodeScanData: barcodeData1,
          barcodeScanIndex: currentIndex,
          data: dataList,
          successCnt: scanCnt,
        });
        this._setScanValidData('s');

        // auto confirm이 N일떄, 스캔이 다 됬으면 auto confirm 됨.
        if (autoConfirmYN === 'Y') {
          if (dataLenght === scanCnt) {
            // this._CONFIRM();
            this._saveLocation(1);
            console.log('오토컨펌');
          }
        }

        this._onClearBarcode('barcode1');

        if (barcodeData2 && fixLoc === 'N') {
          this._onClearBarcode('barcode2');
        }
        if (barcodeData3 && fixRemark === 'N') {
          this._onClearBarcode('barcode3');
        }

        this.setState({
          barSeq: 0,
        });

        // 사용자가 한번에 스캔하려는 값 세팅 할 경우.
        if (cnt === setCnt) {
          this.barcode[0].focus();
          return;
        }
      }

      if (dataList[i].completed === 'Y') {
        this.setState({
          scanVaildData: '  "scan failed.',
          barcodeScanData: barcodeData1,
          barcodeScanIndex: currentIndex,
          data: dataList,
          successCnt: scanCnt,
        });
        this._setScanValidData('f');
      }
    }

    this.barcode[0].focus();
  }

  failScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
    this.setState({ spinner: false });
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
    } else {
      this.barcode[2].clear();
      this.setState({
        barcodeData3: null,
      });
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
      scanVaildData: null,
      barcodeStatus: null,
      // data: null,
    });
    Keyboard.dismiss();
  }

  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
    this.barcode[0].focus();
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


  // 선택 리스트 전체 카운팅
  _onCheckPress(item, index) {
    const data = this.state.data;
    const completed = item.completed;
    let scanCnt = 0;
    let scanVaildData = null;

    // if (!Util.isEmpty(completed)) {
    if (completed === 'Y') {
      data.forEach(x => {
        if (x === item) {
          x.completed = 'N';
          x.DOC_NO = '';
        }
      });
      scanCnt = this.state.successCnt - 1;
      scanVaildData = '1 cancle success';
      Util.toastMsg('1 cancle success');
    } else {
      data.forEach(x => {
        if (x === item) {
          x.DOC_NO = '';
          x.completed = 'Y';
        }
      });
      scanCnt = this.state.successCnt + 1;
      scanVaildData = '1 save success';
      Util.toastMsg('1 save success');
    }
    // }

    this.setState({
      scanVaildData,
      data,
      successCnt: scanCnt,
    });
  }

  // Y일때, 스캔할 C/T를 총 data row수와 맞춰줌
  setUpdateAll() {
    const checkAll = modelUtil.getValue('DMS200202.checkAll');

    const dataLength = this.state.data.length;

    if (checkAll === 'Y') {
      modelUtil.setValue('DMS200202.setScanCnt', dataLength);
    }

    if (checkAll === 'N') {
      modelUtil.setValue('DMS200202.setScanCnt', 1);
    }
  }

  _locationChecked() {
    this.setState({ locationTarget: this.state.locationTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }

  _remarkChecked() {
    this.setState({ remarkTarget: this.state.remarkTarget === 'Y' ? 'N' : 'Y' });
    this._resetState();
  }

  // 해당 화면의 데이터 초기화
  _resetState() {
    this.setState({
      barcodeData1: null,
      barcodeData2: null,
      barcodeData3: null,
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
    // this.fetch(null);
    this.barcode[0].focus();
  }


  renderBody = (item, index) => (
    <View key={item.GR_NO + item.SCAN_NO} >
      <HFormView
        style={[
          { marginTop: 2 },
          item.completed === 'Y'
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
            value={item.SCAN_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <View style={styles.barcodeStyle}>
            <View>
              <HButton
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
          <HNumberfield label={'ITEM'} value={item.ITEM_QTY} />
          <HNumberfield label={'C/T'} value={item.BOX_QTY} editable />
          <HNumberfield label={'Plt'} value={item.PLT_QTY} />
          <HNumberfield label={'W/t:'} value={item.GW} />
        </HRow>
        <HRow between>
          <HText value={`${item.DOC_NO === undefined ? '' : item.DOC_NO}/ ${item.LOCATION === undefined ? '' : item.LOCATION} / ${item.REMARKS === undefined ? '' : item.REMARKS}`} />
        </HRow>
      </HFormView>
    </View>
  );

  render() {
    return (
      <View style={{ flex: 1 }}>
        <HRow>
          <View style={styles.checkBox}>
            <HCheckbox
              onChanged={() => this.setUpdateAll()}
              label={'All'}
              bind={'DMS200202.checkAll'}
              editable
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <HTextfield label={'C/T'} bind={'DMS200202.setScanCnt'} editable />
          </View>

          <HCheckbox
            label={'Loc'}
            value={this.state.locationTarget}
            onChanged={() => this._locationChecked()}
            editable
            toggle
          />
          <HCheckbox label={'Loc fix'} bind={'DMS200202.fixLoc'} editable={this.state.locationTarget === 'Y'} />
          <HCheckbox
            label={'remark'}
            value={this.state.remarkTarget}
            onChanged={() => this._remarkChecked()}
            editable
            toggle
          />
          <HCheckbox label={'remark fix'} bind={'DMS200202.fixRemark'} editable={this.state.remarkTarget === 'Y'} />

        </HRow>
        <View style={styles.spaceAroundStyle}>
          <TextInput
            rowflex={3}
            style={(styles.barcodeInput, { flex: 1 })}
            ref={c => {
              this.barcode[0] = c;
            }}
            placeholder="Doc No."
            onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
            value={this.state.barcodeData1}
            autoFocus={this.state.GI_STATUS !== 'F'}
            keyboardType="email-address" // autoFocus
            blurOnSubmit={false}
            onSubmitEditing={() => {
              this._focusNextField();
            }}
          />
          {this.state.locationTarget === 'Y' ?
            <TextInput
              rowflex={3}
              style={(styles.barcodeInput, { flex: 1 })}
              ref={c => {
                this.barcode[1] = c;
              }}
              placeholder="Loc No."
              onChangeText={barcodeData2 => this.setState({ barcodeData2 })}
              value={this.state.barcodeData2}
              // autoFocus={this.state.GI_STATUS !== 'F'}
              keyboardType="email-address" // autoFocus
              blurOnSubmit={false}
              onSubmitEditing={() => {
                this._focusNextField();
              }}
            /> : null
          }
          {this.state.remarkTarget === 'Y' ?
            <TextInput
              rowflex={3}
              style={(styles.barcodeInput, { flex: 1 })}
              ref={c => {
                this.barcode[2] = c;
              }}
              placeholder="Remark."
              onChangeText={barcodeData3 => this.setState({ barcodeData3 })}
              value={this.state.barcodeData3}
              // autoFocus={this.state.GI_STATUS !== 'F'}
              keyboardType="email-address" // autoFocus
              blurOnSubmit={false}
              onSubmitEditing={() => {
                this._focusNextField();
              }}
            /> : null
          }

          <View style={styles.buttonStyle}>
            <HButton
              bStyle={{
                width: 50,
                margin: 5,
                padding: 2,
              }}
              onPress={() => this._keyboardDissmiss()}
              name={'refresh'}
            />
          </View>
        </View>


        <HBaseView style={styles.container} scrollable={false}>
          <View style={styles.spaceAroundStyle}>
            <Text
              style={styles.textVaildScan}
              ref={c => {
                this.scanVaildData = c;
              }}
            >
              {this.state.scanVaildData}
            </Text>
            <HText
              style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}
              textStyle={[
                this.state.successCnt !== this.state.totalDataLenght
                  ? { color: bluecolor.basicRedColor, fontWeight: 'bold', fontSize: 20 }
                  : { color: bluecolor.basicGreenColor, fontWeight: 'bold', fontSize: 20 },
              ]}
            >
              {this.state.successCnt} / {this.state.totalDataLenght}
            </HText>
          </View>
          <HTexttitle>From</HTexttitle>
          <View style={styles.scanArea}>
            <Text style={styles.textTopStyle}>{this.state.GR_NO}</Text>
            <Text style={styles.textTopStyle}>{this.state.VENDOR_NAME}</Text>
            <Text style={styles.textTopStyle}>{this.state.REF_NO}</Text>
            <Text style={styles.textTopStyle}>{this.state.LOCATION}</Text>
            <Text style={styles.textTopStyle}>
              {this.state.STOCK_DAYS ? `${this.state.STOCK_DAYS} Days` : null}
            </Text>
          </View>
          <HListView
            keyExtractor={item => item.GR_NO + item.SCAN_NO}
            renderItem={({ item, index }) => this.renderBody(item, index)}
            onSearch={() => this.fetch(this.state.barcode)}
            onMoreView={this.onMoreView}
            // 그려진값
            data={this.state.data}
            // 조회된값
            totalData={this.state.dataTotal}
            // 하단에 표시될 메세지값
            status={this.state.status}
          />
          <View>
            <HButton
              bStyle={{
                width: '100%',
                paddingLeft: 5,
                paddingRight: 5,
                justifyContent: 'center',
                alignContent: 'center',
                alignSelf: 'center',
              }}
              onPress={() => this._saveLocation(1)}
              title={'SAVE'}
            />
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
    // flexDirection: 'row',
    flex: 0.5,
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
    color: '#ffffff',
    fontSize: 15,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
  },
  textVaildScan: {
    color: '#000000',
    fontSize: 15,
    paddingLeft: 5,
    paddingRight: 5,
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
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    paddingRight: 1,
    paddingLeft: 1,
  },
  scanArea: {
    justifyContent: 'center', // borderColor: color,
    borderWidth: 1,
    margin: 5,
    borderColor: bluecolor.basicSkyLightBlueTrans,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: bluecolor.basicSkyLightBlueTrans,
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
  barcodeStyle: {
    flexDirection: 'row',
    // justifyContent: 'center',
    paddingRight: 3,
    paddingLeft: 3,
  },
  checkBox: {
    marginStart: 15,
    paddingLeft: 8,
  },
  // buttonContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  // },
  countStyle: {
    // height: 50,
    // width: 50,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 650,
    right: 120,
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
