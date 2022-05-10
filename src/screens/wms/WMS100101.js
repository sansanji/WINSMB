/* *
 * Import Common
 * */
import { View, Text, TextInput, StyleSheet, Keyboard, Vibration } from 'react-native';
import { _, React, Util, Redux, Fetch, Navigation, NavigationScreen, ReduxStore } from 'libs';
import { HBaseView, Touchable, HButton, HIcon } from 'ux';

/**
 * Barcode Scan 화면
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100101');
    this.state = {
      spinner: false,
      DATE_FROM: null,
      DATE_TO: null,
      GRGI_FLAG: 'GI',
      keyword: null,
      scanVaildData: 'Ready',
    };
  }

  componentWillMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 whcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  shouldComponentUpdate() {
    return true;
  }

  // 창고코드 및 벤더 정보 유무 체크
  _validCheckFunc(alertType) {
    const validCheck = Util.wmsValidCheckFunc(alertType);

    // if (validCheck) {
    //   this.fetch('', null);
    // }
  }

  _onPress(item, grgiFlag) {
    const { navigator } = this.props;

    if (grgiFlag === 'GR') {
      Navigation(
        navigator,
        'screen.WMS100304',
        {
          onSaveComplete: callback => this._clear(`${item.GR_NO} Success!`, callback),
          params: item,
        },
        'GR Dt List',
      );
    } else {
      Navigation(
        navigator,
        'screen.WMS100204',
        {
          onSaveComplete: callback => this._clear(`${item.GI_NO} Success!`, callback),
          params: item,
        },
        'GI Dt List',
      );
    }
  }

  _onSearch() {
    this._validCheckFunc('alert');
    // this.fetch('', null);
  }

  // 바코드 스캔 처리 로직
  async focusNextField(scanData) {
    // 바코드 스캔시 오류발생 원인이됨
    this.setState({ spinner: false });

    let barcode1Data = this.barcode1._lastNativeText;
    if (scanData) {
      barcode1Data = scanData;
    }

    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const date = '';
    let grgiFlag = '';

    Vibration.vibrate(500);
    this.barcode1.clear();

    if (!barcode1Data || barcode1Data.length !== 15) {
      this.setState({
        scanVaildData: 'Please, Input GR/GI No.',
      });
      this.failScan();
      return;
    }

    if (!(barcode1Data.indexOf('GR') > -1 || barcode1Data.indexOf('GI') > -1)) {
      this.setState({
        scanVaildData: 'Please, Input GR/GI No.',
      });
      this.failScan();
      return;
    }

    // date = barcode1Data.substr(2, 8);
    grgiFlag = barcode1Data.substr(0, 2);

    let reqService = 'WMS010205SVC';
    let reqKey = 'WMS010205F1';
    let resKey = 'WMS010205G1';
    let param = {
      WH_CODE: whCode,
      // GR_DATE_FROM: date,
      // GR_DATE_TO: date,
      GR_FLAG: 'Y',
      M_KEYWORD: barcode1Data,
      M_GR_STATUS: 'Y',
    };

    if (grgiFlag === 'GI') {
      param = {
        WH_CODE: whCode,
        // GI_DATE_FROM: date,
        // GI_DATE_TO: date,
        GI_FLAG: 'Y',
        M_KEYWORD: barcode1Data,
        M_GI_STATUS: 'Y',
      };
      reqService = 'WMS010209SVC';
      reqKey = 'WMS010209F1';
      resKey = 'WMS010209G1';
    }

    const result = await Fetch.request(reqService, 'get', {
      body: JSON.stringify({
        [reqKey]: param,
      }),
    });

    if (result) {
      if (result.TYPE === 1) {
        // 스캔 성공한 경우
        this.setState({
          scanVaildData: 'Find out!',
          data: result[resKey][0],
          spinner: false,
        });
        ReduxStore.dispatch({
          type: 'global.vendorcode.set',
          vendorcode: this.state.data,
        });

        this._onPress(this.state.data, grgiFlag);
        this._clear('Ready');
        this.successScan();
      } else {
        this._clear(result.MSG);
        this.failScan();
      }
    } else {
      // 스캔 실패한 경우
      this._clear('Can not find data \n Please contact manager.');
      this.failScan();
    }
  }

  _keyboardDismiss() {
    Keyboard.dismiss();
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

  successScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanSucess });
    Util.playSound('successSound');
    this.setState({ spinner: false });
  }

  failScan() {
    this.scanVaildData.setNativeProps({ style: styles.textVaildScanFailure });
    Util.playSound('failSound');
    this.setState({ spinner: false });
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

  render() {
    return (
      <HBaseView style={styles.container} scrollable={false}>
        <View style={styles.searchContainer}>
          <Text
            style={styles.textVaildScan}
            ref={c => {
              this.scanVaildData = c;
            }}
          >
            {this.state.scanVaildData}
          </Text>
          <TextInput
            style={styles.barcodeInput}
            ref={c => {
              this.barcode1 = c;
            }}
            placeholder="Scan Barcode"
            value={this.state.keyword}
            autoFocus
            // autoFocus
            blurOnSubmit={false}
            keyboardType="email-address"
            onSubmitEditing={() => {
              this.focusNextField();
            }}
          />
          <View style={styles.spaceAroundStyle}>
            <HButton onPress={() => this._clear()} name={'refresh'} title={'Refresh'} />
          </View>
        </View>
        <Touchable
          style={styles.searchButton}
          underlayColor={'rgba(63,119,161,0.8)'}
          onPress={() => this.onBarcodePopup()}
        >
          <HIcon name="barcode" size={20} color="#fff" />
        </Touchable>
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
  },
  searchContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 200,
  },
  spaceAroundStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingRight: 3,
    paddingLeft: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#428BCA',
    fontSize: 16,
    paddingTop: 20,
    paddingRight: 5,
  },
  barcodeInput: {
    height: 40,
    flex: 1,
    fontSize: 36,
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  buttonStyle: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#428BCA',
    borderRadius: 10,
    marginTop: 10,
    marginRight: 5,
  },
  textVaildScan: {
    color: '#3333ce',
    fontSize: 18,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
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
