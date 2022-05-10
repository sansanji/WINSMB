/* *
 * Import Common
 * */
import { View, StyleSheet, Platform } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, ReduxStore } from 'libs';
import { HBaseView, HRow, HFormView, HText, HTexttitle, HDatefield, HButton, HTextfield } from 'ux';

/**
 * 배차정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100303');
    this.state = {
      data: {},
      TRN_NO: this.props.params.TRN_NO,
      TRANS_DATE: this.props.params.TRANS_DATE,
      // 최종 하차가 완료되기 전에는 경유지, 하차 버튼이 같이 보이도록
      taskStep: this.props.params.TASK_STEP === '3' ? '2' : this.props.params.TASK_STEP || '0',
      lat: this.props.location.lat,
      lon: this.props.location.lon,
      addr: this.props.location.addr,
    };
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('TMS010101SVC', 'getTMDt', {
      body: JSON.stringify({
        TMS010101F1: this.state,
      }),
    });

    if (result) {
      this.setState(
        {
          data: result.TMS010101F1,
        },
        callback,
      );
      Util.openLoader(this.screenId, false);
    } else {
      Util.openLoader(this.screenId, false);
    }
  }

  // 버튼 이벤트에 대한 조건 처리
  _eventBtnBranch(eventType, trnNo) {
    if (eventType === 'LOADING') {
      Util.msgBox({
        title: '상차 완료 처리를 진행하시겠습니까?',
        msg: '취소가 불가한 점 유의 바랍니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._LOADING(),
          },
        ],
      });
    } else if (eventType === 'TS_UNLOADING') {
      Util.msgBox({
        title: '경유지 하차 처리를 진행하시겠습니까?',
        msg: '취소가 불가한 점 유의 바랍니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._TS_UNLOADING(),
          },
        ],
      });
    } else if (eventType === 'TS_LOADING') {
      Util.msgBox({
        title: '경유지 상차 처리 진행하시겠습니까?',
        msg: '취소가 불가한 점 유의 바랍니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._TS_LOADING(),
          },
        ],
      });
    } else if (eventType === 'UNLOADING') {
      Util.msgBox({
        title: '최종 하차 처리 진행하시겠습니까?',
        msg: '취소가 불가한 점 유의 바랍니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._UNLOADING(),
          },
        ],
      });
    } else if (eventType === 'RECIPT') {
      Util.msgBox({
        title: '인수완료 처리 진행하시겠습니까?',
        msg: '취소가 불가한 점 유의 바랍니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this._onSign(trnNo),
          },
        ],
      });
    }
  }

  // 상차 완료 처리
  async _LOADING() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const platform = Platform.OS;
    const { componentId } = this.props;
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0100', // 상차 완료 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    // 차량 상태 저장 : 운행중
    const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: 'D', // 운행중
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE === 1) {
      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: result2.data.CAR_STATUS_NAME,
      });

      Util.msgBox({
        title: '상차 완료 알림',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Navigation(navigator, 'ALERT', {
        title: '상차 실패',
        content: result.MSG,
        onClose: () => {
          navigator.dismissLightBox();
          this.setState({
            taskStep: 1,
            spinner: false,
          });
        },
      });
      Util.msgBox({
        title: '상차 오류',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 1,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 경유 하차 처리
  async _TS_UNLOADING() {
    Util.openLoader(this.screenId, true);

    const platform = Platform.OS;
    const { componentId } = this.props;
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0200', // 경유지 하차 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: '경유지 하차 완료 알림',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '경유지 하차 실패',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 경유 상차 처리
  async _TS_LOADING() {
    const { componentId } = this.props;
    const platform = Platform.OS;
    Util.openLoader(this.screenId, true);

    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0210', // 경유지 상차 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: '경유지 상차 완료 알림',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '경유지 상차 실패',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 2,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 최종 하차 처리
  async _UNLOADING() {
    const { componentId } = this.props;
    const platform = Platform.OS;
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0300', // 최종 하차 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: '최종 하차 완료 알림',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 4,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '최종 하차 실패',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 3,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 인수 처리
  async _RECIPT() {
    // debugger;
    const { componentId } = this.props;
    const platform = Platform.OS;
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0310', // 인수완료 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    // 차량 상태 저장 : 대기
    const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: 'W', // 대기
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
        },
      }),
    });

    if (result.TYPE === 1) {
      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: result2.data.CAR_STATUS_NAME,
      });

      Util.msgBox({
        title: '인수 처리 완료 알림',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 5,
              });
              Util.openLoader(this.screenId, false);
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '인수 처리 실패',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.setState({
                taskStep: 4,
              });
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  // 하단 버튼 컨트롤
  buttonControll(btnType) {
    const btn = {
      1: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton
            title={'출발지 도착 및 상차 완료'}
            onPress={() => this._eventBtnBranch('LOADING', this.state.TRN_NO)}
          />
        </View>
      ),
      2: (
        <View style={styles.buttonGroupContainer}>
          <View style={[styles.buttonInnerContainer]}>
            <HButton
              title={'경유지 하차'}
              onPress={() => this._eventBtnBranch('TS_UNLOADING', this.state.TRN_NO)}
            />
          </View>
          <View style={[styles.buttonInnerContainer]}>
            <HButton
              title={'경유지 상차'}
              onPress={() => this._eventBtnBranch('TS_LOADING', this.state.TRN_NO)}
            />
          </View>
          <View style={[styles.buttonInnerContainer]}>
            <HButton
              title={'최종 하차 완료'}
              onPress={() => this._eventBtnBranch('UNLOADING', this.state.TRN_NO)}
            />
          </View>
        </View>
      ),
      3: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton
            title={'최종 하차 완료'}
            onPress={() => this._eventBtnBranch('UNLOADING', this.state.TRN_NO)}
          />
        </View>
      ),
      4: (
        <View style={[styles.buttonInnerContainer]}>
          <HButton
            title={'인수 완료'}
            onPress={() => this._eventBtnBranch('RECIPT', this.state.TRN_NO)}
          />
        </View>
      ),
    };
    return btn[btnType];
  }

  _onSign(trnNo) {
    const title = '인수확인'; // 팝업 타이트 설정 값
    const refNo = trnNo; // 첨부파일 저장 시 참조 번호 값

    // refNo는 필수 값!
    Util.signBox(`${title} SignBox`, refNo, callback => this._RECIPT(callback));
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
        <View style={styles.buttonContainer}>{this.buttonControll(this.state.taskStep)}</View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
