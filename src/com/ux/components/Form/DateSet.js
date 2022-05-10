/* *
 * Import Common
 * */
import { View, Text, StyleSheet, Alert } from 'react-native';
import { React, bluecolor, moment, Util } from 'libs';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ButtonGroup, Button } from 'react-native-elements';

/**
 * 일자항목 콩통처리 컴포넌트
 */
class Component extends React.Component {
  constructor(props) {
    super(props);

    let fromDateNum = Number(this.props.fromDateNum); // +-fromDate 일 수
    let toDateNum = Number(this.props.toDateNum); // +-toDate 일 수
    // const limitDay = Number(this.props.limitDay); // 일 수 제한
    let fromDateSet = null; // YYYY-MM-DD
    let searchFromDateSet = null; // YYYYMMDD
    let toDateSet = null; // YYYY-MM-DD
    let searchToDateSet = null; // YYYYMMDDs

    // 넘겨받은 일자 설정 값이 없을 경우 0 으로 설정!
    if (!fromDateNum || fromDateNum > toDateNum) {
      fromDateNum = 0;
    }
    if (!toDateNum) {
      toDateNum = 0;
    }

    // fromDate Set
    if (fromDateNum && fromDateNum < 0) {
      fromDateSet = moment()
        .subtract(fromDateNum * -1, 'days')
        .format('YYYY-MM-DD');
      searchFromDateSet = moment()
        .subtract(fromDateNum * -1, 'days')
        .format('YYYYMMDD');
    } else {
      fromDateSet = moment()
        .add(fromDateNum, 'days')
        .format('YYYY-MM-DD');
      searchFromDateSet = moment()
        .add(toDateNum, 'days')
        .format('YYYYMMDD');
    }

    // toDate Set
    if (toDateNum && toDateNum < 0) {
      toDateSet = moment()
        .subtract(toDateNum * -1, 'days')
        .format('YYYY-MM-DD');
      searchToDateSet = moment()
        .subtract(toDateNum * -1, 'days')
        .format('YYYYMMDD');
    } else {
      toDateSet = moment()
        .add(toDateNum, 'days')
        .format('YYYY-MM-DD');
      searchToDateSet = moment()
        .add(toDateNum, 'days')
        .format('YYYYMMDD');
    }

    this.state = {
      data: [],
      btnIndex: 0,
      CAL_FROM_DATE: fromDateSet,
      FROM_DATE: searchFromDateSet,
      CAL_TO_DATE: toDateSet,
      TO_DATE: searchToDateSet,
      // 기본 일자 설정!
      defaultCalFromDate: fromDateSet,
      defalutFromDate: searchFromDateSet,
      defaultCalToDate: toDateSet,
      defaultToDate: searchToDateSet,
      //
      dateTypeCode: 'ALL',
      dateTypeName: 'All',
    };
  }

  componentWillMount() {
    // 화면이 처음 그려질 때 호출한 부모의 일자를 셋팅한다.
    this._setDefaultDate();
  }

  shouldComponentUpdate() {
    return true;
  }

  // 화면이 처음 그려질 때 호출한 부모의 일자를 셋팅한다.
  _setDefaultDate() {
    this.props.onSetDefaultDate(
      this.state.CAL_FROM_DATE,
      this.state.FROM_DATE,
      this.state.CAL_TO_DATE,
      this.state.TO_DATE,
    );
  }

  // 일자 선택 (달력팝업 & 일자타입)
  _changeDate = index => {
    if (index === 0 || index === 1) {
      Util.openCalendar({
        // toDate를 변경할 경우 fromDate보다 작을 경우 fromDate로 강제 설정!
        currentFromDate: this.state.CAL_FROM_DATE,
        // fromDate를 변경할 경우 toDate보다 클 경우 toDate로 강제 설정!
        currentToDate: this.state.CAL_TO_DATE,
        dateType: index === 0 ? 'fromDate' : 'toDate',
        onChange: date => {
          // Calender.js 참조
          const { dateString, dateOrigin } = date;
          if (index === 0) {
            // 일수 제한 옵션 처리
            if (this.props.limitDay !== undefined && this.props.limitDay !== null) {
              this._setLimitCheck(
                this.props.limitDay,
                'fromDate',
                dateString,
                dateOrigin,
                this.state.CAL_TO_DATE,
                this.state.TO_DATE,
                null, // comboCode
                null, // comboName
              );
            } else {
              this.setState({ CAL_FROM_DATE: `${dateString}`, FROM_DATE: `${dateOrigin}` }, () => {
                this.props.onChangeDatePick(dateString, dateOrigin, 'fromDate'); // 호출한 부모의 state를 변경하기 위해 callback처리
              });
            }
          } else if (index === 1) {
            // 일수 제한 옵션 처리
            if (this.props.limitDay !== undefined && this.props.limitDay !== null) {
              this._setLimitCheck(
                this.props.limitDay,
                'toDate',
                this.state.CAL_FROM_DATE,
                this.state.FROM_DATE,
                dateString,
                dateOrigin,
                null, // comboCode
                null, // comboName
              );
            } else {
              this.setState({ CAL_TO_DATE: `${dateString}`, TO_DATE: `${dateOrigin}` }, () => {
                this.props.onChangeDatePick(dateString, dateOrigin, 'toDate'); // 호출한 부모의 state를 변경하기 위해 callback처리
              });
            }
          }
        },
        current: index === 0 ? this.state.CAL_FROM_DATE : this.state.CAL_TO_DATE,
      });
    } else {
      Util.openComboBox({
        code: 'SEL_DATE_TYPE',
        selected: 'SEL_DATE_TYPE',
        onChange: value => this._setSelectedCombo('SEL_DATE_TYPE', value), // 호출한 부모의 state를 변경하기 위해 callback처리
      });
    }
  };

