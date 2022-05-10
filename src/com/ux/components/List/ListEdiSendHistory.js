/* *
 * Import Common
 * */
import { View, Text, StyleSheet } from 'react-native';
import { React, Redux, bluecolor } from 'libs';

/**
 * eid 전송내역화면
 */
const ListEdiSendHistory = props => {
  const { item, index } = props;
  const { theme } = props.global;

  return (
    <View style={[index % 2 === 0 ? theme.evenRowColor : theme.oddRowColor]} key={props.key}>
      <View style={styles.startEndColumn}>
        <Text style={styles.BoldText}> {item.HBL_NO} </Text>
        <Text style={styles.SoftText}>{item.MBL_NO}</Text>
      </View>

      <View style={styles.startEndColumn}>
        <Text style={styles.SoftText}> {item.DOC_TYPE} </Text>
        <Text style={styles.SoftText}>{item.SEND_TYPE}</Text>
      </View>

      <View style={styles.SingleColumn}>
        <Text
          style={[
            theme.newItemArrival,
            { width: 40, color: bluecolor.basicDeepGrayColor, marginRight: 5 },
          ]}
        >
          Doc.
        </Text>
        <Text style={styles.SoftText}>{item.DOC_NO}</Text>
      </View>

      <View style={styles.SingleColumn}>
        <Text
          style={[
            theme.newItemArrival,
            { width: 40, color: bluecolor.basicDeepGrayColor, marginRight: 5 },
          ]}
        >
          Msg.
        </Text>
        <Text style={styles.SoftText}>{item.MSG_NO}</Text>
      </View>

      <View style={styles.SingleColumn}>
        <Text
          style={[
            theme.newItemArrival,
            { width: 40, color: bluecolor.basicDeepGrayColor, marginRight: 5 },
          ]}
        >
          Send.
        </Text>
        <Text style={styles.SoftText}>
          {item.DOC_SEND_DATE} ({item.DOC_SEND_USER_NAME})
        </Text>
      </View>

      <View style={styles.SingleColumn}>
        <Text
          style={[
            theme.newItemArrival,
            { width: 40, color: bluecolor.basicDeepGrayColor, marginRight: 5 },
          ]}
        >
          Ack.
        </Text>
        <Text style={styles.SoftText}>
          {item.DOC_ACKANS_DATE}
          {'\n'}({item.DOC_ACKANS_STATUS})
        </Text>
      </View>

      {props.children}
      <View style={theme.line} />
    </View>
  );
};

/**
 * Define component prop types
 */
// ListRow.propTypes = {
//   children: PropTypes.element.isRequired,
// };

/**
 * Define component styles
 */

const styles = StyleSheet.create({
  startEndColumn: {
    flex: 1,
    paddingRight: 5,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  BoldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: bluecolor.basicBlueImpactColor, // '#003366',
  },
  SoftText: {
    fontSize: 13,
    color: bluecolor.basicBlueFontColor, // '#003366',
  },
  SingleColumn: {
    flex: 1,
    paddingRight: 10,
    flexDirection: 'row',
    paddingBottom: 1,
    paddingTop: 5,
    alignItems: 'center',
  },
});

const mapStateToProps = state => ({
  global: state.global,
});

export default Redux.connect(mapStateToProps)(ListEdiSendHistory);
