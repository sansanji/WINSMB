/* *
 * Import Common
 * */
import { StyleSheet, View } from 'react-native';
import React from 'react';
import _ from 'lodash';

/**
 * 가로정렬 컴퍼넌트
 * @param {Number} groupNumber - 가로열에 표시될 아이템 갯수(보통 갯수에 맞게 자동으로 분할되어 보여짐)
 * @param {Boolean} between - 양끝 정렬 여부 ( 리스트에서 주로 쓰인다.)
 * @param {styles} style - 스타일 파라미터
 * @param {Number} rowflex - 로우 컨테이너 아래에 있는 자식의 넓이를 조절하고 싶을때 쓰임()
 * @example
 * <HRow between>
 <HIcon name="flight-takeoff" iconType="M" />
 <HIcon name="flight-land" iconType="M" />
</HRow>
 */

class HRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { children, groupNumber, style, between, leftAlign, rightAlign } = this.props;
    if (groupNumber > 1) {
      const groups = _.chunk(children, groupNumber);
      return (
        <View style={{ flex: 1 }}>
          {groups.map((group, groupIndex) => (
            <View style={styles.container} key={groupIndex}>
              {_.range(groupNumber).map(index =>
                React.createElement(
                  View,
                  {
                    style: { flex: 0.5, ...style },
                    key: index,
                  },
                  group[index],
                ),
              )}
            </View>
          ))}
        </View>
      );
    } else if (between) {
      return <View style={[styles.bewteenContainer, style]}>{children}</View>;
    } else if (leftAlign) {
      return <View style={[styles.leftAlignContainer, style]}>{children}</View>;
    } else if (rightAlign) {
      return <View style={[styles.rightAlignContainer, style]}>{children}</View>;
    } else if (children.length > 1) {
      return (
        <View style={[styles.container, style]}>
          {children.map((items, childIndex) => (
            <View style={{ flex: items.props.rowflex || 1 }} key={`${items}${childIndex}`}>
              {items}
            </View>
          ))}
        </View>
      );
    }
    return <View style={[styles.container, style]}>{children}</View>;
  }
}

HRow.defaultProps = {
  number: 1,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bewteenContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftAlignContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  rightAlignContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
});

export default HRow;
