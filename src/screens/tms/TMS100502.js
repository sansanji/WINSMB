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
  bluecolor,
} from 'libs';
/**
 * Import components
 */
import { HBaseView, HPhotoView, HButton, HText, HInputView, HRow, HCombobox } from 'ux';
/* *
 * Import node_modules
 * */

/**
 * @constructor
 * 사고등록
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TMS100502');

    this.state = {
      data: [],
      status: null,
      spinner: false,
      photoList: [],
    };
  }

  async componentWillMount() {
    modelUtil.setModelData('TMS100502', {
      REF_NO: this.props.REF_NO,
      IRRE_SEQ_NO: this.props.IRRE_SEQ_NO,
      REF_TYPE: this.props.REF_TYPE,
      IRRE_CODE: this.props.IRRE_CODE,
      IRRE_NAME: this.props.IRRE_NAME,
      IRRE_INFO: this.props.IRRE_INFO,
    });
  }

  async componentDidMount() {
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

  async fetch(callback) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request('COM080101SVC', 'getTm', {
      body: JSON.stringify({
        COM080101F2: modelUtil.getModelData('TMS100502'),
      }),
    });
    if (result.TYPE === 1) {
      // 정해진 데이터만 보여준다.
      // 모델에 데이터를 set해주면 모델을 쓸수 있다.
      modelUtil.setModelData('TMS100502', result.COM080101G1[0]);
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
          COM080101F2: modelUtil.getModelData('TMS100502'),
        }),
      },
      true,
    );
    Util.openLoader(this.screenId, false);
    if (result.TYPE === 1) {
      modelUtil.setValue('TMS100502.IRRE_SEQ_NO', result.data.IRRE_SEQ_NO);
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
          <HText>사고타입을 선태후 유형을 선택해 주세요</HText>
          <HCombobox
            label={'사고타입'}
            groupCode={'TM_IRR_TYPE'}
            codeField={'DT_CODE'}
            nameField={'LOC_VALUE'}
            bindVar={{
              CD: 'TMS100502.TM_IRR_TYPE',
              NM: 'TMS100502.TM_IRR_TYPE_NAME',
            }}
            editable
          />
          {modelUtil.getValue('TMS100502.TM_IRR_TYPE') ? (
            <HCombobox
              label={'사고유형'}
              groupCode={`TM_IRR_${modelUtil.getValue('TMS100502.TM_IRR_TYPE')}`}
              codeField={'DT_CODE'}
              nameField={'LOC_VALUE'}
              bindVar={{
                CD: 'TMS100502.IRRE_CODE',
                NM: 'TMS100502.IRRE_NAME',
              }}
              editable
            />
          ) : null}
          <HInputView
            containerStyle={{ marginTop: 5 }}
            label={'사고내용'}
            bind={'TMS100502.IRRE_INFO'}
            editable
            multiline
            numberOfLines={12}
          />
        </HBaseView>
        <View style={{ flex: 1 }}>
          <HPhotoView
            style={{ flex: 3.5 }}
            isAttachable={this.state.isAttachable || modelUtil.getValue('TMS100502.IRRE_SEQ_NO')}
            photoList={this.state.photoList}
            REF_NO={modelUtil.getValue('TMS100502.IRRE_SEQ_NO')}
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
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
