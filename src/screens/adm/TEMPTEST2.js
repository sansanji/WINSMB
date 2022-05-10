/* *
 * Import Common
 * */
import { View, Platform } from 'react-native';
import {
  Navigation,
  React,
  Redux,
  Fetch,
  NavigationScreen,
  bluecolor,
  Util,
  modelUtil,
  env,
  langUtil,
} from 'libs';
import {
  HBaseView,
  HListView,
  HFormView,
  HRow,
  Touchable,
  HText,
  HIcon,
  HDateSet,
  HTextfield,
  HNumberfield,
  HCombobox,
} from 'ux';
/* *
 * Import node_modules
 * */


/**
 *  항공 수출 GSCL(CELLO) EDI 전송
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPTEST2');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
      visible: true,
      visibleTabCntr: this.props.visibleTabCntr !== false,
      information: [
        {
          name: 'mina',
          age: 28,
          GENDER: 'Woman',
          birth: 1993,
          nickname: 'mimi',
          id: '0',
        },
        {
          name: 'jkm',
          age: 22,
          GENDER: 'man',
          birth: 1983,
          nickname: 'snasnaji',
          id: '1',
        },
        {
          name: 'ryu',
          age: 50,
          GENDER: 'Woman',
          birth: 1994,
          nickname3: 'minary',
          id: '2',
        },
      ],
    }; this.callapsed = false;
    console.log('100', this.state.information);
  }

  onInit() {
    const result1 = modelUtil.getModelData('TEMPTEST2');
    console.log('mina', result1);

    const result = {
      TYPE: 1,
      MSG: '정상적으로 처리되었습니다',
      ADM010101G1: [
        {
          name: 'mina',
          GENDER: 'Woman',
          age: 28,
          birth: 1993,
          nickname: 'mimi',
          id: '0',
        },
      ],
    };
    const data = Util.getArrayData(result.ADM010101G1, env().listCnt);
    this.setState({
      dataTotal: result.ADM010101G1,
      data, // data: result.BAS010101G1,
      status: {
        TYPE: result.TYPE,
        MSG: result.MSG,
      },
    });
  }

  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('TEMPTEST2', {
      NAME: 'mina',
      GENDER: 'Woman',
    });
    this.fetch();
  }

  shouldComponentUpdate() {
    return true;
  }

  // 화면을 조회한다.
  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = {
      TYPE: 1,
      MSG: '정상적으로 처리되었습니다',
      ADM010101G1: [
        {
          name: 'mina',
          GENDER: 'Woman',
          age: 28,
          birth: 1993,
          nickname: 'mimi',
          id: '0',
        },
        {
          name: 'jkm',
          GENDER: 'man',
          age: 22,
          birth: 1983,
          nickname: 'snasnaji',
          id: '1',
        },
        {
          name: 'ryu',
          age: 50,
          GENDER: 'man',
          birth: 1994,
          nickname: 'minary',
          id: '2',
        },
      ],
    };

    if (result) {
      // 정해진 데이터만 보여준다.
      const data = Util.getArrayData(result.ADM010101G1, env().listCnt);
      this.setState({
        dataTotal: result.ADM010101G1,
        data, // data: result.BAS010101G1,
        status: {
          TYPE: result.TYPE,
          MSG: result.MSG,
        },
      });
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
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
      <HTextfield label={'NAME'} bind={'TEMPTEST2.NAME'} editable />
      <HCombobox
        label={'GENDER'}
        groupJson={[{ DT_CODE: 'W', LOC_VALUE: 'Woman' }, { DT_CODE: 'M', LOC_VALUE: 'Man' }]}
        bindVar={{
          CD: 'TEMPTEST2.WOMAN_MAN_TYPE',
          NM: 'TEMPTEST2.WOMAN_MAN_TYPE_NAME',
        }}
        editable
      />
    </View>
  );

  renderBody = (item, index) => {
    const { theme } = this.props.global;
    return (
      <Touchable
        style={{ flex: 1 }}
        activeOpacity={0.7}
        key={item.id}
        // onLongPress={() => this._sendEdiAlert(item, 'BLADVI')}
      >
        <HFormView style={{ marginTop: 2 }}>
          <HRow between>
            <HText value={item.name} />
            <HText value={item.GENDER} />
          </HRow>
          <HRow between>
            <HText value={item.nickname} />
            <HText value={item.birth} />
          </HRow>
        </HFormView>
      </Touchable>
    );
  };

  // 실제로 화면을 그려준다.
  render() {
    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * ActionButton 공통 컴포넌트 처리
     */

    return (
      <HBaseView scrollable={false} button={() => this.onInit()}>
        <HListView
          keyExtractor={(item) => item.id}
          headerClose
          renderHeader={this.renderHeader}
          renderBody={this.renderBody}
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
