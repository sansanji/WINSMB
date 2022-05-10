import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import LineChart from './components/line-chart';
import ColumnChart from './components/column-chart';
import PieChart from './components/pie-chart';
/**
 * 공통차트 컴포넌트
 * @param {String} type - 차트타입 ( ['line' | 'bar' | 'pie'] is now available )
 * @param {Number} height - 차트높이
 * @param {Array,JSONArray} data - 차트 데이터
 * @param {String} color - 차트 색상
 * @example
 * let sampleData = [30, 200, 170, 250, 10]
 <HChart data={sampleData} type='line' />

let sampleData = [
      {x: '2018-01-01', y: 30},
      {x: '2018-01-02', y: 200},
      {x: '2018-01-03', y: 170},
      {x: '2018-01-04', y: 250},
      {x: '2018-01-05', y: 10}
  ]
  <HChart data={sampleData} type='line' />

 */
export default class HChart extends React.Component {
  constructor(props) {
    super(props);
    this.renderChart = this.renderChart.bind(this);
  }
  renderChart() {
    if (this.props.type === 'line') {
      return <LineChart {...this.props} />;
    } else if (this.props.type === 'bar') {
      return <ColumnChart {...this.props} />;
    } else if (this.props.type === 'pie') {
      return <PieChart {...this.props} />;
    }
  }
  render() {
    return <View>{this.renderChart()}</View>;
  }
}

HChart.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  color: PropTypes.string,
  height: PropTypes.number,
  numberOfYAxisGuideLine: PropTypes.number,
  customValueRenderer: PropTypes.func,
  backgroundColor: PropTypes.string,
};
HChart.defaultProps = {
  color: '#297AB1',
  height: 150,
  numberOfYAxisGuideLine: 5,
  backgroundColor: '#FFFFFF',
};
