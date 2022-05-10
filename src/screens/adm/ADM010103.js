/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, modelUtil, Util } from 'libs';
/**
 * Import components
 */
import { HBaseView, HDatefield, HButton, HRow, HTextfield } from 'ux';
/* *
 * Import node_modules
 * */

/**
 * @constructor
 * 계정정보 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010103');

    this.state = {};
  }

  componentDidMount() {
    this.fetch();
  }

  // 유저정보 조회
  async fetch() {
    const { session } = this.props.global;

    Util.openLoader(this.screenId, true);
    const result = await Fetch.request('COM060104SVC', 'get', {
      body: JSON.stringify({
        COM060104F1: session,
      }),
    });
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('ADM010103', result.COM060104F1);
    Util.openLoader(this.screenId, false);
  }

  // 유저정보 저장
  async onSave() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request(
      'COM060104SVC',
      'save',
      {
        body: JSON.stringify({
          COM060104F1: modelUtil.getModelData('ADM010103'),
        }),
      },
      true,
    );
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    Util.openLoader(this.screenId, false);
    if (result) {
      if (result.TYPE === 1) {
        this.fetch();
      }
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <HBaseView>
          <HRow>
            <HTextfield label={'User ID'} bind={'ADM010103.F_USER_ID'} />
            <HTextfield label={'Company'} bind={'ADM010103.F_COMPANY_CODE'} />
          </HRow>
          <HRow>
            <HTextfield label={'User Name(Loc)'} bind={'ADM010103.F_USER_NAME_LOC'} />
            <HTextfield label={'User Name(Eng)'} bind={'ADM010103.F_USER_NAME_ENG'} />
          </HRow>
          <HDatefield label={'Expire P/W'} bind={'ADM010103.F_EXPIRED_DATE'} />
          <HRow>
            <HTextfield
              label={'E-Mail'}
              bind={'ADM010103.F_EMAIL'}
              editable
              keyboardType={'email-address'}
            />
            <HTextfield
              label={'H/P'}
              bind={'ADM010103.F_USER_CP'}
              editable
              keyboardType={'phone-pad'}
            />
          </HRow>
          <HRow>
            <HTextfield
              label={'TEL'}
              bind={'ADM010103.F_TEL_NO'}
              editable
              keyboardType={'phone-pad'}
            />
            <HTextfield
              label={'FAX'}
              bind={'ADM010103.F_FAX_NO'}
              editable
              keyboardType={'phone-pad'}
            />
          </HRow>
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
