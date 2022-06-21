/* *
 * Import Common
 * */
import {View, Image, StyleSheet, AsyncStorage, Text} from 'react-native';
import {
  React,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  Util,
  modelUtil,
  env,
  bluecolor,
  ReduxStore,
} from 'libs';
/**
 * Import components
 */
import {
  HBaseView,
  HListView,
  HRow,
  HTextfield,
  HFormView,
  HText,
  Touchable,
  HIcon,
  HFadeinView,
} from 'ux';

const tnsLogoImage = require('assets/images/feel-back14.png');
/* *
 * Import node_modules
 * */
/**
 * @constructor
 * 채팅 리스트 조회
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010106');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  componentWillReceiveProps(props) {
    if (props.chat.messages && props.chat.messages > 0) {
      ReduxStore.dispatch({
        type: 'chat.message.add',
        message: null,
      });
      AsyncStorage.removeItem('message');
      this.fetch();
    }
  }

  componentWillMount() {
    modelUtil.setModelData('ADM010106', {ROOM_NAME: null});
  }

  componentDidAppear() {
    this.fetch();
    // ReduxStore.dispatch({
    //   type: 'chat.message.add',
    //   message: null,
    // });
    // AsyncStorage.removeItem('message');
  }

  async fetch(newRoomData) {
    const {navigator} = this.props;
    // Util.openLoader(this.screenId, true);
    const result = await Fetch.request('VTX010101SVC', 'getRooms', {
      body: JSON.stringify(modelUtil.getModelData('ADM010106')),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.data, env().listCnt);
      this.setState({
        dataTotal: result.data,
        data, // data: result.BAS010101G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        }, // fetch후 리턴받은 모든 값
      });
      // Util.openLoader(this.screenId, false);
      // 방을 신규로 생성했다면!!!
      if (newRoomData) {
        Navigation(
          navigator,
          'screen.ADM010108',
          {
            ROOM_ID: newRoomData.ROOM_ID,
            ROOM_NAME: newRoomData.ROOM_NAME,
            USER_ID: newRoomData.USER_ID,
            afterCreateRoom: (ROOM_ID, ROOM_NAME) =>
              this.afterCreateRoom(ROOM_ID, ROOM_NAME),
          },
          newRoomData.ROOM_NAME,
        );
      }
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      // Util.openLoader(this.screenId, false);
    }
  }

  onPopup(item, index) {
    const {navigator} = this.props;
    const {session} = this.props.global;
    Navigation(
      navigator,
      'screen.ADM010108',
      {
        ROOM_ID: item.ROOM_ID,
        USER_ID: session.USER_ID,
        ROOM_NAME: item.ROOM_NAME,
        RECENT_CHAT_DATE: item.RECENT_CHAT_DATE,
        afterCreateRoom: (ROOM_ID, ROOM_NAME) =>
          this.afterCreateRoom(ROOM_ID, ROOM_NAME),
      },
      item.ROOM_NAME,
    );
    // 방을 읽음 표시
    this.fetchReadRoom(item, index);
  }

  onPopupCR() {
    const {navigator} = this.props;
    Navigation(
      navigator,
      'screen.ADM010107',
      {
        afterCreateRoom: (ROOM_ID, ROOM_NAME) =>
          this.afterCreateRoom(ROOM_ID, ROOM_NAME),
      },
      '방만들기',
    );
  }

  // 신규 멤버 초대시 NEW_MEMBER에 값을 넘겨준다.
  afterCreateRoom(ROOM_ID, ROOM_NAME) {
    console.log('JAY', ROOM_ID, ROOM_NAME);
    const {session} = this.props.global;
    const newRoomData = {ROOM_ID, USER_ID: session.USER_ID, ROOM_NAME};
    this.fetch(newRoomData);
  }

  // 방을 읽음 표시
  async fetchReadRoom(item, index) {
    const result = await Fetch.request('VTX010101SVC', 'readRoom', {
      body: JSON.stringify({ROOM_ID: item.ROOM_ID}),
    });
    if (result) {
      const dataList = this.state.data;
      dataList[index].READ_YN = 'Y';
      this.setState({data: dataList});
    }
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
    <View>
      <HTextfield label={'Search'} bind={'ADM010106.ROOM_NAME'} editable />
    </View>
  );

  // 리스트 헤더 화면
  mainHeader = () => (
    <View style={styles.mainImage}>
      <HFadeinView>
        <Image
          source={tnsLogoImage}
          resizeMode={'contain'}
          style={{margin: 0, height: 150}}
        />
        {/* <Text style={styles.mainText}>Welcome to Wins Mobile! V1.0</Text> */}
      </HFadeinView>
    </View>
  );

  renderBody = (item, index) => (
    <Touchable
      style={{flex: 1}}
      key={item.ROOM_ID}
      onPress={() => this.onPopup(item, index)}>
      <HFormView style={{padding: 10, marginTop: 2}}>
        <HRow between>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <HText
              value={item.ROOM_NAME.substring(0, 25)}
              textStyle={
                item.ROOM_NAME === 'G1 My Cloud'
                  ? {fontWeight: 'bold', color: bluecolor.basicBluebt}
                  : null
              }
            />
            <HText
              value={`${item.USER_COUNT}`}
              textStyle={{
                fontSize: 10,
                marginLeft: -5,
                marginRight: -5,
                color: bluecolor.basicBluebt,
                fontWeight: null,
              }}
            />
          </View>
          {item.READ_YN === 'N' ? (
            <HIcon
              name={'report'}
              iconType="M"
              color={bluecolor.basicRedColor}
              size={20}
            />
          ) : null}
        </HRow>
        <View style={{flex: 1, marginTop: 5}}>
          <HRow between>
            <HText
              value={item.MSG_CONTENTS}
              textStyle={{
                fontSize: 10,
                fontWeight: null,
                color: bluecolor.basicDeepGrayColor,
              }}
            />
            <HText
              value={item.ADD_DATE}
              textStyle={{
                fontSize: 10,
                fontWeight: null,
                color: bluecolor.basicDeepGrayColor,
              }}
            />
          </HRow>
        </View>
      </HFormView>
    </Touchable>
  );

  render() {
    const buttonGroup = [
      {
        title: 'Create Room', // 필수사항
        iconName: 'user-plus', // 필수사항  // FontAwesome
        onPress: (title, param) => {
          this.onPopupCR();
        },
      },
      {
        title: 'Search', // 필수사항
        iconName: 'search', // 필수사항 // FontAwesome
        onPress: (title, param) => {
          this.fetch();
        },
      },
    ];
    return (
      <HBaseView
        scrollable={false}
        buttonGroup={this.props.noMain ? buttonGroup : null}>
        {this.props.noMain ? null : this.mainHeader()}
        <HListView
          keyExtractor={item => item.ROOM_ID}
          headerClose={false}
          // renderHeader={this.renderHeader}
          renderHeader={this.props.noMain ? this.renderHeader : null}
          renderItem={({item, index}) => this.renderBody(item, index)}
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
 * Define component styles
 */
const styles = StyleSheet.create({
  mainImage: {
    alignItems: 'center',
    backgroundColor: bluecolor.basicSkyBlueColor,
    marginTop: -10,
    marginLeft: -10,
    marginRight: -10,
  },
  mainText: {
    textAlign: 'center',
    color: bluecolor.basicBlueFontColor,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
  },
  content: {},
  date: {},
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({global: state.global, chat: state.chat});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
