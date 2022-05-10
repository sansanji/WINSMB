/* *
 * Import Common
 * */
import { RefreshControl, StyleSheet, FlatList, View } from 'react-native';
import { React, bluecolor, Util, env } from 'libs';
import { Touchable } from 'ux';
import HFormView from 'components/View/HFormView';
import HIcon from 'components/Form/HIcon';
import HButton from 'components/Buttons/HButton';
import SearchToolBar from 'components/List/SearchToolBar'; // 하단 상태메시지 및 조회 버튼 공통 컴포넌트
/* *
 * Import node_modules
 * */

/**
 * 기본 리스트뷰 컴포넌트(리스트에는 keyExtractor를 필수값으로 지정해야함 ex) keyExtractor={item => item.SR_CODE})
 * <br>초기값 셋팅은 this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  * */
/**
 * @param {Function} renderHeader - 리스트 헤더에 표시될 뷰(조회조건)
 * @param {Function} renderItem - 리스트 아이템에 표시될 뷰({item, index } 리턴)
 * @param {Function} onSearch - 조회 메소드
 * @param {Function} onMoreView - 더보기 메소드(Util.flatListOnEndReached을 이용하여 선택시 추가로 표시될 데이터를 추가함)
 * @param {JSONArray} data - 리스트에 표시될 데이터
 * @param {JSONArray} totalData - 전체 데이터
 * @param {JSONObject} status - 하단에 표시될 메세지값(TYPE : 서비스리턴 타입, MSG : 서비스리턴 메세지)
 * @param {Boolean} headerClose - 헤더 닫힘 여부(조회조건 폼)
 * @param {styles} headerStyle - 헤더 스타일 사용자 정의
 * @param {styles} toolbarStyle - 툴바 스타일 사용자 정의
 * @param {Boolean} msgStatusVisible - 하단 상태표시줄 표시 여부 (기본값 true)
//  * @param {Number} onGoRow - 원하는 Row로 이동(리스트의 index)
//  * @param {Function} getItemLayout - 리스트 헤더에 표시될 뷰(조회조건)
//  * @param {Function} onScrollToIndexFailed - 리스트 헤더에 표시될 뷰(조회조건)
 * @example
 * <HListView
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
 // 특정 RowIndex로 이동하기 위한 옵션 값 <시작>
 onGoRow={this.state.goRow}
 getItemLayout={(data, index) => ({
  length: 135,
  offset: 135 * index,
  index,
 })}
 onScrollToIndexFailed={() => {}}
 // 특정 RowIndex로 이동하기 위한 옵션 값 <끝>
/>
 */

