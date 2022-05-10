/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  Util,
  Fetch,
  Navigation,
  // KeepAwake,
} from 'libs';
import { HBaseView, HTextfield, HMapView, HDatefield, HRow } from 'ux';

/**
 * 지도검색
 */

const icon = require('assets/images/placeholder.png');

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100201');

    this.state = {
      selData: null,
      markers: [],
      region: {
        latitude: props.location.lat || 37.1646793,
        longitude: props.location.lon || 127.0905088,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      origin: {},
      destination: {},
    };
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('TMS010101SVC', 'getTMMapList', {
      body: JSON.stringify({
        TMS010101F1: { ...this.state },
      }),
    });

    if (result.TYPE === 1) {
      this.setState(
        {
          data: result.TMS010101G1,
          selData: null,
        },
        callback,
      );

      const resultData = result.TMS010101G1;

      const marker = [];
      for (let i = 0; i < resultData.length; i += 1) {
        marker.push({
          title: resultData[i].TITLE,
          description: `${resultData[i].DEPART_CODE_NAME}->${resultData[i].ARRIVAL_CODE_NAME}`,
          latlng: {
            latitude: resultData[i].LAT,
            longitude: resultData[i].LON,
          },
          markerImg: icon,
        });
      }
      this.hmapView.setMarkers(marker);
      Util.openLoader(this.screenId, false);
    } else {
      Util.openLoader(this.screenId, false);
    }
  }

  onPress(e) {
    const selData = Util.filterData(this.state.data, 'TRN_NO', e.title);
    this.setState({
      selData: selData[0],
    });
  }

  onPopup(item) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.TMS100102',
      {
        onSaveComplete: callback => this.fetch(),
        TRN_NO: this.state.selData.TRN_NO,
        TRANS_DATE: this.state.selData.TRANS_DATE,
        ...this.state.selData,
      },
      '배차상세정보',
    );
  }

  render() {
    return (
      <HBaseView
        // spinner={this.state.spinner}
        button={() => this.fetch(this.state.keyword)}
        scrollable={false}
      >
        {/* HbaseView를 상속 받는 화면의 경우는 HbaseView의 속성값으로 지정하고,
         * 그외의 건들은 최상를 부모 <View> </View> 안에 <KeepAwake /> 설정한다.
         * libs 공동 선언부에 처리 */}
        {/* <KeepAwake /> */}
        <HMapView onRef={ref => (this.hmapView = ref)} onPress={e => this.onPress(e)} />
        {this.state.selData ? (
          <View>
            <HRow style={{ marginBottom: 10 }}>
              <HTextfield label={'TRN No'} value={this.state.selData.TRN_NO} />
              <HTextfield label={'도착지'} value={this.state.selData.ARRIVAL_CODE_NAME} />
            </HRow>
            <HRow>
              <HDatefield label={'출발시간'} value={this.state.selData.TRANS_DATE} />
              <HDatefield label={'도착시간'} value={this.state.selData.TRANS_END_DATE} />
            </HRow>
          </View>
        ) : null}
      </HBaseView>
    );
  }
}

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ model: state.model, location: state.global.location });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
