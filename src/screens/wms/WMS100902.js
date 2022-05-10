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
    super(props, 'WMS100902');

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
    modelUtil.setModelData('WMS100902_P', {
      WH_CODE: this.props.WH_CODE,
      STK_DATE: this.props.STK_DATE,
      SEQ_NO: this.props.SEQ_NO,
      STK_NO: this.props.STK_NO,
      PARTITION_SEQ_NO: this.props.PARTITION_SEQ_NO,
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
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('WMS010214SVC', 'getDT', {
      body: JSON.stringify({
        WMS010214F1: modelUtil.getModelData('WMS100902_P'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('WMS100902', result.WMS010214G2[0]);
      this.setState(
        {
          formData: result.WMS010214G2[0],
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
    const result = await Fetch.request('WMS010214SVC', 'getHistory', {
      body: JSON.stringify({
        WMS010214F1: modelUtil.getModelData('WMS100902_P'),
      }),
    });
    if (result) {
      this.setState(
        {
          totalData: result.WMS010214G3,
          data: result.WMS010214G3,
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
    const wmsBlockDup = config.WMS_BLOCK_DUP; // 로케이션 중복 허용 설정
    // const wmsBlockDup = _.get(this.props.global, 'config.WMS_BLOCK_DUP', null);

    let tabCode = 'M_REF_DT';
    if (wmsBlockDup) {
      if (wmsBlockDup === 'Y') {
        tabCode = 'M_GR_REF_DT';
      }
    }
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const { navigator } = this.props;
    const result = await Fetch.request('WMS010212SVC', 'saveLoc', {
      body: JSON.stringify({
        WMS010212F1: {
          TAB_CODE: tabCode, // 모바일 상세정보(기존LOCATION여부 체크)
        },
        WMS010212G1: {
          data: [
            {
              WH_CODE: this.props.WH_CODE,
              GR_NO: this.props.GR_NO,
              REF_DT_NO: this.props.STK_NO,
              PARTITION_SEQ_NO: this.props.PARTITION_SEQ_NO,
              LOCATION: this.state.barcodeData1,
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
          <HRow>
            <HTextfield label={'GR No'} value={this.state.formData.GR_NO} bold />
            <HTextfield label={'GR Date'} value={this.state.formData.GR_DATE_TIME} />
          </HRow>
          <HRow>
            <HTextfield label={'Ref No'} value={this.state.formData.REF_NO} />
            <HTextfield label={'Lot No'} value={this.state.formData.LOT_NO} />
          </HRow>
          <HNumberfield label={'W/T'} value={this.state.formData.WEIGHT} />
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
