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
    super(props, 'DMS100408');
    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  async componentWillMount() {
    const { item } = this.props;
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const COMPANY_CODE = this.props.global.session.COMPANY_CODE;
    if (whCode) {
      modelUtil.setModelData('DMS100408', {
        COMPANY_CODE,
        WH_CODE: whCode,
        GR_NO: item.GR_NO,
        GR_SEQ_NO: item.GR_SEQ_NO,
        PLT_YN: this.props.PLT_YN,
        BOX_YN: this.props.BOX_YN,
        ITEM_YN: this.props.ITEM_YN,
      });
    }
  }

  async componentDidMount() {
    this.fetch('', null);
  }

  async fetch(sort, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request('DMS030511SVC', 'getPopupM', {
      body: JSON.stringify({
        DMS030511F1: modelUtil.getModelData('DMS100408'),
      }),
    });
    if (result) {
      this.setState(
        {
          dataTotal: result.DMS030511G1,
          data: result.DMS030511G1,
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
      <HText
        value={item.VENDOR_NAME}
        textStyle={{
          fontSize: 12,
        }}
      />
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
          value={item.PLT_NO}
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
      <HRow>
        {
          !Util.isEmpty(item.REMARKS) ? <HText value={`Remark : ${item.REMARKS}`} textStyle={{ fontSize: 12 }} />
            : <HText value={''} />
        }
      </HRow>
      <HRow between>
        <HText value={`PLT : ${item.PLT_QTY}`} textStyle={{ fontSize: 12 }} />
        <HText value={`Box : ${item.BOX_QTY}`} textStyle={{ fontSize: 12 }} />
        <HText value={`CBM : ${item.CBM}`} textStyle={{ fontSize: 12 }} />
        <HText value={`Item : ${item.ITEM_QTY}`} textStyle={{ fontSize: 12 }} />
        <HText value={`Weight : ${item.GW}`} textStyle={{ fontSize: 12 }} />
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
