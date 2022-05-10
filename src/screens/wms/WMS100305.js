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
    super(props, 'WMS100305');

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
    const result = await Fetch.request('WMS010205SVC', 'get', {
      body: JSON.stringify({
        WMS010205F1: {
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
          data: result.WMS010205G1[0],
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
      'screen.WMS100702',
      {
        onSaveComplete: callback => this.fetch(callback),
        REF_NO: `${this.state.WH_CODE}${this.state.GR_NO}`,
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
          <HText value={`${this.state.data.VENDOR_NAME}(${this.state.data.VENDOR_PLANT_NAME})`} />
          <HTexttitle>Buyer Info.</HTexttitle>
          <HText value={`${this.state.data.BUYER_NAME}(${this.state.data.BUYER_PLANT_NAME})`} />
          <HTexttitle>Basic & Cargo Info.</HTexttitle>
          <HRow>
            <HTextfield label={'GR No'} value={this.state.data.GR_NO} bold />
            <HTextfield label={'GR Date'} value={this.state.data.GR_DATE_TIME} />
          </HRow>
          <HRow>
            <HTextfield label={'GR Status'} value={this.state.data.GR_STATUS_NAME} bold />
            <HTextfield label={'Ref.Doc No.'} value={this.state.data.GR_REF_DOC_NO} bold />
          </HRow>
          <HRow>
            <HTextfield label={'Inv No.'} value={this.state.data.INV_NO} />
            <HTextfield label={'HBL No.'} value={this.state.data.HBL_NO} />
          </HRow>
          <HRow>
            <HNumberfield label={'Dt Cnt.'} value={this.state.data.GR_DT_COUNT} />
            <HNumberfield label={'Base Qty'} value={this.state.data.T_BASE_QTY} />
            <HNumberfield label={'C/T Qty'} value={this.state.data.T_GR_CT_QTY} />
          </HRow>
          <HRow>
            <HNumberfield label={'Item Qty'} value={this.state.data.T_GR_ITEM_QTY} />
            <HNumberfield label={'Plt Qty'} value={this.state.data.T_GR_PLT_QTY} />
            <HNumberfield label={'W/T'} value={this.state.data.T_GR_WT} />
          </HRow>
          <HTextfield label={'Urgent'} value={this.state.data.WH_URGENT_NAME} />
          <HTexttitle>Confirm</HTexttitle>
          <HRow>
            <HTextfield label={'Name'} value={this.state.data.GR_CONFIRM_USER_NAME} />
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
