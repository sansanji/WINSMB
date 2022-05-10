/* *
 * Import Common
 * */
import { View, Text } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  NavigationScreen,
  modelUtil,
  Util,
  bluecolor,
  Navigation,
  env,
  langUtil,
  // KeepAwake,
  beaconUtil,
} from 'libs';
import {
  HBaseView,
  HRow,
  HDatefield,
  HTextfield,
  HTextarea,
  HCombobox,
  HCheckbox,
  HGridCombobox,
  HText,
  HTexttitle,
  HNumberfield,
  HDateSet,
  HButton,
  HTextareaPopup,
  HChart,
  HProgressBar,
  MyLocation,
  Timeline,
  HFormView,
} from 'ux';
/**
 * 샘플 폼
 */

const envConfig = env();
const fetchURL = envConfig.fetchURL;

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPFORM');

    this.state = {
      keyword: '',
      data: [],
      markers: [
        {
          title: 'HTNS',
          description: 'Come here!!',
          latlng: {
            latitude: 37.1654709,
            longitude: 127.0902458,
            // latitudeDelta: 0.0922,
            // longitudeDelta: 0.0421,
          },
        },
        {
          title: 'HTNS2',
          description: 'Come here!!',
          latlng: {
            latitude: 37.2654709,
            longitude: 127.2902458,
            // latitudeDelta: 0.0922,
            // longitudeDelta: 0.0421,
          },
        },
      ],
    };
  }

  async componentWillMount() {
    this.fetch();
  }

  async fetch(keyword) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    console.log(modelUtil.getModelData('TEMPFORM'));
    const result = await Fetch.request('FMS010108SVC', 'get', {
      body: JSON.stringify({
        FMS010108F1: {
          SR_CODE: 'SR190203666',
          HBL_NO: 'HICN1907736',
          keyword,
        },
      }),
    });
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('TEMPFORM', result.FMS010108F1);
    this.setState({ data: result.FMS010108F1 });
    Util.openLoader(this.screenId, false);
  }

  async fetchHttp() {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('FMS010108SVC', 'get', {
      body: JSON.stringify({
        FMS010108F1: {
          SR_CODE: 'SR190203666',
          HBL_NO: 'HICN1907736',
        },
      }),
    });
    Util.toastMsg(result.MSG);
  }

  // 바코드 팝업
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

  // 스캔 응답합니다.
  onBarcodeScan(result) {
    Util.toastMsg(result);
  }

  // 사인박스 팝업
  onSignBoxPopup() {
    const title = this.screenId; // 팝업 타이트 설정 값
    const refNo = this.props.model.data.TEMPFORM.SR_CODE; // 첨부파일 저장 시 참조 번호 값

    // refNo는 필수 값!
    Util.signBox(`${title} SignBox`, refNo);
  }

  onImageBoxPopup() {
    const title = this.screenId; // 팝업 타이트 설정 값
    const source = `${fetchURL}/api/apicall/getDownload/HTNS/MB/1561361881090`;
    const companyCode = 'HTNS';
    const fileMgtCode = '1561361881090';

    Util.imageBox(`${title} ImageBox`, source, companyCode, fileMgtCode);
  }

  render() {
    return (
      <HBaseView backimage button={() => this.fetch(this.state.keyword)}>
        <HRow between>
          <HTextfield rowflex={2} label={'Shipper'} value={'HANARO'} />
          <HTextfield label={'Shipper'} value={'SAMSUNG'} />
        </HRow>
        <HFormView style={{ marginTop: 2 }}>
          <HTextfield label={'Shipper'} value={'HANARO'} />
          <HTextfield label={'Shipper'} value={'SAMSUNG'} />
        </HFormView>
      </HBaseView>
    );
  }
}
/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
