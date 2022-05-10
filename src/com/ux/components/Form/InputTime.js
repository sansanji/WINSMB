/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, PropTypes } from 'libs';
import { HRow } from 'ux';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DatePicker from 'react-native-datepicker';

/**
 * 시간 입력 컴포넌트
 */

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <HRow>
        <View>
          <DatePicker
            style={{ flex: 1 }}
            date={this.props.value}
            mode="time"
            placeholder="시간을 선택하세요"
            format="HH:mm"
            confirmBtnText="선택"
            cancelBtnText="취소"
            showIcon={false}
            customStyles={{
              dateInput: {
                borderWidth: 1,
                borderRadius: 5,
                backgroundColor: '#ffffff',
                height: 35,
              },
              dateText: {
                color: '#003366',
              },
              dateTouchBody: {},
              // ... You can check the source to find the other keys.
            }}
            onDateChange={date => {
              this.props.onChange(date);
            }}
          />
        </View>
        <FontAwesome name="calendar" size={30} color="#FE7013" style={styles.icon} />
      </HRow>
    );
  }
}

Component.defaultProps = {
  value: null,
};

Component.propTypes = {
  value: PropTypes.string,
};
/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 15,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    textAlignVertical: 'center',
    borderColor: '#cccccc',
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    color: '#aaaaaa',
  },
  icon: { marginLeft: 5 },
});

export default Component;
