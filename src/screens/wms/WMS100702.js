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
  modelUtil,
  Util,
  _,
  bluecolor,
} from 'libs';
/**
 * Import components
 */
import { HBaseView, HPhotoView, HButton, HTexttitle, HInputView, HRow } from 'ux';
/* *
 * Import node_modules
 * */

/**
 * @constructor
 * IRRE정보 등록/수정 컴포넌트
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'WMS100702');

    this.state = {
      data: [],
      status: null,
      spinner: false,
      photoList: [],
    };
  }

  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const vendorCode = _.get(this.props.global, 'vendorcode.VENDOR_CODE', null);
    const vendorPlantCode = _.get(this.props.global, 'vendorcode.VENDOR_PLANT_CODE', null);

    if (whCode && vendorCode && vendorPlantCode) {
      modelUtil.setModelData('WMS100702', {
        WH_CODE: whCode,
        VENDOR_CODE: vendorCode,
        VENDOR_PLANT_CODE: vendorPlantCode,
        REF_NO: this.props.REF_NO,
        IRRE_SEQ_NO: this.props.IRRE_SEQ_NO,
        REF_TYPE: this.props.REF_TYPE,
        IRRE_CODE: this.props.IRRE_CODE,
        IRRE_NAME: this.props.IRRE_NAME,
        IRRE_INFO: this.props.IRRE_INFO,
      });
    } else {
      modelUtil.setModelData('WMS100702', {
        REF_NO: this.props.REF_NO,
        IRRE_SEQ_NO: this.props.IRRE_SEQ_NO,
        REF_TYPE: this.props.REF_TYPE,
        IRRE_CODE: this.props.IRRE_CODE,
        IRRE_NAME: this.props.IRRE_NAME,
        IRRE_INFO: this.props.IRRE_INFO,
      });
    }
  }

  componentDidMount() {
    this.fetch(null);
  }

  onComplete() {
    Util.msgBox({
      title: 'Save',
      msg: 'Do you want to save?',
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.onSave(),
        },
        {
          title: 'Back',
          onPress: item => {},
        },
      ],
    });
  }

  // async fetch(refNo) {
  //   Util.openLoader(this.screenId, true);
  //   console.log(modelUtil.getModelData('TEMPPHOTO'));
  //   const result = await Fetch.request('file', 'getList', {
  //     body: JSON.stringify({
  //       S_FUNC_CODE: 'MB',
  //       REF_TYPE: 'RM',
  //       REF_NO: refNo,
  //     }),
  //   });
  //   // 모델에 데이터를 set해주면 모델을 쓸수 있다.

  //   modelUtil.setModelData('TEMPPHOTO', result.data[0]);
  //   this.setState({ data: result.data });
  //   Util.openLoader(this.screenId, false);
  // }

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('COM080101SVC', 'getWm', {
      body: JSON.stringify({
        COM080101F2: modelUtil.getModelData('WMS100702'),
      }),
    });
    if (result.TYPE === 1) {
      // 정해진 데이터만 보여준다.
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('WMS100702', result.COM080101G1[0]);
      this.setState(
        {
          data: result.COM080101G1[0],
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
          REF_NO: this.state.data.IRRE_SEQ_NO,
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

  _onSaveAttatch() {
    this.setState({
      isAttachable: true,
    });
  }

  // IRRE 저장
  async onSave() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request(
      'COM080101SVC',
      'saveTm',
      {
        body: JSON.stringify({
          COM080101F2: modelUtil.getModelData('WMS100702'),
        }),
      },
      true,
    );
    Util.openLoader(this.screenId, false);
    if (result.TYPE === 1) {
      modelUtil.setValue('WMS100702.IRRE_SEQ_NO', result.data.IRRE_SEQ_NO);
      Util.msgBox({
        title: 'Save',
        msg: 'Done Successfully',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              Util.msgBox({
                title: 'Photo',
                msg: 'Do you want to attach photo?',
                buttonGroup: [
                  {
                    title: 'OK',
                    onPress: () => {
                      this.fetch(this._onSaveAttatch());
                    },
                  },
                  {
                    title: 'Cancel',
                    onPress: () => {
                      this.fetch();
                    },
                  },
                ],
              });
            },
          },
        ],
      });
    }
  }

  // 삭제
  onDelete() {
    Util.msgBox({
      title: 'Delete',
      msg: 'Do you want to delete?',
      buttonGroup: [
        {
          title: 'OK',
          onPress: () => this.fetchDelete(),
        },
      ],
    });
  }

  // IRRE 삭제
  async fetchDelete() {
    Util.openLoader(this.screenId, true);
    const result = await Fetch.request(
      'COM080101SVC',
      'delete',
      {
        body: JSON.stringify({
          COM080101F2: this.state.data,
        }),
      },
      true,
    );
    Util.openLoader(this.screenId, false);
    const { componentId } = this.props;
    if (result.TYPE === 1) {
      Util.msgBox({
        title: 'Delete',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              this.props.onSaveComplete(() => {
                Navigation(componentId, 'POP');
              });
            },
          },
        ],
      });
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <HBaseView style={{ flex: 1 }}>
          <HTexttitle>IRRE Info.</HTexttitle>
          <HInputView
            containerStyle={{ marginTop: 5 }}
            label={'Contents'}
            bind={'WMS100702.IRRE_INFO'}
            editable
            multiline
            numberOfLines={12}
          />
        </HBaseView>
        <View style={{ flex: 1 }}>
          <HPhotoView
            style={{ flex: 3.5 }}
            isAttachable={this.state.isAttachable || modelUtil.getValue('WMS100702.IRRE_SEQ_NO')}
            photoList={this.state.photoList}
            REF_NO={modelUtil.getValue('WMS100702.IRRE_SEQ_NO')}
            onSuccess={() => {
              this.fetch();
            }}
          />
        </View>
        <HRow>
          <HButton
            onPress={() => this.onDelete()}
            name={'delete'}
            iconType={'M'}
            title={'Delete'}
            bStyle={{ backgroundColor: bluecolor.basicRedColor }}
            disabled={this.state.data.length <= 0}
          />
          <HButton onPress={() => this.onComplete()} name={'save'} title={'Save'} />
        </HRow>
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
