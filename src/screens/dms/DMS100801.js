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
  HTextfield,
} from 'ux';
/* *
 * Import node_modules
 * */
/**
 * @constructor
 * 환경설정
 */

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100801');
    this.state = {
      data: { version: 'V1.0', user_id: null },
    };

    const { config } = this.props.global || {};
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('DMS100801', config);
  }

  componentWillMount() {}

  onSave() {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: modelUtil.getModelData('DMS100801'),
    });
    Util.toastMsg('Saved');
    Navigation(this.props.componentId, 'POP');
  }

  onViewWhCode() {
    const { session, dmsWhcode } = this.props.global;

    Util.openComboBox({
      label: 'W/H Code',
      groupCode: 'SP9895',
      sql: {
        USER_ID: session.USER_ID,
        DEPT_CODE: session.DEPT_CODE,
      },
      codeField: 'WH_CODE',
      nameField: 'WH_NAME',
      selected: dmsWhcode.WH_CODE,
      onChange: value => {
        ReduxStore.dispatch({
          type: 'global.dmsWhcode.set',
          dmsWhcode: {
            WH_CODE: value.code,
            WH_NAME: value.name,
          },
        });
        ReduxStore.dispatch({
          type: 'global.dmsVendorcode.set',
          dmsVendorcode: null,
        });
      },
    });
  }

  async onViewVendor() {
    const { session, dmsWhcode } = this.props.global;

    const result = await Fetch.request('DMS030030SVC', 'get', {
      body: JSON.stringify({
        DMS030030F1: {
          WH_CODE: dmsWhcode.WH_CODE,
        },
      }),
    });

    if (result) {
      const vendorList = [];
      result.DMS030030G1.forEach(item => {
        vendorList.push({
          ...item,
          DISP_VENDOR_NAME: `${item.VENDOR_NAME}\n(${item.BUYER_NAME})`,
        });
      });

      Util.openComboBox({
        label: 'W/H Code',
        groupJson: vendorList,
        codeField: 'VENDOR_CODE',
        nameField: 'DISP_VENDOR_NAME',
        onChange: (value, comboValue) => {
          ReduxStore.dispatch({
            type: 'global.dmsVendorcode.set',
            dmsVendorcode: comboValue,
          });
        },
      });
    }
  }

  render() {
    const { session, dmsWhcode, dmsVendorcode } = this.props.global;
    let refDtYnName = '';
    let vendorName = '';
    if (dmsVendorcode) {
      if (dmsVendorcode.REF_DT_YN) {
        refDtYnName = dmsVendorcode.REF_DT_YN;
      }
      if (dmsVendorcode.VENDOR_NAME) {
        vendorName = dmsVendorcode.VENDOR_NAME;
      }
    }
    return (
      <View style={{ flex: 1 }}>
        <HBaseView>
          <HFormView style={{ marginTop: 5 }}>
            <Touchable onPress={() => this.onViewWhCode()}>
              <HRow>
                <View>
                  <HIcon name={'cube'} />
                  <HText>Warehouse</HText>
                </View>
                <HText>{dmsWhcode.WH_NAME}</HText>
              </HRow>
            </Touchable>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <Touchable onPress={() => this.onViewVendor()}>
              <HRow>
                <View>
                  <HIcon name={'user'} />
                  <HText>Vendor</HText>
                </View>
                <HText>{vendorName}</HText>
              </HRow>
            </Touchable>
            <HTextfield label={'Detail'} value={refDtYnName} />
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'volume-up'} />
                <HText>You can control bacord scan sounds</HText>
              </View>
              <HCheckbox label={'Scan Sound'} bind={'DMS100801.DMS_SOUND_YN'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'check'} />
                <HText>Checking a location format</HText>
              </View>
              <HCheckbox label={'Check'} bind={'DMS100801.DMS_LOC_FORMAT'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'ban'} />
                <HText>You can block duplicated locations</HText>
              </View>
              <HCheckbox
                label={'Block Duplicated Loc.'}
                bind={'DMS100801.DMS_BLOCK_DUP'}
                toggle
                editable
              />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'barcode'} />
                <HText
                  value={'Yes mode can`t check to duplicated\n* Yes mode can`t use the Move menu'}
                />
              </View>
              <HCheckbox label={'Simple Scan'} bind={'DMS100801.DMS_SIMPLE_YN'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View rowflex={2}>
                <HIcon name={'tags'} />
                <HText>Use Doc No barcode</HText>
              </View>
              <HCheckbox
                label={'USE Doc No'}
                bind={'DMS100801.DMS_DOC_NO'}
                toggle
                editable
                rowflex={1}
              />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HText>auto confirm YN</HText>
              </View>
              <HCheckbox label={'Auto Confirm'} bind={'DMS100801.DMS_AUTO_CONFIRM_YN'} toggle editable />
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
