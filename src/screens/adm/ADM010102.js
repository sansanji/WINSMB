/* *
 * Import Common
 * */
import { View, StyleSheet, AsyncStorage } from 'react-native';
import { React, Redux, Fetch, ReduxStore, NavigationScreen, Util, modelUtil, env } from 'libs';
/**
 * Import components
 */
import { HBaseView, HListView, HRow, HTextfield, HFormView, HText, Touchable } from 'ux';
/* *
 * Import node_modules
 * */
import HTMLView from 'react-native-htmlview';
/**
 * @constructor
 * 공지사항 목록 조회
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010102');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  componentWillMount() {
    modelUtil.setModelData('ADM010102', {
      ROOM_ID: 'system',
    });
  }

  componentDidAppear() {
    this.fetch();
    ReduxStore.dispatch({
      type: 'chat.newalarm.add',
      newalarm: null,
    });
    AsyncStorage.removeItem('newalarm');
  }

  async fetch() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('COM080101SVC', 'getChat', {
      body: JSON.stringify({
        COM080101F2: modelUtil.getModelData('ADM010102'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.COM080101G1, env().listCnt);
      this.setState({
        dataTotal: result.COM080101G1,
        data, // data: result.BAS010101G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        }, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  _onView(item) {
    // const { navigator } = this.props;
    // Navigation(navigator, 'CTM040102', item);
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
      <HTextfield label={'Title'} bind={'ADM010102.MSG_CONTENTS'} editable />
    </View>
  );

  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.NOTICE_NO}
      onLongPress={() => this._onView(item)}
    >
      <HFormView style={{ padding: 10, marginTop: 2 }}>
        <HTMLView value={item.MSG_CONTENTS} />
        <HRow between>
          <HText value={item.USER_NAME_LOC} textStyle={{ fontSize: 10, fontWeight: null }} />
          <HText value={item.createdAt} textStyle={{ fontSize: 10, fontWeight: null }} />
        </HRow>
      </HFormView>
    </Touchable>
  );

  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.NOTICE_NO}
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
 * Define component styles
 */
const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
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