  // 일자 타입에서 선택된 콤보 데이터를 설정한다.
  _setSelectedCombo(code, value) {
    const { value: selected } = value;
    const selOption = Util.getSelOption(code, selected);
    let fromDateNum = 0;
    let fromDateSet = null;
    let searchFromDateSet = null;
    const toDateSet = moment().format('YYYY-MM-DD');
    const searchToDateSet = moment().format('YYYYMMDD');

    if (selOption.DT_CODE === 'ALL') {
      // 전체로 선택 시 부모에서 넘겨받은 기본 값으로 설정
      fromDateNum = Number(this.props.fromDateNum) * -1;
    } else if (selOption.DT_CODE === 'TODAY') {
      fromDateNum = 0;
    } else if (selOption.DT_CODE === '3DAY') {
      fromDateNum = 3;
    } else if (selOption.DT_CODE === '1WEEK') {
      fromDateNum = 7;
    } else if (selOption.DT_CODE === '1MONTH') {
      fromDateNum = 30;
    }

    fromDateSet = moment()
      .subtract(fromDateNum, 'days')
      .format('YYYY-MM-DD');
    searchFromDateSet = moment()
      .subtract(fromDateNum, 'days')
      .format('YYYYMMDD');

    // 일수 제한 옵션 처리
    if (this.props.limitDay !== undefined && this.props.limitDay !== null) {
      this._setLimitCheck(
        this.props.limitDay,
        'fromDate',
        fromDateSet,
        searchFromDateSet,
        this.state.defaultCalToDate, // CAL_TO_DATE,
        this.state.defaultToDate, // TO_DATE,
        selOption.DT_CODE,
        selOption.ENG_VALUE,
      );
    } else {
      this.setState(
        {
          dateTypeCode: selOption.DT_CODE,
          dateTypeName: selOption.ENG_VALUE,
          CAL_FROM_DATE: `${fromDateSet}`,
          FROM_DATE: `${searchFromDateSet}`,
          CAL_TO_DATE: `${toDateSet}`,
          TO_DATE: `${searchToDateSet}`,
        },
        () => {
          // 호출한 부모의 state를 변경하기 위해 callback처리
          this.props.onChangeDateType(fromDateSet, searchFromDateSet, toDateSet, searchToDateSet);
        },
      );
    }
  }

