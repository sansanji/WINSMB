/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, moment, Util, modelUtil, bluecolor } from 'libs';
import HDatefield from 'components/Form/Text/HDatefield';
import HRow from 'components/View/HRow';
import HCombobox from 'components/Form/Text/HCombobox';
// import { HText } from 'ux';
/* *
/* *
 * Import node_modules
 * */

/**
 * 일자시작종료 항목 콩통처리 컴포넌트
 * (모델기반으로 초기값을 넣고 싶을때 Util.getDateValue(날짜,일자계산)를 활용하여 모델에 넣어준다.)
 * @param {String} label - 라벨값
 * @param {JSONObect} bindVar - 모델을 사용하도록함(FROM_DATE 시작일 , TO_DATE 종료일, DATE_TYPE 간편검색일자구분)
 * @param {Number} lDateNum - 날짜를 선택할때 기간의 제한을 두고 기간을 넘게 선택시엔 경고창과 함께 초기셋팅된다.
 * @param {Number} fDateNum - 시작날짜를 현재날짜 기준으로 셋팅해준다. (ex fDateNum={-1} 하루전날로 셋팅 )
 * @param {Number} tDateNum - 종료날짜를 현재날짜 기준으로 셋팅해준다. (ex fDateNum={1} 내일로 셋팅 )
 * @example
 * <HDateSet
 label={'Shipping'}
 bindVar={{
   FROM_DATE: 'TEMPFORM.ETD_DATE_FROM',
   TO_DATE: 'TEMPFORM.ETD_DATE_TO',
   DATE_TYPE: 'TEMPFORM.ETD_DATE_TYPE',
 }}
 lDateNum={3}
 fDateNum={-1}
 tDateNum={0}
/>
 */
class HDateSet extends React.Component {
  constructor(props) {
    super(props);
  }

  // 일자 타입에서 선택된 콤보 데이터를 설정한다.
  _setSelectedCombo(value) {
    const { bindVar, lDateNum, fDateNum } = this.props;

    let fromDateNum = 0;

    if (value.code === 'ALL') {
      // 전체로 선택 시 부모에서 넘겨받은 기본 값으로 설정
      fromDateNum = fDateNum;
    } else if (Util.isEmpty(value.code)) {
      fromDateNum = fDateNum;
    } else if (value.code === 'TODAY') {
      fromDateNum = 0;
    } else if (value.code === '3DAY') {
      fromDateNum = -3;
    } else if (value.code === 'WEEK') {
      fromDateNum = -7;
    } else if (value.code === 'MONTH') {
      fromDateNum = -30;
    }

    modelUtil.setValue(bindVar.FROM_DATE, Util.getDateValue('', fromDateNum));
    modelUtil.setValue(bindVar.TO_DATE, Util.getDateValue(''));
    // 일수 제한 옵션 처리
    if (lDateNum) {
      this.limitDateCheck();
    }
  }

  limitDateCheck() {
    const { bindVar, lDateNum, fDateNum, tDateNum } = this.props;

    const fromDate = modelUtil.getValue(bindVar.FROM_DATE);
    const toDate = modelUtil.getValue(bindVar.TO_DATE);
    const diffDays = moment(toDate, 'YYYY-MM-DD').diff(fromDate, 'day');

    // 최대일자수 체크
    if (Number(diffDays) > Number(lDateNum)) {
      Util.msgBox({
        title: '기본 값으로 재 설정됩니다.',
        msg: `종료일자 기준 최대 [${lDateNum}]일치 일자만 설정 가능합니다.`,
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              modelUtil.setValue(bindVar.FROM_DATE, Util.getDateValue('', fDateNum));
              modelUtil.setValue(bindVar.TO_DATE, Util.getDateValue('', tDateNum));
              modelUtil.setValue(bindVar.DATE_TYPE, '');
              console.log('cancel');
            },
          },
        ],
      });
    } else if (Number(diffDays) < 0) {
      Util.msgBox({
        title: '기본 값으로 재 설정됩니다.',
        msg: '종료일자가 시작일자 보다 빠릅니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              console.log('cancel');
              modelUtil.setValue(bindVar.FROM_DATE, Util.getDateValue('', fDateNum));
              modelUtil.setValue(bindVar.TO_DATE, Util.getDateValue('', tDateNum));
              modelUtil.setValue(bindVar.DATE_TYPE, '');
            },
          },
        ],
      });
    }
  }

  render() {
    const { bindVar, fDateNum, tDateNum, label } = this.props;

    return (
      <View style={styles.container}>
        <HRow>
          {/* {label ? (
            <HText
              textStyle={styles.lableStyle}
              rowflex={0.55}
              numberOfLines={3} // ios에서 메뉴명이 길 경우 잘리는 경우가 발생하여 옵션 추가!
              multiline // ios에서 메뉴명이 길 경우 잘리는 경우가 발생하여 옵션 추가!
              adjustsFontSizeToFit // ios에서 메뉴명이 길 경우 잘리는 경우가 발생하여 옵션 추가!
            >
              {label || 'Apply Date'}
            </HText>
          ) : (
            <View rowflex={0.00001} />
          )} */}
          <HDatefield
            label={label ? `${label} From` : 'From'}
            bind={bindVar.FROM_DATE}
            dateNum={fDateNum}
            onChanged={() => {
              this.limitDateCheck();
            }}
            editable
          />
          <HDatefield
            label={label ? `${label} To` : 'To'}
            bind={bindVar.TO_DATE}
            dateNum={tDateNum}
            onChanged={() => {
              this.limitDateCheck();
            }}
            editable
          />
          <HCombobox
            label={'Type'}
            groupCode={'DATE_TYPE'}
            bindVar={{
              CD: bindVar.DATE_TYPE,
              NM: bindVar.DATE_TYPE,
            }}
            onChanged={value => {
              this._setSelectedCombo(value);
            }}
            editable
          />
        </HRow>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lableStyle: {
    fontSize: 11,
    color: bluecolor.basicBluebt, // bluecolor.basicDeepGrayColor,
  },
});

export default HDateSet;
