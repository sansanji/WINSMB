/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions } from 'react-native';
import { _, React, Util, Redux, Fetch, NavigationScreen, modelUtil, bluecolor } from 'libs';
import { Touchable, HRow, HFormView, HText, HListView, HIcon } from 'ux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
/**
 * Location Item 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100502');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  async componentWillMount() {
    const { item } = this.props;
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    if (whCode) {
      modelUtil.setModelData('WMS100502', {
        WH_CODE: whCode,
        LOCATION: item.LOCATION,
        EXIST_YN: 'Y',
        GRGI_DAY: 'GR',
        GR_FLAG: 'N',
        LOC_YN: 'Y',
      });
    }
  }

  async componentDidMount() {
    this.fetch('', null);
  }

  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('WMS010212SVC', 'getStockAll', {
      body: JSON.stringify({
        WMS010212F1: modelUtil.getModelData('WMS100502'),
      }),
    });
    if (result) {
      this.setState(
        {
          dataTotal: result.WMS010212G6,
          data: result.WMS010212G6,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
        callback,
      );
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  renderBody = (item, index) => (
    <HFormView style={{ marginTop: 2 }}>
      <HRow between>
        <HText
          value={item.REF_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        />
        <HText
          value={item.LOCATION}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 11,
          }}
        />
      </HRow>
      <HRow between>
        <HText value={`${item.ITEM_QTY} qty`} />
        <HText value={item.GR_DATE_TIME} />
      </HRow>
    </HFormView>
  );
  render() {
    const { navigator } = this.props.global;
    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <View style={styles.cancelBtnStyle}>
            <HText textStyle={{ fontWeight: 'bold' }}>{this.props.title}</HText>
            <Touchable
              onPress={() => {
                navigator.dismissOverlay(this.props.componentId);
              }}
            >
              <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
            </Touchable>
          </View>
          <HListView
            keyExtractor={item => item.GI_NO}
            renderHeader={null}
            renderItem={({ item, index }) => this.renderBody(item, index)}
            onSearch={() => this.fetch()}
            onMoreView={null}
            // 그려진값
            data={this.state.data}
            // 조회된값
            totalData={this.state.dataTotal}
            // 하단에 표시될 메세지값
            status={this.state.status}
          />
        </View>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnStyle: {
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.7,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
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
