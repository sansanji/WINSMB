/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions } from 'react-native';
import { _, React, Util, Redux, Fetch, NavigationScreen, modelUtil, bluecolor } from 'libs';
import { Touchable, HRow, HFormView, HText, HListView, HIcon } from 'ux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
/**
 * Stock info > daily > popUp list
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200902');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  async componentWillMount() {
    const { item } = this.props;
    const { DMS030510F1 } = this.props;

    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const COMPANY_CODE = this.props.global.session.COMPANY_CODE;
    if (whCode) {
      modelUtil.setModelData('DMS200902', {
        COMPANY_CODE,
        WH_CODE: item.WH_CODE,
        VENDOR_CODE: item.VENDOR_CODE,
        BUYER_CODE: item.VENDOR_CODE,
        GR_DATE_FROM: DMS030510F1.GR_DATE_FROM,
        M_KEYWORD: DMS030510F1.M_KEYWORD,
      });
    }
  }

  async componentDidMount() {
    this.fetch('', null);
  }

  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('DMS030510SVC', 'getPLTLotteDT', {
      body: JSON.stringify({
        DMS030510F1: modelUtil.getModelData('DMS200902'),
      }),
    });
    if (result) {
      this.setState(
        {
          dataTotal: result.DMS030510G1,
          data: result.DMS030510G1,
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

  renderBody = (item) => (

    <HFormView style={{ marginTop: 2 }}>
      <HRow between>
        <HText
          value={item.WH_NAME}
          textStyle={{
            fontSize: 12,
          }}
        />
        <HText
          value={item.VENDOR_NAME}
          textStyle={{
            fontSize: 12,
          }}
        />
      </HRow>
      <HRow between>
        <HText
          value={item.GR_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 13,
          }}
        />
        <HText
          value={item.PALLET_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 13,
          }}
        />
      </HRow>
      <HRow between>
        <HText
          value={item.ITEM_NAME}
          textStyle={{
            fontSize: 12,
          }}
        />
        <HText
          value={item.LOCATION}
          textStyle={{
            fontSize: 12,
          }}
        />
      </HRow>
      <HRow between>
        <HText
          value={item.REF_NO}
          textStyle={{
            fontSize: 12,
          }}
        />
        <HText
          value={item.REF_DOC_NO}
          textStyle={{
            fontSize: 12,
          }}
        />
      </HRow>
      <HRow between>
        <HText value={`DOC No : ${item.DOC_NO}`} textStyle={{ fontSize: 12 }} />
        <HText value={`GW : ${item.GW}`} textStyle={{ fontSize: 12 }} />
      </HRow>
      <HRow between>
        <HText value={`REMARKS : ${item.REMARKS}`} textStyle={{ fontSize: 12 }} />

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
            keyExtractor={item => item.PALLET_NO}
            renderHeader={null}
            renderItem={({ item }) => this.renderBody(item)}
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
