/* *
 * Import Common
 * */
import { View, Text, Linking } from 'react-native';
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
} from 'ux';
/**
 * 샘플 폼
 */


// import Barcode from 'com/layout/Barcode';

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
  /*
  _onBarCodeRead = e => {
    console.log(
      `e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${
        e.nativeEvent.data.code
      }`,
    );
    Util.toastMsg(e.nativeEvent.data.code);
    this._barCode.stopScan();
    this._barCode.startScan();
  }; */

  // 사인박스 팝업
  onSignBoxPopup() {
    const title = this.screenId; // 팝업 타이트 설정 값
    const refNo = this.props.model.data.TEMPFORM.SR_CODE; // 첨부파일 저장 시 참조 번호 값

    // refNo는 필수 값!
    Util.signBox(`${title} SignBox`, refNo);
  }

  onBarcodeBoxPopup() {
    const value = '1602813685293';
    // const format = 'CODE128';

    // value 필수 값!
    Util.barcodeBox(value);
  }

  onImageBoxPopup() {
    const title = this.screenId; // 팝업 타이트 설정 값
    const source = `${fetchURL}/api/file/getDownload/HTNS/MB/1602813685293`;
    const companyCode = 'HTNS';
    const fileMgtCode = '1602813685293';

    Util.imageBox(`${title} ImageBox`, source, companyCode, fileMgtCode);
  }

  onNaverMapp() {
    const url = 'nmap://route/car?slat=37.3595953&slng=127.1053971&sname=%EA%B7%B8%EB%A6%B0%ED%8C%A9%ED%86%A0%EB%A6%AC&secoords=37.359761,127.10527&dlng=127.1267772&dlat=37.4200267&dname=%EC%84%B1%EB%82%A8%EC%8B%9C%EC%B2%AD&decoords=37.4189564,127.1256827&v1lng=126.9522394&v1lat=37.464007&v1name=%20%EC%84%9C%EC%9A%B8%EB%8C%80%ED%95%99%EA%B5%90&v1ecoords=37.466358,126.948357&appname=com.example.myappcom.hanarotns.g1mb';
    Linking.openURL(url);
  }

  openWebViewLogin() {
    Util.openWebView({
      mode: 'LOGIN',
      source: 'https://wins.htns.com/index.html#FMS010102V',
    });
  }

  openWebView() {
    Util.openWebView({
      mode: 'WINS',
      source: 'https://wins.htns.com/index.html#FMS010102V',
      onMessage: () => {
        console.log('TEMPFORM ON MESSAGE');
      },
      onLoad: (e) => {
        console.log('TEMPFORM ON LOAD', e);
      },
    });
  }

  render() {
    return (
      <HBaseView
        // spinner={this.state.spinner}
        keepAwake // 화면 꺼짐 방지! 사용할 경우만 선언하자! (지도화면 등...)
        button={() => this.fetch(this.state.keyword)}
      >
        {/* HbaseView를 상속 받는 화면의 경우는 HbaseView의 속성값으로 지정하고,
         * 그외의 건들은 최상위 부모 <View> </View> 안에 <KeepAwake /> 설정한다.
         * libs 공동 선언부에 처리 */}
        {/* <KeepAwake /> */}
        <HTexttitle>My Location</HTexttitle>
        {/*
         * MyLocation 안에 BackgroundTimer 기능 내포되어 있음.
         * (단, 일반 업무 화면에 구성을 하게 되면 해당 화면이 종료되었을 경우 기능이 꺼짐
         * 그래서 백그라운드에서 상시 돌고 있는 서랍메뉴나 탑바메뉴에 추가하는 것이 좋아 보임!)
        <MyLocation
          ref={comp => {
            this.myLocationHandle = comp;
          }}
        /> */}
        {/* <View style={{ width: 500, height: 200, zIndex: -5 }}>
          <Barcode
            style={{ width: 500, height: 200 }}
            ref={component => {
              this._barCode = component;
            }}
            onBarCodeRead={this._onBarCodeRead}
          />
        </View>
        <HButton onPress={() => this._barCode.startScan()} name={'image'} title={'Start'} />
          <HButton onPress={() => this._barCode.stopScan()} name={'image'} title={'Stop'} /> */}
        <HRow>
          <HTextfield label={'MBL No.'} bind={'TEMPFORM.MBL_NO'} bold />
          <HTextfield label={'HBL No.'} bind={'TEMPFORM.HBL_NO'} />
        </HRow>
        <HTexttitle>Shipper</HTexttitle>
        <HTextfield label={langUtil.get(this, 'ANAME')} bind={'TEMPFORM.SHIPPER_NAME'} />
        <HTextarea label={'Address'} bind={'TEMPFORM.SHIPPER_ADDR2'} numberOfLines={2} />
        <HRow>
          <HTextfield label={'Tel.'} bind={'TEMPFORM.SHIPPER_TEL'} />
          <HTextfield label={'Fax.'} bind={'TEMPFORM.SHIPPER_FAX'} />
        </HRow>
        <HTexttitle>Consignee</HTexttitle>
        <HTextfield label={langUtil.get(this, 'ANAME')} bind={'TEMPFORM.CONSIGNEE_NAME'} />
        <HTextarea label={'Address'} bind={'TEMPFORM.CONSIGNEE_ADDR2'} numberOfLines={2} />
        <HRow>
          <HTextfield label={'Tel.'} bind={'TEMPFORM.CONSIGNEE_TEL'} />
          <HTextfield label={'Fax.'} bind={'TEMPFORM.CONSIGNEE_FAX'} editable />
        </HRow>
        <HTexttitle>Notify</HTexttitle>
        <HTextfield label={langUtil.get(this, 'ANAME')} bind={'TEMPFORM.NOTIFY_NAME'} />
        <HTextarea label={'Address'} bind={'TEMPFORM.NOTIFY_ADDR2'} numberOfLines={2} />
        <HRow>
          <HTextfield label={'Tel.'} bind={'TEMPFORM.NOTIFY_TEL'} />
          <HTextfield label={'Fax.'} bind={'TEMPFORM.NOTIFY_FAX'} editable require />
        </HRow>
        <HTexttitle>HDatefield</HTexttitle>
        <HRow>
          <HDatefield label={'ETD'} bind={'TEMPFORM.ETD_DATE'} editable require />
          <HDatefield label={'ETA'} value={this.state.data.ETA_DATE} />
        </HRow>
        <HRow>
          <HTextfield label={'Depart'} bind={'TEMPFORM.DEPART_PORT_NAME'} />
          <HTextfield label={'Arrival'} value={this.state.data.ARRIVAL_PORT_NAME} />
        </HRow>
        <HTexttitle>HNumberfield</HTexttitle>
        <HRow>
          <HNumberfield label={'G/W'} bind={'TEMPFORM.GW'} editable require />
          <HNumberfield label={'V/W'} bind={'TEMPFORM.VW'} />
          <HNumberfield label={'C/W'} bind={'TEMPFORM.CW'} />
          <HRow>
            <HNumberfield label={'PKG'} value={3333.9831} />
            <HText>{this.state.data.PKG_UNIT}</HText>
          </HRow>
        </HRow>
        <HTexttitle>HCombobox</HTexttitle>
        <HRow>
          <HCombobox
            label={'Cargo Type'}
            groupCode={'CARGO_TYPE'}
            codeField={'DT_CODE'}
            nameField={'LOC_VALUE'}
            bindVar={{
              CD: 'TEMPFORM.CARGO_TYPE',
              NM: 'TEMPFORM.CARGO_TYPE_NAME',
            }}
            editable
          />
          <HCombobox
            label={'Dely Terms'}
            groupCode={'INCOTERMS'}
            value={this.state.data.INCOTERMS}
          />
        </HRow>
        <HRow>
          <HRow>
            <HCombobox
              label={'W/T Terms'}
              groupCode={'CC_PP'}
              bindVar={{
                CD: 'TEMPFORM.SETTLE_CONDITION',
                NM: 'TEMPFORM.SETTLE_CONDITION',
              }}
              editable
            />
            <HCombobox
              label={'W/T Cur'}
              groupCode={'CUR'}
              bindVar={{
                CD: 'TEMPFORM.SETTLE_CUR',
                NM: 'TEMPFORM.SETTLE_CUR',
              }}
              editable
            />
          </HRow>
          <HRow>
            <HCombobox
              label={'O/C Terms'}
              groupCode={'CC_PP'}
              bindVar={{
                CD: 'TEMPFORM.OTHER_SETTLE_CONDITION',
                NM: 'TEMPFORM.OTHER_SETTLE_CONDITION',
              }}
            />
            <HCombobox
              label={'Yes/No'}
              groupJson={[{ DT_CODE: 'Y', LOC_VALUE: 'Yes' }, { DT_CODE: 'N', LOC_VALUE: 'No' }]}
              bindVar={{
                CD: 'TEMPFORM.YES_NO',
                NM: 'TEMPFORM.YES_NO_NAME',
              }}
              editable
              require
            />
          </HRow>
        </HRow>
        <HTexttitle>HGridCombobox</HTexttitle>
        <HRow>
          <HGridCombobox
            label={'Depart'}
            groupCode={'SP9943'}
            codeField={'DT_CODE'}
            nameField={'LOC_VALUE'}
            bindVar={{
              CD: 'TEMPFORM.DEPART_PORT',
              NM: 'TEMPFORM.DEPART_PORT_NAME',
            }}
            sql={{ DT_CODE: '' }}
            editable
            require
          />
          <HGridCombobox
            label={'Arrival'}
            groupCode={'SP9943'}
            bindVar={{
              CD: 'TEMPFORM.DEPART_PORT',
              NM: 'TEMPFORM.DEPART_PORT_NAME',
            }}
            sql={{ DT_CODE: '' }}
            value={this.state.data.ARRIVAL_PORT_NAME}
          />
        </HRow>
        <HTexttitle>HCheckbox</HTexttitle>
        <HRow>
          <HCheckbox label={'Forward'} bind={'TEMPFORM.FORWARDING_YN'} editable />
          <HCheckbox label={'Customs'} bind={'TEMPFORM.CUSTOMS_YN'} editable />
          <HCheckbox label={'Trans'} bind={'TEMPFORM.TRANS_YN'} editable require />
          <HCheckbox label={'Warehouse'} bind={'TEMPFORM.WAREHOUSE_YN'} />
          <HCheckbox label={'Bonded'} value={'Y'} />
        </HRow>
        <HRow>
          <HCheckbox label={'Forward'} bind={'TEMPFORM.FORWARDING_YN'} editable toggle />
          <HCheckbox label={'Customs'} bind={'TEMPFORM.CUSTOMS_YN'} editable toggle />
          <HCheckbox label={'Trans'} bind={'TEMPFORM.TRANS_YN'} editable toggle />
          <HCheckbox label={'Warehouse'} bind={'TEMPFORM.WAREHOUSE_YN'} toggle />
          <HCheckbox label={'Bonded'} value={'Y'} />
        </HRow>
        <HTexttitle>HTextarea</HTexttitle>
        <HRow>
          <HTextarea
            label={'H/D Information'}
            bind={'TEMPFORM.HANDLE_INFO'}
            editable
            require
            multiline
            numberOfLines={5}
            maxLength={100}
          />
          <HTextarea
            label={'Marks & Numbers'}
            bind={'TEMPFORM.SHIPPING_MARK'}
            editable
            multiline
            numberOfLines={5}
            maxLength={100}
          />
        </HRow>
        <HTexttitle>HTextareaPopup</HTexttitle>
        <HRow>
          <HTextareaPopup
            label={'H/D Information'}
            bind={'TEMPFORM.HANDLE_INFO'}
            editable
            require
            multiline
            numberOfLines={5}
            maxLength={100}
          />
          <HTextareaPopup
            label={'Marks & Numbers'}
            bind={'TEMPFORM.SHIPPING_MARK'}
            editable
            multiline
            numberOfLines={5}
            maxLength={100}
          />
        </HRow>
        <HTexttitle>HDateSet</HTexttitle>
        <HDateSet
          bindVar={{
            FROM_DATE: 'TEMPFORM.ETD_DATE_FROM',
            TO_DATE: 'TEMPFORM.ETD_DATE_TO',
            DATE_TYPE: 'TEMPFORM.ETD_DATE_TYPE',
          }}
          lDateNum={3}
          fDateNum={-1}
          tDateNum={0}
        />
        <HDateSet
          bindVar={{
            FROM_DATE: 'TEMPFORM.ETA_DATE_FROM',
            TO_DATE: 'TEMPFORM.ETA_DATE_TO',
            DATE_TYPE: 'TEMPFORM.ETA_DATE_TYPE',
          }}
        />
        <HTexttitle>HButton / msgBox / tts</HTexttitle>
        <HRow>
          <HButton
            onPress={() => {
              Util.tts('확정 Touch 助けてください 我是韩国人');
              Util.msgBox({
                title: 'Alert',
                msg: 'You can`t confirm now',
                buttonGroup: [
                  {
                    title: 'OK',
                  },
                ],
              });
            }}
            name={'check-circle-o'}
            title={'Confirm'}
          />
          <HButton
            onPress={() => {
              Util.tts('취소 Touch');
              Util.msgBox({
                title: 'Cancel',
                msg: 'Do you want to cancel?',
                buttonGroup: [
                  {
                    title: 'OK',
                    onPress: item => {
                      Util.toastMsg(`${item.title}취소 완료`);
                    },
                  },
                  {
                    title: 'Back',
                    onPress: item => {
                      Util.toastMsg(`${item.title}취소 취소`);
                    },
                  },
                ],
              });
            }}
            name={'undo'}
            title={'Cancel'}
            bStyle={{
              backgroundColor: bluecolor.basicRedColor,
            }}
          />
          <HButton
            onPress={() => {
              Util.tts('저장 Touch');
              Util.toastMsg('클릭하셨습니다.');
            }}
            name={'save'}
            title={'Save'}
            disabled
          />
        </HRow>
        <HRow>
          <HButton
            onPress={() => {
              Util.tts('삭제 Touch');
              Util.msgBox({
                title: 'Delete',
                msg: 'Do you want to delete?\nPlease check it again!!',
                buttonGroup: [
                  {
                    title: 'Delete',
                    name: 'delete',
                    iconType: 'M',
                    onPress: item => {
                      Util.toastMsg(`${item.title}삭제 완료`);
                    },
                  },
                  {
                    title: 'Cancel',
                    onPress: item => {
                      Util.toastMsg(`${item.title}취소됨`);
                    },
                  },
                  {
                    title: 'OK',
                    onPress: item => {
                      Util.toastMsg(`${item.title}완료`);
                    },
                  },
                  {
                    title: 'Back',
                    onPress: item => {
                      Util.toastMsg(`${item.title}취소됨`);
                    },
                  },
                  {
                    title: 'Delete1',
                    onPress: item => {
                      Util.toastMsg(`${item.title}삭제 완료`);
                    },
                  },
                  {
                    title: 'Cancel1',
                    onPress: item => {
                      Util.toastMsg(`${item.title}취소됨`);
                    },
                  },
                  {
                    title: 'OK1',
                    onPress: item => {
                      Util.toastMsg(`${item.title}완료`);
                    },
                  },
                  {
                    title: 'Back1',
                    onPress: item => {
                      Util.toastMsg(`${item.title}취소됨`);
                    },
                  },
                ],
              });
            }}
            name={'delete'}
            iconType={'M'}
            title={'Delete'}
            bStyle={{
              backgroundColor: bluecolor.basicRedColor,
            }}
          />
          <HButton
            onPress={() => {
              Util.tts('업로드 Touch');
              Util.toastMsg('클릭하셨습니다.');
            }}
            name={'cloud-upload'}
            title={'Upload'}
          />
          <HButton
            onPress={() => {
              Util.tts('다운로드 Touch');
              Util.toastMsg('클릭하셨습니다.');
            }}
            name={'cloud-download'}
            title={'Download'}
          />
        </HRow>
        <HTexttitle>HChart</HTexttitle>
        <View style={{ flex: 1, marginTop: 10 }}>
          <HChart
            customValueRenderer={(index, point) => {
              if (index % 2 === 0) return null;
              return <Text style={{ textAlign: 'center', margin: 0 }}>{point.y}</Text>;
            }}
            data={[
              {
                seriesName: 'series1',
                data: [
                  { x: '2018-02-01', y: 30 },
                  { x: '2018-02-02', y: 200 },
                  { x: '2018-02-03', y: 170 },
                  { x: '2018-02-04', y: 250 },
                  { x: '2018-02-05', y: 10 },
                ],
                color: bluecolor.basicBlueColor,
              },
              {
                seriesName: 'series2',
                data: [
                  { x: '2018-02-01', y: 20 },
                  { x: '2018-02-02', y: 100 },
                  { x: '2018-02-03', y: 140 },
                  { x: '2018-02-04', y: 550 },
                  { x: '2018-02-05', y: 40 },
                ],
                color: bluecolor.basicRedColor,
              },
            ]}
            type="line"
            height={150}
          />
        </View>
        <View style={{ flex: 1, marginTop: 10 }}>
          <HChart
            customValueRenderer={(index, point) => <Text style={{ margin: 0 }}>{point.y}</Text>}
            data={[
              {
                seriesName: 'series1',
                data: [
                  { x: '2018-02-01', y: 30 },
                  { x: '2018-02-02', y: 200 },
                  { x: '2018-02-03', y: 170 },
                  { x: '2018-02-04', y: 250 },
                  { x: '2018-02-05', y: 10 },
                ],
                color: bluecolor.basicBlueColor,
              },
              {
                seriesName: 'series2',
                data: [
                  { x: '2018-02-01', y: 20 },
                  { x: '2018-02-02', y: 100 },
                  { x: '2018-02-03', y: 140 },
                  { x: '2018-02-04', y: 550 },
                  { x: '2018-02-05', y: 40 },
                ],
                color: bluecolor.basicRedColor,
              },
            ]}
            type="bar"
            height={150}
          />
        </View>
        <HTexttitle>HProgressBar</HTexttitle>
        <HProgressBar
          data={[
            {
              title: 'Sales 30%',
              value: 30,
              barColor: bluecolor.basicDeepGrayColor,
            },
            {
              title: 'Sales 20%',
              value: 20,
              barColor: bluecolor.basicBlueColor,
            },
            {
              title: 'Sales 50%',
              value: 50,
              barColor: bluecolor.basicRedColor,
            },
          ]}
        />
        <HTexttitle>Beacon</HTexttitle>
        <HRow>
          <HButton onPress={() => beaconUtil.startBeacon()} name={'rss'} title={'Start'} />
          <HButton onPress={() => beaconUtil.stopBeacon()} name={'times-circle-o'} title={'Stop'} />
        </HRow>
        <HTexttitle>Barcode</HTexttitle>
        <HButton onPress={() => this.onBarcodePopup()} name={'barcode'} title={'Barcode'} />
        <HTexttitle>signBox</HTexttitle>
        <HButton onPress={() => this.onSignBoxPopup()} name={'paint-brush'} title={'Sign'} />
        <HTexttitle>barcodeBox</HTexttitle>
        <HButton onPress={() => this.onBarcodeBoxPopup()} name={'paint-brush'} title={'Create Barcode'} />
        <HTexttitle>imageBox</HTexttitle>
        <HButton onPress={() => this.onImageBoxPopup()} name={'image'} title={'Image'} />
        <HTexttitle>naverMap</HTexttitle>
        <HButton onPress={() => this.onNaverMapp()} name={'map'} title={'Naver'} />
        <HTexttitle>webView</HTexttitle>
        <HButton onPress={() => this.openWebViewLogin()} name={'monitor'} title={'Webivew Login'} />
        <HButton onPress={() => this.openWebView()} name={'monitor'} title={'Webivew'} />
        <HTexttitle>Timeline</HTexttitle>
        <Timeline
          data={[
            { time: '12/02\n09:00', title: 'Start', description: 'Event 1 Description' },
            { time: '12/02\n10:45', title: 'Event 2', description: 'Event 2 Description' },
            { time: '12/02\n12:00', title: 'Event 3', description: 'Event 3 Description' },
            { time: '12/02\n14:00', title: 'Event 4', description: 'Event 4 Description' },
            { time: '12/02\n16:30', title: 'Goal', description: 'Event 5 Description' },
          ]}
          circleSize={20}
          onEventPress={data => {
            console.log(data);
          }}
          circleColor={bluecolor.basicBlueColor}
          lineColor={bluecolor.basicBlueColor}
          timeContainerStyle={{ minWidth: 52, marginTop: -5 }}
          titleStyle={{
            color: bluecolor.basicBlueColor,
          }}
          timeStyle={{
            textAlign: 'center',
            backgroundColor: bluecolor.basicSkyBlueColor,
            color: 'white',
            padding: 5,
            borderRadius: 20,
          }}
          descriptionStyle={{ color: 'gray' }}
          options={{
            style: { paddingTop: 5 },
          }}
          innerCircle={'dot'}
        />

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
