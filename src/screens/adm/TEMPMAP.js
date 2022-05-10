/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  // KeepAwake,
} from 'libs';
import { HBaseView, HTexttitle, HMapView, HButton, HRow } from 'ux';

/**
 * 샘플 지도
 */

const icon = require('assets/images/navico.png');

let i = 0.001;
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPMAP');

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
    };
  }

  componentWillMount() {}

  async fetch() {
    this.hmapView.setMarkers([
      {
        title: 'HTNS',
        description: 'Come here!!',
        latlng: {
          latitude: 37.2154709 + i,
          longitude: 127.2902458 + i,
        },
        markerImg: icon,
      },
      {
        title: 'HTNS2',
        description: 'Come here!!',
        latlng: {
          latitude: 37.3254709 + i,
          longitude: 127.3902458 + i,
        },
        markerImg: icon,
      },
    ]);
    i += 0.001;
  }

  render() {
    const markers = [
      {
        title: 'HTNS',
        description: 'Come here!!',
        latlng: {
          latitude: 37.2154709 + i,
          longitude: 127.2902458 + i,
          // latitudeDelta: 0.0922,
          // longitudeDelta: 0.0421,
        },
        markerImg: icon,
      },
      {
        title: 'HTNS2',
        description: 'Come here!!',
        latlng: {
          latitude: 37.3254709 + i,
          longitude: 127.3902458 + i,
          // latitudeDelta: 0.0922,
          // longitudeDelta: 0.0421,
        },
        markerImg: icon,
      },
    ];
    const line = [
      { latitude: 37.2154709 + i, longitude: 127.2902458 + i },
      { latitude: 37.2254819 + i, longitude: 127.2703459 + i },
      { latitude: 37.2354929 + i, longitude: 127.260446 + i },
      { latitude: 37.2455039 + i, longitude: 127.2805461 + i },
      { latitude: 37.2555149 + i, longitude: 127.2406462 + i },
      { latitude: 37.2655259 + i, longitude: 127.2307463 + i },
    ];

    const markersRoute = [
      {
        title: 'Start',
        description: 'Come here!!',
        latlng: {
          latitude: 22.292784,
          longitude: 113.949759,
        },
      },
      {
        title: 'End',
        description: 'Come here!!',
        latlng: {
          latitude: 22.294369,
          longitude: 113.953186 + i,
        },
      },
    ];

    return (
      <HBaseView
        // spinner={this.state.spinner}
        button={() => this.fetch(this.state.keyword)}
        scrollable={false}
      >
        {/* HbaseView를 상속 받는 화면의 경우는 HbaseView의 속성값으로 지정하고,
         * 그외의 건들은 최상위 부모 <View> </View> 안에 <KeepAwake /> 설정한다.
         * libs 공동 선언부에 처리 */}
        {/* <KeepAwake /> */}
        <HTexttitle>Map</HTexttitle>
        <HMapView onRef={ref => (this.hmapView = ref)} />
        <HRow>
          <HButton onPress={() => this.hmapView.setMarkers(markers)} title={'setMarkers'} />
          <HButton onPress={() => this.hmapView.setMarkers(null)} title={'hideMarker'} />
        </HRow>
        <HRow>
          <HButton onPress={() => this.hmapView.setLine(line)} title={'setLine'} />
          <HButton onPress={() => this.hmapView.setLine(null)} title={'hideLine'} />
        </HRow>
        <HButton onPress={() => this.hmapView.setRoute(markersRoute)} title={'setRoute'} />
        <HRow>
          <HButton onPress={() => this.hmapView.onPressZoomIn()} title={'Zoom In'} />
          <HButton onPress={() => this.hmapView.onPressZoomOut()} title={'Zoom out'} />
        </HRow>
      </HBaseView>
    );
  }
}

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
