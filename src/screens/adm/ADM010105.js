/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, modelUtil, Util } from 'libs';
/**
 * Import components
 */
import {
  HBaseView,
  HFormView,
  HButton,
  HRow,
  HTextfield,
  HTexttitle,
  HText,
  HTextarea,
  HListView,
  HInputView,
} from 'ux';
/* *
 * Import node_modules
 * */

/**
 * @constructor
 * 문의사항 상세 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010105');

    this.state = {
      data: [],
      dataTotal: [],
      status: null,
    };
  }

  componentDidMount() {
    // 값이 있을때만 조회
    if (this.props.QNA_NO) {
      this.fetch(this.props.QNA_NO);
    } else {
      modelUtil.setModelData('ADM010105', {});
    }
  }

  // 문의사항 상세 조회
  async fetch(keyword) {
    Util.openLoader(this.screenId, true);
    const QNA_NO = this.props.QNA_NO || keyword;
    const result = await Fetch.request('CTM040104SVC', 'get', {
      body: JSON.stringify({
        CTM040104F1: {
          QNA_NO,
        },
      }),
    });
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('ADM010105', result.CTM040104F1);

    const resultDt = await Fetch.request('CTM040104SVC', 'getResult', {
      body: JSON.stringify({
        CTM040104F1: {
          QNA_NO: this.props.QNA_NO || keyword,
        },
      }),
    });
    this.setState({
      data: resultDt.CTM040104G1,
    });
    Util.openLoader(this.screenId, false);
  }

  // 리스트 화면

  renderBody = (item, index) => (
    <HTextarea label={item.ADD_DATE} value={item.REPLY_CONTENTS} multiline numberOfLines={3} />
  );

  // 문의사항 저장
  async onSave() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request(
      'CTM040109SVC',
      'save',
      {
        body: JSON.stringify({
          CTM040109F1: modelUtil.getModelData('ADM010105'),
        }),
      },
      true,
    );
    Util.openLoader(this.screenId, false);
    if (result.TYPE === 1) {
      this.fetch(result.data.QNA_NO);
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <HBaseView style={{ flex: 1 }}>
          <HTexttitle>Q & A Info</HTexttitle>
          <HRow between>
            <HText>{modelUtil.getValue('ADM010105.ADD_DATE')}</HText>
            <HText>{modelUtil.getValue('ADM010105.QNA_NO')}</HText>
          </HRow>
          <HFormView style={{ marginTop: 5 }}>
            <HTextfield label={'Title'} bind={'ADM010105.QNA_TITLE'} editable />
          </HFormView>
          <HInputView
            containerStyle={{ marginTop: 5 }}
            label={'Contents'}
            bind={'ADM010105.QNA_CONTENTS'}
            editable
            multiline
            numberOfLines={12}
          />
          <View style={{ flex: 1 }}>
            <HListView
              keyExtractor={item => item.SEQ}
              headerClose
              renderHeader={null}
              renderItem={({ item, index }) => this.renderBody(item, index)}
              onSearch={() => this.fetch()}
              // 그려진값
              data={this.state.data}
              // 조회된값
              totalData={this.state.data}
              msgStatusVisible={false}
            />
          </View>
        </HBaseView>
        <HButton onPress={() => this.onSave()} name={'save'} title={'Save'} />
      </View>
    );
  }
}
/**
 * Define component styles
 */
const styles = StyleSheet.create({});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
