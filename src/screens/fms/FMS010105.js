/* *
 * Import Common
 * */
import { View } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, Util, env, bluecolor, modelUtil } from 'libs';
import { HBaseView, HListView, HFormView, HRow, HText, HTextfield, HDateSet } from 'ux';

/**
 * EDI 전송 내역 확인
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'FMS010105');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
    this.callapsed = false;
  }

  componentWillMount() {
    modelUtil.setModelData('FMS010105', {
      HBL_NO: this.props.HBL_NO,
      MBL_NO: this.props.MBL_NO,
      FORWD_TYPE: this.props.FORWD_TYPE,
      IMP_EXP_FLAG: this.props.IMP_EXP_FLAG,
      SDS_SEND_DOC_TYPE: this.props.SDS_SEND_DOC_TYPE,
      ENDPOINT_FLAG: this.props.ENDPOINT_FLAG,
      DATE_FLAG: this.props.DATE_FLAG,
      DATE_FROM: Util.getDateValue(null, -20),
      DATE_TO: Util.getDateValue(null, 10),
    });

    this.fetch();
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const result = await Fetch.request(
      'FMS020102SVC',
      'getSendDocList',
      {
        body: JSON.stringify({
          FMS020102F1: modelUtil.getModelData('FMS010105'),
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result) {
      const data = Util.getArrayData(result.FMS020102G1, env().listCnt);

      this.setState({
        dataTotal: result.FMS020102G1,
        data,
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

  // 리스트 헤더 화면
  renderHeader = () => (
    <View>
      <HDateSet
        label={'Send'}
        bindVar={{
          FROM_DATE: 'FMS010105.FROM_DATE',
          TO_DATE: 'FMS010105.TO_DATE',
          DATE_TYPE: 'FMS010105.DATE_TYPE',
        }}
        lDateNum={15}
        fDateNum={-20}
        tDateNum={10}
      />
      <HRow>
        <HTextfield label={'A/O Type'} bind={'FMS010105.FORWD_TYPE'} />
        <HTextfield label={'I/E Type'} bind={'FMS010105.IMP_EXP_FLAG'} />
        <HTextfield label={'Ref No.'} bind={'FMS010105.HBL_NO'} />
      </HRow>
      <HRow>
        <HTextfield label={'Doc. Type'} bind={'FMS010105.SDS_SEND_DOC_TYPE'} />
        <HTextfield label={'End Point'} bind={'FMS010105.ENDPOINT_FLAG'} />
        <HTextfield label={''} />
      </HRow>
    </View>
  );

  // 실제 데이터가 그려질 영역 설정!
  renderBody = (item, index) => (
    // const { theme } = this.props.global;

    <HFormView style={{ marginTop: 2 }}>
      <HRow between>
        <HText
          value={item.HBL_NO}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
          }}
        />
        <HText value={item.MBL_NO} />
      </HRow>
      <HRow between>
        <HText value={`${item.DOC_TYPE} (${this.props.ENDPOINT_FLAG})`} />
        <HText value={item.SEND_TYPE} />
      </HRow>

      <HTextfield label={'Doc. No.'} value={item.DOC_NO} />
      <HTextfield label={'Msg No.'} value={item.MSG_NO} />
      <HTextfield
        label={'Send Info'}
        value={`${item.DOC_SEND_DATE} (${item.DOC_SEND_USER_NAME})`}
      />
      <HTextfield
        label={'Ack. Info'}
        value={`${item.DOC_ACKANS_DATE}\n${item.DOC_ACKANS_STATUS}`}
      />
    </HFormView>
  );

  render() {
    return (
      <HBaseView scrollable={false} button={() => this.fetch()}>
        <HListView
          keyExtractor={item => item.MSG_NO}
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
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
