/* *
 * Import Common
 * */
import {View, StyleSheet, Text} from 'react-native';
import {React, Redux, bluecolor, modelUtil, Util} from 'libs';
import Touchable from 'common/Touchable';
/* *
 * Import node_modules
 * */
import {TextField} from 'rn-material-ui-textfield';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 폼날짜필드 컴포넌트
 * (모델기반으로 초기값을 넣고 싶을때 Util.getDateValue(날짜,일자계산)를 활용하여 모델에 넣어준다.)
 * @param {String} label - 라벨값
 * @param {String} value - 표시할 값 / 단, 값을 넣어주면 표시해주지만 수정은 불가하다.
 * @param {String} bind - 모델을 사용하도록함(모델명.컬럼명), 수정 가능
 * @param {Boolean} editable - value값이 없을때는 수정가능 여부를 판단(기본값 false)
 * @param {Boolean} bold - 강조하고 싶을때 true
 * @param {Boolean} require - 필수값일때 true
 * @param {Function} onChanged - 값이 변할때 발생 이벤트(date 리턴)
 * @param {Number} dateNum - 날짜를 기본으로 셋팅하고 싶을때...(값이 없을때만 자동셋팅되면 값이 있으면 무시된다.)
 * @param {All} all - 나머지 옵션은 Textinput과 동일
 * @example
 * <HDatefield label={'ETD'} bind={'TEMPFORM.ETD_DATE'} editable />
 */

class HDatefield extends React.Component {
  constructor(props) {
    super(props);
    this.editable = false;
  }

  // 초기값을 셋팅해준다.
  componentDidUpdate() {
    const date = modelUtil.getValue(this.props.bind);
    if (!date) {
      const value = Util.getDateValue(date, this.props.dateNum);
      if (value) {
        modelUtil.setValue(this.props.bind, value);
      }
    }
  }

  _onPress() {
    const {label} = this.props;

    if (this.editable) {
      Util.openCalendar({
        label,
        onChange: date => {
          const {dateString, dateOrigin} = date;
          modelUtil.setValue(this.props.bind, dateOrigin);
          // 값이 변할때 이벤트 발생
          if (this.props.onChanged) {
            this.props.onChanged(date);
          }
        },
        current: Util.formatDate(
          this.props.value || modelUtil.getValue(this.props.bind),
          this.props.dateNum,
        ),
      });
    }
  }

  render() {
    const {editable, value, label, bind, dateNum, require, bold} = this.props;
    const height = 55;
    this.editable = Util.checkEdit(editable, value);

    let requireCheck = false;
    if (require) {
      if (value || modelUtil.getValue(bind)) {
        requireCheck = false;
      } else {
        requireCheck = true;
      }
    }

    return (
      <View>
        <View>
          <Touchable onPress={() => this._onPress()}>
            <TextField
              {...this.props}
              label={label}
              labelFontSize={bluecolor.basicFontSizeS}
              fontSize={bluecolor.basicFontSize}
              containerStyle={styles.containerStyle}
              activeLineWidth={1}
              labelHeight={20}
              inputContainerPadding={0}
              keyboardType={'numeric'}
              inputContainerStyle={{height}}
              textColor={bluecolor.basicBlueFontColor}
              style={bold ? {fontWeight: 'bold'} : null}
              // onChangeText={text => {}}
              lineWidth={0}
              value={Util.formatDate(
                value || modelUtil.getValue(bind),
                dateNum,
              )}
              editable={false}
              labelTextStyle={bold ? {fontWeight: 'bold'} : null}
              baseColor={
                this.editable
                  ? bluecolor.basicBluebt
                  : bluecolor.basicDeepGrayColor
              }
              allowFontScaling={false}
            />
            <View style={styles.iconStyle}>
              <FontAwesome
                name="calendar"
                size={12}
                color={bluecolor.basicBlueColor}
              />
            </View>
            {requireCheck ? (
              <Text
                style={{
                  color: 'red',
                  fontSize: 10,
                  position: 'absolute',
                  top: 7,
                  left: 0,
                }}>
                *
              </Text>
            ) : null}
          </Touchable>
        </View>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 0,
    marginLeft: 5,
    marginRight: 5,
  },
  iconStyle: {
    height: 30,
    width: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 0,
    marginTop: 30,
    marginLeft: 82, // 86,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({model: state.model});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(HDatefield);
