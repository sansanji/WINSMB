import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';

export default class ColumnChartItem extends Component {
  drawCustomValue(index, point) {
    if (this.props.customValueRenderer) {
      return this.props.customValueRenderer(index, point);
    }
    return null;
  }
  render() {
    const renders = [];
    const seriesCount = this.props.seriesArray.length;
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
      let lastElementMarginRight = 0;
      if (seriesIndex === seriesCount - 1) {
        lastElementMarginRight = this.props.defaultMargin;
      }
      renders.push(
        <View key={seriesIndex}>
          {this.drawCustomValue(
            seriesIndex,
            this.props.seriesArray[seriesIndex].data[this.props.dataIndex],
          )}
          <View
            style={[
              styles.bar,
              {
                width: this.props.defaultWidth / seriesCount,
                height: this.props.seriesArray[seriesIndex].data[this.props.dataIndex].ratioY,
                marginRight: lastElementMarginRight,
                backgroundColor: this.props.seriesArray[seriesIndex].seriesColor,
                borderColor: this.props.isSelected ? this.props.highlightColor : '#FFFFFF',
              },
            ]}
          />
        </View>,
      );
    }
    return (
      <TouchableWithoutFeedback onPressIn={evt => this.props.onClick(evt)}>
        <View style={{ height: this.props.defaultHeight }}>
          <View style={styles.chartView}>{renders}</View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  chartView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 20,
  },
  bar: {
    justifyContent: 'flex-end',
    borderWidth: 1,
  },
});

ColumnChartItem.propTypes = {
  seriesArray: PropTypes.array,
  onClick: PropTypes.func,
  defaultWidth: PropTypes.number,
  defaultHeight: PropTypes.number,
  defaultMargin: PropTypes.number,
  primaryColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
