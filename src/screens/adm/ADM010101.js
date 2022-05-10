/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
  Navigation,
  React,
  Redux,
  Util,
  ReduxStore,
  modelUtil,
  NavigationScreen,
  Fetch,
} from 'libs';
import {
  HBaseView,
  HFormView,
  HRow,
  HCheckbox,
  HText,
  HButton,
  HIcon,
  Touchable,
  HCombobox,
} from 'ux';
/* *
 * Import node_modules
 * */
/**
 * @constructor
 * 환경설정 컴포넌트
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010101');
    this.state = {
      data: { version: 'V1.0', user_id: null },
    };

    const { config } = this.props.global || {};
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('ADM010101', config);
  }

  componentWillMount() {}

  async onSave() {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: modelUtil.getModelData('ADM010101'),
    });
    Util.toastMsg('Saved');
    await Fetch.getLang(modelUtil.getValue('ADM010101.MSG_LANG'));
    Navigation(this.props.componentId, 'POP');
  }

  async onUpdate() {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: modelUtil.getModelData('ADM010101'),
    });
    Util.toastMsg('Saved');
    await Fetch.getLang(modelUtil.getValue('ADM010101.MSG_LANG'));
  }

  onViewAccount() {
    const { navigator } = this.props.global;
    Navigation(navigator, 'screen.ADM010103', {}, 'User Information');
  }

  render() {
    const { session } = this.props.global;

    return (
      <View style={{ flex: 1 }}>
        <HBaseView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'fa'} />
                <HText>App Version</HText>
              </View>
              <HText>{this.state.data.version}</HText>
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <Touchable onPress={() => this.onViewAccount()}>
              <HRow>
                <View>
                  <HIcon name={'user'} />
                  <HText>Account</HText>
                </View>
                <HText>{session.USER_ID}</HText>
              </HRow>
            </Touchable>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'volume-up'} />
                <HText>Alram sound</HText>
              </View>
              <HCheckbox label={'Yes/No'} bind={'ADM010101.ALRAM_YN'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'rotate-left'} />
                <HText>photo rotation</HText>
              </View>
              <HCheckbox label={'rotation'} bind={'ADM010101.ROTATION'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'language'} iconType={'M'} />
                <HText>Language</HText>
              </View>
              <HCombobox
                label={'Language'}
                groupJson={[
                  { LANG_CODE: 'EN', LANG_VALUE: 'English' },
                  { LANG_CODE: 'KO', LANG_VALUE: 'Korean' },
                ]}
                codeField={'LANG_CODE'}
                nameField={'LANG_VALUE'}
                bindVar={{
                  CD: 'ADM010101.MSG_LANG',
                  NM: 'ADM010101.MSG_LANG_NAME',
                }}
                editable
              />
              <HButton onPress={() => this.onUpdate()} name={'language'} title={'Update'} />
            </HRow>
          </HFormView>
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
const mapStateToProps = state => ({
  global: state.global,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
