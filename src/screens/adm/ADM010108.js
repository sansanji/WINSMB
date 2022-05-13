/**
 * Import default modules
 */

// window.navigator.userAgent = 'react-native';
import { View, StyleSheet, Alert, Platform, Keyboard, Image, Linking } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  NavigationScreen,
  bluecolor,
  io,
  env,
  modelUtil,
  Util,
  Navigation,
  Upload,
  moment,
} from 'libs';
import { HIcon, HText, Touchable, BarIndicator, HSpringView } from 'ux';
/* *
 * Import node_modules
 * */
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'; // MessageImage
import Voice from 'react-native-voice';
import { CheckBox } from 'react-native-elements';
import uuidv1 from 'uuid/v1';
import ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

/**
 * Destructing react native component
 */
import Contract from 'components/Chatbot/Contract';
import TrackingView from 'components/Chatbot/TrackingView';
import CustomsView from 'components/Chatbot/CustomsView';
import VoteStartNotice from 'components/Chatbot/VoteStartNotice';
import VoteResult from 'components/Chatbot/VoteResult';
import PressToVote from 'components/Chatbot/PressToVote';
import RandomDrawer from 'components/Chatbot/RandomDrawer';
import Approval from 'components/Chatbot/Approval';

let lsocket = null;
const fileMsgIcon = 'https://wins.htns.com/resources/icons/download.png';
/**
 * 대화 목록 상세(채팅창) 컴포넌트
 */

