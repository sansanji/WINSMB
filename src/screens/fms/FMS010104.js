/* *
 * Import Common
 * */
import { View, Platform } from 'react-native';
import {
  Navigation,
  React,
  Redux,
  Fetch,
  NavigationScreen,
  bluecolor,
  Util,
  modelUtil,
  env,
} from 'libs';
import {
  HBaseView,
  HListView,
  HFormView,
  HRow,
  Touchable,
  HText,
  HIcon,
  HDateSet,
  HTextfield,
  HNumberfield,
  HCombobox,
} from 'ux';
/* *
 * Import node_modules
 * */
import debounce from 'debounce';

/**
 * 항공 수출 GERP EDI 전송
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'FMS010104');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      chkDepartedSuccessCnt: 0, // 2차 전송 시 실제 출발한 편기 건수 체크
    };

    // 다중 터치 방지!
    this._commonSendRecvHistoryChk = debounce(this._commonSendRecvHistoryChk.bind(this), 1000, true);
  }

  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('FMS010104', {
      H_CONFIRM_YN: '',
      ONLY_QUE_CHK: 'N',
      USER_ID_CHK: 'N',
      AT_BLADVI_PUSH_SEND_YN: '',
      AT_BLADVI_EDI_SEND_YN: '',
      FROM_DATE: Util.getDateValue(null, -1),
      TO_DATE: Util.getDateValue(),
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  // 화면을 조회한다.
  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    // 대문자 변환
    modelUtil.setValue(
      'FMS010104.HMBL_NO',
      modelUtil
        .getValue('FMS010104.HMBL_NO')
        .toString()
        .toUpperCase(),
    );
    modelUtil.setValue(
      'FMS010104.ARRIVAL_PORT',
      modelUtil
        .getValue('FMS010104.ARRIVAL_PORT')
        .toString()
        .toUpperCase(),
    );

    const result = await Fetch.request(
      'BAS010101SVC',
      'getGerpSrAeApp',
      {
        body: JSON.stringify({
          BAS010101F1: modelUtil.getModelData('FMS010104'),
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.BAS010101G1, env().listCnt);
      this.setState({
        dataTotal: result.BAS010101G1,
        data, // data: result.BAS010101G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
        chkDepartedSuccessCnt: 0,
      });
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
        chkDepartedSuccessCnt: 0,
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 전송이력 화면 팝업 전 전송 유무 체크
  _commonSendRecvHistoryChk(item, docType) {
    if (docType === 'BLADVI') {
      if (item.BLADVI_SEND_YN === 'N') {
        Util.msgBox({
          title: 'Check',
          msg: `[${docType}] No send history.\nPlease check again!`,
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });
      } else {
        this._commonSendHistoryList(item, docType);
      }
    } else {
      Util.msgBox({
        title: 'Alert',
        msg: 'Developing...\nPlease wait, coming soon!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }

  // 전송이력 화면 팝업
  _commonSendHistoryList(item, docType) {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.FMS010105',
      {
        HBL_NO: item.HBL_NO,
        MBL_NO: item.MBL_NO,
        FORWD_TYPE: 'AIR',
        IMP_EXP_FLAG: 'EX',
        SDS_SEND_DOC_TYPE: docType,
        ENDPOINT_FLAG: 'GERP',
        DATE_FLAG: 'Y',
        item,
      },
      'EDI Send List',
    );
  }

  /**
   * EDI 전송 이벤트 <시작>
   */
  // EDI 전송 전 알림 표시
  // LongPress 적용
  _sendEdiAlert(item, docType) {
    Util.msgBox({
      title: 'Send EDI',
      msg: `Are you sure you want to ${docType} send?\n\n[${item.HBL_NO}]`,
      buttonGroup: [
        {
          title: 'Nomal Send',
          onPress: () => this._actualDepartedChk(item, docType, 'single'),
        },
        {
          title: 'Cancel Send',
          bStyle: { backgroundColor: bluecolor.basicRedColor },
          onPress: () => this._sendEdiCancelAlert(item, docType),
        },
      ],
    });
  }

  // 취소 단 건 전송 시 한번 더 되묻기!
  _sendEdiCancelAlert(item, docType) {
    Util.msgBox({
      title: 'Send Single Cancel EDI',
      msg: `Are you sure you want to ${docType} Cancel send?\n\n[${item.HBL_NO}]`,
      buttonGroup: [
        {
          title: 'Cancel Send',
          bStyle: { backgroundColor: bluecolor.basicRedColor },
          onPress: () => this._sendEdi(item, docType, 'single', 'cancel'),
        },
      ],
    });
  }

  // 조회된 전체 건에 대해 EDI 전송 시 한번 더 되묻기!
  _sendEdiMultiAlert(docType, orgType) {
    const fetchDataAll = this.state.dataTotal;
    const dataLength = fetchDataAll.length;
    let targetHbl = null;
    let orgTypeName = null;

    if (dataLength > 1) {
      targetHbl = `${fetchDataAll[0].HBL_NO} 외 ${dataLength - 1}건`;
    } else {
      targetHbl = fetchDataAll[0].HBL_NO;
    }

    if (orgType === 'cancel') {
      orgTypeName = 'Cancel';
    } else {
      orgTypeName = 'Nomal';
    }

    Util.msgBox({
      title: `Send multi ${orgTypeName} EDI`,
      msg: `Are you sure you want to ${docType} ${orgTypeName} send All?\n\n[${targetHbl}]`,
      buttonGroup: [
        {
          title: `${orgTypeName} Send All`,
          bStyle: orgType === 'cancel' ? { backgroundColor: bluecolor.basicRedColor } : null,
          onPress: () => this._actualDepartedChk(null, docType, 'multi', orgType),
        },
      ],
    });
  }

  // 인천공항 스케줄 정보 api 정보를 조회한 값을 통해 실제 해당 편기가 출발했는지 안했는지 체크!
  // 만약 출발하지 않은 건을 전송할 경우 Alert 메시지를 확인한다.
  _actualDepartedChk(item, docType, sendType, orgType) {
    // 전체 전송에 필요한 변수 설정 <시작>
    const dataLength = this.state.dataTotal.length;
    const fetchDataAll = this.state.dataTotal;
    let chkDepartedSuccessCnt = Number(this.state.chkDepartedSuccessCnt);
    // let chkDepartedFailCnt = 0;
    let notDepartedHblNo = null;
    // 전체 전송에 필요한 변수 설정 <끝>

    // 취소 전송이 아닌 경우 (원본, 재전송)만 적기 여부 체크!
    if (orgType !== 'cancel') {
      if (sendType === 'multi') {
        for (let i = 0; i < dataLength; i += 1) {
          const flightStatus = fetchDataAll[i].FLIGHT_STATUS;
          const sendStatus = fetchDataAll[i].SEND_STATUS;

          if (
            (sendStatus === 'RTR_TARGET' ||
              sendStatus === 'COMPLETED' ||
              sendStatus === 'ORG_SEND_COM' ||
              sendStatus === 'ORG_RESEND_COM') &&
            flightStatus !== 'Departed'
          ) {
            // chkDepartedFailCnt = +1;
            notDepartedHblNo = fetchDataAll[i].HBL_NO;
          } else {
            chkDepartedSuccessCnt += 1;
          }
        }

        if (dataLength !== chkDepartedSuccessCnt) {
          Util.msgBox({
            title: 'Flight Status',
            msg: `This HAWB [${notDepartedHblNo}] flight is not departed.\n\nAre you sure you want to ${docType} Final Nomal send All?`,
            buttonGroup: [
              {
                title: 'Nomal Send All',
                bStyle: { backgroundColor: bluecolor.basicRedColor },
                onPress: () => this._sendEdi(null, docType, sendType),
              },
            ],
          });
        } else {
          this._sendEdi(null, docType, sendType);
        }
      } else {
        // sendType === 'single'
        const flightStatus = item.FLIGHT_STATUS;
        const sendStatus = item.SEND_STATUS;
        notDepartedHblNo = item.HBL_NO;

        if (
          (sendStatus === 'RTR_TARGET' ||
            sendStatus === 'COMPLETED' ||
            sendStatus === 'ORG_SEND_COM' ||
            sendStatus === 'ORG_RESEND_COM') &&
          flightStatus !== 'Departed'
        ) {
          Util.msgBox({
            title: 'Flight Status',
            msg: `This HAWB [${notDepartedHblNo}] flight is not departed.\n\nAre you sure you want to ${docType} Final Nomal send?`,
            buttonGroup: [
              {
                title: 'Nomal Send',
                bStyle: { backgroundColor: bluecolor.basicRedColor },
                onPress: () => this._sendEdi(item, docType, sendType),
              },
            ],
          });
        } else {
          this._sendEdi(item, docType, sendType);
        }
      }
    } else {
      this._sendEdi(item, docType, sendType, orgType);
    }
  }

  // EDI 전송
  async _sendEdi(item, docType, sendType, orgType) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const fetchDataAll = this.state.dataTotal;
    const fetchDataLength = this.state.dataTotal.length;
    let cancelYN = 'N';

    if (orgType === 'cancel') {
      cancelYN = 'Y';
    }

    // 삭제 전송일 경우 "3" 처리!
    if (sendType === 'single') {
      // 단 건 전송은 선택한 데이터에만 취소 컬럼 설정!
      Object.assign(item, { BLADVI_CANCEL_YN: cancelYN });
    } else if (sendType === 'multi') {
      // 전체 건 전송은 반복문을 통해 모든 데이터에 취소 컬럼 설정!
      for (let i = 0; i < fetchDataLength; i += 1) {
        Object.assign(fetchDataAll[i], { BLADVI_CANCEL_YN: cancelYN });
      }
    }

    const result = await Fetch.request('FMS010405SVC', 'sendBLADVI_GERP', {
      body: JSON.stringify({
        FMS010405G1: {
          data: sendType === 'multi' ? fetchDataAll : [item], // 단 건 전송이냐? 다중 건 전송이냐?
        },
      }),
    });

    if (result) {
      // 응답 값 state 셋팅! (공통)
      this.setState({
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
      });
      Util.openLoader(this.screenId, false);

      // 성공 / 살패에 따른 처리
      if (result.TYPE === 1) {
        // 재조회를 해줘야 최신의 EDI 상태값을 refresh한다.
        // fetch callback에서 최종 스피너 false 처리
        this.fetch();
      } else {
        // 특정 이벤트 발생 후 리턴 메시지 Alert로 보여주기!
        this._popResultAlert(result.MSG);
      }
    }
  }

  // 특정 이벤트 발생 후 리턴 메시지 Alert로 보여주기!
  // 우선은 오류나 실패할 경우만 팝업 알림 보여주기!
  _popResultAlert(msg) {
    Util.msgBox({
      title: 'EDI Send Error!',
      msg,
      buttonGroup: [
        {
          title: 'OK',
        },
      ],
    });
  }
  /**
   * EDI 전송 이벤트 <끝>
   */

  // 그리드에 조회된 EDI 송수신 상태 스타일 설정
  _getStatusTextStyle(themeStatus, docType, itemColumn) {
    if (docType === 'BLADVI') {
      if (
        itemColumn === 'ORG_SEND_COM' ||
        itemColumn === 'SEND_RTR_ING' ||
        itemColumn === 'RTR_TARGET' ||
        itemColumn === 'ORG_RESEND_COM'
      ) {
        return themeStatus.myPageStatusIng;
      } else if (itemColumn === 'COMPLETED') {
        return themeStatus.myPageStatusOn;
      } else if (itemColumn.indexOf('ERROR') > -1) {
        // ORG_ERROR, RTR_ERROR, CC_ERROR
        return themeStatus.myPageStatusError;
      } else if (itemColumn === 'CANCELED') {
        // 취소전송 성공 시 짙은 회색 음영 처리!
        return themeStatus.myPageStatusCancel;
      }
      return themeStatus.myPageStatusOff;
    }
    return themeStatus.myPageStatusOff;

    // 정해진 것이 아닌 커스터미아징이 필요할 경우
    // return {
    // height: 40,
    // }
  }

  // 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
  onMoreView = getRtnData => {
    // 리턴 된 값이 있을 경우만 setState 처리!
    if (!Util.isEmpty(getRtnData)) {
      this.setState({
        data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
      });
    }
  };

  // 조회조건 컴포넌트 설정
  renderHeader = () => (
    <View>
      <HDateSet
        label={'Shipping'}
        bindVar={{
          FROM_DATE: 'FMS010104.FROM_DATE',
          TO_DATE: 'FMS010104.TO_DATE',
          DATE_TYPE: 'FMS010104.DATE_TYPE',
        }}
        lDateNum={3}
        fDateNum={-1}
        tDateNum={0}
      />
      <HRow>
        <HTextfield label={'Arrival Port'} bind={'FMS010104.ARRIVAL_PORT'} editable />
        <HTextfield label={'H/M BL No.'} bind={'FMS010104.HMBL_NO'} editable />
        <HCombobox
          label={'EDI Status'}
          groupCode={'EDI_SEND_STATUS'}
          bindVar={{
            CD: 'FMS010104.SEND_TARGET_STATUS',
            NM: 'FMS010104.SEND_TARGET_STATUS_NAME',
          }}
          editable
        />
      </HRow>
    </View>
  );

  // 실제로 HBL 기준으로 데이터가 그려지기 위한 설정
  renderBody = (item, index) => {
    const { theme } = this.props.global;
    return (
      <Touchable
        style={{ flex: 1 }}
        activeOpacity={0.7}
        key={item.SR_CODE}
        onLongPress={() => this._sendEdiAlert(item, 'BLADVI')}
      >
        <HFormView style={{ marginTop: 2 }}>
          <HRow between>
            <HText
              value={item.HBL_NO}
              textStyle={{
                color: bluecolor.basicBlueImpactColor,
              }}
            />
            <HText value={item.MBL_NO} />
          </HRow>
          <HTextfield label={'Shipper'} value={item.SHIPPER_NAME} />
          <HTextfield label={'Consignee'} value={item.CONSIGNEE_NAME} />
          <HRow between>
            <HIcon name="flight-takeoff" iconType="M" />
            <HIcon name="flight-land" iconType="M" />
          </HRow>
          <HRow between>
            <HText value={item.DEPART_PORT} />
            <HText value={item.ARRIVAL_PORT} />
          </HRow>
          <HRow between style={{ marginTop: 0 }}>
            <HText value={item.ETD_DATE_TIME} />
            <HText value={item.ETA_DATE_TIME} />
          </HRow>
          <HRow between>
            <HText value={`${item.FLNT_NO} (${item.FLIGHT_STATUS})`} />
            <HText value={item.INV_NO} />
          </HRow>
          <HRow>
            <HNumberfield label={'Q`ty'} value={item.PKG_QTY} />
            <HNumberfield label={'G/W'} value={item.GW} />
            <HNumberfield label={'V/W'} value={item.VW} />
            <HNumberfield label={'C/W'} value={item.CW} />
          </HRow>
          <HRow leftAlign>
            <Touchable style={{ paddingRight: 5 }}>
              <HText
                textStyle={
                  item.H_CONFIRM_STATUS === 'Confirmed'
                    ? theme.myPageStatusOn
                    : theme.myPageStatusOff
                }
                adjustsFontSizeToFit={Platform.OS !== 'ios'}
                numberOfLines={1}
              >
                Confirm
              </HText>
            </Touchable>
            <Touchable
              style={{ paddingRight: 5 }}
              onPress={() => this._commonSendRecvHistoryChk(item, 'SHPREQ')}
            >
              <HText
                textStyle={
                  item.SHPREQ_RECV_YN === 'Y' ? theme.myPageStatusOn : theme.myPageStatusOff
                }
                adjustsFontSizeToFit={Platform.OS !== 'ios'}
                numberOfLines={1}
              >
                SHPREQ
              </HText>
            </Touchable>

            <Touchable
              style={{ paddingRight: 5 }}
              onPress={() => this._commonSendRecvHistoryChk(item, 'BLADVI')}
            >
              <HText
                textStyle={this._getStatusTextStyle(theme, 'BLADVI', item.SEND_STATUS)}
                adjustsFontSizeToFit={Platform.OS !== 'ios'}
                numberOfLines={1}
              >
                BLADVI
              </HText>
            </Touchable>
          </HRow>
        </HFormView>
      </Touchable>
    );
  };

  // 실제로 화면을 그려준다.
  render() {
    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * ActionButton 공통 컴포넌트 처리
     */
    const buttonGroup = [
      {
        title: 'Cancel All', // 필수사항
        iconName: 'send', // 필수사항 // FontAwesome
        param: 'BLADVI', // 선택사항
        onPress: (title, param) => {
          if (this.state.dataTotal.length > 0) {
            this._sendEdiMultiAlert(param, 'cancel');
          } else {
            Util.msgBox({
              title: 'Alert',
              msg: 'No search history.\nPlease search first.',
              buttonGroup: [
                {
                  title: 'OK',
                },
              ],
            });
          }
        },
      },
      {
        title: 'Send All', // 필수사항
        iconName: 'send', // 필수사항 // FontAwesome
        param: 'BLADVI', // 선택사항
        onPress: (title, param) => {
          if (this.state.dataTotal.length > 0) {
            this._sendEdiMultiAlert(param);
          } else {
            Util.msgBox({
              title: 'Alert',
              msg: 'No search history.\nPlease search first.',
              buttonGroup: [
                {
                  title: 'OK',
                },
              ],
            });
          }
        },
      },
      {
        title: 'Reset', // 필수사항
        iconName: 'undo', // 필수사항  // FontAwesome
        onPress: () => {
          this.setState({
            data: [],
            dataTotal: [],
            status: null,
          });
        },
      },
      {
        title: 'Search', // 필수사항
        iconName: 'search', // 필수사항 // FontAwesome
        onPress: () => {
          this.fetch();
        },
      },
    ];

    return (
      <HBaseView scrollable={false} buttonGroup={buttonGroup}>
        <HListView
          keyExtractor={item => item.SR_CODE}
          headerClose
          renderHeader={this.renderHeader}
          renderItem={({ item, index }) => this.renderBody(item, index)}
          onSearch={() => this.fetch()}
          onMoreView={this.onMoreView}
          // 그려진값
          data={this.state.data}
          // 조회된값
          totalData={this.state.dataTotal}
          // 하단에 표시될 메세지값
          status={this.state.status}
        />
      </HBaseView>
    );
  }
}

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
