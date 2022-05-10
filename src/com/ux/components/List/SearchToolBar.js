/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import { React, Util, bluecolor } from 'libs';
import HText from 'components/Form/Text/HText';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 조회툴바 컴포넌트(개발자는 사용하지 않음)
 */
class SearchToolBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetchIconColor: bluecolor.basicBlueFontColor,
      msgStatusVisible: Util.isEmpty(this.props.msgStatusVisible)
        ? true
        : this.props.msgStatusVisible,
    };
  }

  componentWillMount() {}

  shouldComponentUpdate() {
    return true;
  }

  render() {
    const status = this.props.status;
    let fetchMsg = null;
    let fetchIconColor = null;

    if (Util.isEmpty(status)) {
      fetchMsg = null;
      fetchIconColor = this.state.fetchIconColor;
    } else {
      if (Util.isEmpty(status.MSG)) {
        fetchMsg = null;
      } else {
        fetchMsg = status.MSG;
      }

      if (Util.isEmpty(status.TYPE)) {
        fetchIconColor = this.state.fetchIconColor;
      } else {
        fetchIconColor =
          Number(status.TYPE) === 1 ? bluecolor.basicGreenlightColor : bluecolor.basicRedColor;
      }
    }

    return (
      <View>
        {/**
         * 화면 하단에 조회 및 이벤트 발생 후 응답값과 전체 건수 표시!
         */}
        {this.state.msgStatusVisible ? (
          <View style={[styles.fetchMsgStyle, this.props.toolbarStyle]}>
            <HText textStyle={{ fontSize: 11 }}>
              <FontAwesome name="globe" size={11} color={fetchIconColor} /> {fetchMsg}
            </HText>
            <HText textStyle={{ fontSize: 11 }}>
              Rows:{' '}
              {this.props.currentRow === 0 || Util.isEmpty(this.props.currentRow)
                ? this.props.totalRow
                : `${this.props.currentRow}/${this.props.totalRow}`}
            </HText>
          </View>
        ) : null}
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
  },
  fetchMsgStyle: {
    flexDirection: 'row',
    paddingRight: 5,
    paddingLeft: 5,
    margin: 1,
    padding: 2,
    borderRadius: 5,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: bluecolor.basicSkyLightBlueColor,
  },
});

export default SearchToolBar;
