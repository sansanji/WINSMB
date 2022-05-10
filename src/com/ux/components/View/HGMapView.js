/* *
 * Import Common
 * */
import { View, StyleSheet, Image, Platform, Callout, Text } from 'react-native';
import { React, bluecolor } from 'libs';
import { MyLocation, HIcon, Touchable } from 'ux';
/* *
 * Import node_modules
 * */
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

/**
 * 맵뷰 컴포넌트
 * @param {JSON} location - 초기화면 latitude, longitude
 * @param {Boolean} showMyLocation - 현재 내 위치 로케이션 표시 여부 기본은 false
 * @param {Function} onPress - 마커 선택시 발생하는 이벤트(마커정보를 반환)
 */

class HGMapView extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;
    this.state = {
      markers: [],
      region: {
        latitude: location ? location.latitude : 37.2154709,
        longitude: location ? location.longitude : 127.2902458,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      origin: {},
      destination: {},
    };
    this.onPressZoomIn = this.onPressZoomIn.bind(this);
    this.onPressZoomOut = this.onPressZoomOut.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {}

  // 줌설정
  onPressZoomOut() {
    this.region = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      latitudeDelta: this.state.region.latitudeDelta * 10,
      longitudeDelta: this.state.region.longitudeDelta * 10,
    };

    this.setState({
      region: {
        latitudeDelta: this.region.latitudeDelta,
        longitudeDelta: this.region.longitudeDelta,
        latitude: this.region.latitude,
        longitude: this.region.longitude,
      },
    });
    this.map.animateToRegion(this.region, 100);
  }
  // 줌설정
  onPressZoomIn() {
    this.region = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      latitudeDelta: this.state.region.latitudeDelta / 10,
      longitudeDelta: this.state.region.longitudeDelta / 10,
    };
    this.setState({
      region: {
        latitudeDelta: this.region.latitudeDelta,
        longitudeDelta: this.region.longitudeDelta,
        latitude: this.region.latitude,
        longitude: this.region.longitude,
      },
    });
    this.map.animateToRegion(this.region, 100);
  }

  // 마커 선택시 이벤트
  onPress(e) {
    if (this.props.onPress) {
      this.props.onPress(e._dispatchInstances.pendingProps);
    }
    console.log(e._dispatchInstances.pendingProps);
  }

  // 마커 찍기
  setMarkers(data) {
    this.setState({
      markers: data,
    });
    if (data) {
      this.setCenter(data[0].latlng);
    }
  }
  // 라인그리기
  setLine(line) {
    this.setState({
      line,
    });
    if (line) {
      this.setCenter(line[0]);
    }
  }
  // 라우트 그리기
  setRoute(data) {
    this.setMarkers(data);
    if (data) {
      this.setState({
        origin: data[0].latlng,
        destination: data[1].latlng,
      });
    }
  }
  // 센터 지정
  setCenter(region) {
    if (region) {
      this.setState({
        region: { ...this.state.region, ...region },
      });
    }
  }

  render() {
    const GOOGLE_MAPS_APIKEY = 'AIzaSyDFen91T67WXSb4pMahBxX62D-PRry0Log';
    const { showMyLocation } = this.props;
    return (
      <View style={styles.container}>
        {showMyLocation ? (
          <MyLocation
            ref={comp => {
              this.myLocationHandle = comp;
            }}
          />
        ) : null}
        <View style={styles.container}>
          <MapView
            ref={map => {
              this.map = map;
            }}
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            region={this.state.region}
            showsUserLocation
            loadingEnabled
          >
            {this.state.markers
              ? this.state.markers.map(marker => (
                <Marker
                  key={marker.title + marker.description}
                  // image={marker.markerImg}
                  coordinate={marker.latlng}
                  title={marker.title}
                  description={marker.description}
                  // onCalloutPress={e => this.onPress(e)}
                  onCalloutPress={this.props.onPress ? e => this.props.onPress(e._dispatchInstances.pendingProps) : null}
                >
                  {marker.markerImg != null ?
                    <Image
                      source={marker.markerImg}
                      style={{
                        resizeMode: 'cover',
                        width: 30,
                        height: 30,
                      }}
                    />
                    : null}

                  {marker.markerIcon != null ?
                    <HIcon name={marker.markerIcon} color={marker.markerIconColor} size={marker.markerIconSize} />
                    : null}
                </Marker>
              ))
              : null}
            {this.state.line ? (
              <Polyline coordinates={this.state.line} strokeColor={bluecolor.basicBlueColor} strokeWidth={3} />
            ) : null}
          </MapView>
          <View
            style={{
              position: 'absolute', // use absolute position to show button on top of the map
              bottom: '10%', // for center align
              alignSelf: 'flex-end', // for align to right
              margin: 15,
            }}
          >
            <Touchable
              style={styles.scrollCtrlBtn}
              onPress={this.onPressZoomIn} // {() => this.goToTop()} 이런식으로 하면 문제가 됨!
            >
              <HIcon name="plus-circle" color={bluecolor.basicBlueColorTrans} />
            </Touchable>
            <Touchable
              style={styles.scrollCtrlBtn}
              onPress={this.onPressZoomOut} // {() => this.goToTop()} 이런식으로 하면 문제가 됨!
            >
              <HIcon name="minus-circle" color={bluecolor.basicBlueColorTrans} />
            </Touchable>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  map: {
    height: '100%',
    width: '100%',
    padding: 5,
    // ...StyleSheet.absoluteFillObject,
  },
  scrollCtrlBtn: {
    backgroundColor: bluecolor.basicBlueLightTrans,
    height: 30,
    width: 30,
    marginTop: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  title: {
    color: 'black',
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  description: {
    color: '#707070',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
});


export default HGMapView;

