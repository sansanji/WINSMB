/* *
 * Import Common
 * */
import { View, StyleSheet, Platform, Text } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, ReduxStore, bluecolor } from 'libs';
import { HBaseView, HRow, HFormView, HText, HTexttitle, HDatefield, HTextfield, Touchable, HIcon, HButton } from 'ux';

import { Icon } from 'react-native-elements';
/**
 * 기사용 배차정보
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100702');
    this.state = {
      data: {},
      TRN_NO: this.props.params.TRN_NO,
      TRANS_DATE: this.props.params.TRANS_DATE,
      lat: this.props.location.lat,
      lon: this.props.location.lon,
      addr: this.props.location.addr,
      P_COMPANY_CODE: this.props.params.COMPANY_CODE,
    };
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch(callback) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
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
      // Util.openLoader(this.screenId, false);
    } else {
      // Util.openLoader(this.screenId, false);
    }
  }

  // 공차이동
  async fetchMove() {
    const platform = Platform.OS;
    const { componentId } = this.props;
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
    // const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
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
          P_COMPANY_CODE: this.state.P_COMPANY_CODE,
        },
      }),
    });
    // 차량 상태 저장 : 공차이동
    const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
    // const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: 'E', // 공차이동
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
          P_COMPANY_CODE: this.state.P_COMPANY_CODE,
        },
      }),
    });

    if (result.TYPE === 1) {
      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: result2.data.CAR_STATUS_NAME,
      });

      this.fetch();

      Util.msgBox({
        title: '공차이동',
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
    } else {
      Util.msgBox({
        title: '공차이동',
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

  // 상차 완료 처리
  async fetchStart() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const platform = Platform.OS;
    const { componentId } = this.props;
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
    // const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0100', // 상차 완료 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
          P_COMPANY_CODE: this.state.P_COMPANY_CODE,
        },
      }),
    });

    // 차량 상태 저장 : 운행중
    const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
    // const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: 'D', // 운행중
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
          P_COMPANY_CODE: this.state.P_COMPANY_CODE,
        },
      }),
    });

    if (result.TYPE === 1) {
      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: result2.data.CAR_STATUS_NAME,
      });

      this.fetch();

      Util.msgBox({
        title: '출발',
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
    } else {
      Navigation(navigator, 'ALERT', {
        title: '출발 실패',
        content: result.MSG,
        onClose: () => {
          navigator.dismissLightBox();
        },
      });
      Util.msgBox({
        title: '출발 오류',
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

  // 인수 처리
  async fetchStop() {
    // debugger;
    const { componentId } = this.props;
    const platform = Platform.OS;
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
    // const result = await Fetch.request('TMS010101SVC', 'saveTMTrc', {
      body: JSON.stringify({
        TMS010101F1: {
          TRN_NO: this.state.TRN_NO,
          TRACE_TYPE: 'TM0310', // 인수완료 TRC_ID
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
          P_COMPANY_CODE: this.state.P_COMPANY_CODE,
        },
      }),
    });

    // 차량 상태 저장 : 대기
    const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
    // const result2 = await Fetch.request('TMS010101SVC', 'saveStatus', {
      body: JSON.stringify({
        TMS010101F1: {
          CAR_STATUS: 'W', // 대기
          LATITUDE: this.state.lat,
          LONGITUDE: this.state.lon,
          ADDR: this.state.addr,
          REMARKS: platform,
          P_COMPANY_CODE: this.state.P_COMPANY_CODE,
        },
      }),
    });

    if (result.TYPE === 1) {
      ReduxStore.dispatch({
        type: 'global.trnstatus.set',
        trnstatus: result2.data.CAR_STATUS_NAME,
      });

      this.fetch();

      Util.msgBox({
        title: '도착알림',
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
    } else {
      Util.msgBox({
        title: '도착실패',
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

  onSignBoxPopup() {
    const title = '인수확인'; // 팝업 타이트 설정 값
    const refNo = this.state.data.TRN_NO; // 첨부파일 저장 시 참조 번호 값
    const companyCode = this.props.params.COMPANY_CODE;
    // TMS 인수증 서명 전달
    const refType = 'DN';
    const sFuncCode = 'NT';

    // refNo는 필수 값!
    Util.signBox(
      refType,
      sFuncCode,
      `${title} 서명란`,
      refNo,
      companyCode,
      // () => this.fetchStop(),
    );
  }

  // 하단 버튼 컨트롤
  buttonField(params) {
    let taskSetp = 0;
    if (params.TC_RECP_ID !== '' && params.TC_RECP_ID !== null) {
      // 도착
      taskSetp = 3;
    } else if (params.TC_START_ID !== '' && params.TC_START_ID !== null) {
      // 출발
      taskSetp = 2;
    } else if (params.TC_MOVE_ID !== '' && params.TC_MOVE_ID !== null) {
      // 공차이동
      taskSetp = 1;
    }
    console.log(`JAYTEST STEP = ${taskSetp}`);
    return (
      <View style={styles.stepButtonContainer}>
        <Touchable
          onPress={
            () => {
              if (taskSetp !== 0) {
                Util.toastMsg('이미 공차이동 되었습니다.');
              } else {
                this.fetchMove();
              }
            }
          }
        >
          <View style={[styles.stepButton, { backgroundColor: taskSetp !== 0 ? bluecolor.basicDeepGrayColor : '#559854' }]}>
            <HText
              value={taskSetp !== 0 ? '이동완료' : '공차이동'}
              textStyle={[styles.oldText, { color: bluecolor.basicWhiteColor }]}
            />
          </View>
        </Touchable>
        <Touchable
          onPress={
            () => {
              if (taskSetp >= 2) {
                Util.toastMsg('이미 출발하였습니다.');
              } else {
                this.fetchStart();
              }
            }
          }
        >
          <View style={[styles.stepButton, { backgroundColor: taskSetp >= 2 ? bluecolor.basicDeepGrayColor : '#E1C310' }]}>
            <HText
              value={taskSetp >= 2 ? '출발완료' : '출발'}
              textStyle={[styles.oldText, { color: bluecolor.basicWhiteColor }]}
            />
          </View>
        </Touchable>
        <Touchable
          onPress={
            () => {
              if (taskSetp === 2) {
                this.fetchStop();
              } else if (taskSetp === 3) {
                Util.toastMsg('이미 도착하였습니다.');
              } else {
                Util.toastMsg('출발을 먼저 해주세요');
              }
            }
          }
        >
          <View style={[styles.stepButton, { backgroundColor: taskSetp === 0 || taskSetp === 3 ? bluecolor.basicDeepGrayColor : '#D84329' }]}>
            <HText
              value={taskSetp === 3 ? '도착완료' : '도착'}
              textStyle={[styles.oldText, { color: bluecolor.basicWhiteColor }]}
            />
          </View>
        </Touchable>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1,
        justifyContent: 'space-around' }}
      >
        <HBaseView style={styles.container}>
          <HFormView>
            <HText textStyle={styles.deptText} value={`출) ${this.state.data.DEPART_CODE_NAME}  ${this.state.data.DEPART_ADDR}`} />
            <HText textStyle={styles.arrText} value={`도) ${this.state.data.ARRIVAL_CODE_NAME}  ${this.state.data.ARRIVAL_ADDR}`} />
            <View style={styles.viewStyle}>
              <Icon
                containerStyle={{ justifyContent: 'center' }}
                name="cube"
                type="font-awesome"
                color={bluecolor.basicBluebt}
                size={17}
              />
              <HText textStyle={styles.deptText}>{this.state.data.TRN_NO}</HText>
            </View>
            <HText textStyle={styles.coustmerText} value={this.state.data.CUSTOMER_NAME} />
            <View style={{ margin: 5 }} />
            <HRow>
              <HText textStyle={styles.contentsText} value={this.state.data.TRN_STAFF_NAME} />
              <Touchable
                onPress={() => {
                  Util.onCalling(this.state.data.TRN_STAFF_TEL);
                }}
              >
                <View style={styles.rowContainer}>
                  <HIcon
                    name={'phone-square'}
                    color={bluecolor.basicGreenColor}
                    style={{ marginTop: 1 }}
                  />
                  <View style={{ flex: 1 }}>
                    <HText textStyle={styles.contentsText} value={this.state.data.TRN_STAFF_TEL} />
                  </View>
                </View>
              </Touchable>
            </HRow>
            <HRow>
              <HTextfield
                style={styles.contentsText}
                label={'차종'}
                value={`${this.state.data.CAR_TYPE_NAME} / ${this.state.data.CAR_TON_NAME}`}
              />
              <HTextfield
                style={styles.contentsText}
                label={'등록'}
                value={this.state.data.ORIGIN_ADD_DATE}
              />
            </HRow>
            <HRow>
              <HTextfield style={styles.contentsText} label={'수량'} value={`${this.state.data.PKG_QTY} Q'ty`} />
              <HTextfield style={styles.contentsText} label={'중량'} value={`${this.state.data.GW} KG`} />
            </HRow>
            <HTextfield style={styles.contentsText} label={'품목명'} value={this.state.data.COMMODITY} />
          </HFormView>
        </HBaseView>
        {/* 인수증 싸인 */}

        <HButton
          onPress={() => { this.onSignBoxPopup(); }}
          name={'paint-brush'}
          title={'인수증 서명'}
          bStyle={{
            fontSize: 19,
            height: 45,
            backgroundColor: bluecolor.basicBluebt,
          }}
        />

        {this.buttonField(this.state.data)}
      </View>
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
  rowPadding: {
    marginBottom: 5,
  },
  oldText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  coustmerText: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  contentsText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  deptText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: bluecolor.basicBluebt,
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
    marginTop: 3,
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
  contentStyle: {
    fontSize: 19,
  },
  viewStyle: {
    marginLeft: 3,
    marginRight: 3,
    padding: 5,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    // backgroundColor: bluecolor.basicBlueLightTrans,
    borderBottomWidth: 1,
    borderColor: bluecolor.basicBlueLightTrans,
    // borderRadius: 5,
  },
  text: {
    marginBottom: 0,
    color: bluecolor.basicBluebt,
    fontSize: 18,
    fontWeight: 'bold',
  },
  calContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // padding: 5,
    // flexWrap: 'wrap',
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
