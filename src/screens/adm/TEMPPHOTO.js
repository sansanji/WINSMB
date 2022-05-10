/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';

import { React, Redux, Fetch, NavigationScreen, modelUtil, Util } from 'libs';
import { HPhotoView } from 'ux';
/* *
 * Import node_modules
 * */

/**
 * 샘플 폼
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPFORM');

    this.state = {
      keyword: '',
      data: [],
    };
  }

  componentWillMount() {
    this.fetch('TIR19010003');
  }

  async fetch(refNo) {
    Util.openLoader(this.screenId, true);
    console.log(modelUtil.getModelData('TEMPPHOTO'));
    const result = await Fetch.request('file', 'getList', {
      body: JSON.stringify({
        S_FUNC_CODE: 'MB',
        REF_TYPE: 'RM',
        REF_NO: refNo,
      }),
    });
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.

    modelUtil.setModelData('TEMPPHOTO', result.data[0]);
    this.setState({ data: result.data });
    Util.openLoader(this.screenId, false);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <HPhotoView
          style={{ flex: 3.5 }}
          isAttachable
          photoList={this.state.data}
          REF_NO={'TIR19010003'}
          onSuccess={() => {
            this.fetch('TIR19010003');
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
