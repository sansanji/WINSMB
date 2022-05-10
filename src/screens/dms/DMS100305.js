/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, Fetch, Navigation, NavigationScreen, Util, bluecolor } from 'libs';
import {
  HBaseView,
  HIcon,
  HRow,
  HFormView,
  HText,
  HTexttitle,
  HNumberfield,
  HButton,
  HTextfield,
} from 'ux';
/**
 * 출고 상세 헤더
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100305');

    this.state = {
      data: [],
      WH_CODE: this.props.params.WH_CODE,
      GR_NO: this.props.params.GR_NO,
      GR_DATE: this.props.params.GR_DATE,
    };
  }

  componentWillMount() {
    this.setState({
      WH_CODE: this.props.params.WH_CODE,
      GR_NO: this.props.params.GR_NO,
      GR_DATE: this.props.params.GR_DATE,
    });
    this.fetch();
  }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('DMS030050SVC', 'get', {
      body: JSON.stringify({
        DMS030050F1: {
          WH_CODE: this.state.WH_CODE,
          GR_NO: this.state.GR_NO,
          GR_DATE_FROM: this.state.GR_DATE,
          GR_DATE_TO: this.state.GR_DATE,
          GR_FLAG: 'Y',
        },
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.

      this.setState(
        {
          data: result.DMS030050G1[0],
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

  _onPress() {
    const { navigator } = this.props;

    Navigation(
      navigator,
      'screen.DMS100702',
      {
        onSaveComplete: callback => this.fetch(callback),
        REF_NO: `D${this.state.WH_CODE}${this.state.GR_NO}`,
        IRRE_SEQ_NO: '',
        REF_TYPE: 'GR',
        IRRE_CODE: 'ETC',
        IRRE_NAME: '기타',
        IRRE_INFO: '',
        parentDispalyId: this.props.testID,
      },
      'IRRE Info.',
    );
  }

  render() {
    return (
      <HBaseView style={styles.container}>
        <HFormView>
          <HTexttitle>Vendor Info.</HTexttitle>
          <HText value={`${this.state.data.VENDOR_NAME}`} />
          <HTexttitle>Buyer Info.</HTexttitle>
          <HText value={`${this.state.data.BUYER_NAME}`} />
          <HTexttitle>Basic & Cargo Info.</HTexttitle>
          <HRow>
            <HTextfield label={'GR No'} value={this.state.data.GR_NO} bold />
            <HTextfield label={'GR Date'} value={this.state.data.GR_DATE_TIME} />
          </HRow>
          <HRow>
            <HTextfield label={'GR Status'} value={this.state.data.GR_STATUS_NAME} bold />
            <HTextfield label={'Ref No.'} value={this.state.data.REF_NO} bold />
          </HRow>
          <HRow>
            <HTextfield label={'Ref.Doc No.'} value={this.state.data.REF_DOC_NO} />
            <HNumberfield label={'Dt Cnt.'} value={this.state.data.GR_DT_COUNT} />
          </HRow>
          <HRow>
            <HNumberfield label={'Item Qty'} value={this.state.data.T_GR_ITEM_QTY} />
            <HNumberfield label={'Box Qty'} value={this.state.data.T_GR_BOX_QTY} />
            <HNumberfield label={'Plt Qty'} value={this.state.data.T_GR_PLT_QTY} />
            <HNumberfield label={'W/T'} value={this.state.data.T_GR_WT} />
          </HRow>
          <HRow>
            <HNumberfield label={'CBM'} value={this.state.data.T_GR_CBM} />
            <HNumberfield label={'Pyeong'} value={this.state.data.T_GR_PYEONG} />
            <HNumberfield label={'SQM'} value={this.state.data.T_GR_SQUARE_METER} />
          </HRow>
          <HTexttitle>Confirm</HTexttitle>
          <HRow>
            <HTextfield label={'Name'} value={this.state.data.CONFIRM_USER_NAME} />
            <HTextfield label={'Date'} value={this.state.data.GR_CONFIRM_DATE} />
          </HRow>
        </HFormView>
        <View style={[styles.buttonInnerContainer]}>
          <HButton onPress={() => this._onPress()} title={'Irre Reg'} />
        </View>
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonInnerContainer: {
    flex: 1,
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
