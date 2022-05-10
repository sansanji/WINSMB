/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Alert, Keyboard, Vibration, TouchableOpacity } from 'react-native';
import { _, React, Redux, Fetch, Navigation, NavigationScreen, Util, bluecolor, modelUtil, ReduxStore } from 'libs';
import {
  HBaseView,
  Touchable,
  HIcon,
  HRow,
  HFormView,
  HText,
  HTextfield,
  HCombobox,
  HListView,
  HDatefield,
  HTexttitle,
  HNumberfield,
  HButton,
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
    super(props, 'DMS200301');

    this.state = {
      data: [],
      status: null,
      taskStep: '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      // 클로즈 기능으로 신규추가
      TIME_HOUR_NAME: '00',
      TIME_MIN_NAME: '00',
      BT_TIME_HOUR_NAME: '00',
      BT_TIME_MIN_NAME: '00',
      scanVaildData: null,

      VENDOR_CODE: this.props.global.dmsVendorcode.VENDOR_CODE,
      BUYER_CODE: this.props.global.dmsVendorcode.BUYER_CODE,

      VENDOR_NAME: this.props.global.dmsVendorcode.VENDOR_NAME,
      BUYER_NAME: this.props.global.dmsVendorcode.BUYER_NAME,
      WH_CODE: this.props.global.dmsVendorcode.WH_CODE,
      COMPANY_CODE: this.props.global.session.COMPANY_CODE,
      GI_DATE: null,
      BT_GR_DATE: null,

      TAP_CODE: null,
    };


    // modelUtil.setModelData('DMS200301', config);


    modelUtil.setModelData('DMS200301', {
      data: [],
      status: null,
      taskStep: '1', // 1: 확정버튼 활성화, 2: 취소버튼 활성화
      // 클로즈 기능으로 신규추가
      TIME_HOUR_NAME: '00',
      TIME_MIN_NAME: '00',
      BT_TIME_HOUR_NAME: '00',
      BT_TIME_MIN_NAME: '00',
      TAP_CODE: 'PLT',

      VENDOR_CODE: this.props.global.dmsVendorcode.VENDOR_CODE,
      BUYER_CODE: this.props.global.dmsVendorcode.BUYER_CODE,

      VENDOR_NAME: this.props.global.dmsVendorcode.VENDOR_NAME,
      BUYER_NAME: this.props.global.dmsVendorcode.BUYER_NAME,
      WH_CODE: this.props.global.dmsVendorcode.WH_CODE,
      COMPANY_CODE: this.props.global.session.COMPANY_CODE,

      GI_DATE: Util.getDateValue(),
      BT_GR_DATE: Util.getDateValue(),

      BT_VENDOR_NAME: null,
      BT_VENDOR_CODE: null,
      BT_VENDOR_INFO: null,

    });
    Tts.setDefaultLanguage('ko');
    Tts.voices().then(voices => console.log('voices', voices));
  }


  componentWillMount() {
    // this.fetch(null);
    this._validCheckFunc('alert');
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);
  }

  // _validCheckFunc(alertType) {
  //   const validCheck = Util.dmsValidCheckFunc(alertType);
  // }

  shouldComponentUpdate() {
    return true;
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    Util.openLoader(this.screenId, false);
  }

  // 버튼 이벤트에 대한 조건 처리
  _eventBtnBranch(eventType) {
    const modelValue = modelUtil.getModelData('DMS200301');

    this.setState({
      TAP_CODE: 'PLT',
      GI_DATE: modelValue.GI_DATE,
      BT_GR_DATE: modelValue.BT_GR_DATE,
    });

    if (eventType === 'SAVE') {
      this.tts('Do you want to Save?');
      Util.msgBox({
        title: 'Save',
        msg: 'Do you want to Save?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._SAVE(),
          },
          {
            title: 'Back',
            onPress: item => {},
          },
        ],
      });
    }
  }

  async _SAVE() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const { componentId } = this.props;

    // this.setState((state, props) => ({
    //   TAP_CODE: 'PLT',
    // }));

    const result = await Fetch.request('DMS030310SVC', 'saveGI', {
      body: JSON.stringify({
        // DMS030310F2: this.state,
        DMS030310F2: modelUtil.getModelData('DMS200301'),
        DMS030310G4: {
          data: this.state.data,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Save Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
              Navigation(
                componentId,
                'screen.DMS100201',
                {

                },
                'GI List',
              );
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Save Alert',
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

  // 하단 버튼 컨트롤
  buttonControll(btnType) {
    const btn = {
      1: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._eventBtnBranch('SAVE')} title={'Save'} />
        </View>
      ),
    };
    return btn[btnType];
  }

  // 바코드 스캔 처리 로직
  async focusNextField(scanData) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const modelValue = modelUtil.getModelData('DMS200301');

    this.setState({
      TAP_CODE: 'PLT',
      GI_DATE: modelValue.GI_DATE,
      BT_GR_DATE: modelValue.BT_GR_DATE,
    });

    //  const data = modelUtil.getModelData('DMS200301');
    //  this.setState((state, props) => ({
    //    GI_DATE: '20210624', // this.props.model.data.DMS200301.GI_DATE,
    //    GR_DATE: '20210624', // this.props.model.data.DMS200301.GR_DATE,
    //  }));
    const dataLength = this.state.data.length;
    const barcode1Data = this.barcode1._lastNativeText;
    let g1ScanData = null;
    let targetG1ScanData = null;
    modelUtil.setValue('DMS200301.barcodeData1', barcode1Data);

    for (let i = 0; i < dataLength; i += 1) {
      g1ScanData = this.state.data[i].SCAN_NO.toUpperCase().trim();

      if (barcode1Data.toUpperCase().trim() === g1ScanData) {
        // 스캔 성공 하였지만, 중복 스캔 된 경우
        targetG1ScanData = this.state.data[i].SCAN_NO.trim();
        this.setState({
          scanVaildData: `"${targetG1ScanData}" already scanned!`,
        });

        this._setScanValidData('f');
        this._sound('f');
        Util.openLoader(this.screenId, false);
        return;
      }
    }

    this.setState({
      scanVaildData: `"${barcode1Data}" already scanned!`,
    });
    this._setScanValidData('a');
    this._sound('s');

    const result1 = await Fetch.request('DMS030320SVC', 'getStockCheck', {

      body: JSON.stringify({
        DMS030320F1: modelUtil.getModelData('DMS200301'),
      }),
    });

    if (result1) {
      // 정해진 데이터만 보여준다.
      if (result1.DMS030320G2[0]) {
        let totalData = '';
        totalData = this.state.data;
        totalData.push(result1.DMS030320G2[0]);

        this.setState(
          {
            data: totalData,
            status: {
              TYPE: result1.TYPE,
              MSG: result1.MSG,
            },
            barcodeData1: null,
          },
          scanData,
        );
        Util.openLoader(this.screenId, false);
      } else {
        this.setState({
          barcodeData1: null,
        // status: null, // fetch후 리턴받은 모든 값
        });
        Util.msgBox({
          title: 'Scan Check',
          msg: 'Invaild data! Check again!',
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });

        Util.openLoader(this.screenId, false);
      }
    } else {
      Util.msgBox({
        title: 'Scan Check',
        msg: 'Invaild data! Check again!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      this.setState({
        barcodeData1: null,
        // status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.dmsValidCheckFunc(alertType);
  }

  _onPress(item, barcode1Data) {
    const { navigator } = this.props;
    const checkData = modelUtil.getModelData('DMS100201');
    // if (grgiFlag === 'ITBOX') {
    const PLT_CHECK = checkData.PLT_CHECK;
    const BOX_CHECK = checkData.BOX_CHECK;
    const ITEM_CHECK = checkData.ITEM_CHECK;
    const GR_DT = checkData.GR_DT;
    Navigation(
      navigator,
      'screen.DMS100201',
      {
        onSaveComplete: callback => this._clear(`${item.GR_NO} Success!`, callback),
        params: item,
        barcode: barcode1Data,
        PLT_CHECK,
        BOX_CHECK,
        ITEM_CHECK,
        GR_DT,
      },
      'move',
    );
  }

  _keyboardDismiss() {
    Keyboard.dismiss();
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
    this.focusNextField(result);
  }

  _onDelete(SCAN_NO) {
    const listData = this.state.data;
    const idx = listData.findIndex((item) => item.SCAN_NO === SCAN_NO);
    listData.pop(idx);
    this.setState({
      data: listData,
    });
    // const checkData = modelUtil.getModelData('DMS100301');
  }

  // 시간 설정
  setTimeValue(param) {
    if (!Util.isEmpty(param)) {
      this._onPressHour(
        {
          label: 'Hour',
          groupCode: 'SP8942',
          codeField: 'DT_CODE',
          nameField: 'LOC_VALUE',
          value: this.state.TIME_HOUR_NAME,
          sql: { DT_CODE: '' },
        },

      );
    } else {
      this._onPressHour(
        {
          label: 'Min',
          groupCode: 'TIME_MIN',
          value: this.state.TIME_MIN_NAME,
        },
      );
    }
  }


  // open combobox
  _onPressHour(param) {
    Util.openComboBox({
      label: param.lable,
      groupCode: param.groupCode,
      groupJson: param.groupJson,
      sql: param.sql,
      codeField: param.codeField || 'DT_CODE', // 기본적으로 DT_CODE
      nameField: param.nameField || 'LOC_VALUE', // 기본적으로 LOC_VALUE
      selected: param.selected,
      onChange: (value, comboValues) => {
        if (param.label === 'Hour') {
          this.setState({
            TIME_HOUR_NAME: value.name,
          });
          modelUtil.setValue('DMS200301.TIME_HOUR_NAME', value.name);
        } else {
          this.setState({
            TIME_MIN_NAME: value.name,
          });
        }
        modelUtil.setValue('DMS200301.TIME_MIN_NAME', value.name);
        // 값이 변할때 이벤트 발생
        if (this.props.onChanged) {
          this.props.onChanged(value, comboValues);
        }
      },
    });
  }

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

        onChange: (value, comboValues) => {
          modelUtil.setValue('DMS200301.VENDOR_NAME', comboValues.DISP_VENDOR_NAME);
          modelUtil.setValue('DMS200301.VENDOR_CODE', value.code);
          modelUtil.setValue('DMS200301.VENDOR_INFO', comboValues);
          // 값이 변할때 이벤트 발생
          // if (this.props.onChanged) {
          //   this.props.onChanged(value, comboValues);
          // }
        },


      });
    }
  }

  async onViewVendorBT() {
    const whCode = modelUtil.getValue('DMS200301.BT_WH_CODE');
    // const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
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
          BT_DISP_VENDOR_NAME: `${item.VENDOR_NAME}\n(${item.BUYER_NAME})`,
        });
      });

      Util.openComboBox({
        label: 'BT Vendor Code',
        groupJson: vendorList,
        codeField: 'VENDOR_CODE',
        nameField: 'BT_DISP_VENDOR_NAME',


        onChange: (value, comboValues) => {
          modelUtil.setValue('DMS200301.BT_VENDOR_NAME', comboValues.BT_DISP_VENDOR_NAME);
          modelUtil.setValue('DMS200301.BT_VENDOR_CODE', value.code);
          modelUtil.setValue('DMS200301.BT_VENDOR_INFO', comboValues);
          // 값이 변할때 이벤트 발생
          // if (this.props.onChanged) {
          //   this.props.onChanged(value, comboValues);
          // }
        },

        // onChange: (value, comboValue) => {
        //   ReduxStore.dispatch({
        //     type: 'global.dmsStockVendorcodeBT.set',
        //     dmsStockVendorcodeBT: comboValue,
        //   });
        // },
      });
    }
  }


  // 시간 설정
  setTimeValue2(param) {
    if (!Util.isEmpty(param)) {
      this._onPressHour2(
        {
          label: 'Hour',
          groupCode: 'SP8942',
          codeField: 'DT_CODE',
          nameField: 'LOC_VALUE',
          value: this.state.BT_TIME_HOUR_NAME,
          sql: { DT_CODE: '' },
        },

      );
    } else {
      this._onPressHour2(
        {
          label: 'Min',
          groupCode: 'TIME_MIN',
          value: this.state.BT_TIME_MIN_NAME,
        },
      );
    }
  }


  // open combobox
  _onPressHour2(param) {
    Util.openComboBox({
      label: param.lable,
      groupCode: param.groupCode,
      groupJson: param.groupJson,
      sql: param.sql,
      codeField: param.codeField || 'DT_CODE', // 기본적으로 DT_CODE
      nameField: param.nameField || 'LOC_VALUE', // 기본적으로 LOC_VALUE
      selected: param.selected,
      onChange: (value, comboValues) => {
        if (param.label === 'Hour') {
          this.setState({
            BT_TIME_HOUR_NAME: value.name,
          });
          modelUtil.setValue('DMS200301.BT_TIME_HOUR_NAME', value.name);
        } else {
          this.setState({
            BT_TIME_MIN_NAME: value.name,
          });
        }
        modelUtil.setValue('DMS200301.BT_TIME_MIN_NAME', value.name);
        // 값이 변할때 이벤트 발생
        if (this.props.onChanged) {
          this.props.onChanged(value, comboValues);
        }
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
          autoFocus={this.state.GI_STATUS !== 'F'}
          // autoFocus
          blurOnSubmit={false}
          keyboardType="email-address"
          onSubmitEditing={() => {
            this.focusNextField();
          }}
        />
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
        <HRow>
          <HText
            value={item.SCAN_NO}
            textStyle={{
              color: bluecolor.basicBlueImpactColor,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          />
          <HButton
            onPress={() => this._onDelete(item.SCAN_NO)}
            name={'link'}
            title={'Delete'}
          />
        </HRow>
        <HRow>
          <HNumberfield label={'Item'} value={item.ITEM_QTY} />
          <HNumberfield label={'C/T'} value={item.BOX_QTY} />
          <HNumberfield label={'Plt'} value={item.PLT_QTY} />
          <HNumberfield label={'W/t:'} value={item.GW} />
        </HRow>
        <HRow between>
          <HText value={`${item.DOC_NO} / ${item.LOCATION}`} />
        </HRow>
      </HFormView>
    </View>
  );

  render() {
    const USER_ID = this.props.global.session.USER_ID;
    const COMPANY_CODE = this.props.global.session.COMPANY_CODE;
    const vendor = modelUtil.getValue('DMS200301.VENDOR_NAME');
    const btVendor = modelUtil.getValue('DMS200301.BT_VENDOR_NAME');

    return (
      <HBaseView style={styles.container}>
        <HFormView>
          <Touchable onPress={() => this.onViewVendor()}>
            <View>
              <HText textStyle={{ fontSize: 9, color: bluecolor.basicBlueImpactColor }}>Vendor▼</HText>
            </View>
            <HText textStyle={{ fontSize: 10 }} >{vendor}</HText>
          </Touchable>
          <HRow>
            <HDatefield label={'GI Date'} bind={'DMS200301.GI_DATE'} editable rowflex={1.5} />
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity
                style={styles.timeStyle}
                onPress={() => this.setTimeValue('hour')}
              >
                <HText value={this.state.TIME_HOUR_NAME} bind={'DMS200301.TIME_HOUR_NAME'} textStyle={styles.onVoteTimeStyle} />
              </TouchableOpacity>
              <HText value={'시'} textStyle={styles.onVoteTimeStyle} />
              <HText value={':'} textStyle={styles.onVoteTimeStyle} />
              <TouchableOpacity
                style={styles.timeStyle}
                onPress={() => this.setTimeValue()}
                // style={{ marginStart: 'auto' }}
              >
                <HText value={this.state.TIME_MIN_NAME} bind={'DMS200301.TIME_MIN_NAME'} textStyle={styles.onVoteTimeStyle} />
              </TouchableOpacity>
              <HText value={'분'} textStyle={styles.onVoteTimeStyle} />
              <HIcon
                name="clock-o"
                style={styles.onVoteTimeClockIconStyle}
              />
            </View>
          </HRow>
          <HRow>
            <HTextfield
              label={'Mgt No.'}
              keyboardType="email-address"
              bind={'DMS200301.MGT_NO'}
              editable
            />
            <HTextfield
              label={'Ref Doc No'}
              keyboardType="email-address"
              bind={'DMS200301.REF_DOC_NO'}
              editable
            />
          </HRow>
          <HRow>
            <HCombobox
              label={'Work Type'}
              groupCode={'DMS_WORK_TYPE'}
              bindVar={{
                CD: 'DMS200301.WORK_TYPE',
                NM: 'DMS200301.WORK_TYPE_NAME',
              }}
              editable
            />
            <HTextfield
              label={'BL No'}
              keyboardType="email-address"
              bind={'DMS200301.BL_NO'}
              editable
            />
          </HRow>


          <HTextfield
            label={'Remarks'}
            keyboardType="email-address"
            bind={'DMS200301.REMARKS'}
            editable
            clospan="2"
          />

          <HTexttitle>Branch Transfer</HTexttitle>

          <HCombobox
            label={'W/H Code'}
            groupCode={'SP9892'}
            codeField={'BT_WH_CODE'}
            nameField={'BT_WH_NAME'}
            bindVar={{
              CD: 'DMS200301.BT_WH_CODE',
              NM: 'DMS200301.BT_WH_NAME',
            }}
            sql={{ COMPANY_CODE, USER_ID }}
            editable
          />

          <Touchable onPress={() => this.onViewVendorBT()}>
            <View>
              <HText textStyle={{ fontSize: 9, color: bluecolor.basicBlueImpactColor }}>Vendor▼</HText>
            </View>
            <HText textStyle={{ fontSize: 10 }} >{btVendor}</HText>
          </Touchable>
          <HRow>
            <HDatefield label={'GR Date'} bind={'DMS200301.BT_GR_DATE'} editable rowflex={1.5} />
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity
                style={styles.timeStyle}
                onPress={() => this.setTimeValue2('hour')}
              >
                <HText value={this.state.BT_TIME_HOUR_NAME} bind={'DMS200301.BT_TIME_HOUR_NAME'} textStyle={styles.onVoteTimeStyle} />
              </TouchableOpacity>
              <HText value={'시'} textStyle={styles.onVoteTimeStyle} />
              <HText value={':'} textStyle={styles.onVoteTimeStyle} />
              <TouchableOpacity
                style={styles.timeStyle}
                onPress={() => this.setTimeValue2()}
                // style={{ marginStart: 'auto' }}
              >
                <HText value={this.state.BT_TIME_MIN_NAME} bind={'DMS200301.BT_TIME_MIN_NAME'} textStyle={styles.onVoteTimeStyle} />
              </TouchableOpacity>
              <HText value={'분'} textStyle={styles.onVoteTimeStyle} />
              <HIcon
                name="clock-o"
                style={styles.onVoteTimeClockIconStyle}
              />
            </View>
          </HRow>
          <HTexttitle>GI Plt. Info</HTexttitle>
        </HFormView>
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
            autoFocus={this.state.GI_STATUS !== 'F'}
            // autoFocus
            blurOnSubmit={false}
            keyboardType="email-address"
            bind={'DMS200301.BARCODE'}
            onSubmitEditing={() => {
              this.focusNextField();
            }}
          />
          <View style={styles.buttonStyle}>
            <HButton onPress={() => this._clear()} name={'refresh'} />
          </View>
        </View>
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

        <View style={styles.buttonContainer}>{this.buttonControll(1)}</View>
        {/* 바코드 스캔입력부분 제어 */}
        {
          <Touchable
            style={styles.searchButton}
            underlayColor={'rgba(63,119,161,0.8)'}
            onPress={() => this.onBarcodePopup()}
          >
            <HIcon name="barcode" size={20} color="#fff" />
          </Touchable>
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
    bottom: 250,
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
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
  * Wrapping with root component
  */
export default Redux.connect(mapStateToProps)(Component);
