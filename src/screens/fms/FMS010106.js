/* *
* Import Common
* */
import { View, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  bluecolor,
  Util,
  modelUtil,
  env,
} from 'libs';
import {
  Touchable,
  HBaseView,
  HListView,
  HFormView,
  HRow,
  HDateSet,
  HCheckbox,
  HTextfield,
  HNumberfield,
  HCombobox,
  HButton,
  HText,
  HIcon,
} from 'ux';
/* *
* Import node_modules
* */
/**
* 항공 수출 GSCL(CELLO) EDI 전송
*/
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'FMS010106');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      button: null,
      buttonType: null,
      orgType: null,
      HBL_NO: '',
      selList: [],
      currentIndex: null,
    };
  }
  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('FMS010106', {
      GR_DATE_FLAG: '',
      WH_EX_FLAG: 'N',
      UNLOAD_SPOT_SM: 'S',
      CONSIGNEE_SM: 'S',
      HBL_NO_SM: 'S',
      ETA_FLAG: 'Y',
      COMPANY_CODE: this.props.global.session.COMPANY_CODE,
      ETA_DATE_FROM: Util.getDateValue(null, -1),
      ETA_DATE_TO: Util.getDateValue(),
      // ETA_DATE_FROM: 20210201,
      // ETA_DATE_TO: 20210301,
      WH_CODE: '',
      HBL_NO: '',
      FLNT_NO: '',
      RECV_EX_FLAG: 'N',
      M_UNLOAD_SPOT: '',
      M_UNLOAD_EX_FLAG: 'N',
    });
  }
  async componentDidMount() {
    this.fetch();
  }
  shouldComponentUpdate() {
    return true;
  }
  // 화면을 조회한다.
  async fetch(sort) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    if (!Util.isEmpty(sort)) {
      modelUtil.setValue('FMS010106.HBL_NO', sort);
    } else {
      modelUtil.setValue('FMS010106.HBL_NO', this.state.HBL_NO);
    }
    // 대문자 변환
    modelUtil.setValue(
      'FMS010106.HBL_NO',
      modelUtil
        .getValue('FMS010106.HBL_NO')
        .toString()
        .toUpperCase(),
    );
    const result = await Fetch.request(
      'FMS040117SVC',
      'get',
      {
        body: JSON.stringify({
          FMS040117F1: modelUtil.getModelData('FMS010106'),
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );
    if (result.TYPE === 1) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.FMS040117G1, env().listCnt);
      this.setState({
        dataTotal: result.FMS040117G1,
        data, // data: result.FMS040117G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
        HBL_NO: '',
      });
      if (!Util.isEmpty(sort)) {
        this.changeColor(result.FMS040117G1[0], 'Y');
      }
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        dataTotal: [],
        data: [],
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.msgBox({
        title: 'Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      Util.openLoader(this.screenId, false);
    }
  }
  /**
* EDI 전송
* parameters
* - item : 조회된 내역 중 선택된 행의 데이터 (단, 전체 전송은 "null" 처리)
* - orgType : 일반(원본,재전송) or 취소 전송 구분
* */
  // EDI 단건 전송
  async _sendEdi(item, sendType) {
    let orgType = null;
    if (sendType === 'single') {
      orgType = item[0].CARREQ_SEND_TYPE;
    }


    if (Util.isEmpty(orgType)) {
      Util.msgBox({
        title: 'alert',
        msg: '전송상태가 입력되지 않았습니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              console.log('cancel');
            },
          },
        ],
      });
      return;
    }
    if (orgType === '0') {
      Util.msgBox({
        title: 'alert',
        msg: '전송 불가한 상태값입니다. 다시 확인 부탁드립니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              console.log('cancel');
            },
          },
        ],
      });
      return;
    }
    if (item.CARREQ_ACK_TYPE === 'CFM') {
      Util.msgBox({
        title: 'alert',
        msg: '전송할 수 없는 수신상태값입니다. 내용을 확인하여 주시기 바랍니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              console.log('cancel');
            },
          },
        ],
      });
    }
    // 전송상태값 입력
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const itemSendInfo = item;
    itemSendInfo.CARREQ_SEND_TYPE = orgType;
    const result = await Fetch.request('FMS040117SVC', 'sendAIRCIS', {
      body: JSON.stringify({
        FMS040117G1: {
          data: itemSendInfo,
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
        this.fetch();
      } else {
        Util.msgBox({
          title: 'EDI Send Error!',
          msg: result.MSG,
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });
      }
    }
  }

  // EDI 그룹 전송 시 그룹넘버를 백단에서 받아오기 위한 작업
  async _saveGroupEdi(item, ORG_FLAG) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const itemSendInfo = item;
    // itemSendInfo.CARREQ_SEND_TYPE = orgType;
    const result = await Fetch.request('FMS040117SVC', 'saveGroupno', {
      body: JSON.stringify({
        FMS040117G1: {
          data: itemSendInfo,
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
        this._sendGroupEdi(result.AIRCIS_GROUP_NO, ORG_FLAG);
      } else {
        Util.msgBox({
          title: 'EDI Send Error!',
          msg: result.MSG,
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });
      }
    }
  }

  // EDI 그룹 전송
  async _sendGroupEdi(groupNo, ORG_FLAG) {
    // 전송상태값 입력
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const userName = this.props.global.session.USER_NAME_LOC;
    const headerValue = modelUtil.getModelData('FMS010106');
    const result = await Fetch.request('FMS040117SVC', 'sendAIRCISGroup', {
      body: JSON.stringify({
        FMS040117F1: {
          AIRCIS_GROUP_NO: groupNo,
          FROM_DATE: headerValue.ETA_DATE_FROM,
          TO_DATE: headerValue.ETA_DATE_TO,
          ORG_FLAG,
          RECIPIENT_NAME: userName,
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
        this.fetch();
      } else {
        Util.msgBox({
          title: 'EDI Send Error!',
          msg: result.MSG,
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });
      }
    }
  }

  // 바코드 스캔 처리 로직
  focusNextField(scanData) {
    this.barcode1.clear();
    const barcode1Data = this.barcode1._lastNativeText;
    if (!Util.isEmpty(scanData)) {
      this.fetch(scanData);
    } else {
      this.fetch(barcode1Data);
    }
  }

  // 전송상태값 자동 계산
  sendType(item) {
    let buttonType = null;
    // EDI 정상 전송
    if (item.CARREQ_SEND_TYPE === '9') {
      if (Util.isEmpty(item.CARREQ_ACK_TYPE)) {
        buttonType = { orgType: '9' };
      } else if (item.CARREQ_ACK_TYPE === 'SEND' || item.CARREQ_ACK_TYPE === '99' || item.CARREQ_ACK_TYPE === 'REC' || item.CARREQ_ACK_TYPE === 'CFM') {
        buttonType = { orgType: '0' };
      } else if (item.CARREQ_ACK_TYPE === 'REF') {
        buttonType = { orgType: '9' };
      } else {
        buttonType = { orgType: '0' };
      }
    } else if (item.CARREQ_SEND_TYPE === '3') {
      if (item.CARREQ_ACK_TYPE === 'SEND' || item.CARREQ_ACK_TYPE === '99' || item.CARREQ_ACK_TYPE === 'REF') {
        buttonType = { orgType: '0' };
      } else if (item.CARREQ_ACK_TYPE === 'REC') {
        buttonType = { orgType: '9' };
      } else {
        buttonType = { orgType: '0' };
      }
    } else {
      buttonType = { orgType: '0' };
    }
    return buttonType;
  }

  // EDI 전송 전 알림 표시
  // LongPress 적용
  _sendEdiAlert(sendType) {
    const dataList = this.state.data;
    const selectList = this.state.selList;
    for (let i = 0; i < dataList.length; i++) {
      if (dataList[i].CLICK_YN === 'Y') {
        const orgType = this.sendType(dataList[i]).orgType;
        // orgType을 구해준다.
        dataList[i].CARREQ_SEND_TYPE = orgType;
        selectList.push(dataList[i]);
      }
    }

    // 다중 전송시, 그룹번호 유무로 전송, 재전송을 구분해 준다.(그룹전송번호가 있다면 재전송, 없다면 전송)
    // 기존에 그룹전송을 한 이력이 있으면, 그룹전송 번호가 생성되어 조회된다.
    let ORG_FLAG = null;
    if (sendType !== 'single') {
      if (Util.isEmpty(selectList[0].AIRCIS_GROUP_NO)) {
        ORG_FLAG = 9;
        selectList.ORG_FLAG = 9;
      } else {
        ORG_FLAG = 35;
        selectList.ORG_FLAG = 35;
      }
    }


    this.setState({
      selList: selectList,
    });

    if (sendType === 'single') {
      if (selectList.length > 1) {
        Util.msgBox({
          title: 'alert',
          msg: '전송하려는 값이 여러개입니다. EDI 그룹전송을 이용해주세요',
          buttonGroup: [
            {
              title: '확인',
            },
          ],
        });
        this.setState({
          selList: [],
        });
        return;
      }
    }

    // 단건 전송일떄
    if (sendType === 'single') {
      Util.msgBox({
        title: 'alert',
        msg: ` BL NO: ${selectList[0].HBL_NO} 에 전송을 진행하시겠습니까?`,
        buttonGroup: [
          {
            title: 'EDI 전송하기 ',
            onPress: () => this._sendEdi(selectList, 'single'),
          },
          {
            title: '돌아가기',
          },
        ],
      });
    }

    // 그룹 전송일 떄,
    if (sendType !== 'single') {
      Util.msgBox({
        title: 'alert',
        msg: `${selectList.length}개의 그룹전송을 진행하시겠습니까?`,
        buttonGroup: [
          {
            title: 'EDI 그룹전송하기',
            onPress: () => this._saveGroupEdi(selectList, ORG_FLAG),
          },
          {
            title: '돌아가기',
          },
        ],
      });
    }
  }

  onClick(item) {
    if (Util.isEmpty(item.CLICK_YN) || item.CLICK_YN === 'N') {
      this.changeColor(item, 'Y');
    } else {
      this.changeColor(item, 'N');
    }
  }

  changeColor(item, param) {
    const checkData = this.state.data.map(data => {
      if (item.SR_CODE === data.SR_CODE) {
        return { ...data, CLICK_YN: param };
      }
      return data;
    });
    this.setState({ data: checkData });
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

onBarcodePopup() {
  const { navigator } = this.props;
  Navigation(
    navigator,
    'com.layout.ComBarcode',
    {
      onBarcodeScan: result => this.focusNextField(result),
    },
    'Barcode Scan',
  );
}
// 리스트 헤더 화면
renderHeader = () => (
  <View>
    <HDateSet
      label={''}
      bindVar={{
        FROM_DATE: 'FMS010106.ETA_DATE_FROM',
        TO_DATE: 'FMS010106.ETA_DATE_TO',
        DATE_TYPE: 'FMS010106.DATE_TYPE',
      }}
      lDateNum={3}
      fDateNum={-1}
      tDateNum={0}
    />
    <HRow>
      <HTextfield label={'하기장소'} bind={'FMS010106.M_UNLOAD_SPOT'} editable />
      <HCheckbox label={'제외'} bind={'FMS010106.M_UNLOAD_EX_FLAG'} editable />
      <HCombobox
        label={'수신 상태'}
        groupCode={'AIRCIS_RECV_TYPE'}
        bindVar={{
          CD: 'FMS010106.AIRCIS_RECV_TYPE',
          NM: 'FMS010106.AIRCIS_RECV_TYPE_NAME',
        }}
        editable
      />
      <HCheckbox label={'제외'} bind={'FMS010106.RECV_EX_FLAG'} editable />
    </HRow>
    <HRow>
      <TextInput
        style={(styles.barcodeInput, { flex: 1 })}
        ref={c => {
          this.barcode1 = c;
        }}
        placeholder="H/M BL No"
        onChangeText={HBL_NO => this.setState({ HBL_NO })}
        value={this.state.HBL_NO}
        // autoFocus={this.state.GI_STATUS !== 'F'}
        blurOnSubmit={false}
        keyboardType="email-address"
        onSubmitEditing={() => {
          this.focusNextField();
        }}
      />
      <HTextfield label={'편명'} bind={'FMS010106.FLNT_NO'} editable />
      <HCombobox
        label={'출고 창고'}
        groupCode={'SP8943'}
        codeField={'DT_CODE'}
        nameField={'LOC_VALUE'}
        bindVar={{
          CD: 'FMS010106.WH_CODE',
          NM: 'FMS010106.WH_NAME',
        }}
        sql={modelUtil.getModelData('FMS010106')}
        editable
      />
    </HRow>
  </View>
);
renderBody = (item) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => this.onClick(item)}
    // disabled={this.sendType(item).orgType === '0'}
  >
    <HFormView
      key={item.SR_CODE}
      style={[
        item.CLICK_YN === 'Y' ? { backgroundColor: bluecolor.basicBluelightColor } : null,
        { flex: 1,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: 'rgba(212,212,212,0.6)',
          paddingTop: 3 }]
      }
    >
      <HRow>
        <Text style={{ fontSize: 12, color: bluecolor.basicBlueFontColor, fontWeight: 'bold', alignItems: 'stretch', alignSelf: 'flex-end' }}>
          {item.HBL_NO}
        </Text>
        <Text style={{ fontSize: 13, color: bluecolor.basicBlueFontColor, marginStart: 10, alignSelf: 'center' }}>
          {item.FLNT_NO}
        </Text>
        <Text style={{ fontSize: 13, color: bluecolor.basicBlueFontColor }}>
          {item.PKG_QTY} / {item.GW}
        </Text>
        <Text style={{ fontSize: 10, color: bluecolor.basicBlueFontColor }}>
            ({item.CONSIGNEE_PLANT_NAME}) {item.CONSIGNEE_NAME}
        </Text>
      </HRow>
      <View style={styles.spaceAroundStyle}>
        {
          Util.isEmpty(item.CARREQ_STATUS_INFO) || Util.isEmpty(item.CARREQ_ACK_TYPE_DESC) ?
            <Text style={{ fontSize: 13, color: bluecolor.basicBlueFontColor }}>
              {item.CARREQ_ACK_TYPE_DESC} {item.CARREQ_STATUS_INFO}
            </Text> :
            <Text style={{ fontSize: 13, color: bluecolor.basicBlueFontColor }}>
              {item.CARREQ_ACK_TYPE_DESC}/ {item.CARREQ_STATUS_INFO}
            </Text>
        }
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Util.barcodeBox(item.AIRCIS_GROUP_NO)}
        >
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: bluecolor.basicBlueFontColor }}>
            {item.AIRCIS_GROUP_NO}
          </Text>
        </TouchableOpacity>
      </View>
    </HFormView>
  </TouchableOpacity>
);
// 실제로 화면을 그려준다.
render() {
/**
* 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
* ActionButton 공통 컴포넌트 처리
*/
  const buttonGroup = [
    {
      title: 'Search', // 필수사항
      iconName: 'search', // 필수사항 // FontAwesome
      onPress: () => {
        this.fetch();
      },
    },
    {
      title: 'send', // 필수사항
      iconName: 'send', // 필수사항 // FontAwesome
      onPress: () => {
        this._sendEdiAlert('single'); // 단건전송
        this.setState({
          selList: [],
        });
        //  this._sendEdiAlert(item, this.sendType(item).orgType)
      },
    },
    {
      title: 'send All', // 필수사항
      iconName: 'send', // 필수사항 // FontAwesome
      onPress: () => {
        this._sendEdiAlert(); // 그룹전송
        this.setState({
          selList: [],
        });
      },
    },
  ];
  return (
    <HBaseView scrollable={false} buttonGroup={buttonGroup}>
      <HListView
        keyExtractor={(item) => item.SR_CODE}
        headerClose={false}
        renderHeader={this.renderHeader}
        renderItem={({ item }) => this.renderBody(item)}
        onSearch={() => this.fetch()}
        onMoreView={this.onMoreView}
        // 그려진값
        data={this.state.data}
        // 조회된값
        totalData={this.state.dataTotal}
        // 하단에 표시될 메세지값
        status={this.state.status}
      />
      {/* 바코드 스캔입력부분 제어 */}
      <Touchable
        style={styles.searchButton}
        underlayColor={'rgba(63,119,161,0.8)'}
        onPress={() => this.onBarcodePopup()}
      >
        <HIcon name="barcode" size={20} color="#fff" />
      </Touchable>
    </HBaseView>
  );
}
}
/**
* Define component styles
*/
const styles = StyleSheet.create({
  ResultAlerttext: {
    alignSelf: 'center',
    fontSize: 13,
    color: bluecolor.basicBlueColor,
    fontWeight: 'bold',
  },
  ResultAlertText: {
    color: 'rgba(92,94,94,0.5)',
    fontWeight: '900',
  },
  searchButton: {
    backgroundColor: 'rgba(52,152,219,0.8)',
    borderColor: 'rgba(52,152,219,0.8)',
    borderWidth: 1,
    height: 50,
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 200,
    right: 20,
    shadowColor: '#3f77a1',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
  spaceAroundStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
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
