/* *
 * Import Common
 * */
import { View, StyleSheet, Platform } from 'react-native';
import {
  Navigation,
  React,
  Redux,
  Util,
  ReduxStore,
  modelUtil,
  NavigationScreen,
  Fetch,
} from 'libs';
import { HBaseView, HFormView, HRow, HCheckbox, HText, HButton, HIcon, HTexttitle } from 'ux';
/* *
 * Import node_modules
 * */
/**
 * @constructor
 * 환경설정
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100601');
    this.state = {
      data: { version: 'V1.0', user_id: null },
    };

    const { config } = this.props.global || {};
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('TMS100601', config);
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    let carStatus = '대기';
    const result = await Fetch.request('TMS010101SVC', 'getTMTrcStatus', {
      body: JSON.stringify({
        TMS010101F1: {},
      }),
    });

    Util.openLoader(this.screenId, false);
    if (result) {
      // 정해진 데이터만 보여준다.

      if (result.TYPE === 1) {
        carStatus = result.TMS010101F1.CAR_STATUS_NAME;
      }
      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: carStatus,
      });
    }
  }

  onSave() {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: modelUtil.getModelData('TMS100601'),
    });
    Util.toastMsg('Saved');
    Navigation(this.props.componentId, 'POP');
  }

  async saveStatus(statusType) {
    const { session, location } = this.props.global;
    const platform = Platform.OS;

    const result = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: statusType, // 차량상태
          LATITUDE: location.lat,
          LONGITUDE: location.lon,
          ADDR: location.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE != null) {
      this.fetch();
    }
  }

  render() {
    const { trnstatus } = this.props.global;

    return (
      <View style={{ flex: 1 }}>
        <HBaseView>
          <HTexttitle>운행상태</HTexttitle>
          <HText
            textStyle={{
              fontWeight: 'bold',
              fontSize: 20,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {trnstatus != null ? trnstatus : ''}
          </HText>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'stop'} iconType={'M'} />
                <HText>운행상태를 대기로 변경</HText>
              </View>
              <HButton
                onPress={() => {
                  this.saveStatus('W');
                }}
                name={'stop'}
                iconType={'M'}
                title={'대기'}
              />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'slideshow'} iconType={'M'} />
                <HText>운행상태를 공차이동으로 변경</HText>
              </View>
              <HButton
                onPress={() => {
                  this.saveStatus('E');
                }}
                name={'slideshow'}
                iconType={'M'}
                title={'공차이동'}
              />
            </HRow>
          </HFormView>
          <HTexttitle>환경셋팅</HTexttitle>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'volume-up'} />
                <HText>신규화물정보에 대한 알림소리를 설정합니다.</HText>
              </View>
              <HCheckbox label={'화물정보읽어주기'} bind={'TMS100601.CTM_TTS_YN'} toggle editable />
            </HRow>
          </HFormView>
        </HBaseView>
        <HButton onPress={() => this.onSave()} name={'save'} title={'Save'} />
      </View>
    );
  }
}

/**
 * Define component styles
 */

const styles = StyleSheet.create({});

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
