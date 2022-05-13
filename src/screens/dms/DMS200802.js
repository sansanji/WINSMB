/* * DMS200802
 * Import Common
 * */
import { StyleSheet, Text, View, Keyboard, Vibration } from 'react-native';
import { _, React, Redux, Fetch, Navigation, NavigationScreen, Util, modelUtil, bluecolor } from 'libs';
import {
  HBaseView,
  HRow,
  HNumberfield,
  HTexttitle,
  HTextfield,
  HButton,
} from 'ux';
/* *
 * Import node_modules
 * */

/**
 * IOT 바코드 스캔 상세 정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200802');
    this.state = {
      data: this.props.params,
      scanVaildData: 'Ready',
    };
  }

  componentWillMount() {
    modelUtil.setModelData('DMS200802', {
      BL_NO: this.props.params.BL_NO,
      BOX_QTY: this.props.params.BOX_QTY,
      BUYER_NAME: this.props.params.BUYER_NAME,
      CBM: this.props.params.CBM,
      COMPANY_CODE: this.props.params.COMPANY_CODE,
      GRGI_DATE: this.props.params.GRGI_DATE,
      GRGI_NO: this.props.params.GRGI_NO,
      GRGI_TIME: this.props.params.GRGI_TIME,
      GW: this.props.params.GW,
      ITEM_QTY: this.props.params.ITEM_QTY,
      PLT_QTY: this.props.params.PLT_QTY,
      REF_DOC_NO: this.props.params.REF_DOC_NO,
      REF_NO: this.props.params.REF_NO,
      REMARKS: this.props.params.REMARKS,
      VENDOR_NAME: this.props.params.VENDOR_NAME,
      VW: this.props.params.VW,
      VENDOR_CODE: this.props.params.VENDOR_CODE,
      BUYER_CODE: this.props.params.BUYER_CODE,
      ARRIVAL_ADDR: this.props.params.ARRIVAL_ADDR,
      ARRIVAL_NAME: this.props.params.ARRIVAL_NAME,
      DEPART_ADDR: this.props.params.DEPART_ADDR,
      DEPART_NAME: this.props.params.DEPART_NAME,
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  // 바코드 스캔 처리 로직
  async focusNextField(scanData) {
    const { componentId } = this.props;
    const WH_CODE = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    Vibration.vibrate(500);

    if (!scanData || scanData.length !== 6) {
      this.setState({
        scanVaildData: 'Please, Input GPS BARCODE.',
      });
      this.failScan();
      return;
    }


    const DATA = modelUtil.getModelData('DMS200802');
    const result = await Fetch.request('DMS030310SVC', 'updateGPS', {
      body: JSON.stringify({
        DMS030310F1: {
          WH_CODE,
          GRGI_NO: DATA.GRGI_NO,
          GPS_ID : scanData,
          VENDOR_CODE : DATA.VENDOR_CODE,
          BUYER_CODE : DATA.BUYER_CODE,
        },
      }),
    });

    if (result.TYPE === 1) {
      // 스캔 성공한 경우
      this.setState({
        scanVaildData: 'Scan Sucess',
      });
      this.successScan();
      this.props.onSaveComplete('GPS BARCODE SCAN SUCESS');
      Navigation(componentId, 'POP');
    } else {
      this.setState({
        scanVaildData: 'Scan fail',
      });
      this.failScan();
    }
  }

  _keyboardDismiss() {
    Keyboard.dismiss();
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

  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
    // this.setState({ spinner: false });
  }

  failScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
    // this.setState({ spinner: false });
  }

  _clear(msg, callback) {
    this._keyboardDismiss();
    this.barcode1.clear();
    this.setState(
      {
        keyword: null,
        scanVaildData: msg,
      },
      callback,
    );
  }

  render() {
    return (
      <View style={{ flex: 1,
        justifyContent: 'space-around' }}
      >
        <View style={styles.scanArea}>
          <Text
            style={styles.textVaildScan}
            ref={c => {
              this.scanVaildData = c;
            }}
          >
            {this.state.scanVaildData}
          </Text>
        </View>

        <HBaseView>
          <HTexttitle>Buyer Information</HTexttitle>
          <HTextfield label={'BUYER NAME'} bind={'DMS200802.BUYER_NAME'} bold />
          <HRow>
            <HTextfield label={'REF NO.'} bind={'DMS200802.REF_NO'} />
            <HTextfield label={'BL No.'} bind={'DMS200802.BL_NO'} />
          </HRow>
          <HTexttitle>GR/GI Information</HTexttitle>
          <HRow>
            <HTextfield label={'GR/GI NO'} bind={'DMS200802.GRGI_NO'} bold />
            <HTextfield label={'REF DOC NO'} bind={'DMS200802.REF_DOC_NO'} />
          </HRow>
          <HRow>
            <HTextfield label={'GRGI DATE.'} bind={'DMS200802.GRGI_DATE'} />
            <HTextfield label={'GRGI TIME.'} bind={'DMS200802.GRGI_TIME'} />
          </HRow>
          <HTexttitle>Cargo detail</HTexttitle>
          <HRow>
            <HNumberfield label={'BOX QTY'} bind={'DMS200802.BOX_QTY'} />
            <HNumberfield label={'ITEM QTY'} bind={'DMS200802.ITEM_QTY'} />
            <HNumberfield label={'PLT QTY'} bind={'DMS200802.PLT_QTY'} />
          </HRow>
          <HRow>
            <HNumberfield label={'G/W'} bind={'DMS200802.GW'} />
            <HNumberfield label={'V/W'} bind={'DMS200802.VW'} />
            <HNumberfield label={'CBM'} bind={'DMS200802.CBM'} />
          </HRow>
          <HTexttitle>Depart/Arrival Information</HTexttitle>
          <HTextfield label={'Depart Name'} bind={'DMS200802.DEPART_NAME'} bold />
          <HTextfield label={'Depart Address'} bind={'DMS200802.DEPART_ADDR'} />
          <HTextfield label={'Arrival Name'} bind={'DMS200802.ARRIVAL_NAME'} bold />
          <HTextfield label={'Arrival Address'} bind={'DMS200802.ARRIVAL_ADDR'} />
        </HBaseView>
        <View style={{ marginBottom: 10 }}>
          <HButton onPress={() => this.onBarcodePopup()} name={'barcode'} title={'Barcode'} />
        </View>
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
  scanArea: {
    justifyContent: 'center', // borderColor: color,
    borderWidth: 1,
    margin: 8,
    borderColor: bluecolor.basicSkyLightBlueColor,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: bluecolor.basicSkyLightBlueColor,
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
