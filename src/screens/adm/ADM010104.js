/* *
 * Import Common
 * */
import { View, StyleSheet, AsyncStorage } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, modelUtil, env } from 'libs';
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
 * 문의사항 목록 조회
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010104');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  componentWillMount() {
    modelUtil.setModelData('ADM010104', { SEARCH_QNA: null });
    this.fetch();
  }

  async fetch() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('CTM040103SVC', 'get', {
      body: JSON.stringify({
        CTM040103F1: modelUtil.getModelData('ADM010104'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.CTM040103G1, env().listCnt);
      this.setState({
        dataTotal: result.CTM040103G1,
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

  onPopup(item) {
    const { navigator } = this.props;
    Navigation(
      navigator,
      'screen.ADM010105',
      { ...item, onCallback: () => this.fetch() },
      '문의사항 상세',
    );
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
      <HTextfield label={'Search'} bind={'ADM010104.SEARCH_QNA'} editable />
    </View>
  );

  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item.QNA_NO}
      onPress={() => this.onPopup(item)}
    >
      <HFormView style={{ padding: 10, marginTop: 2 }}>
        <HText value={item.QNA_TITLE} />
        <HRow between>
          <HRow between>
            <HText value={'answer : '} textStyle={{ fontSize: 10, fontWeight: null }} />
            <HText value={item.REP_CT} textStyle={{ fontSize: 10, fontWeight: null }} />
          </HRow>
          <HText value={item.ADD_DATE} textStyle={{ fontSize: 10, fontWeight: null }} />
        </HRow>
      </HFormView>
    </Touchable>
  );

  render() {
    const buttonGroup = [
      {
        title: 'Write', // 필수사항
        iconName: 'pencil-square-o', // 필수사항  // FontAwesome
        onPress: (title, param) => {
          this.onPopup();
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
      <HBaseView scrollable={false} buttonGroup={buttonGroup}>
        <HListView
          keyExtractor={item => item.QNA_NO}
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
