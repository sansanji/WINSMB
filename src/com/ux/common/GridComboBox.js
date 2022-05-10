/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions, KeyboardAvoidingView } from 'react-native';
import { React, _, bluecolor, modelUtil, Fetch, Util, ReduxStore } from 'libs';
import Touchable from 'common/Touchable';
import HListView from 'components/List/HListView';
import HTextfield from 'components/Form/Text/HTextfield';
import HFormView from 'components/View/HFormView';
import { HIcon, HText } from 'ux';
/**
 * 그리드 콤보박스 컴포넌트
 */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 공통코드를 활용한 그리드 콤보박스 컴포넌트
 */
class GridComboBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      status: null,
    };
  }

  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('GRIDCOMBOBOX', {});
    this.setState({
      data: this.props.comboValues,
      status: {
        TYPE: this.props.comboValues.TYPE,
        MSG: this.props.comboValues.MSG,
      }, // fetch후 리턴받은 모든 값
    });
  }

  async fetchCombo() {
    const query = _.cloneDeep(this.props.sql);
    const searchWord = modelUtil.getModelData('GRIDCOMBOBOX');
    Object.assign(query, searchWord);

    const result = await Fetch.fetchCommonCode(this.props.groupCode, searchWord);

    this.setState({
      data: result.data,
      status: {
        TYPE: result.TYPE,
        MSG: result.MSG,
      }, // fetch후 리턴받은 모든 값
    });
  }

  _onPress(item, index) {
    const { navigator } = ReduxStore.getState().global;
    navigator.dismissOverlay(this.props.componentId);
    this.props.onChange(this.state.data[index]);
  }

  // 리스트 헤더 화면
  renderHeader = () => (
    <View>
      <HTextfield
        label={'Code'}
        bind={`GRIDCOMBOBOX.${this.props.codeField}`}
        textColor={bluecolor.basicWhiteColor}
        editable
        onChanged={() => this.fetchCombo()}
      />
      <HTextfield
        label={'Name'}
        bind={`GRIDCOMBOBOX.${this.props.nameField}`}
        textColor={bluecolor.basicWhiteColor}
        editable
        onChanged={() => this.fetchCombo()}
      />
    </View>
  );

  renderBody = (item, index) => (
    <Touchable
      style={{ flex: 1 }}
      activeOpacity={0.7}
      key={item[this.props.codeField]}
      onPress={() => this._onPress(item, index)}
    >
      <HFormView style={styles.bodyStyle}>
        <HTextfield
          label={Util.getMultiText(this.props.codeField)}
          value={item[this.props.codeField]}
          // textStyle={{
          //   color: bluecolor.basicBlueImpactColor,
          // }}
        />
        <HTextfield
          label={Util.getMultiText(this.props.nameField)}
          value={item[this.props.nameField]}
          // textStyle={{
          //   color: bluecolor.basicBlueImpactColor,
          // }}
        />
      </HFormView>
    </Touchable>
  );

  render() {
    const { navigator } = ReduxStore.getState().global;

    return (
      <KeyboardAvoidingView style={styles.highContainer} behavior="height" enabled={false}>
        <View style={styles.highContainer}>
          <View style={styles.container}>
            <View style={styles.cancelBtnStyle}>
              <HText textStyle={{ fontWeight: 'bold' }}>{this.props.label}</HText>
              <Touchable
                onPress={() => {
                  navigator.dismissOverlay(this.props.componentId);
                }}
              >
                <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
              </Touchable>
            </View>
            <HListView
              keyExtractor={item => item[this.props.codeField]}
              headerClose={false}
              renderHeader={this.renderHeader}
              renderItem={({ item, index }) => this.renderBody(item, index)}
              onSearch={() => this.fetchCombo()}
              onMoreView={null}
              // 그려진값
              data={this.state.data}
              // 조회된값
              totalData={this.state.data}
              // 하단에 표시될 메세지값
              status={this.state.status}
              // style 재정의
              // headerStyle={styles.headerStyle}
              // toolbarStyle={styles.toolbarStyle}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnStyle: {
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.85,
    backgroundColor: bluecolor.basicWhiteColor,
    borderRadius: 10,
    padding: 5,
    borderWidth: 0,
    borderColor: bluecolor.basicWhiteColor,
  },
  headerStyle: {
    backgroundColor: bluecolor.basicBlueColorTrans,
  },
  toolbarStyle: {
    backgroundColor: bluecolor.basicBlueColorTrans,
  },
  bodyStyle: {
    marginTop: 2,
    backgroundColor: bluecolor.basicSoftGrayColor,
  },
});

export default GridComboBox;
