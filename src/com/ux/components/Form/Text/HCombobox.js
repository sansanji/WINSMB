/* *
 * Import Common
 * */
import {View, StyleSheet, Text} from 'react-native';
import {_, React, Redux, bluecolor, modelUtil, Util} from 'libs';
import Touchable from 'common/Touchable';
/* *
 * Import node_modules
 * */
import {TextField} from 'rn-material-ui-textfield';

/**
 * 폼콤보박스 컴포넌트(코드와 네임 필드로 구분)
 * @param {String} label - 라벨값
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.(코드네임값셋팅)
 * @param {JSONObject} bindVar - 모델을 사용하도록함(CD : 콤보 코드, NM : 콤보 네임), 수정 가능 ex) bindVar={{
 *             CD: '모델명.CARGO_TYPE',
 *             NM: '모델명.CARGO_TYPE_NAME',
 *           }}
 * @param {Boolean} editable - value값이 없을때는 수정가능 여부를 판단(기본값 false)
 * @param {Boolean} bold - 강조하고 싶을때 true
 * @param {Boolean} require - 필수값일때 true
 * @param {String} codeField - 실제 입력될 코드 컬럼(기본은 DT_CODE)
 * @param {String} nameField - 사용자에게 보여지는 컬럼(기본은 LOC_VALUE)
 * @param {String} groupCode - 서비스 호출할 그룹코드(ex groupCode={'CARGO_TYPE'})
 * @param {JSONObject} sql - 서비스 호출시 초기 파라미터 (ex sql={{ DT_CODE: '' }})
 * @param {JSONArray} groupJson - 직접 콤보를 구성할때
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(value={code, name} 리턴)
 * @param {All} all - 나머지 옵션은 Textinput과 동일
 * @example
 * <HCombobox
 label={'Cargo Type'}
 groupCode={'CARGO_TYPE'}
 codeField={'DT_CODE'}
 nameField={'LOC_VALUE'}
 bindVar={{
   CD: 'TEMPFORM.CARGO_TYPE',
   NM: 'TEMPFORM.CARGO_TYPE_NAME',
 }}
 editable
/>
 */

class HCombobox extends React.Component {
  constructor(props) {
    super(props);
    const {bindVar} = this.props;

    this.editable = false;
    this.bindcode = _.get(bindVar, 'CD');
    this.bindname = _.get(bindVar, 'NM');
  }

  _onPress() {
    const {label, groupCode, groupJson, sql, codeField, nameField, selected} =
      this.props;

    if (this.editable) {
      Util.openComboBox({
        label,
        groupCode,
        groupJson,
        sql,
        codeField: codeField || 'DT_CODE', // 기본적으로 DT_CODE
        nameField: nameField || 'LOC_VALUE', // 기본적으로 LOC_VALUE
        selected,
        onChange: (value, comboValues) => {
          modelUtil.setValue(this.bindname, value.name);
          modelUtil.setValue(this.bindcode, value.code);
          // 값이 변할때 이벤트 발생
          if (this.props.onChanged) {
            this.props.onChanged(value, comboValues);
          }
        },
      });
    }
  }

  render() {
    const {label, value, editable, require, bold} = this.props;
    const height = 55;
    this.editable = Util.checkEdit(editable, value);
    let requireCheck = false;
    if (require) {
      if (value || modelUtil.getValue(this.bindname)) {
        requireCheck = false;
      } else {
        requireCheck = true;
      }
    }

    return (
      <View>
        <TextField
          {...this.props}
          label={`${label}▼`}
          labelFontSize={bluecolor.basicFontSizeS}
          fontSize={bluecolor.basicFontSize}
          containerStyle={styles.containerStyle}
          activeLineWidth={1}
          labelHeight={20}
          inputContainerPadding={0}
          inputContainerStyle={{height}}
          textColor={bluecolor.basicBlueFontColor}
          style={bold ? {fontWeight: 'bold'} : null}
          // onChangeText={text => {}}
          lineWidth={0}
          value={String(value || modelUtil.getValue(this.bindname))}
          editable={this.editable}
          labelTextStyle={bold ? {fontWeight: 'bold'} : null}
          baseColor={
            this.editable ? bluecolor.basicBluebt : bluecolor.basicDeepGrayColor
          }
          allowFontScaling={false}
          showSoftInputOnFocus={false}
          onFocus={() => this._onPress()}
        />

        {requireCheck ? (
          <Text
            style={{
              color: 'red',
              fontSize: 10,
              position: 'absolute',
              top: 27,
              left: 0,
            }}>
            *
          </Text>
        ) : null}
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  containerStyle: {
    marginTop: -5,
    marginLeft: 5,
    marginRight: 5,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({model: state.model});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(HCombobox);