  // 지정한 제한 일자가 있다면 설정 해준다.
  _setLimitCheck(
    limitDay,
    dateType,
    fromDateString,
    fromDateOrigin,
    toDateString,
    toDateOrigin,
    comboCode,
    comboName,
  ) {
    if (dateType === 'fromDate') {
      const diffDays = moment(toDateString, 'YYYY-MM-DD').diff(fromDateString, 'day');

      if (Number(diffDays) > Number(limitDay)) {
        // 만약 제한일수에 걸린다면 toDate 설정
        if (comboCode) {
          Util.msgBox({
            title: '기본 값으로 재 설정됩니다.',
            msg: `종료일자 기준 최대 [${this.props.limitDay}]일치 일자만 설정 가능합니다.`,
            buttonGroup: [
              {
                title: 'OK',
                onPress: () => {
                  console.log('cancel');
                },
              },
            ],
          });

          this.setState(
            {
              dateTypeCode: 'ALL',
              dateTypeName: 'All',
              CAL_FROM_DATE: this.state.defaultCalFromDate, // moment().format('YYYY-MM-DD'),
              FROM_DATE: this.state.defalutFromDate, // moment().format('YYYYMMDD'),
              CAL_TO_DATE: this.state.defaultCalToDate, // moment().format('YYYY-MM-DD'),
              TO_DATE: this.state.defaultToDate, // moment().format('YYYYMMDD'),
            },
            () => {
              // 호출한 부모의 state를 변경하기 위해 callback처리
              // this.props.onChangeDateType(toDateString, toDateOrigin, toDateString, toDateOrigin);
              this.props.onChangeDateType(
                this.state.defaultCalFromDate,
                this.state.defalutFromDate,
                this.state.defaultCalToDate,
                this.state.defaultToDate,
              );
            },
          );
        } else {
          Util.msgBox({
            title: '종료일자 값으로 재 설정됩니다.',
            msg: `최대 [${this.props.limitDay}]일치 일자만 설정 가능합니다.`,
            buttonGroup: [
              {
                title: 'OK',
                onPress: () => {
                  console.log('cancel');
                },
              },
            ],
          });

          this.setState({ CAL_FROM_DATE: `${toDateString}`, FROM_DATE: `${toDateOrigin}` }, () => {
            // 호출한 부모의 state를 변경하기 위해 callback처리
            this.props.onChangeDatePick(toDateString, toDateOrigin, 'fromDate');
          });
        }
      } else if (Number(diffDays) <= Number(limitDay)) {
        // 만약 제한일수와 상관 없다면 선택한 fromDate 설정
        if (comboCode) {
          this.setState(
            {
              dateTypeCode: comboCode,
              dateTypeName: comboName,
              CAL_FROM_DATE: fromDateString,
              FROM_DATE: fromDateOrigin,
              CAL_TO_DATE: toDateString,
              TO_DATE: toDateOrigin,
            },
            () => {
              // 호출한 부모의 state를 변경하기 위해 callback처리
              this.props.onChangeDateType(
                fromDateString,
                fromDateOrigin,
                toDateString,
                toDateOrigin,
              ); // 호출한 부모의 state를 변경하기 위해 callback처리
            },
          );
        } else {
          this.setState(
            { CAL_FROM_DATE: `${fromDateString}`, FROM_DATE: `${fromDateOrigin}` },
            () => {
              // 호출한 부모의 state를 변경하기 위해 callback처리
              this.props.onChangeDatePick(fromDateString, fromDateOrigin, 'fromDate');
            },
          );
        }
      }
    } else {
      // toDate
      const diffDays = moment(toDateString, 'YYYY-MM-DD').diff(fromDateString, 'day');

      if (Number(diffDays) > Number(limitDay)) {
        Util.msgBox({
          title: '시작일자 값으로 재 설정됩니다.',
          msg: `최대 [${this.props.limitDay}]일치 일자만 설정 가능합니다.`,
          buttonGroup: [
            {
              title: 'OK',
              onPress: () => {
                console.log('cancel');
              },
            },
          ],
        });

        // 만약 제한일수에 걸린다면 fromDate 설정
        this.setState({ CAL_TO_DATE: `${fromDateString}`, TO_DATE: `${fromDateOrigin}` }, () => {
          this.props.onChangeDatePick(fromDateString, fromDateOrigin, 'toDate'); // 호출한 부모의 state를 변경하기 위해 callback처리
        });
      } else {
        // 만약 제한일수와 상관 없다면 선택한 tosDate 설정
        this.setState({ CAL_TO_DATE: `${toDateString}`, TO_DATE: `${toDateOrigin}` }, () => {
          this.props.onChangeDatePick(toDateString, toDateOrigin, 'toDate'); // 호출한 부모의 state를 변경하기 위해 callback처리
        });
      }
    }
  }

  render() {
    const { btnIndex } = this.state;

    const fromDate = () => (
      <Text style={{ color: bluecolor.basicBlueFontColor }}>
        <FontAwesome name="calendar" size={16} color="#428BCA" /> {this.state.CAL_FROM_DATE}
      </Text>
    );
    const toDate = () => (
      <Text style={{ color: bluecolor.basicBlueFontColor }}>
        <FontAwesome name="calendar" size={16} color="#428BCA" /> {this.state.CAL_TO_DATE}
      </Text>
    );

    const dateType = () => (
      <Button
        title={this.state.dateTypeName}
        color={bluecolor.basicBlueFontColor}
        // titleStyle={{ fontWeight: 'bold' }}
        icon={{ name: 'caret-down', type: 'font-awesome', color: bluecolor.basicBlueFontColor }}
        buttonStyle={styles.comboListStyle}
        containerStyle={{ marginTop: 20 }}
        onPress={() => this._changeDate(2)}
      />
    );

    const btnGroup = [{ element: fromDate }, { element: toDate }, { element: dateType }];

    return (
      <View style={styles.container}>
        <ButtonGroup
          selectedIndex={btnIndex}
          buttons={btnGroup}
          containerStyle={{ flex: 1, height: 35, padding: 3 }}
          onPress={this._changeDate}
        />
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
  comboListStyle: {
    backgroundColor: bluecolor.basicSoftGrayColor,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 5,
  },
});

export default Component;
