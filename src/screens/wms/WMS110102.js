/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
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
  HCheckbox,
  HRow,
  HFormView,
  HText,
  HPhotoView,
  HTexttitle,
  HCombobox,
  HButton,
  HNumberfield,
  HTextfield,
} from 'ux';
/* *
 * Import node_modules
 * */

/**
 * 하기운송관리(출고) 상세
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS110102');

    this.state = {
      data: [],
      status: null,
      spinner: false,
      photoList: [],
    };
  }

  componentWillMount() {
    modelUtil.setModelData('WMS110102_P', {
      CONSIGNEE_EX_FLAG: 'N',
      CONSIGNEE_SM: 'M',
      HBL_NO: this.props.HBL_NO,
      ETA_FLAG: 'Y',
      WH_CODE: '',
      WH_GI_YN: this.props.WH_GI_YN,
      WH_GI_YN_NAME: 'NO',
      DMG_YN: '',
      HBL_NO_EX_FLAG: 'N',
      HBL_NO_SM: 'S',
      M_UNLOAD_EX_FLAG: 'N',
      UNLOAD_EX_FLAG: 'N',
      UNLOAD_SPOT_SM: 'M',
      WH_EX_FLAG: 'N',
      ETA_DATE_FROM: modelUtil.getValue('WMS110101.ETA_DATE_FROM'),
      ETA_DATE_TO: modelUtil.getValue('WMS110101.ETA_DATE_TO'),
    });
  }

  componentDidMount() {
    this.fetch(null);
  }

  shouldComponentUpdate() {
    return true;
  }

  async fetch(REF_NO, callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('FMS040112SVC', 'get', {
      body: JSON.stringify({
        FMS040112F1: modelUtil.getModelData('WMS110102_P'),
      }),
    });
    if (result) {
      // 정해진 데이터만 보여준다.
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('WMS110102', result.FMS040112G1[0]);
      this.setState(
        {
          data: result.FMS040112G1[0],
          status: {
            TYPE: result.TYPE,
            MSG: result.MSG,
          },
        },
        callback,
      );
      // 첨부사진 가져오기..
      const resultPhoto = await Fetch.request('file', 'getList', {
        body: JSON.stringify({
          S_FUNC_CODE: 'MB',
          REF_TYPE: 'RM',
          REF_NO: `${this.state.data.HBL_NO}_AP`,
        }),
      });
      this.setState({ photoList: resultPhoto.data });
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({
        status: null, // fetch후 리턴받은 모든 값
      });
      Util.openLoader(this.screenId, false);
    }
  }

  // 저장하기
  onSave(type) {
    if (type === 'SAVE') {
      Util.msgBox({
        title: '저장',
        msg: '저장하시겠습니까?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this.fetchSave(type),
          },
        ],
      });
    } else {
      Util.msgBox({
        title: '출고',
        msg: '출고하시겠습니까?',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => this.fetchSave(type),
          },
        ],
      });
    }
  }

  async fetchSave(type) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    if (type === 'GI') {
      modelUtil.setValue('WMS110102.WH_GI_YN', 'Y');
    }

    modelUtil.setValue('WMS110102.DMG_QTY', modelUtil.getValue('WMS110102.DMG_QTY').toString());

    const { componentId } = this.props;
    const result = await Fetch.request('FMS040112SVC', 'save', {
      body: JSON.stringify({
        FMS040112G1: {
          data: [modelUtil.getModelData('WMS110102')],
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
              if (type === 'GI') {
                this.props.onSaveComplete(() => {
                  Navigation(componentId, 'POP');
                });
              }
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

  render() {
    return (
      <HBaseView>
        <HFormView
          style={[
            this.state.data.WH_GI_YN === 'Y'
              ? { backgroundColor: bluecolor.basicGreenColor }
              : null,
          ]}
        >
          <HRow>
            <HTextfield label={'HAWB'} value={this.state.data.HBL_NO} bold rowflex={3} />
            <HNumberfield label={'PKGS'} value={this.state.data.PKG_QTY} />
            <HNumberfield label={'G/W'} value={this.state.data.GW} />
            <HTextfield label={'하기장소'} value={this.state.data.UNLOAD_SPOT} />
          </HRow>
          <HRow>
            <HText value={this.state.data.CONSIGNEE_NAME} numberOfLines={1} rowflex={1.4} />
            <HText value={this.state.data.CONSIGNEE_PLANT_NAME} numberOfLines={1} rowflex={1} />
            <HText value={this.state.data.FLNT_NO} rowflex={0.7} />
            <HText value={this.state.data.ATA_DATE} rowflex={1.7} />
          </HRow>
          <HRow>
            <HText textStyle={{ color: bluecolor.basicRedColor }} value={this.state.data.OP_MEMO} />
            <HText
              textStyle={{ color: bluecolor.basicRedColor }}
              value={this.state.data.DEFFER_CONTENT_NAME}
            />
          </HRow>
        </HFormView>
        <HFormView
          style={{
            margin: 0,
          }}
        >
          <HTexttitle>IRRE 정보</HTexttitle>
          <HRow>
            <HNumberfield label={'DMG수량'} bind={'WMS110102.DMG_QTY'} editable />
            <HCombobox
              label={'DMG단위'}
              groupCode={'PKG_TYPE'}
              bindVar={{
                CD: 'WMS110102.QTY_TYPE',
                NM: 'WMS110102.QTY_TYPE_NAME',
              }}
              editable
            />
            <HCombobox
              label={'보류내용'}
              groupCode={'DEFFER_CONTENT'}
              bindVar={{
                CD: 'WMS110102.DEFFER_CONTENT',
                NM: 'WMS110102.DEFFER_CONTENT_NAME',
              }}
              editable
            />
          </HRow>
          <HRow>
            <HCheckbox label={'찌그러짐'} bind={'WMS110102.CHECK_LIST1'} editable toggle />
            <HCheckbox label={'찍힘'} bind={'WMS110102.CHECK_LIST2'} editable toggle />
            <HCheckbox label={'터짐'} bind={'WMS110102.CHECK_LIST3'} editable toggle />
            <HCheckbox label={'찢김(스크레치)'} bind={'WMS110102.CHECK_LIST9'} editable toggle />
          </HRow>
          <HRow>
            <HCheckbox label={'변색(Tilt)'} bind={'WMS110102.CHECK_LIST10'} editable toggle />
            <HCheckbox label={'내품보임'} bind={'WMS110102.CHECK_LIST6'} editable toggle />
            <HCheckbox label={'침수'} bind={'WMS110102.CHECK_LIST4'} editable toggle />
            <HCheckbox label={'변색(Shock)'} bind={'WMS110102.CHECK_LIST5'} editable toggle />
          </HRow>
          <HRow>
            <HCheckbox
              label={'분실/도난'}
              bind={'WMS110102.CHECK_LIST7'}
              editable
              toggle
              flex={1}
            />
            <HTextfield label={'기타(사용자입력)'} bind={'WMS110102.CHECK_ETC'} editable flex={3} />
          </HRow>

          <HButton onPress={() => this.onSave('SAVE')} name={'save'} title={'저장'} />
          {/* <HRow>
            <HButton onPress={() => this.onSave('SAVE')} name={'save'} title={'저장'} />
            <HButton
              onPress={() => this.onSave('GI')}
              name={'check-circle-o'}
              title={'출고'}
              bStyle={{
                backgroundColor: bluecolor.basicGreenColor,
              }}
            />
            </HRow> */}
          <View style={{ height: 400 }}>
            <HPhotoView
              style={{ flex: 3.5 }}
              isAttachable
              photoList={this.state.photoList}
              REF_NO={`${this.state.data.HBL_NO}_AP`}
              onSuccess={() => {
                this.fetch(`${this.state.data.HBL_NO}_AP`);
              }}
            />
          </View>
        </HFormView>
      </HBaseView>
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