/**
 * 채팅방 사진, 동영상 처리 참조 Lib.
 *  1. https://www.npmjs.com/package/react-native-chat-images
 *  2. https://medium.com/@decentpianist/react-native-chat-with-image-and-audio-c09054ca2204
 *  3. https://www.npmjs.com/package/react-native-gifted-chat-video-support
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010108');

    const { session } = props.global;

    this.state = {
      messages: [],
      companyCode: session.COMPANY_CODE,
      room_id: this.props.ROOM_ID,
      user_id: this.props.USER_ID,
      user_name: session.USER_NAME_LOC,
      room_name: this.props.ROOM_NAME,
      recent_chat_date: this.props.RECENT_CHAT_DATE,
      today: moment().format('YYYYMMDD'),
      history_day: -5,
      room_member: '',
      isAiChecked: false,
      isMic: false,
      isActionView: false,
      actonViewIcon: 'plus-circle',
      micColor: bluecolor.basicDeepGrayColor,
      chatText: '',
    };

    // 가장 최근 채팅한 일자의 정보를 가져오기 위한 변수 설정!
    const diffDays = moment(this.state.recent_chat_date, 'YYYYMMDD').diff(this.state.today, 'day');
    let historyDay = null;
    if (Util.isEmpty(diffDays) || diffDays === 0) {
      historyDay = this.state.history_day;
    } else {
      historyDay = diffDays;
    }
    this.fetch(historyDay);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this.onOpenMenu = this.onOpenMenu.bind(this);
    this.afterJoinRoom = this.afterJoinRoom.bind(this);
    this.renderActionBtn = this.renderActionBtn.bind(this);
    this.renderMessageImage = this.renderMessageImage.bind(this);
    this.onSendImage = this.onSendImage.bind(this);
    this.onSendFile = this.onSendFile.bind(this);

    // 서비스 렌더
    this.renderBubble = this.renderBubble.bind(this);


    // Voice 이벤수 함수 설정!
    Voice.onSpeechStart = this._onSpeechStart;
    Voice.onSpeechEnd = this._onSpeechEnd;
    Voice.onSpeechResults = this._onSpeechResults.bind(this);
    Voice.onSpeechError = this._onSpeechError;
  }

  componentWillMount() {
    try {
      lsocket = this.initSocket();
      modelUtil.setModelData('ADM010108', { ROOM_ID: this.props.ROOM_ID });
    } catch (error) {
      Alert.alert(
        '채팅오류발생',
        '잠시후 다시 시도해주세요',
        [{ text: 'OK' }, { cancelable: false }],
        { cancelable: false },
      );
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    lsocket.socket.disconnect();
    console.log('SocketProcess2', 'disconnect');
    modelUtil.delGlobalModel('ADM010108');

    Voice.destroy().then(Voice.removeAllListeners);
  }

  /**
   * react-native-voice Event 모음 <시작>
   * */

  // 음성인식이 시작되는 구간 즉. Voice.start를 하게 되면 가장 먼저 호출되는 이벤트!
  // start를 진행하고 아무런 음성 입력 값이 없을 경우, _onSpeechError 이벤트 호출!
  _onSpeechStart = event => {
    console.log('onSpeechStart', event);

    if (Platform.OS === 'ios') {
      setTimeout(() => Voice.stop(), 7000);
    }
  };

  // 음성인식이 정상적으로 처리되고, Voice.stop 이 실행된 후 호출 되는 이벤트!
  // 내부적으로 음성 관련 변수들을 초기화!
  _onSpeechEnd = event => {
    console.log('onSpeechEnd', event);

    this._onResetSpeech();
  };

  // _onSpeechStart 이벤트 실행 후 정상적인 음성 입력값이 있을 경우 처리되는 이벤트!
  // iOS와 Android 간의 상이한 점이 있어 조건 처리 필요!
  _onSpeechResults = event => {
    console.log('onSpeechResults', event.value[0]);

    // iOS의 경우 음성인식이 하나의 끝맺음 문장이 아닌 단어 또는 음절, 어절마다 해당 이벤트 호출을 한다.
    // 이에, 특정 state에 담아두고 일정 시간이 지나면 InputText에 자동 입력한다.
    // 단, iOS는 물리 전송 버튼을 마지막에 터치해야하는 번거로움이 있음.
    if (Platform.OS === 'ios') {
      const iosSpeechResult = event.value[0];
      let setMilSec = 5000;

      this.setState({
        chatText: iosSpeechResult,
        isMic: false,
        micColor: bluecolor.basicDeepGrayColor,
      });

      // 입력받은 문장이 긴 경우 7초의 허용시간 부여 (그외는 5초로 정의)
      if (iosSpeechResult.length >= 10) {
        setMilSec = 7000;
      } else {
        setMilSec = 5000;
      }
      setTimeout(() => Voice.stop(), setMilSec);
    } else {
      // Platform.OS === 'android'

      // G1 My Cloud가 아닌 일반 채팅방에서는 사용자가 전송 버튼을 누르게 함
      // (음성인식이 오입력 될 경우 방지!)
      if (this.props.ROOM_ID !== this.props.USER_ID) {
        this.setState({
          chatText: event.value[0],
          isMic: false,
          micColor: bluecolor.basicDeepGrayColor,
        });
      }

      // G1 My Cloud 에서 음성 인식 후 바로 메시지 Send 까지 진행!
      if (this.props.ROOM_ID === this.props.USER_ID) {
        this._onResetSpeech();
        this.sendMsg(event.value[0]);

        const messages = {
          createdAt: new Date(),
          text: event.value[0],
          user: { _id: this.state.user_id },
          _id: uuidv1(),
        };

        this._storeMessages(messages);

        if (this.state.isAiChecked) {
          this.G1AiChat(event.value[0]);
        }
      }
    }
  };

  // 음성 인식 중 에러가 발생했을 경우 호출되는 이벤트!
  _onSpeechError = event => {
    console.log('_onSpeechError', event);

    // Voice.stop(); // ios에서도 필요 없는 지 확인 필요!
    this.setState({
      chatText: '',
      isMic: false,
      micColor: bluecolor.basicDeepGrayColor,
    });
    // Util.toastMsg('입력 시간이 초과하였습니다. \n 재 시도 바랍니다. \n (Try again. Please!)');
  };

  // 마이크 버튼을 터치 값에 따라 음성인식을 start 할지 stop 할지 처리하는 로직
  // 가장 먼저 실행되는 이벤트
  _onRecordVoice = () => {
    const { isMic } = this.state;
    if (!isMic) {
      Voice.stop();
    } else {
      Voice.start('ko-KR'); // en-US // ko-KR
    }
  };

  _onResetSpeech() {
    this.setState({
      // chatText: '',
      isMic: false,
      micColor: bluecolor.basicDeepGrayColor,
    });
  }
  /**
   * react-native-voice Event 모음 <끝>
   * */

  // 화면이 사라질대 소켓을 끊어준다.
  _onNavigatorEvent(e) {
    if (e.id === 'willDisappear') {
      // console.log('SocketProcess1', lsocket);
      // lsocket.socket.disconnect();
      // console.log('SocketProcess2', 'disconnect');
      // modelUtil.delGlobalModel('ADM010108');
      // console.log('SocketProcess3', lsocket);
    }
  }

  initSocket() {
    const socket = io.connect(env().chatURL, {
      path: '',
      'force new connection': true,
    });
    console.log('socket', socket);
    socket.on('connect', data => {
      console.log('socekt connect!!');
    });

    socket.emit('join', {
      ROOM_ID: this.state.room_id,
    });

    socket.on('msg', e => {
      console.log('msg', e);

      if (e.APP_TYPE === 'WEBOS') {
        if (e.ROOM_ID === this.state.room_id) {
          this.onReceivedMessage(e);
        }
      } else if (e.ROOM_ID === this.state.room_id && e.USER_ID !== this.state.user_id) {
        this.onReceivedMessage(e);
      }
    });

    socket.on('taostmsg', e => {
      console.log('taostmsg', e);
    });

    return socket;
  }

  // 채팅 내용 가져오기
  async fetch(CHAT_HISTRY_DAY) {
    const result = await Fetch.request('VTX010101SVC', 'getMobileChat', {
      body: JSON.stringify({
        VTX010101F1: {
          ROOM_ID: this.state.room_id,
          CHAT_HISTRY_DAY,
        },
      }),
    });
    this.setState({
      messages: result.VTX010101G1,
      history_day: CHAT_HISTRY_DAY,
    });
  }

  // 채팅 멤버 가져오기
  async fetchMember() {
    const result = await Fetch.request('VTX010101SVC', 'getChatMember', {
      body: JSON.stringify({
        VTX010101F1: {
          ROOM_ID: this.state.room_id,
        },
      }),
    });

    this.setState({
      room_member: result.VTX010101F1,
    });
  }

  // 방 떠나기
  async fetchLeave() {
    const { componentId, ROOM_NAME } = this.props;
    // 방이름에서 이름을 빼준다.(현재 룸멤버들중에서..)

    // const ROOM_NAME = this.state.room_member.replace(this.state.user_name, '').replace(/,,/g, ',');
    const result = await Fetch.request('VTX010101SVC', 'leaveRoom', {
      body: JSON.stringify({
        ROOM_ID: this.state.room_id,
        ROOM_NAME,
      }),
    });

    if (result) {
      console.log('JAY', '방을 나가셨습니다!');
      this.sendMsg(`${this.state.user_name}님이 방을 나가셨습니다.`);
      Navigation(componentId, 'POP');
    }
  }

  // Helper functions
  _storeMessages(messages) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  // Event listeners
  /**
   * When the server sends a message to this.
   */
  onReceivedMessage(messages) {
    let msgObjects = null;
    let msgType = null;
    let fileName = null;
    let fileSize = null;
    let fileUrl = null;

    if (this.mounted) {
      if (messages.MSG_OBJECTS) {
        msgObjects = JSON.parse(messages.MSG_OBJECTS);
        msgType = msgObjects.msgType;
        fileName = msgObjects.fileName;
        fileSize = msgObjects.fileSize;
        fileUrl = msgObjects.fileUrl;

        if (msgType === 'IMAGE' || msgType === 'FILE') {
          this._storeMessages([
            {
              _id: uuidv1(), // uuidv4(), // or use  Math.round(Math.random() * 1000000)
              text:
                msgType === `${fileName}\nFile Size: ${fileSize}`,
              createdAt: messages.ADD_DATE,
              user: {
                _id: messages.USER_ID,
                name: messages.USER_NAME_LOC,
                avatar: messages.PHOTO_PATH,
              },
              image: fileUrl,
              MSG_OBJECTS: messages.MSG_OBJECTS,
            },
          ]);
        } else {
          // AI 챗봇일 경우
          this._storeMessages([
            {
              _id: uuidv1(), // uuidv4(), // or use  Math.round(Math.random() * 1000000)
              text: messages.MSG_CONTENTS,
              createdAt: messages.ADD_DATE,
              user: {
                _id: messages.USER_ID,
                name: messages.USER_NAME_LOC,
                avatar: messages.PHOTO_PATH,
              },
              MSG_OBJECTS: messages.MSG_OBJECTS,
              MSG_CONTENTS: messages.MSG_CONTENTS,
            },
          ]);
        }
      } else {
        this._storeMessages([
          {
            _id: uuidv1(), // uuidv4(), // or use  Math.round(Math.random() * 1000000)
            text: messages.MSG_CONTENTS,
            createdAt: messages.ADD_DATE,
            user: {
              _id: messages.USER_ID,
              name: messages.USER_NAME_LOC,
              avatar: messages.PHOTO_PATH,
            },
          },
        ]);
      }
    }
  }

  onSend(messages = []) {
    const text = messages[0].text;
    const randomDrawer = '#당첨';
    const word = text.startsWith(randomDrawer);

    if (!lsocket.socket.connected) {
      Alert.alert(
        '채팅연결 문제 발생',
        '앱을 종료후 잠시후 다시 시도해주세요',
        [{ text: 'OK' }, { cancelable: false }],
        { cancelable: false },
      );
      return;
    }

    if (word) {
      this.randomDrawer(text);
      return;
    }

    this._storeMessages(messages);
    this.sendMsg(messages[0].text);

    // AI 챗봇일 경우 호출!
    if (this.state.isAiChecked) {
      this.G1AiChat(messages[0].text);
    }
  }

  // 랜덤 뽑기
  async randomDrawer(text) {
    await this.fetchMember();

    const { session } = this.props.global;
    const roomMember = this.state.room_member;
    const memberList = roomMember.split(',');
    const memberLength = memberList.length;

    const Random = Math.random();
    const winner = Math.floor(Random * memberLength);

    // const content = ` 축하합니다!  ${memberList[winner]}님  담첨되셨어요!`;
    const content = text;

    const item = {
      msgType: 'RandomDrawer',
      ADD_DATE: session.ADD_DATE,
      ADD_USER_ID: session.ADD_USER_ID,
      ADD_USER_NAME: session.ADD_USER_NAME,
      MSG_CONTENTS: `${memberList[winner]}님  담첨되셨어요!`,
      MSG_OBJECTS: text,
    };

    this.onSendVote(item, content, memberList[winner]);
  }


  // 채팅 메세지보내기
  sendMsg(sMsg, pushStop, userId, msgObjects) {
    // const socket = this.initSocket();
    // BizTalk이 자동으로 호출된 경우는 User Name도 "BizTalk"로 설정!
    let userNameLoc = this.state.user_name;
    if (userId === 'BizTalk') {
      userNameLoc = 'BizTalk';
    }

    // if (sMsg === 'VoteResult' || sMsg === 'VoteStartNotice') {
    //   userNameLoc = 'Vote';
    // }

    lsocket.emit('msg', {
      ROOM_ID: this.state.room_id,
      USER_ID: userId || this.state.user_id,
      USER_NAME_LOC: userNameLoc || this.state.user_name,
      MSG_CONTENTS: sMsg,
      MSG_OBJECTS: msgObjects,
      PUSH_STOP: pushStop,
    });

    if (Platform.OS === 'ios') {
      this.setState({
        chatText: '',
      });

      Voice.destroy();
    }
  }

  // G1 AI 챗봇일 경우 개인화 호출!
  async G1AiChat(sMsg, pushStop) {
    let g1AiChatMsg = null;
    let g1aiType = null;
    let g1AiChatObj = null;
    if (this.state.isAiChecked) {
      const result = await Fetch.request('googleai', 'message', {
        body: JSON.stringify({
          user_key: `MB_${this.props.USER_ID}`,
          type: 'text',
          content: sMsg,
          device_type: 'AI_MOBILE_APP',
        }),
      });


      if (!Util.isEmpty(result.message.API_DATA)) {
        g1aiType = result.message.CONTENTS_TYPE;
        if (!Util.isEmpty(g1aiType)) {
          result.message.API_DATA.g1aiType = g1aiType;
        }
        g1AiChatMsg = result.message.text;
        g1AiChatObj = JSON.stringify(result.message.API_DATA);
        this.sendMsg(g1AiChatMsg, pushStop, 'BizTalk', g1AiChatObj);
      } else {
        g1AiChatMsg = result.message.text;
        this.sendMsg(g1AiChatMsg, pushStop, 'BizTalk');
      }
    }
  }


  // 투표 완료 메세지에서 결과 확인하기 버튼 클릭시 실행
  onVoting(item) {
    const { navigator } = this.props.global;
    // this.props.fetch(this.props.ROOM_ID);

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
      },
      '투표하기',
    );
  }

   renderService = (items) => {
     const userID = items.currentMessage.user._id;
     let svcObjects = items.currentMessage.MSG_OBJECTS;

     if (!Util.isEmpty(svcObjects)) {
       if (typeof (svcObjects) === 'string') {
         svcObjects = JSON.parse(svcObjects);
       }
       const msgType = svcObjects.msgType;

       // AI 챗봇일 경우 조회
       if (userID === 'BizTalk') {
         const g1aiType = svcObjects.g1aiType;

         if (!Util.isEmpty(g1aiType)) {
           // 성공했을 때만!!
           if (svcObjects.TYPE !== -1) {
             if (g1aiType === 'CONTRACT') {
             // 연락처
               return (
               //  <Contract paramObj={svcObjects.data[0]} />
                 <Contract paramObj={svcObjects.data} />
               );
             } else if (g1aiType === 'TRACKING_VIEW') {
             // 트레이싱
               return (
                 <TrackingView paramObj={svcObjects} />
               );
             } else if (g1aiType === 'CUSTOMS_IM_INFO') {
             // 트레이싱
               return (
                 <CustomsView paramObj={svcObjects} />
               );
             } else if (g1aiType === 'approvalType') {
               // 결재문서 알림
               const approvalTime = items.currentMessage.approvalTime;
               return (
                 <Approval paramObj={svcObjects} approvalTime={approvalTime} />
               );
             }
           }
         }
       } else if (msgType === 'VoteStartNotice' || msgType === 'VoteResult' || msgType === 'PressToVote' || msgType === 'RandomDrawer') {
         // 성공했을 때만!!
         if (msgType === 'VoteStartNotice') {
           return (
             // 투표 생성 알림
             <VoteStartNotice
               paramObj={svcObjects}
               onVoting={(item) => this.onVoting(item)}
             />
           );
         } else if (msgType === 'VoteResult') {
           // 투표 결과 안내 알림
           return (
             <VoteResult
               paramObj={svcObjects}
               onVoting={(item) => this.onVoting(item)}
             />
           );
         } else if (msgType === 'PressToVote') {
           // 투표 결과 안내 알림
           return (
             <PressToVote
               paramObj={svcObjects}
               onVoting={(item) => this.onVoting(item)}
             />
           );
         } else if (msgType === 'RandomDrawer') {
           // 투표 결과 안내 알림
           return (
             <RandomDrawer
               paramObj={svcObjects}
               // onVoting={(item) => this.onVoting(item)}
             />
           );
         }
       }
     }
     return (
       <Bubble
         {...items}
         wrapperStyle={{
           right: {
             backgroundColor: bluecolor.basicBluelightColor,
           },
           left: {
             backgroundColor: bluecolor.basicWhiteColor,
           },
         }}
         textStyle={{
           right: {
             color: '#000000',
             fontSize: bluecolor.basicFontSize,
           },
           left: {
             fontSize: bluecolor.basicFontSize,
           },
         }}
       />);
   };

   renderBubble(props) {
     return (
       <View>
         {props.currentMessage.USER_ID === props.user._id ? null : (
           <HText
             style={{ padding: 10 }}
             textStyle={{ color: bluecolor.basicDeepGrayColor, fontSize: bluecolor.basicFontSizeS }}
           >
             {props.currentMessage.user.name}
           </HText>
         )}
         {this.renderService(props)}
       </View>
     );
   }

   renderSend(props) {
     return (
       <Send {...props}>
         <View style={{ marginRight: 10, marginBottom: 10 }}>
           <HIcon name="send" iconType="M" size={20} />
         </View>
       </Send>
     );
   }

   renderActionBtn() {
     return (
       <View style={{ marginLeft: 10, marginBottom: 15 }}>
         <Touchable
           onPress={() =>
             this.setState(
               {
                 isActionView: !this.state.isActionView,
                 actonViewIcon: this.state.isActionView ? 'plus-circle' : 'times-circle',
               },
               () => {
                 // 하단 액션버튼이 활성화 될 경우 키보드 비활성화 처리!
                 if (this.state.isActionView) {
                   Keyboard.dismiss();
                 }
               },
             )
           }
         >
           <HIcon name={this.state.actonViewIcon} size={20} color={bluecolor.basicBluebtTrans} />
         </Touchable>
       </View>
     );
   }

  // 이미지 메시지 처리!
  // 참조: https://github.com/FaridSafi/react-native-gifted-chat/issues/875
  renderMessageImage = props => {
    if (props.currentMessage.image) {
      let msgObjects = null;
      let msgType = null;
      let fileUrl = null;

      if (props.currentMessage.MSG_OBJECTS) {
        msgObjects = JSON.parse(props.currentMessage.MSG_OBJECTS);
        msgType = msgObjects.msgType;
        if (msgObjects.fileUrl) {
          fileUrl = msgObjects.fileUrl;
        }
      }
      if (!props.currentMessage.MSG_OBJECTS) {
        if (Util.isEmpty(props.currentMessage.text)) {
          msgType = 'IMAGE';
        } else {
          msgType = 'FILE';
        }
      }

      return (
        <Touchable
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onPress={() => this.onImageBoxPopup(props.currentMessage.image, msgType, fileUrl)}
        >
          {/* <MessageImage
            {...props}
            // imageStyle={styles.imageMessage}
            // imageProps={{ defaultSource: require('../../Images/bg_image.jpg') }}
          /> */}
          {msgType === 'IMAGE' ? (
            <Image
              resizeMode={'cover'}
              style={styles.imageMessage}
              source={{
                uri: fileUrl,
                headers: {
                  'X-CSRF-TOKEN': globalThis.gToken,
                  Cookie: globalThis.gCookie,
                  // withCredentials: true,
                },
              }}
            />
          ) : (
            <View style={styles.downloadMessageView}>
              <HIcon
                name={'file'}
                style={{ paddingTop: 3 }}
                size={15}
                color={bluecolor.basicBlueColor}
              />
              <HText
                value={'Down'}
                textStyle={[
                  styles.actionText,
                  {
                    color: bluecolor.basicBlueFontColor,
                    fontSize: 15,
                    textDecorationLine: 'underline',
                  },
                ]}
              />
            </View>
          )}
        </Touchable>
      );
    }
    return null;
  };

  // 이미지 상세 보기!
  onImageBoxPopup(imageUrl, msgType, fileUrl) {
    if (msgType === 'IMAGE') {
      Util.imageBox('ImageBox', fileUrl, null, null);
    } else {
      Linking.openURL(fileUrl);
      Util.toastMsg('Download 폴더로 저장합니다.');
    }
  }

  // 카메라 또는 앨범을 통해 이미지를 전송한다.
  async onSendImage() {
    Keyboard.dismiss();

    const options = {
      title: 'Choose Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      onSuccess: (res, source) => {
        console.log('file uploaded success', res, source);
      },
    };

    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const fileConfig = {
          pickType: 'IMAGE',
          callPage: 'ADM010108',
          fileUri: response.uri,
          fileType: response.type,
          fileName: response.fileName,
          fileSize: response.fileSize || 0,
        };

        this.onUpload(options, fileConfig);
      }
    });
  }

  // 파일을 전송한다.
  // https://github.com/Elyx0/react-native-document-picker
  async onSendFile() {
    Keyboard.dismiss();

    try {
      //   const response = await DocumentPicker.pickMultiple({
      //     type: [DocumentPicker.types.images],
      //   });
      //   for (const res of response) {
      //     console.log(
      //       res.uri,
      //       res.type, // mime type
      //       res.name,
      //       res.size,
      //     );
      //   }
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const fileConfig = {
        pickType: 'FILE',
        callView: 'ADM010108',
        fileUri: response.uri,
        fileType: response.type,
        fileName: response.name,
        fileSize: response.size || 0,
      };

      this.onUpload(null, fileConfig);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('DocumentPicker Error', err);
      } else {
        throw err;
      }
    }
  }

  // Image Picker, Document(File) Pickek 에서 넘겨온 파일 정보를 G1 서버에 업로드한다.
  // Option은 Image Picker만 해당!
  onUpload(options, fileConfig) {
    Upload({
      companyCode: this.state.companyCode || null, // 'HTNS',
      refNo: `${this.state.room_id}_${this.state.user_id}`,
      refType: 'BT', // BizTalk : 채팅 전용 폴더 생성!
      sFuncCode: 'MB',
      fileConfig,
      onProgress: progress => {
        if (options && options.onSuconProgresscess) {
          options.onProgress(progress, fileConfig.Uri);
        }
      },
      onSuccess: (res, resJson) => {
        if (options && options.onSuccess) {
          options.onSuccess(res, fileConfig.Uri);
        }

        // 채팅 이미지, 파일 전송 처리!
        const pickType = fileConfig.pickType; // 'IMAGE';
        const resData = resJson.data;

        const resFileSize = resData.FILE_SIZE; // 1,750K
        let applyFileSize = null;
        if (!resFileSize && Util.isEmpty(resFileSize)) {
          applyFileSize = 'Unknown';
        } else {
          const resFileSizeOnlyNo = Number(resFileSize.replace(/[^0-9]/g, '')); // 숫자만 추출!
          const fileSizeKB = resFileSizeOnlyNo; // kiloByte로 변환
          const fileSizeMB = resFileSizeOnlyNo / 1024; // 1048576B = 1024KB = 1MB

          if (fileSizeKB >= 1024) {
            applyFileSize = `${Util.formatNumber(fileSizeMB.toFixed(2))}MB`;
          } else {
            applyFileSize = `${Util.formatNumber(fileSizeKB)}KB`;
          }
        }

        // https로 이미지 메세지 보낼때, 웹에서 이미지 깨지는 문제로 인해 이미지 보내줄 땐 http형식으로 보내준다.
        const fileUrl = `${Fetch.fetchHttp}/api/file/getDownload/${resData.COMPANY_CODE}/MB/${resData.FILE_MGT_CODE}`;
        // const fileUrl = `${Fetch.fetchURL}/api/file/getDownload/${resData.COMPANY_CODE}/MB/${resData.FILE_MGT_CODE}`;

        const msgObjects = {
          msgType: pickType,
          fileName: fileConfig.fileName,
          fileUrl,
          fileSize: applyFileSize,
        };
        let msgContents = null;
        if (pickType === 'IMAGE') {
          msgContents = fileConfig.fileName;
        } else {
          // file일경우!
          msgContents = fileMsgIcon;
        }

        this.sendMsg(msgContents, null, null, JSON.stringify(msgObjects)); // pickType);

        const messages = {
          _id: uuidv1(), // uuidv4(), // or use  Math.round(Math.random() * 1000000)
          text: `${fileConfig.fileName}\nFile Size: ${applyFileSize}`,
          createdAt: resData.ADD_DATE,
          user: {
            _id: resData.ADD_USER_ID,
            name: resData.ADD_USER_NAME,
            avatar: resData.PHOTO_PATH,
          },
          image: fileUrl,
          MSG_OBJECTS: JSON.stringify(msgObjects),
        };

        this._storeMessages(messages);
      },
      onError: err => {
        if (options && options.onError) {
          options.onError(err, fileConfig.Uri);
        }
      },
    });
  }

  onLoadEarlier() {
    const calHistory = this.state.history_day - 5;
    this.fetch(calHistory);
    this.state.history_day = calHistory;
  }

  async onOpenMenu() {
    await this.fetchMember();

    Util.msgBox({
      title: '채팅참여자',
      msg: this.state.room_member,
      buttonGroup: [
        {
          title: '나가기',
          name: 'sign-out',
          onPress: item => {
            this.fetchLeave();
          },
        },
        {
          title: '초대하기',
          name: 'user-plus',
          onPress: item => {
            this.onPopupAR();
          },
        },
        {
          title: '투표 하기',
          bStyle: { backgroundColor: bluecolor.basicOrangeColor },
          name: 'hand-o-up',
          onPress: item => {
            this.onCreateVote();
          },
        },
      ],
    });
  }

  // 초대하고 난뒤 실행 함수
  async afterJoinRoom(NEW_MEMBER, ROOM_NAME) {
    const { componentId } = this.props;
    // navigator.setTitle({ title: ROOM_NAME.replace(/,,/g, ',') });
    this.sendMsg(`${NEW_MEMBER}님이 방에 초대되었습니다.`);
    Util.toastMsg(`${NEW_MEMBER}님이 방에 초대되었습니다.`);
    Navigation(componentId, 'POP');
    this.props.afterCreateRoom(this.state.room_id, ROOM_NAME);
    // setTimeout(() => {
    //   Navigation(navigator, 'POP');
    //   this.props.afterCreateRoom(this.state.room_id, ROOM_NAME);
    // }, 700);
  }

  // 초대하기
  onPopupAR() {
    const { navigator } = this.props;
    const roomName = this.props.ROOM_NAME;
    Navigation(
      navigator,
      'screen.ADM010107',
      {
        ROOM_ID: this.state.room_id,
        ROOM_NAME: roomName,
        afterJoinRoom: (NEW_MEMBER, ROOM_NAME) => this.afterJoinRoom(NEW_MEMBER, ROOM_NAME),
      },
      '초대하기',
    );
  }

  // 투표 list 화면 연결
  onCreateVote() {
    const { navigator } = this.props;
    const roomName = this.props.ROOM_NAME;
    Navigation(
      navigator,
      'screen.ADM010114',
      {
        SCREEN: 'ADM010114',
        ROOM_ID: this.state.room_id,
        ROOM_NAME: roomName,
        onClicked: (item, contents, selecContents) => this.onSendVote(item, contents, selecContents),
      },
      '투표하기',
    );
  }

  onSendVote(item, contents, selecContents) {
    console.log(item);

    item.topValue = selecContents;
    this.sendMsg(contents, null, null, item);

    const messages = {
      _id: uuidv1(), // uuidv4(), // or use  Math.round(Math.random() * 1000000)
      text: selecContents,
      MSG_CONTENTS: contents,
      createdAt: item.ADD_DATE,
      user: {
        _id: item.ADD_USER_ID,
        name: item.ADD_USER_NAME,
        avatar: item.PHOTO_PATH,
      },
      MSG_OBJECTS: item,
    };

    this._storeMessages(messages);
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.isAiChecked ? (
            <Touchable
              style={styles.etcButton}
              underlayColor={bluecolor.basicBlueColorTrans}
              onPress={() => {
                this.setState(
                  {
                    isAiChecked: false,
                  },
                );
              }}
            >
              <HSpringView>
                <HIcon name={'smile-o'} color={bluecolor.basicBlueImpactColor} />
              </HSpringView>
            </Touchable>) : null
        }
        {this.props.ROOM_ID !== this.props.USER_ID ? (
          <Touchable
            style={styles.etcButton}
            underlayColor={bluecolor.basicBlueColorTrans}
            onPress={() => this.onOpenMenu()}
          >
            <HIcon name={'bars'} color={bluecolor.basicBluebtTrans} />
          </Touchable>
        ) :
          <View style={styles.aiStyle}>
            <Touchable
              onPress={() =>
                this.setState(
                  {
                    isAiChecked: true,
                    isMic: !this.state.isMic,
                    micColor: this.state.isMic
                      ? bluecolor.basicDeepGrayColor
                      : bluecolor.basicBluebtTrans,
                  },
                  () => {
                    this._onRecordVoice();
                  },
                )
              }
            >
              <View style={styles.chatbotIcon}>
                <HIcon name={this.state.isMic ? 'smile-o' : 'meh-o'} size={this.state.isMic ? 27 : 20} color={this.state.micColor} />
                <HText
                  value={'Chatbot'}
                  textStyle={{ fontSize: 10,
                    fontWeight: 'bold',
                    color: this.state.micColor }}
                />
              </View>
            </Touchable>
          </View>}
        <GiftedChat
          renderBubble={this.renderBubble}
          renderSend={this.renderSend}
          renderActions={this.renderActionBtn}
          renderMessageImage={this.renderMessageImage}
          // imageProps={{ openImageViewer: this.openImageViewer }}
          style={{ backgroundColor: '#f1f1f1' }}
          messages={this.state.messages}
          dateFormat={'YYYY. MM. DD'}
          onSend={messages => this.onSend(messages)}
          placeholder={'Input the message.'}
          isAnimated
          loadEarlier
          onLoadEarlier={this.onLoadEarlier}
          user={{
            _id: this.state.user_id,
          }}
          text={this.state.chatText}
          onInputTextChanged={text => this.setState({ chatText: text }, () => {})}
          keyboardShouldPersistTaps={'never'}
        />

        {this.state.isActionView ? (
          <View
            style={[
              styles.actionContainer,
            ]}
          >
            {this.props.ROOM_ID !== this.props.USER_ID ? (
              <Touchable
                style={styles.actionView}
                onPress={() =>
                  this.setState(
                    {
                      isMic: !this.state.isMic,
                      micColor: this.state.isMic
                        ? bluecolor.basicDeepGrayColor
                        : bluecolor.basicBluebtTrans,
                    },
                    () => {
                      this._onRecordVoice();
                    },
                  )
                }
              >
                <View style={styles.actionIcon}>
                  <HIcon name={'microphone'} size={20} color={this.state.micColor} />
                  <HText value={'음성'} textStyle={styles.actionText} />
                </View>
              </Touchable>) : null}
            <Touchable
              style={styles.actionView}
              onPress={() =>
                this.setState({}, () => {
                  this.onSendImage();
                })
              }
            >
              <View style={styles.actionIcon}>
                <HIcon name={'file-photo-o'} size={20} color={bluecolor.basicBluebtTrans} />
                <HText value={'사진'} textStyle={styles.actionText} />
              </View>
            </Touchable>
            <Touchable
              style={styles.actionView}
              onPress={() =>
                this.setState({}, () => {
                  this.onSendFile();
                })
              }
            >
              <View style={styles.actionIcon}>
                <HIcon name={'paperclip'} size={20} color={bluecolor.basicBluebtTrans} />
                <HText value={'파일'} textStyle={styles.actionText} />
              </View>
            </Touchable>
          </View>
        ) : null}

        {this.state.isMic ? (
          <Touchable
            style={styles.micIndicator}
            onPress={() =>
              this.setState({ isMic: false, micColor: bluecolor.basicDeepGrayColor }, () => {
                Voice.destroy();
              })
            }
          >
            <HText>명령어를 말씀해주세요!</HText>
            {/* // Indicators : https://www.npmjs.com/package/react-native-indicators */}
            <BarIndicator color={bluecolor.basicBluebtTrans} count={5} />
          </Touchable>
        ) : null}
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
    backgroundColor: '#f1f1f1',
  },
  text: {
    fontSize: 16,
  },
  etcButton: {
    backgroundColor: bluecolor.basicWhiteColorTrans,
    borderColor: bluecolor.basicWhiteColorTrans,
    borderWidth: 1,
    height: 30,
    width: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2,
    shadowColor: bluecolor.basicBlueColor,
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
  },
  actionContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: bluecolor.basicSkyBlueColorTrans,
    paddingTop: 5,
    backgroundColor: bluecolor.basicWhiteColor,
    borderTopWidth: 1,
  },
  actionView: {
    marginRight: 13,
    marginLeft: 13,
  },
  actionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 3,
  },
  micIndicator: {
    flex: 1,
    padding: 10,
    backgroundColor: bluecolor.basicSkyBlueColorTrans,
    borderRadius: 5,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    left: '10%',
    zIndex: 3,
  },
  imageMessage: {
    height: 150,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 5,
  },
  downloadMessageView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  serviceStyle: {
    width: 300,
    borderRadius: 10,
    padding: 10,
    backgroundColor: bluecolor.basicWhiteColor,
    fontSize: bluecolor.basicFontSize,
  },
  aiStyle: {
    backgroundColor: bluecolor.basicSkyLightBlueTrans,
    borderWidth: 1,
    height: 55,
    width: 55,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    alignSelf: 'center',
    borderColor: bluecolor.basicSkyLightBlueTrans,
    bottom: 25,
    shadowColor: bluecolor.basicSkyLightBlueTrans,
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    zIndex: 1,
  },
  chatbotIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
