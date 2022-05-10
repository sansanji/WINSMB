/* *
 * Import Common
 * */
import {View, StyleSheet} from 'react-native';
import React from 'react';
import {bluecolor} from 'libs';
import {Touchable, HFadeinView} from 'ux';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 기본 폼뷰 컴포넌트(카드형식으로 배경을 감싸는 형태)
 * @param {styles} style - 스타일 파라미터
 * @param {Function} renderHeader - Form or List 화면 상의 상단 조회조건 안에 포함할 컴포넌트들
 *                                - 상단 조회조건 정보가 필요할 경우에는 renderHeader를 적용하고
 *                                - 상단 조회 조건이 아니고, List의 데이터가 그려질 부분이면 기존의 child자체를 적용한다.
 * @param {Boolean} headerClose - 헤더 닫힘 여부(조회조건 폼)
 * @example
 * <HFormView
      style={this.props.headerStyle}
      renderHeader={this.props.renderHeader}
      headerClose
   />
 */

class HFormView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      btnIconName: this.props.headerClose ? 'chevron-down' : 'chevron-up',
    };
    this.callapsed = false;
  }

  // 상단 조회조건이 존재할 경우!
  renderHeader = () => (
    <View>
      {this.state.btnIconName === 'chevron-up' ? (
        <HFadeinView>
          <View>{this.props.renderHeader()}</View>
        </HFadeinView>
      ) : null}

      <Touchable
        style={styles.iconStyle}
        onPress={() => {
          this.setState({
            btnIconName:
              this.state.btnIconName === 'chevron-up'
                ? 'chevron-down'
                : 'chevron-up',
          });
        }}>
        <FontAwesome
          name={this.state.btnIconName}
          size={15}
          color={bluecolor.basicBlueColorTrans}
        />
      </Touchable>
    </View>
  );

  render() {
    const {style} = this.props;
    // return <View style={[styles.container, style]}>{this.props.children}</View>;
    return (
      <View>
        {this.props.renderHeader ? (
          <View style={[styles.renderHeaderContainer, style]}>
            {this.renderHeader()}
          </View>
        ) : (
          <View>
            {this.props.children ? (
              <View style={[styles.renderEtcContainer, style]}>
                {this.props.children}
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  renderHeaderContainer: {
    flex: 1,
    borderRadius: 5,
    padding: 2,
    backgroundColor: '#c1dcf0',
  },
  renderEtcContainer: {
    flex: 1,
    borderRadius: 5,
    padding: 5,
    backgroundColor: bluecolor.basicSoftGrayColor,
  },
  iconStyle: {
    flex: 1,
    marginTop: 5,
    padding: 3,
    borderRadius: 5,
    backgroundColor: bluecolor.basicSoftGrayColor,
    alignItems: 'center',
  },
});

/**
 * Wrapping with root component
 */
export default HFormView;
