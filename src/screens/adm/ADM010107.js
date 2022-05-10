/* *
 * Import Common
 * */
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  NavigationScreen,
  Util,
  modelUtil,
  env,
  bluecolor,
  Navigation,
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
  HButton,
} from 'ux';
/* *
 * Import node_modules
 * */
/**
 * @constructor
 * 채팅 방만들기
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010107');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      memberList: [],
    };
  }

  componentWillMount() {
    modelUtil.setModelData('ADM010107', { USER_NAME_LOC: null, SYSTEM_CODE: 'G1' });
    this.fetch();
  }

  async fetch() {
    this.fetchGroup();
    // Util.openLoader(this.screenId, true);
    /* const result = await Fetch.request(
      'COM060101SVC',
      'get',
      {
        body: JSON.stringify({ COM060101F1: modelUtil.getModelData('ADM010107') }),
      },
      false, // toast Message : False
      false, // keyboard dismiss : False
    );
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.COM060101G1, env().listCnt);
      this.setState({
        dataTotal: result.COM060101G1,
        data, // data: result.BAS010101G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        }, // fetch후 리턴받은 모든 값
      });
      // Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    } */
  }

  async fetchGroup() {
    // Util.openLoader(this.screenId, true);
    const result = await Fetch.request(
      'VTX010101SVC',
      'getChatUser',
      {
        body: JSON.stringify({ VTX010101F1: modelUtil.getModelData('ADM010107') }),
      },
      false, // toast Message : False
      false, // keyboard dismiss : False
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
        }, // fetch후 리턴받은 모든 값
      });
      // Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 방생성
  async fetchCreate() {
    const { componentId } = this.props;
    const { session } = this.props.global;

    // Back단으로 보내줄 방이름
    const ROOM_NAME = Util.makeRoomName(this.state.memberList);
    // 채팅대화창에 표시될 방이름
    const NEW_ROOM_NAME = `${ROOM_NAME},${session.USER_NAME_LOC}`;

    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('VTX010101SVC', 'postRoomAndMemb', {
      body: JSON.stringify({ ROOM_NAME, VTX010101G1: { data: this.state.memberList } }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      Util.openLoader(this.screenId, false);
      Navigation(componentId, 'POP');
      this.props.afterCreateRoom(result.data, NEW_ROOM_NAME);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 방초대
  async fetchJoin() {
    const { componentId, ROOM_ID, ROOM_NAME } = this.props;

    const NEW_ROOM_MEMBER = Util.makeRoomName(this.state.memberList);

    // Back단으로 보내줄 방이름
    // const NEW_ROOM_NAME = `${ROOM_NAME},${NEW_ROOM_MEMBER}`;

    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('VTX010101SVC', 'putRoomAndMemb', {
      body: JSON.stringify({
        ROOM_ID,
        ROOM_NAME: ROOM_NAME.replace(/,,/g, ','),
        VTX010101G1: { data: this.state.memberList },
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      Util.openLoader(this.screenId, false);
      Navigation(componentId, 'POP');
      this.props.afterJoinRoom(NEW_ROOM_MEMBER, ROOM_NAME);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 멤버를 눌렀을때
  onPressList(item, index) {
    const memberList = this.state.memberList;
    // 값이 포함되어 있을때는 빼주고 없을때는 넣어준다.

    if (memberList.some(e => e.USER_ID === item.USER_ID)) {
      this.onDeleteMember(item);
    } else {
      memberList.push(item);
      this.setState({ memberList });
    }

    // 조회값 초기화
    modelUtil.setModelData('ADM010107', { USER_NAME_LOC: null });
  }

  // 특정 멤버 지우기
  onDeleteMember(item, index) {
    const memberList = this.state.memberList.filter(obj => obj.USER_ID !== item.USER_ID);
    this.setState({ memberList });
  }

  // 멤버리스트 지우기
  onDeleteAllMember() {
    const memberList = [];
    this.setState({ memberList });
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
      <HTextfield
        label={'Search'}
        bind={'ADM010107.USER_NAME_LOC'}
        editable
        onChanged={() => this.fetch()}
      />
    </View>
  );

  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.ROOM_ID}
      onPress={() => this.onPressList(item, index)}
    >
      <HFormView style={{ padding: 5, margin: 2 }}>
        <View style={{ flexDirection: 'row' }}>
          <HIcon name={item.USER_TYPE === 'DEPT' ? 'domain' : 'face'} iconType={'M'} />
          <HText value={`${item.USER_NAME_LOC}(${item.USER_NAME_ENG})`} />
        </View>
        <HText value={item.PLANT_NAME} textStyle={{ fontSize: 10, fontWeight: null }} />
        <HRow between>
          <HText value={item.DEPT_NAME} textStyle={{ fontSize: 10, fontWeight: null }} />
          <HText value={item.TEL_NO} textStyle={{ fontSize: 10, fontWeight: null }} />
        </HRow>
      </HFormView>
    </Touchable>
  );

  render() {
    const members = this.state.memberList.map((item, i) => (
      <View key={item.USER_ID} style={{ alignItems: 'center', margin: 2 }}>
        <Touchable
          key={item.USER_ID + item.USER_NAME}
          style={styles.memberButton}
          onPress={() => this.onDeleteMember(item, i)}
        >
          <HRow between>
            <HText>{item.USER_NAME_LOC}</HText>
            <HIcon name={'close'} />
          </HRow>
        </Touchable>
      </View>
    ));
    return (
      <HBaseView scrollable={false}>
        <View style={{ width: '100%', height: 130 }}>
          <ScrollView>
            <View style={styles.membercontainer}>
              {this.state.memberList.length > 0 ? members : <View />}
            </View>
          </ScrollView>
          <HRow>
            <HButton
              onPress={() => {
                this.onDeleteAllMember();
              }}
              name={'trash'}
              title={'모두 지우기'}
              bStyle={{
                backgroundColor: bluecolor.basicRedColor,
              }}
              disabled={this.state.memberList.length === 0}
            />
            {this.props.ROOM_ID ? (
              <HButton
                onPress={() => {
                  this.fetchJoin();
                }}
                name={'user-plus'}
                title={'초대하기'}
                disabled={this.state.memberList.length === 0}
              />
            ) : (
              <HButton
                onPress={() => {
                  this.fetchCreate();
                }}
                name={'user-plus'}
                title={'방만들기'}
                disabled={this.state.memberList.length === 0}
              />
            )}
          </HRow>
        </View>
        <HListView
          keyExtractor={item => item.ROOM_ID}
          headerClose={false}
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
 * Define component styles
 */
const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
  },
  memberButton: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    padding: 5,
    borderRadius: 5,
    backgroundColor: bluecolor.basicSoftGrayColor,
  },
  membercontainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // paddingTop: 0,
    // paddingLeft: 15,
    // paddingRight: 15,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  content: {},
  date: {},
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
