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
    super(props, 'WMS100801');
    this.state = {
      data: { version: 'V1.0', user_id: null },
    };

    const { config } = this.props.global || {};
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('WMS100801', config);
  }

  componentWillMount() {}

  onSave() {
    ReduxStore.dispatch({
      type: 'global.config.set',
      config: modelUtil.getModelData('WMS100801'),
    });
    Util.toastMsg('Saved');
    Navigation(this.props.componentId, 'POP');
  }

  onViewWhCode() {
    const { session, whcode } = this.props.global;

    Util.openComboBox({
      label: 'W/H Code',
      groupCode: 'SP9972',
      sql: {
        USER_ID: session.USER_ID,
        DEPT_CODE: session.DEPT_CODE,
      },
      codeField: 'WH_CODE',
      nameField: 'WH_NAME',
      selected: whcode.WH_CODE,
      onChange: value => {
        ReduxStore.dispatch({
          type: 'global.whcode.set',
          whcode: {
            WH_CODE: value.code,
            WH_NAME: value.name,
          },
        });
        ReduxStore.dispatch({
          type: 'global.vendorcode.set',
          vendorcode: null,
        });
      },
    });
  }

  async onViewVendor() {
    const { session, whcode } = this.props.global;

    const result = await Fetch.request('WMS010109SVC', 'get', {
      body: JSON.stringify({
        WMS010109F1: {
          WH_CODE: whcode.WH_CODE,
        },
      }),
    });

    if (result) {
      const vendorList = [];
      result.WMS010109G1.forEach(item => {
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
            type: 'global.vendorcode.set',
            vendorcode: comboValue,
          });
        },
      });
    }
  }

  render() {
    const { session, whcode, vendorcode } = this.props.global;
    let refDtYnName = '';
    let vendorName = '';
    if (vendorcode) {
      if (vendorcode.REF_DT_YN) {
        refDtYnName = vendorcode.REF_DT_YN;
      }
      if (vendorcode.VENDOR_NAME) {
        vendorName = vendorcode.VENDOR_NAME;
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
                <HText>{whcode.WH_NAME}</HText>
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
              <HCheckbox label={'Scan Sound'} bind={'WMS100801.WMS_SOUND_YN'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View>
                <HIcon name={'check'} />
                <HText>Checking a location format</HText>
              </View>
              <HCheckbox label={'Check'} bind={'WMS100801.WMS_LOC_FORMAT'} toggle editable />
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
                bind={'WMS100801.WMS_BLOCK_DUP'}
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
              <HCheckbox label={'Simple Scan'} bind={'WMS100801.WMS_SIMPLE_YN'} toggle editable />
            </HRow>
          </HFormView>
          <HFormView style={{ marginTop: 5 }}>
            <HRow>
              <View rowflex={2}>
                <HIcon name={'tags'} />
                <HText>Use Lot No barcode(GR Ref Dt)</HText>
              </View>
              <HCheckbox
                label={'USE Lot No'}
                bind={'WMS100801.WMS_LOT_NO'}
                toggle
                editable
                rowflex={1}
              />
              <HCheckbox
                label={'Check Lot Format'}
                bind={'WMS100801.WMS_LOT_FORMAT'}
                toggle
                editable
                rowflex={1}
              />
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
