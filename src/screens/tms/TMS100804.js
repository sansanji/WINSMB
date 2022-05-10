/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  // KeepAwake,
  Fetch, bluecolor } from 'libs';
import { HBaseView, HTexttitle, HGMapView, HText, HRow, HTextfield } from 'ux';


/**
 * 지도
 */


class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100804');

    this.state = {
      markers: [],
      region: {
        latitude: 37.2154709,
        longitude: 127.2902458,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      origin: {},
      destination: {},
      CAR_NO: this.props.TRN_DATA.data.CAR_NO,
      TRN_NO: this.props.TRN_DATA.TRN_NO,
      TRANS_DATE: this.props.TRN_DATA.data.TRANS_DATE,
      TRANS_TIME: this.props.TRN_DATA.data.TRANS_TIME,
      TRANS_END_DATE: this.props.TRN_DATA.data.TRANS_END_DATE,
      TRANS_END_TIME: this.props.TRN_DATA.data.TRANS_END_TIME,
      CAR_TYPE_NAME: this.props.TRN_DATA.data.CAR_TYPE_NAME,
      CAR_TON_NAME: this.props.TRN_DATA.data.CAR_TON_NAME,
      DRIVER_TEL: this.props.TRN_DATA.data.DRIVER_TEL,
      DRIVER_NAME: this.props.TRN_DATA.data.DRIVER_NAME,
      lineData: [],
      line: [],
      routeMarker: [],
    };
  }

  async componentWillMount() {
    console.log('TRN DATA ### ', this.props.TRN_DATA);
    await this.getRouteItemAtList();
    await this.getTraceDataList();
    await this.setLine();
    await this.setRouteMarker();


    console.log('TRN ROUTE ### ', this.state.routeMarker);
    console.log('TRN LINE DATA ### ', this.state.lineData);
  }

  setRouteMarker() {
    const marker = this.state.routeMarker;
    marker.unshift({
      title: this.state.lineData[0].CAR_NO,
      description: `${this.state.lineData[0].DRIVER_NAME} Tel: ${this.state.lineData[0].DRIVER_TEL}`,
      // markerImg: icon,
      markerIcon: 'map-marker',
      markerIconColor: '#d67766',
      markerIconSize: 35,
      latlng: {
        latitude: parseFloat(this.state.lineData[0].LATITUDE),
        longitude: parseFloat(this.state.lineData[0].LONGITUDE),
      },
    });
    this.hgmapView.setMarkers(marker);
  }
  setLine() {
    this.hgmapView.setLine(this.state.line);
  }

  async getTraceDataList() {
    const result = await Fetch.request('GPS130001SVC', 'getPoliline', {
      body: JSON.stringify({
        GPS130001F1: {
          TRN_TO_D: this.state.TRN_NO,
          CAR_NO: this.state.CAR_NO,
          REQ_DATE_FROM: this.state.TRANS_DATE + this.state.TRANS_TIME,
          REQ_DATE_TO: this.state.TRANS_END_DATE + this.state.TRANS_END_TIME,
        },
      }),
    });
    this.setState({
      lineData: result.GPS130001G1,
    });
    const line = [];
    // result.GPS130001G1.reverse();
    result.GPS130001G1.forEach((obj) => {
      line.push({
        latitude: parseFloat(obj.LATITUDE),
        longitude: parseFloat(obj.LONGITUDE),
      });
    });

    this.setState({
      line,
    });
  }

  async getRouteItemAtList() {
    const result = await Fetch.request('GPS500001SVC', 'get', {
      body: JSON.stringify({
        GPS500001F1: {
          TRN_NO: this.state.TRN_NO,
        },
      }),
    });
    const marker = [];
    result.GPS500001G1.forEach((obj) => {
      marker.push({
        title: obj.AREA_NAME,
        description: obj.ADDR,
        markerIcon: 'map-marker',
        markerIconColor: '#4CAF50',
        markerIconSize: 35,
        latlng: {
          latitude: parseFloat(obj.LATITUDE),
          longitude: parseFloat(obj.LONGITUDE),
        } });
    });
    this.setState({
      routeMarker: marker,
    });
  }

  render() {
    return (
      <HBaseView
        // spinner={this.state.spinner}
        // button={() => this.fetch(this.state.keyword)}
        scrollable={false}
      >
        {/* HbaseView를 상속 받는 화면의 경우는 HbaseView의 속성값으로 지정하고,
         * 그외의 건들은 최상위 부모 <View> </View> 안에 <KeepAwake /> 설정한다.
         * libs 공동 선언부에 처리 */}
        {/* <KeepAwake /> */}
        <HTexttitle>Map</HTexttitle>
        <HGMapView onRef={ref => (this.hgmapView = ref)} />
        <HTexttitle>기사정보</HTexttitle>
        <HRow>
          <HTextfield
            label={'기사명'}
            value={this.state.DRIVER_NAME}
          />

          <HTextfield
            label={'Tel:'}
            value={this.state.DRIVER_TEL}
          />
        </HRow>
        <HTexttitle>차량정보</HTexttitle>
        <HRow>
          <HTextfield
            label={'차량번호'}
            value={this.state.CAR_NO}
          />

          <HTextfield
            label={'Ton'}
            value={this.state.CAR_TON_NAME}
          />
        </HRow>
        <HTexttitle>차량센서 ({this.state.lineData.length == 0 ? 'NoSignal' : this.state.lineData[0].ADD_DATE})</HTexttitle>
        <HRow>
          <HText>온도 : {this.state.lineData.length == 0 ? '0' : this.state.lineData[0].TEMPERATURE}℃</HText>
          <HText>습도 : {this.state.lineData.length == 0 ? '0' : this.state.lineData[0].HUMIDITY}%</HText>
        </HRow>
        <HRow>
          <HText>속도 : {this.state.lineData.length == 0 ? '0' : this.state.lineData[0].SPEED}km/h</HText>
          <HText>충격 : {this.state.lineData.length == 0 ? '0' : this.state.lineData[0].SHCOK}</HText>
        </HRow>
      </HBaseView>
    );
  }
}

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ model: state.model });


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonInnerContainer: {
    flex: 1,
  },
  rowPadding: {
    marginBottom: 5,
  },
  oldText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  deptText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: bluecolor.basicBlueImpactColor,
  },
  arrText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: bluecolor.basicRedColor,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 5,
  },
  stepButtonContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
    backgroundColor: '#4d4d4d',
    padding: 7,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'black',
  },
  stepButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 80,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
  },
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
