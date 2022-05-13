/* *
 * Import Common
 * */
import { View, StyleSheet, TextInput } from 'react-native';
import {
  React,
  Redux,
  Fetch,
  Navigation,
  NavigationScreen,
  Util,
  bluecolor,
  modelUtil,
} from 'libs';
import {
  HBaseView,
  HRow,
  HFormView,
  HText,
  HListView,
  HTexttitle,
  HButton,
  HNumberfield,
  HTextfield,
} from 'ux';
/* *
 * Import node_modules
 * */

/**
 * Stock History
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS201202');

    this.state = {
      totalData: [],
      data: [],
      formData: [],
      status: null,
      spinner: false,
      barcodeData1: null,
    };
  }

  componentWillMount() {
    modelUtil.setModelData('DMS201202_P', {
      COMPANY_CODE: this.props.COMPANY_CODE,
      WH_CODE: this.props.WH_CODE,
      STK_DATE: this.props.STK_DATE,
      SEQ_NO: this.props.SEQ_NO,
      SCAN_NO: `IT${this.props.GUBUN_NO}`,
      GR_NO: this.props.GR_NO,
      GR_SEQ_NO: this.props.GR_SEQ_NO,
    });
  }

  componentDidMount() {
    this.fetch(null);
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetch(callback) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030510SVC', 'getDT', {
      body: JSON.stringify({
        DMS030510F1: modelUtil.getModelData('DMS201202_P'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      // modelUtil.setModelData('DMS201202', result.DMS030510G2[0]);
      this.setState(
        {
          formData: result.DMS030510G2[0],
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
        callback,
      );
      this.fetchHistory();
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  async fetchHistory(callback) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030510SVC', 'getHistory', {
      body: JSON.stringify({
        DMS030510F1: modelUtil.getModelData('DMS201202_P'),
      }),
    });
    if (result) {
      this.setState(
        {
          totalData: result.DMS030510G3,
          data: result.DMS030510G3,
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
        callback,
      );
      // Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      // Util.openLoader(this.screenId, false);
    }
  }

  // 저장하기
  onSave() {
    Util.msgBox({
      title: 'Move',
      msg: 'Do you want to move?',
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchSave(),
        },
      ],
    });
  }

  async fetchSave() {
    const { config } = this.props.global;
    const dmsBlockDup = config.DMS_BLOCK_DUP; // 로케이션 중복 허용 설정
    // const dmsBlockDup = _.get(this.props.global, 'config.DMS_BLOCK_DUP', null);

    const tabCode = 'MOBILE';
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { navigator } = this.props;
    const result = await Fetch.request('DMS030510SVC', 'saveLoc', {
      body: JSON.stringify({
        DMS030510F1: {
          TAB_CODE: tabCode, // 모바일 상세정보(기존LOCATION여부 체크)
        },
        DMS030510G1: {
          data: [
            {
              WH_CODE: this.props.WH_CODE,
              GR_NO: this.props.GR_NO,
              TYPE: this.props.TYPE,
              LOCATION: this.state.barcodeData1,
              GUBUN_NO: this.props.GUBUN_NO,
            },
          ],
        },
      }),
    });

    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Save Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
              this.fetch();
            },
          },
        ],
      });
    } else {
      Util.msgBox({
        title: 'Save Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.openLoader(this.screenId, false);
            },
          },
        ],
      });
    }
  }

  renderBody = (item, index, scanData, scanIndex) => (
    <View style={{ flex: 1 }} key={item.REF_DT_NO + item.PARTITION_SEQ_NO}>
      <HFormView>
        <HRow>
          <HText value={`Old : ${item.OLD_LOCATION}`} />

          <HText value={`New : ${item.CHANGE_LOCATION}`} textStyle={[{ fontWeight: 'bold' }]} />
        </HRow>
        <HText value={item.ADD_DATE} textStyle={[{ color: bluecolor.basicRedColor }]} />
      </HFormView>
    </View>
  );

  render() {
    return (
      <HBaseView>
        <HFormView>
          <HRow style={{ flex: 1 }} between>
            <HText textStyle={{ fontSize: 13, fontWeight: 'bold' }}>{this.state.formData.VENDOR_NAME}</HText>
          </HRow>
          <HRow>
            <HTextfield label={'ITEM Name'} value={this.state.formData.ITEM_NAME} />
            <HTextfield label={'GR Date'} value={this.state.formData.GR_DATE} />
          </HRow>
          <HRow>
            <HTextfield label={'Doc No'} value={this.state.formData.DOC_NO} />
            <HTextfield label={'Location'} value={this.state.formData.LOCATION} />
          </HRow>
          <HRow between>
            <HText value={`PLT : ${this.state.formData.PLT_QTY}`} textStyle={{ fontSize: 12 }} />
            <HText value={`Box : ${this.state.formData.BOX_QTY}`} textStyle={{ fontSize: 12 }} />
            <HText value={`Item : ${this.state.formData.ITEM_QTY}`} textStyle={{ fontSize: 12 }} />
            <HText value={`Weight : ${this.state.formData.GW}`} textStyle={{ fontSize: 12 }} />
          </HRow>
          <HRow>
            <TextInput
              style={(styles.barcodeInput, { flex: 1 })}
              // ref="barcode1" // 빨간 줄 가도 무시하자!
              ref={c => {
                this.barcode1 = c;
              }}
              placeholder="Location"
              onChangeText={barcodeData1 => this.setState({ barcodeData1 })}
              value={this.state.barcodeData1}
              autoFocus
              // autoFocus
              blurOnSubmit={false}
              keyboardType="email-address"
              onSubmitEditing={() => {
                this.focusNextField();
              }}
            />
            <HButton onPress={() => this.onSave()} title={'Move'} />
          </HRow>
        </HFormView>
        <HTexttitle>History info.</HTexttitle>
        <HListView
          keyExtractor={item => item.REF_DT_NO + item.PARTITION_SEQ_NO}
          renderHeader={null}
          renderItem={({ item, index }) =>
            this.renderBody(item, index, this.state.barcodeScanData, this.state.barcodeScanIndex)
          }
          onSearch={() => this.fetchHistory()}
          onMoreView={null}
          data={this.state.data}
          // 조회된값
          totalData={this.state.totalData}
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
  barcodeInput: {
    height: 40,
    flex: 1,
    borderColor: 'gray',
    paddingLeft: 10,
    paddingRight: 10,
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
