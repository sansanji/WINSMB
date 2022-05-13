/* *
 * Import Common
 * */
import {View, StyleSheet} from 'react-native';
import {React, moment, Util, ReduxStore, bluecolor} from 'libs';
import {Component} from 'react';
/* *
 * Import node_modules
 * */
import {LocaleConfig, Calendar as WixCalendar} from 'react-native-calendars';
import calendarStyle from 'styles/calendar';
import {Navigation} from 'react-native-navigation';
import Touchable from 'common/Touchable';
import {HIcon, HText} from 'ux';

/**
 * 달력 컴포넌트
 */

LocaleConfig.locales.fr = {
  monthNames: [
    '01 /',
    '02 /',
    '03 /',
    '04 /',
    '05 /',
    '06 /',
    '07 /',
    '08 /',
    '09 /',
    '10 /',
    '11 /',
    '12 /',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

LocaleConfig.defaultLocale = 'fr';

class Calendar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let currentData = null;
    let currentFromDate = null;
    let currentToDate = null;
    let dateType = null;

    // Calender에서 선택한 일자
    if (Util.isEmpty(this.props.current)) {
      const today = moment().format('YYYY-MM-DD');
      currentData = today;
    } else {
      currentData = this.props.current;
    }

    // 설정된 fromDate
    if (Util.isEmpty(this.props.currentFromDate)) {
      const today = moment().format('YYYY-MM-DD');
      currentFromDate = today;
    } else {
      currentFromDate = this.props.currentFromDate;
    }

    // 설정된 toDate
    if (Util.isEmpty(this.props.currentToDate)) {
      const today = moment().format('YYYY-MM-DD');
      currentToDate = today;
    } else {
      currentToDate = this.props.currentToDate;
    }

    // 선택된 일자 타입
    if (Util.isEmpty(this.props.dateType)) {
      dateType = null;
    } else {
      dateType = this.props.dateType;
    }

    // const platform = Platform.OS;
    // const contianerStyle = platform === 'ios' ? styles.containerAndroid : styles.containerIos;
    const {navigator} = ReduxStore.getState().global;

    return (
      <View style={styles.highContainer}>
        <View style={styles.borderContainer}>
          <View style={styles.cancelBtnStyle}>
            <HText textStyle={{fontWeight: 'bold'}}>{this.props.label}</HText>
            <Touchable
              onPress={() => {
                navigator.dismissOverlay(this.props.componentId);
              }}>
              <HIcon
                name="times-circle"
                size={20}
                color={bluecolor.basicGrayColor}
              />
            </Touchable>
          </View>
          <WixCalendar
            // Specify style for calendar container element. Default = {}
            style={styles.container} // style={contianerStyle}
            onDayPress={day => {
              const currentFromDay = `${currentFromDate}`;
              const currentToDay = `${currentToDate}`;
              const currentFromDayOrigin = currentFromDay
                .replace('-', '')
                .replace('-', ''); // YYYYMMDD 형식도 추가
              const currentToDayOrigin = currentToDay
                .replace('-', '')
                .replace('-', ''); // YYYYMMDD 형식도 추가
              const currentDateType = `${dateType}`;
              // day.dateOrigin = day.dateString.replace('-', '').replace('-', ''); // YYYYMMDD 형식도 추가
              Object.assign(day, {
                dateOrigin: day.dateString.replace('-', '').replace('-', ''),
              });

              // toDate가 fromDate보다 작다면 toDate를 fromDate 값으로 강제 설정!
              if (
                currentDateType === 'toDate' &&
                day.dateString.replace('-', '').replace('-', '') <
                  currentFromDayOrigin
              ) {
                Object.assign(day, {dateString: currentFromDay});
                Object.assign(day, {dateOrigin: currentFromDayOrigin});
                Object.assign(day, {
                  year: Number(currentFromDayOrigin.substring(0, 4)),
                });
                Object.assign(day, {
                  month: Number(currentFromDayOrigin.substring(4, 6)),
                });
                Object.assign(day, {
                  day: Number(currentFromDayOrigin.substring(6, 8)),
                });
                Object.assign(day, {
                  timestamp: Number(moment(currentFromDay).format('x')),
                });
              }

              // fromDate가 toDate보다 크다면 fromDate를 toDate 값으로 강제 설정!
              if (
                currentDateType === 'fromDate' &&
                day.dateString.replace('-', '').replace('-', '') >
                  currentToDayOrigin
              ) {
                Object.assign(day, {dateString: currentToDay});
                Object.assign(day, {dateOrigin: currentToDayOrigin});
                Object.assign(day, {
                  year: Number(currentToDayOrigin.substring(0, 4)),
                });
                Object.assign(day, {
                  month: Number(currentToDayOrigin.substring(4, 6)),
                });
                Object.assign(day, {
                  day: Number(currentToDayOrigin.substring(6, 8)),
                });
                Object.assign(day, {
                  timestamp: Number(moment(currentToDay).format('x')),
                });
              }

              this.props.onChange(day);
              Navigation.dismissOverlay(this.props.componentId);
            }}
            // Specify theme properties to override specific styles for calendar parts. Default = {}
            theme={calendarStyle}
            current={`${currentData}`}
            markedDates={{
              [`${currentData}`]: {selected: true, selectedColor: '#2c7bba'},
            }}
            {...this.props}
          />
        </View>
      </View>
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
  borderContainer: {
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 5,
    padding: 10,
  },
  container: {
    // borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    margin: '1%',
  },
  // containerAndroid: {
  //   // borderWidth: 1,
  //   borderRadius: 5,
  //   borderColor: 'gray',
  //   margin: '1%',
  // },
  // containerIos: {
  //   // borderWidth: 1,
  //   borderRadius: 5,
  //   borderColor: 'gray',
  //   height: 350,
  // },
});

export default Calendar;
