/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
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
  HText,
  HDateSet,
  HTextfield,
  HCombobox,
  HButton,
} from 'ux';


import debounce from 'debounce';

// 메세지 푸쉬 리스트

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010109');

    // Component의 props의 값을 초기화시키는것
    // super가 부모Component

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      oldData: null,
    };
  }

  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다. mount되기전에 초기값 아래와 같이 세팅
    modelUtil.setModelData('ADM010109', {
      FROM_DATE: Util.getDateValue(null, -30),
      TO_DATE: Util.getDateValue(),
      APP_ID: 'G1MB',
    });
  }


  componentDidAppear() {
    this.fetch();
  }

  shouldComponentUpdate() {
    return true;
  }

  checkSearch() {
    // 라는 함수는..
    // 이유,,,사용자가 검색조건만 바꾸고 조회를 하지않은뒤, 삭제했을경우. 경고차원
    const searchData = modelUtil.getModelData('ADM010109');
    const oldSearchData = this.state.oldData;

    if (searchData !== oldSearchData) {
      Util.msgBox({
        title: 'Alert',
        msg: '먼저 조회 후 삭제해주세요',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return true;
      // 버튼누르면 return;
    }
    return false;
  }


  getParam(msgNo) {
    // 라는 함수는..
    let valueMsgNo = null;

    if (msgNo) {
      valueMsgNo = {
        MSG_NO: msgNo,
        APP_ID: modelUtil.getValue('ADM010109.APP_ID'),
      };
    } else {
      valueMsgNo = modelUtil.getModelData('ADM010109');
    }
    return valueMsgNo;
  }


  // 삭제 관련 코드
  async fetchDelete(msgNo) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!


    const result = await Fetch.request(
      'VTX010101SVC',
      'updateMsgList',
      // 요청이된다.
      {
        body: JSON.stringify({
          VTX010101F1: this.getParam(msgNo),
          // key로 넣어줌
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result.TYPE === 1) {
      this.fetch();
    } else {
      Util.msgBox({
        title: 'Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }

  // 화면을 조회한다.
  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request(
      'VTX010101SVC',
      'getPushMsgList',
      {
        body: JSON.stringify({
          VTX010101F1: modelUtil.getModelData('ADM010109'),
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!

    );

    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.VTX010101G1, env().listCnt);
      this.setState({
        dataTotal: result.VTX010101G1,
        data, // data: result.BAS010101G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
        oldData: modelUtil.getModelData('ADM010109'),
        // 실제 백단에서 가지고온 값을 세팅
      });
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 조회데이터 삭제 관련 코드.
  async deleteSerchedMsglist() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request(
      'VTX010101SVC',
      'updateSearchList', {
        body: JSON.stringify({
          VTX010101G1: {
            data: this.state.data,
          },
        }),
      });

    if (result.TYPE === 1) {
      Util.openLoader(this.screenId, false);
      this.fetch();
    } else {
      Util.openLoader(this.screenId, false);
      Util.msgBox({
        title: 'Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }
  // 조회데이터 삭제 관련 코드 끝


  // 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
  onMoreView = getRtnData => {
    // 리턴 된 값이 있을 경우만 setState 처리!
    if (!Util.isEmpty(getRtnData)) {
      this.setState({
        data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
      });
    }
  };

  // 리스트 헤더 화면
  renderHeader = () => (
    // jsx문법을 사용.
    <View>
      <HDateSet
        label={''}
        bindVar={{
          FROM_DATE: 'ADM010109.FROM_DATE',
          TO_DATE: 'ADM010109.TO_DATE',
          DATE_TYPE: 'ADM010109.DATE_TYPE',
        }}
        lDateNum={30}
        fDateNum={-1}
        tDateNum={0}
      />
      <HRow>
        <HTextfield label={'Search'} bind={'ADM010109.MSG_CONTENTS'} editable />
        <HCombobox
          style={{ alignSelf: 'flex-end' }}
          label={'Msg Type'}
          // groupCode={'MSG_TYPE'}
          // back단에서 조회 가능할수 있게 table..찾아보기..
          groupJson={[
            { DT_CODE: 'CHAT_MSG', LOC_VALUE: 'Message' },
            { DT_CODE: 'NOTICE_MSG', LOC_VALUE: 'Notice' },
          ]}
          // 백단안타는것
          codeField={'DT_CODE'}
          nameField={'LOC_VALUE'}
          bindVar={{
            CD: 'ADM010109.MSG_TYPE',
            NM: 'ADM010109.MSG_TYPE_NAME',
          }}
          // back단으로 가는 것
          editable
        />
      </HRow>
    </View>
  );

  // <View style={{alignSelf:'flex-end'}}>]
  renderBody = (item, index) => {
    const { theme } = this.props.global;
    return (
      <HFormView
        key={item.MSG_NO}
        style={{
          padding: 10,
          marginTop: 2,
          backgroundColor: item.MSG_TYPE === 'CHAT_MSG' ? bluecolor.basicWhiteColor : bluecolor.basicBlueColor }}
      >
        <HRow between>
          <HText
            value={item.TITLE}
            textStyle={item.MSG_TYPE === 'CHAT_MSG' ? styles.textBlue : styles.textWhite}
          />
          <HText
            value={item.ADD_DATE}
            textStyle={item.MSG_TYPE === 'CHAT_MSG' ? styles.dateBlue : styles.textWhite}
          />
        </HRow>
        <HRow>
          <HText
            style={{ marginTop: 3 }}
            value={item.MSG_CONTENTS}
            textStyle={item.MSG_TYPE === 'CHAT_MSG' ? styles.contentsBlue : styles.contentsWhite}
            rowflex={9}
          />
          <HButton
            onPress={() => this.fetchDelete(item.MSG_NO)}
            name={'remove'}
            // HButton에서 정의되어있다 .. 아이콘 명을 사용하면 해당 아이콘이 그려짐..
            bStyle={{
              paddingLeft: 0.5,
              paddingRight: 0.5,
              backgroundColor: bluecolor.basicSkyLightBlueTrans,
            }}
            rowflex={1}
            // flex는 화면에 꽉채우는 것,, 화면에 비율을 나눠줌
          />
        </HRow>
      </HFormView>
    );
  };


  // 실제로 화면을 그려준다.
  render() {
    const buttonGroup = [
      {
        title: 'Delete All', // 필수사항
        iconName: 'undo', // 필수사항 // FontAwesome
        // param: 'BLADVI', // 선택사항
        onPress: () => {
          if (this.checkSearch()) {
            return;
          }
          Util.msgBox({
            title: 'Delete',
            msg: '현재 조회된 메시지를 모두 삭제하시겠습니까?',
            buttonGroup: [
              {
                title: '조회된 메세지 삭제',
                onPress: () => { this.deleteSerchedMsglist(); },
              },
              {
                title: '모든 메세지 삭제',
                onPress: () => { this.fetchDelete(); },
              },
            ],
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

    // {this.fetchDelete}


    return (
      // jsx문법으로 화면을 그려주는것
      <HBaseView scrollable={false} buttonGroup={buttonGroup}>
        <HListView
        // 리스트로 조회되는 부분을 보여줌 HListView component
          keyExtractor={(item) => item.MSG_NO}
          // 유일키를 설정해줌
          headerClose={false}
          renderHeader={this.renderHeader}
          //
          renderItem={({ item, index }) => this.renderBody(item, index)}
          // 속성 프로퍼티 props.
          onSearch={() => this.fetch()}
          // 새로고침..(드래그했을때 동글동글 하고 실행해주게함)
          // 부모가 자식에게 메소드를 넘겨서 자식이 실행하게함.
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

const styles = StyleSheet.create({
  textWhite: {
    fontSize: 10.5,
    fontWeight: null,
    color: bluecolor.basicWhiteColorTrans,
  },
  textBlue: {
    fontSize: 10.5,
    fontWeight: null,
    color: bluecolor.basicBlueFontColor,
  },
  dateBlue: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: bluecolor.basicBlueImpactColor,
  },
  contentsWhite: {
    fontSize: 12,
    fontWeight: null,
    color: bluecolor.basicWhiteColorTrans,
    textAlignVertical: 'center',
  },
  contentsBlue: {
    fontSize: 12,
    fontWeight: null,
    color: bluecolor.basicBlueFontColor,
    textAlignVertical: 'center',
  },
});

/**
 * Define component styles
 */

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
});
// 전역변수를 쓰기위한 함수며, redux에 전달해주면 사용할수있다.


/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
// mapStateToProps와 Component를 export 시켜줌.

// 용어 , 기능  정확히 알고 설명
