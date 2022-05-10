/* *
 * Import Common
 * */
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  NavigationScreen,
  bluecolor,
  Util,
  modelUtil,
  env,
  Navigation,
} from 'libs';
import {
  HBaseView,
  HListView,
  HFormView,
  HRow,
  HText,
  HDateSet,
  HTextfield,
  HIcon,
} from 'ux';


class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010114');

    // super가 부모Component
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      dispartMem: null,
      ROOM_ID: this.props.ROOM_ID,
      room_member: null,
    };
  }

  componentWillMount() {
    const title = modelUtil.getValue('ADM010114.VOTE_TITLE');
    // 모델에 데이터를 set해주면 모델을 쓸수 있다. mount되기전에 초기값 아래와 같이 세팅
    modelUtil.setModelData('ADM010114', {
      FROM_DATE: Util.getDateValue(null, -100),
      TO_DATE: Util.getDateValue(),
      VOTE_TITLE: title,
      ROOM_ID: this.props.ROOM_ID,
    });

    // this.getChattingMember();
  }


  componentDidAppear() {
    this.fetch();
  }

  shouldComponentUpdate() {
    return true;
  }

  // 투표 미참여 인원 가져오기
  async getChattingMember(item) {
    const result = await Fetch.request('VTX010102SVC', 'getChattingMember', {
      body: JSON.stringify({
        VTX010102F1: {
          ROOM_ID: this.state.ROOM_ID,
          VOTE_ID: item.VOTE_ID,
        },
      }),
    });

    if (result.TYPE === 1) {
      this.sendVoteNotice(item, result.VTX010102F1);
    }
  }


  // 투표리스트 조회
  async fetch() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('VTX010102SVC', 'getVoteList', {
      body: JSON.stringify({
        VTX010102F1: modelUtil.getModelData('ADM010114'),
      }),
    },
    );

    if (result.TYPE === 1) {
      const data = Util.getArrayData(result.VTX010102G1, env().listCnt);
      this.setState({
        dataTotal: result.VTX010102G1,
        data,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
      });
      Util.openLoader(this.screenId, false);
    } else {
      Util.openLoader(this.screenId, false);
      Util.toastMsg(result.MSG);
    }
  }

  // 투표 완료 여부 업데이트
  async updateVoteComplete(data) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    console.log(data);
    const result = await Fetch.request(
      'VTX010102SVC',
      'updateVoteComplete',
      {
        body: JSON.stringify({
          VTX010102F1: data,
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

  // 투표 카운팅 내역 조회
  async selResult(item) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request(
      'VTX010102SVC',
      'getSelectResult',
      {
        body: JSON.stringify({
          VTX010102G1: item,
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result.TYPE === 1) {
      const textMessage = '투표 종료(Vote Complete):';
      item.msgType = 'VoteResult';
      this.passVoteMessage(item, textMessage, result.VTX010102G1);
    }
  }

  // 채팅방에 투표 내용 전달(결과 공지 및 투표 재촉)
  sendVoteNotice(item, disVotPart) {
    // 투표재촉 N : 투표 완료 , Y: 투표 재촉
    if (item.VOTE_STATUS === 'Y') {
      const textMessage = '투표 재알림(Vote Notice):';
      item.disVotPart = disVotPart;
      item.msgType = 'PressToVote';
      this.passVoteMessage(item, textMessage);
    } else {
      this.selResult(item);
    }
  }

  passVoteMessage(item, textMessage, selResult) {
    const content = `${textMessage} ${item.VOTE_TITLE}`;

    this.props.onClicked(item, content, selResult);
    Navigation(this.props.componentId, 'POP');
  }

  // 투표 완료 항목에 대해 update진행
  voteCompleteYN(item) {
    item.VOTE_CLOSE_DATE = Util.replaceAll(item.VOTE_CLOSE_DATE, '-', '');
    item.VOTE_CLOSE_TIME = Util.replaceAll(item.VOTE_CLOSE_TIME, ':', '');
    item.ROOM_ID = this.props.ROOM_ID;

    this.updateVoteComplete(item);
  }

  // 투표하기 이동
  moveVote(item) {
    const { navigator } = this.props.global;
    Navigation(
      navigator,
      'screen.ADM010115',
      {
        ROOM_ID: this.props.ROOM_ID,
        ROOM_NAME: this.props.ROOM_NAME,
        VOTE_ID: item.VOTE_ID,
        VOTE_TITLE: item.VOTE_TITLE,
        VOTE_CLOSE_DATE: item.VOTE_CLOSE_DATE,
        VOTE_CLOSE_TIME: item.VOTE_CLOSE_TIME,
        PHOTO_PATH: item.PHOTO_PATH,
        MULTIPLE_YN: item.MULTIPLE_YN,
        ANONY_YN: item.ANONY_YN,
        VOTE_STATUS: item.VOTE_STATUS,
        visibleTabCntr: this.state.visibleTabCntr,
        // 여기
        voteCompleteNotice: (data) => this.selResult(data),
      },
      '투표하기',
    );
  }


  // 투표생성하기
  onCreateVote() {
    const { navigator } = this.props;
    Navigation(
      navigator,
      'screen.ADM010116',
      {
        ROOM_ID: this.props.ROOM_ID,
        ROOM_NAME: this.props.ROOM_NAME,
        passVoteCreate: (item) => this.passVoteCreate(item),
      },
      '투표생성하기',
    );
  }

  passVoteCreate(item) {
    const contents = `투표 생성(Vote Create): ${item.VOTE_TITLE}`;
    item.msgType = 'VoteStartNotice';
    this.props.onClicked(item, contents);
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

  // 리스트 헤더 화면
  renderHeader = () => (
    // jsx문법을 사용.
    <View>
      <HDateSet
        label={''}
        bindVar={{
          FROM_DATE: 'ADM010114.FROM_DATE',
          TO_DATE: 'ADM010114.TO_DATE',
          DATE_TYPE: 'ADM010114.DATE_TYPE',
        }}
        lDateNum={31}
        fDateNum={-1}
        tDateNum={0}
      />
      <HTextfield label={'Search'} bind={'ADM010114.VOTE_TITLE'} editable />
    </View>
  );

  // <View style={{alignSelf:'flex-end'}}>]
  renderBody = (item, index) => {
    const user = this.props.global.session.USER_ID;
    const { theme } = this.props.global;
    return (
      <TouchableOpacity onPress={() => this.moveVote(item)}>
        <HFormView key={item.VOTE_ID} style={item.VOTE_STATUS === 'Y' ? styles.listItemContainer : styles.listItemContainergray}>
          <View style={styles.iconContainer}>
            {item.PHOTO_PATH === '' || null ?
              (<HIcon
                name="face"
                iconType="M"
                size={55}
              />) :
            // VOTE_STATUS상태값이 완료(T) 인 경우 image를 회색조처리 하기위하여 2번 사용함
            // 1개의 Image componet를 사용하여 tint처리 할 시 image 위에 tint처리 되지 않음
              (<View>
                <Image
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: 40,
                    borderWidth: 0.5,
                    tintColor: item.VOTE_STATUS === 'N' ? 'rgba(212,212,212,0.9)' : null,
                  }}
                  source={{
                    uri: `${item.PHOTO_PATH}`,
                  }}
                />
                <Image
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: 40,
                    borderWidth: 0.5,
                    position: 'absolute',
                    opacity: item.VOTE_STATUS === 'N' ? 0.2 : null,
                  }}
                  source={{
                    uri: `${item.PHOTO_PATH}`,
                  }}
                />
              </View>)
            }
          </View>
          <View style={styles.contentsContainer}>
            <View style={styles.ContainerWrap}>
              <View style={styles.mainContainer}>
                <HRow style={styles.startDate}>
                  <HText
                    textStyle={{
                      color: 'rgba(92, 94, 94, 0.5)',
                      fontSize: 11.5,
                    }}
                    value={item.ADD_DATE}
                  />
                </HRow>
                <HText
                  textStyle={{
                    color: bluecolor.basicBlueFontColorTrans,
                    fontWeight: 'bold',
                    fontSize: 15,
                  }}
                  value={item.VOTE_TITLE}
                />
                <HRow>
                  {item.VOTE_STATUS === 'N' ? (
                    <HText value={`투표 마감 예정 일자: ${item.VOTE_CLOSE_DATE} ${item.VOTE_CLOSE_TIME}`} />
                  ) : (
                    // 현재시간을 받아와야함
                    <HText value={`투표 마감 예정 일자: ${item.VOTE_CLOSE_DATE} ${item.VOTE_CLOSE_TIME}`} />
                  )}
                </HRow>
                <HRow>
                  <HText value={`${item.TOTAL_VT_CT} / ${item.TOTAL_MEMBER_LIST}명 참여중..`} />
                  <HText value={item.VOTE_STATUS === 'N' ? '진행완료' : '진행중..'} textStyle={item.VOTE_STATUS === 'F' ? { color: 'red' } : null} />
                </HRow>
                {
                  user === item.ADD_USER_ID ? (
                    <HRow>
                      {
                        // 유저가 투표생성자 이며, 투표 '완료' 상태일떄 결과 공지 가능
                        item.VOTE_STATUS === 'N' ?
                          (
                            <HRow style={{ justifyContent: 'space-around' }}>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.ResultAlertButton}
                                onPress={() => this.getChattingMember(item)}
                              >
                                <Text style={styles.ResultAlerttext}>{ '결과 공지' }</Text>
                              </TouchableOpacity>
                            </HRow>
                          ) : (
                            <HRow>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.voteButton}
                                onPress={() => this.getChattingMember(item)}
                              >
                                <Text style={styles.votetext}>{ '투표 재촉' }</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.ResultButton}
                                onPress={() => this.voteCompleteYN(item)}
                              >
                                <Text style={styles.ResultAlerttext}>{ '투표 마감' }</Text>
                              </TouchableOpacity>
                            </HRow>
                          )
                      }
                    </HRow>
                  ) : (
                    <View style={{ justifyContent: 'space-around', paddingBottom: 18, paddingTop: 8 }} />
                  )

                }
              </View>
            </View>
          </View>
        </HFormView>
      </TouchableOpacity>
    );
  };


  // 실제로 화면을 그려준다.
  render() {
    const buttonGroup = [
      {
        title: 'Create Vote', // 필수사항
        iconName: 'plus', // 필수사항 // FontAwesome
        onPress: () => {
          this.onCreateVote();
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
          keyExtractor={(item) => item.VOTE_ID}
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
  startDate: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginBottom: 1,
  },
  listItemContainergray: {
    backgroundColor: 'rgba(212,212,212,0.9)',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginBottom: 1,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  contentsContainer: {
    flex: 5,
    borderBottomColor: 'rgba(92,94,94,0.5)',
    borderBottomWidth: 0.4,
  },
  ContainerWrap: {
    marginTop: 0,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  mainContainer: {
    alignItems: 'flex-start',
    alignContent: 'space-between',
    flex: 1,
  },
  voteButton: {
    margin: 10,
    marginLeft: 30,
    flex: 0.7,
    width: 120,
    height: 35,
    backgroundColor: bluecolor.basicBlueColor,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  ResultButton: {
    margin: 10,
    marginLeft: 10,
    flex: 0.7,
    width: 120,
    height: 35,
    borderRadius: 20,
    borderColor: bluecolor.basicBlueColor,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    // text 상하 정렬
    alignItems: 'center',
    // text 좌우 정렬
    justifyContent: 'center',
    alignContent: 'center',
  },
  ResultAlertButton: {
    margin: 10,
    marginLeft: 30,
    flex: 0.7,
    width: 120,
    height: 35,
    borderRadius: 20,
    borderColor: bluecolor.basicBlueColor,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    // text 상하 정렬
    alignItems: 'center',
    // text 좌우 정렬
    justifyContent: 'center',
    alignContent: 'center',
  },
  votetext: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ResultAlertText: {
    color: 'rgba(92,94,94,0.5)',
    fontWeight: '900',

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
