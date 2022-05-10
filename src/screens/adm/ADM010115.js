/* *
 * Import Common
 * */
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { _, React, Redux, Fetch, NavigationScreen, bluecolor, Util } from 'libs';
import {
  HBaseView,
  HText,
  HIcon,
  HListView,
} from 'ux';

/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 *  Common Component ADM010115! - AE GSCL(CELLO) EDI List
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010115');

    const user = this.props.global.session;

    this.state = {
      VOTE_ID: props.VOTE_ID,
      ROOM_ID: props.ROOM_ID,
      VOTE_TITLE: null,
      VOTE_CLOSE_DATE: null,
      VOTE_CLOSE_TIME: null,
      PHOTO_PATH: props.PHOTO_PATH,
      MULTIPLE_YN: null,
      ANONY_YN: null,
      VOTE_STATUS: null,
      ADD_USER_ID: user.USER_ID,
      ADD_USER_NAME: user.ADD_USER_NAME,
      TOTAL_VT_CT: 0,
      TOTAL_MEMBER_LIST: 0,
      VOTE_COMPLETE: null,
      room_member: null,
      data: [],
      dataTotal: [],
      participant: [],
      vote_member: [],
    };
  }

  componentWillMount() {
    this.fetchChatMember();
  }

  componentDidMount() {
    this.fetchContents();
  }

  shouldComponentUpdate() {
    return true;
  }

  // 화면 조회
  async fetchContents() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('VTX010102SVC', 'getVoteStatus', {
      body: JSON.stringify({
        VTX010102F1: this.state }),
    });

    Util.openLoader(this.screenId, false);
    if (result) {
      if (result.VTX010102F1.RE1 && result.VTX010102F1.RE1.length >= 1) {
        const voteStatusResult = result.VTX010102F1.RE1;
        // 정해진 데이터만 보여준다.
        this.setState({
          dataTotal: voteStatusResult,
          data: result.VTX010102F1.RE1,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
          VOTE_TITLE: voteStatusResult[0].VOTE_TITLE,
          VOTE_CLOSE_DATE: voteStatusResult[0].VOTE_CLOSE_DATE,
          VOTE_CLOSE_TIME: voteStatusResult[0].VOTE_CLOSE_TIME,
          MULTIPLE_YN: voteStatusResult[0].MULTIPLE_YN,
          ANONY_YN: voteStatusResult[0].ANONY_YN,
          TOTAL_VT_CT: voteStatusResult[0].TOTAL_VT_CT,
          VOTE_STATUS: voteStatusResult[0].VOTE_STATUS,
        });

        this.checkVoteStatus(result);
      } else {
        this.setState({ status: null });
        Util.msgBox({
          title: 'Alert',
          msg: '투표정보가 없습니다.',
          buttonGroup: [
            {
              title: 'OK',
            },
          ],
        });
      }
    } else {
      this.setState({ status: null });
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

  // 채팅 멤버 가져오기
  async fetchChatMember() {
    const result = await Fetch.request('VTX010101SVC', 'getChatMember', {
      body: JSON.stringify({
        VTX010101F1: {
          ROOM_ID: this.state.ROOM_ID,
        },
      }),
    });

    this.setState({
      room_member: result.VTX010101F1,
    });
  }

  // 투표 관련 코드
  async updateVote() {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request(
      'VTX010102SVC',
      'updateVoteStatus',
      // 요청이된다.
      {
        body: JSON.stringify({
          VTX010102G1: { data: this.state.data },
          // key로 넣어줌
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result.TYPE === 1) {
      this.fetchContents();
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

  // 투표 관련 코드
  async deleteVote() {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request(
      'VTX010102SVC',
      'deleteVoteStatus',
      // 요청이된다.
      {
        body: JSON.stringify({
          VTX010102G1: { data: this.state.data },
          // key로 넣어줌
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result.TYPE === 1) {
      this.fetchContents();
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

  // 투표 멤버 가져오기
  async fetchMember(item, index) {
    const result = await Fetch.request('VTX010102SVC', 'getMember', {
      body: JSON.stringify({
        VTX010102F1: {
          VOTE_ID: item.VOTE_ID,
          VOTE_SEQ: index,
        },
      }),
    });

    const Parti = result.VTX010102G1.map(item => item.USER_NAME_LOC);
    const participant = Parti.join(', ');
    console.log(participant);

    this.setState({
      vote_member: participant,
    });
  }


  async onOpenMenu(item, index) {
    console.log(item, index);
    await this.fetchMember(item, index);

    Util.msgBox({
      title: '투표참여자',
      msg: this.state.vote_member,
      buttonGroup: [
        {
          title: 'OK',
        },
      ],
    });
  }

  changeColor(item, param) {
    const voteCT = this.state.data.map(data => {
      if (item.VOTE_SEQ === data.VOTE_SEQ) {
        return { ...data, STATUS_YN: param };
      }
      return data;
    });
    this.setState({ data: voteCT });
  }

  onPress(item) {
    if (this.state.MULTIPLE_YN === 'Y') {
      // 중복 투표 가능
      if (item.STATUS_YN === 'Y') {
        this.changeColor(item, 'N');
      } else {
        this.changeColor(item, 'Y');
      }
    } else {
      // 중복 투표 불가능
      const voteCT = this.state.data.map(data => {
        if (item.VOTE_SEQ === data.VOTE_SEQ) {
          return { ...data, STATUS_YN: 'Y' };
        }
        return { ...data, STATUS_YN: 'N' };
      });
      this.setState({ data: voteCT });
    }
  }

  checkVoteStatus(param) {
    if (param.VTX010102F1.RE1.every((data) => data.VOTE_USER_ID === '' || null)) {
      this.setState({ VOTE_COMPLETE: false });
    } else {
      this.setState({ VOTE_COMPLETE: true });
    }
    this.countTotalMember(param);
  }


  onVoting() {
    if (this.state.VOTE_COMPLETE === false) {
      if (this.state.data.every((data) => data.STATUS_YN === 'N')) {
        console.log('선택된 값이 없습니다.');
        return;
      }
      this.setState({ VOTE_COMPLETE: true });
      this.updateVote();
    } else {
      this.setState({ VOTE_COMPLETE: false, STATUS_YN: 'N' });
      this.deleteVote();
    }
  }

  countTotalMember(param) {
    const memberList = this.state.room_member;
    const arrayMember = memberList.split([',']);
    const memLenght = arrayMember.length;
    this.setState({ TOTAL_MEMBER_LIST: memLenght });

    this.getParticipant(param);
  }

  getParticipant(param) {
    const member = this.state.room_member;
    const memberList = member.split(',');
    const voteParti = param.VTX010102F1.RE2.map(item => item.USER_NAME_LOC);

    const participant = memberList.filter(val => !voteParti.includes(val));
    const disVotPart = participant.join(', ');
    this.setState({ participant: disVotPart });
    Util.openLoader(this.screenId, false);
  }

  renderBody = (item, index) => (
    <TouchableOpacity
      style={[styles.innerContainer, item.STATUS_YN === 'Y' ? { backgroundColor: bluecolor.basicBlueColorTrans } : null]}
      onPress={() => this.onPress(item, index)}
      disabled={this.state.VOTE_COMPLETE === true || item.VOTE_STATUS === 'N'}
    >
      <View style={styles.rowContainer}>
        <HText value={item.VOTE_CONTENTS} textStyle={styles.contentsText} />
        <TouchableOpacity
          disabled={this.state.ANONY_YN === 'Y' || item.VOTE_SELECT_CT === 0}
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}
          onPress={() => this.onOpenMenu(item, index)}
        >
          <HIcon
            name="users"
            size={18}
          />
          <HText value={item.VOTE_SELECT_CT === 0 ? '0' : item.VOTE_SELECT_CT} textStyle={styles.contentsText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // 실제로 화면을 그려준다.
  render() {
    const { theme } = this.props.global;

    return (
      <HBaseView spinner={this.state.spinner}>
        <View style={styles.listItemContainer}>
          <View style={styles.iconContainer}>
            {this.state.PHOTO_PATH === '' || null ?
              (<HIcon
                name="face"
                iconType="M"
                size={55}
              />) :
              (
                <Image
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: 40,
                    borderWidth: 0.5,
                  }}
                  source={{
                    uri: `${this.state.PHOTO_PATH}`,
                  }}
                />)
            }
          </View>
          <View style={styles.contentsContainer}>
            <View style={styles.ContainerWrap}>
              <View style={styles.mainContainer}>
                <HText
                  textStyle={{
                    color: bluecolor.basicBlueFontColorTrans,
                    fontWeight: 'bold',
                    fontSize: 19,
                  }}
                  value={this.state.VOTE_TITLE}
                />
                <HText
                  textStyle={{
                    fontSize: 15,
                  }}
                  value={`투표 마감 시간 : ${this.state.VOTE_CLOSE_DATE} ${this.state.VOTE_CLOSE_TIME}`}
                />
                <View>
                  {this.state.MULTIPLE_YN === 'Y' && this.state.ANONY_YN === 'N' ? (<HText value={'복수투표'} />) : null }
                  {this.state.ANONY_YN === 'Y' && this.state.MULTIPLE_YN === 'N' ? (<HText value={'익명투표'} />) : null }
                  {this.state.ANONY_YN === 'Y' && this.state.MULTIPLE_YN === 'Y' ? (<HText value={'익명투표 ・ 복수투표'} />) : null }
                </View>
              </View>
            </View>
          </View>
        </View>
        <HListView
          keyExtractor={item => item.VOTE_SEQ}
          renderItem={({ item, index }) => this.renderBody(item, index)}
          onSearch={() => this.fetchContents()}
          onMoreView={null}
          // 그려진값
          data={this.state.data}
          // 조회된값
          totalData={this.state.dataTotal}
          // 하단에 표시될 메세지값
          status={this.state.status}
          msgStatusVisible={false}
        />
        <View>
          <View style={{ alignItems: 'flex-end', padding: 2 }}>
            <HText value={`Total Counting:  ${this.state.TOTAL_VT_CT} / ${this.state.TOTAL_MEMBER_LIST}명 참여 완료`} />
          </View>
          <HText value={'미참여인원'} textStyle={styles.haha} />
          <View
            style={{ alignItems: 'center', padding: 2, backgroundColor: bluecolor.basicWhiteColor }}
          >
            <Text style={styles.textVericalCenter}>
              {this.state.participant}
            </Text>
          </View>
          <View>
            {this.state.VOTE_STATUS === 'Y' ? (
              <TouchableOpacity
                onPress={() => this.onVoting()}
                activeOpacity={0.8}
                style={this.state.VOTE_COMPLETE === false ? styles.ResultButton : styles.ResultCompleteButton}
              >
                <Text style={[styles.ResultAlerttext, this.state.VOTE_COMPLETE === true ? { color: bluecolor.basicWhiteColor } : null]}>{this.state.VOTE_COMPLETE === true ? '다시 투표 하기' : '투표 하기' }</Text>
              </TouchableOpacity>
            ) :
              <View
                style={[styles.ResultButton, { borderColor: bluecolor.basicRedColor }]}
              >
                <Text style={[styles.ResultAlerttext, { color: bluecolor.basicRedColor }]}>{'투표 마감' }</Text>
              </View>
            }
          </View>
        </View>
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
    fontSize: 18,
    color: bluecolor.basicBlueColor,
    fontWeight: 'bold',
  },
  ResultButton: {
    margin: 10,
    marginTop: 30,
    flex: 1,
    width: 160,
    height: 40,
    borderRadius: 22,
    borderColor: bluecolor.basicBlueColor,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  ResultCompleteButton: {
    backgroundColor: bluecolor.basicBlueColor,
    margin: 10,
    marginTop: 30,
    flex: 1,
    width: 160,
    height: 40,
    borderRadius: 22,
    borderColor: bluecolor.basicBlueColor,
    borderWidth: 1,
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  haha: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: 'bold',
    color: bluecolor.basicBlueColor,
  },
  contentsText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  textVericalCenter: {
    flex: 1,
    fontSize: 15,
    minHeight: 20,
    minWidth: '95%',
    padding: 3,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: bluecolor.basicBluelightColor,
    color: bluecolor.basicBlueFontColor,
    backgroundColor: bluecolor.basicWhiteColor,
  },
  listItemContainer: {
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
  innerContainer: {
    margin: 3,
    borderWidth: 1,
    borderColor: 'rgba(92,94,94,0.5)',
    borderRadius: 10,
    padding: 7,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    flexWrap: 'wrap',
    flex: 1,
  },
  mainContainer: {
    alignItems: 'flex-start',
    alignContent: 'space-between',
    flex: 1,
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
