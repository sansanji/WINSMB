/* *
 * Import Common
 * */
import { View } from 'react-native';
import React from 'react';
import Touchable from 'common/Touchable';
/* *
 * Import node_modules
 * */
// import tweenState from 'react-tween-state';
/**
 * 어코디언 레이아웃 컴포넌트
 */
class Accordion extends React.Component {
  constructor(props) {
    super(props, 'Accordion');
    this.state = { isExpanded: true, height: 0, content_height: 0 };
    this._onPress = this._onPress.bind(this);
  }
  // propTypes: {
  //   activeOpacity: React.PropTypes.number,
  //   animationDuration: React.PropTypes.number,
  //   content: React.PropTypes.element.isRequired,
  //   easing: React.PropTypes.string,
  //   expanded: React.PropTypes.bool,
  //   header: React.PropTypes.element.isRequired,
  //   onPress: React.PropTypes.func,
  //   underlayColor: React.PropTypes.string,
  //   style: React.PropTypes.object,
  // },
  componentDidMount() {
    // Gets content height when component mounts
    // without setTimeout, measure returns 0 for every value.
    // See https://github.com/facebook/react-native/issues/953
    setTimeout(this._getContentHeight);
  }

  /*
  // 현재까진 실행되지 않는 기능인 듯...
  close() {
    this.setState({ isExpanded: this.state.isExpanded }, this.toggle());
  }
  open() {
    this.setState({ isExpanded: !this.state.isExpanded }, this.toggle());
  }
  */

  _onPress() {
    this.toggle();
    this._getContentHeight();

    if (this.props.onPress) {
      this.props.onPress.call(this);
    }
  }

  toggle() {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  _getContentHeight() {
    if (this.AccordionContent) {
      this.setState({
        height: this.state.isExpanded ? this.props.content.props.contentHeight : 0,
        content_height: this.props.content.props.contentHeight,
      });
    }
  }

  render() {
    return (
      <View
        style={{
          overflow: 'hidden',
        }}
      >
        <Touchable
          onPress={this._onPress}
          underlayColor={this.props.underlayColor}
          style={this.props.style}
          activeOpacity={0.5}
        >
          {this.props.header}
        </Touchable>
        <View
          style={{
            height: this.state.height, // 50,
          }}
        >
          <View
            ref={ref => {
              this.AccordionContent = ref;
            }}
          >
            {this.props.content}
          </View>
        </View>
      </View>
    );
  }
}

Accordion.defaultProps = {
  activeOpacity: 1,
  animationDuration: 300,
  easing: 'linear',
  expanded: true,
  underlayColor: '#000',
  style: {},
};

export default Accordion;