class HListView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      toPositionVisible: false,
      headerHeight: 0,
      currentRow: 0,
    };
    this.callapsed = false;
    this.onGoTop = this.onGoTop.bind(this);
    this.onGoDown = this.onGoDown.bind(this);
    this.moreView = this.moreView.bind(this);
    // this.onGoRow = this.onGoRow.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // 현재 로우수 지정
    const totalLength = nextProps.data.length;
    this.setState({ currentRow: totalLength });

    if (nextProps.data.length > 0 && this.props.totalData.length !== nextProps.totalData.length) {
      this.onGoTop();
    }

    // 현재 로우수 지정
    // const goRow = nextProps.onGoRow || 0;

    // 재 조회 시 스크롤을 최 상단으로 이동 <시작> (단, 더보기 일 경우는 제외!)
    // if (this.props.onMoreView) {
    //   if (nextProps.data.length > 0 && this.state.resetScroll) {
    //     this.onGoTop();
    //   }
    //   // 다시 스크롤 위치 리셋 허용 처리!
    //   this.setState({
    //     resetScroll: true,
    //   });
    // } else if (nextProps.data.length > 0 && this.props.onGoRow !== nextProps.onGoRow) {
    //   this.onGoRow(goRow);
    // } else {
    //   this.onGoTop();
    // }
    // 재 조회 시 스크롤을 최 상단으로 이동 <끝> (단, 더보기 일 경우는 제외!)
  }

  shouldComponentUpdate() {
    return true;
  }

  // 위아래 버튼 선택시 작동
  onGoTop() {
    this.flatListRef.getScrollResponder().scrollTo({ animated: true }, 0);
  }
  onGoDown() {
    this.flatListRef.getScrollResponder().scrollToEnd({ animated: true });
  }
  // onGoRow(index) {
  //   this.flatListRef.scrollToIndex({ animated: true, index }, 0.5);
  // }

  // 우측 위아래 버튼 표시 여부
  _onScroll(event) {
    const {
      contentOffset: { y },
    } = event.nativeEvent;

    // 스크롤이 내려 갔을 경우!
    if (this.state.headerHeight < y && this.callapsed === false) {
      this.setState({
        visible: false,
        toPositionVisible: true, // 스크롤 위치에 따른 버튼 보이기
      });
      this.callapsed = true;
    }

    // 스크롤이 올라 갔을 경우!
    if (y < 30 && this.callapsed === true) {
      this.setState({
        visible: true,
        toPositionVisible: false, // 스크롤 위치에 따른 버튼 가리기
      });
      this.callapsed = false;
    }
  }
  // 더보기를누르면 보여질 데이터를 반환
  moreView() {
    const getRtnData = Util.flatListOnEndReached(
      this.props.data, // 현재 그려진 페이지!
      this.props.totalData, // 조회된 전체 건수!
    );

    this.props.onMoreView(getRtnData);
  }

  // flatList 가장 하단에 표시될 컴포넌트
  renderFooter = () => {
    if (
      this.props.onMoreView &&
      (this.props.data.length > 0 && this.props.data.length !== this.props.totalData.length)
    ) {
      return (
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <HButton
            name={'search-plus'}
            title={`${env().listCnt}View more...`}
            onPress={this.moreView}
          />
        </View>
      );
    }
    return null;
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          ref={ref => {
            this.flatListRef = ref;
          }}
          onScroll={event => this._onScroll(event)}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.props.onSearch()}
            />
          }
          ListFooterComponent={this.renderFooter()}
          ListHeaderComponent={
            this.props.renderHeader ? (
              <HFormView
                style={this.props.headerStyle}
                renderHeader={this.props.renderHeader}
                headerClose={this.props.headerClose}
              />
            ) : null
          }
          // WMS110101.js 참조
          // getItemLayout={(data, index) => ({
          //   length: 135,
          //   offset: 135 * index,
          //   index,
          // })}
          // onScrollToIndexFailed={() => {}}
          {...this.props}
        />
        {/* 위아래버튼  */}
        {this.state.toPositionVisible === true ? (
          <View style={styles.scrollctrlCntr}>
            <Touchable
              style={styles.scrollCtrlBtn}
              onPress={this.onGoTop} // {() => this.goToTop()} 이런식으로 하면 문제가 됨!
            >
              <HIcon name="chevron-circle-up" color={bluecolor.basicBlueColorTrans} />
            </Touchable>
            <Touchable
              style={styles.scrollCtrlBtn}
              onPress={this.onGoDown} // {() => this._goToBottom()} 이런식으로 하면 문제가 됨!
            >
              <HIcon name="chevron-circle-down" color={bluecolor.basicBlueColorTrans} />
            </Touchable>
          </View>
        ) : null}
        {/* 조회버튼 툴바  */}
        <SearchToolBar
          // fetch 및 이벤트 발생 후 G1 Back-End로 부터 리턴 받은 값
          status={this.props.status}
          // 조회된 전체 건 수
          // fetchResult에 포함되지 않은 이유는 각각의 API마다 실제 데이터가 담기는 key값이 다르기 때문에
          // (BAS010101G1, FMS010101G2 등...)
          totalRow={this.props.totalData.length}
          // 필수값이 아닌 옵션 값 ListRow 페이징 처리 시에만 설정 바람!
          currentRow={this.state.currentRow}
          msgStatusVisible={this.props.msgStatusVisible}
          // 툴바 스타일
          toolbarStyle={this.props.toolbarStyle}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  iconStyle: {
    flex: 1,
    marginTop: 5,
    padding: 3,
    borderRadius: 5,
    backgroundColor: bluecolor.basicSoftGrayColor,
    alignItems: 'center',
  },
  scrollctrlCntr: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: '50%',
    right: '3%', // 10,
  },
  scrollCtrlBtn: {
    backgroundColor: bluecolor.basicBlueLightTrans,
    height: 30,
    width: 30,
    marginTop: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HListView;
