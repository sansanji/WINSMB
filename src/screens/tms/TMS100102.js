/* *
 * Import Common
 * */
import { View, StyleSheet, Platform } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, ReduxStore } from 'libs';
import { HBaseView, HRow, HFormView, HText, HTexttitle, HDatefield, HButton, HTextfield } from 'ux';
import Tts from 'react-native-tts';
/**
 * 배차상세정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100102');

    this.state = {
      data: {},
      lat: this.props.location.lat,
      lon: this.props.location.lon,
      addr: this.props.location.addr,
    };
    Tts.setDefaultLanguage('ko');
    Tts.voices().then(voices => console.log('voices', voices));
  }

  tts(message) {
    if (this.props.global.config.CTM_TTS_YN !== 'Y') {
      return;
    }
    Tts.speak(message);
  }

  componentWillMount() {
    const { item } = this.props;

    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const { TRN_NO, TRANS_DATE } = this.props;
    const result = await Fetch.request('TMS010101SVC', 'getTMDt', {
      body: JSON.stringify({
        TMS010101F1: { TRN_NO, TRANS_DATE },
      }),
    });

    if (result) {
      this.setState(
        {
          data: result.TMS010101F1,
        },
        callback,
      );
      this.tts(
        `${result.TMS010101F1.DEPART_CODE_NAME}에서 ${result.TMS010101F1.ARRIVAL_CODE_NAME}까지 가는 배차 정보입니다.`,
      );
      Util.openLoader(this.screenId, false);
    } else {
      Util.openLoader(this.screenId, false);
    }
  }

  onRequest() {
    this.tts('공차이동 진행을 하시겠습니까?');
    Util.msgBox({
      title: '공차이동 진행을 하시겠습니까?',
      msg: '실제 공차 이동이 시작된 시간에 진행 부탁드립니다.',
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchSave(),
        },
      ],
    });
  }

  async fetchSave() {
    const platform = Platform.OS;
    const { componentId } = this.props;

    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.data.TRN_NO,
          T_CUSTOMER_ID: this.state.data.T_CUSTOMER_ID,
          DRIVER_ID: this.state.data.DRIVER_ID,
          TRACE_TYPE: 'TM0010', // 공차 이동 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    // 차량 상태 저장 : 공차이동
    const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: 'E', // 공차이동
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE === 1) {
      this.tts('완료 되었습니다');

      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: result2.data.CAR_STATUS_NAME,
      });

      Util.msgBox({
        title: '저장',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      this.tts('공차 이동 처리 실패');

      Util.msgBox({
        title: '저장',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  render() {
    return (
      <HBaseView style={styles.container}>
        <HFormView>
          <HText value={'적재중량은 배차 담당자와 사전에 확인하시기 바랍니다'} />
          <HTexttitle>출도착지</HTexttitle>
          <HTextfield
            label={'출발지'}
            value={`${this.state.data.DEPART_CODE_NAME}  ${this.state.data.DEPART_ADDR}`}
            bold
          />
          <HTextfield
            label={'도착지'}
            value={`${this.state.data.ARRIVAL_CODE_NAME}  ${this.state.data.ARRIVAL_ADDR}`}
            bold
          />
          <HTexttitle>배차 정보</HTexttitle>
          <HTextfield label={'배차번호'} value={this.state.data.TRN_NO} bold />
          <HRow>
            <HTextfield
              label={'차종'}
              value={`${this.state.data.CAR_TYPE_NAME} / ${this.state.data.CAR_TON_NAME}`}
            />
            <HDatefield label={'등록'} value={this.state.data.ADD_DATE} />
          </HRow>
          <HRow>
            <HTextfield label={'수량'} value={`${this.state.data.PKG_QTY} Q'ty`} />
            <HTextfield label={'중량'} value={`${this.state.data.GW} KG`} />
          </HRow>
          <HTextfield label={'품목명'} value={this.state.data.COMMODITY} />
          <HRow>
            <HTextfield label={'담당자명'} value={this.state.data.TRN_STAFF_NAME} />
            <HTextfield label={'담당자연락처'} value={this.state.data.TRN_STAFF_TEL} />
          </HRow>
          <HTexttitle>화주 정보</HTexttitle>
          <HText value={this.state.data.CUSTOMER_NAME} />
        </HFormView>
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this.onRequest()} title={'공차이동'} />
        </View>
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
  buttonInnerContainer: {
    flex: 1,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
  location: state.global.location,
});
/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
