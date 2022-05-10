/* *
 * Import Common
 * */
import { View, Text, StyleSheet } from 'react-native';
import { React, Redux, bluecolor } from 'libs';
/* *
 * Import node_modules
 * */
import { Icon } from 'react-native-elements';

/**
 * GSCL 리스트뷰 화면
 */
const ListGsclIvAe = props => {
  const { item, index } = props;
  const { theme } = props.global;

  return (
    <View style={[index % 2 === 0 ? theme.evenRowColor : theme.oddRowColor]} key={props.key}>
      <View style={styles.startEndColumn}>
        <Text style={styles.BoldText}> {item.HBL_NO} </Text>
        <Text style={styles.SoftText}>{item.MBL_NO}</Text>
      </View>

      <View style={styles.SingleColumn}>
        <Text style={theme.newItemArrival}>S</Text>
        <Text style={styles.SoftText}> {item.SHIPPER_NAME} </Text>
      </View>

      <View style={styles.SingleColumn}>
        <Text style={theme.newItemDepart}>C</Text>
        <Text style={styles.SoftText}> {item.CONSIGNEE_NAME} </Text>
      </View>

      <View style={[styles.startEndColumn, { marginTop: 5, marginLeft: 10, marginRight: 10 }]}>
        <Icon
          name="flight-takeoff"
          type="MaterialIcons"
          color={bluecolor.basicBlueColor}
          size={23}
        />
        <Icon name="flight-land" type="MaterialIcons" color={bluecolor.basicBlueColor} size={23} />
      </View>

      <View style={styles.startEndColumn}>
        <Text style={styles.SoftText}> {item.DEPART_PORT} </Text>
        <Text style={styles.SoftText}>{item.ARRIVAL_PORT}</Text>
      </View>

      <View style={styles.startEndColumn}>
        <Text style={styles.SoftText}>
          {item.ETD_DATE} ({item.ETD_TIME})
        </Text>
        <Text style={styles.SoftText}>
          {item.ETA_DATE} ({item.ETA_TIME})
        </Text>
      </View>

      <View style={styles.startEndColumn}>
        <Text style={styles.SoftText}>{item.FLNT_NO}</Text>
        <Text style={styles.SoftText}>{item.INV_NO}</Text>
      </View>

      <View style={styles.multiColumn}>
        <View style={[styles.SingleColumn, { paddingTop: 1 }]}>
          <Text style={theme.dataIndexLabel}>
            {'  '}
            Q`ty{'  '}
          </Text>
          <Text style={styles.SoftText}> {item.PKG_QTY}</Text>
        </View>
        <View style={[styles.SingleColumn, { paddingTop: 1 }]}>
          <Text style={theme.dataIndexLabel}>
            {'  '}
            G/W{'  '}
          </Text>
          <Text style={styles.SoftText}> {item.GW}</Text>
        </View>
        <View style={[styles.SingleColumn, { paddingTop: 1 }]}>
          <Text style={theme.dataIndexLabel}>
            {'  '}
            V/W{'  '}
          </Text>
          <Text style={styles.SoftText}> {item.VW}</Text>
        </View>
        <View style={[styles.SingleColumn, { paddingTop: 1 }]}>
          <Text style={theme.dataIndexLabel}>
            {'  '}
            C/W{'  '}
          </Text>
          <Text style={styles.SoftText}> {item.CW}</Text>
        </View>
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
  multiColumn: {
    flex: 1,
    paddingRight: 5,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const mapStateToProps = state => ({
  global: state.global,
});

export default Redux.connect(mapStateToProps)(ListGsclIvAe);
