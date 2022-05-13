/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions } from 'react-native';
import { React, bluecolor, ReduxStore, Util } from 'libs';
import Term from 'libs/termContents';
/* *
 * Import node_modules
 * */
import { HButton } from 'ux';
import store from 'libs/store';

import { CheckBox } from 'react-native-elements';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 텍스트 박스 형식 입력 공통 컴퍼넌트
 * @param {Function} onPost - 포스트 버튼을 누를때 발생 이벤트(value 리턴)
 */

// 개인정보 & 이용약관 동의
class TosBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentId: this.props.componentId,
      title: '이용약관동의서(TOS)',
      // 이용약관 동의 여부
      checkTerm: null,
      // 개인정보 수집 및 이용 동의 여부
      checkPersonTerm: null,
      personalTerm: this.props.personalTermYN,
      useTerm: this.props.useTermYN,
      allTerm: this.props.allTerm,
    };
  }

  openTerm(title, termType) {
    const { navigator } = store.getState().global;

    navigator.showOverlay({
      component: {
        name: 'common.TosContentsBox',
        passProps: {
          title,
          termContent: Term.termContent(termType),
          termType,
          saveTerm: termType === 'UT' ? this.state.useTerm : this.state.personalTerm,
          saveTermYN: (value, saveTerm) => {
            this.checkAgreeYn(value, saveTerm);
          },
        },
        options: {
          layout: {
            backgroundColor: bluecolor.basicRedColorTransLow,
            componentBackgroundColor: bluecolor.basicRedColorTransLow,
          },
          overlay: {
            interceptTouchOutside: true,
          },
        },
      },
    });
  }

  checkAgreeYn(value, saveTerm) {
    let useTerm = this.state.useTerm;
    let personalTerm = this.state.personalTerm;

    if (value === 'UT') {
      this.setState({
        useTerm: saveTerm,
      });
      useTerm = saveTerm;
    } else {
      this.setState({
        personalTerm: saveTerm,
      });
      personalTerm = saveTerm;
    }

    if (useTerm === 'Y' && personalTerm === 'Y') {
      this.setState({
        allTerm: 'Y',
      });
    } else {
      this.setState({
        allTerm: 'N',
      });
    }
  }

  render() {
    const { navigator } = ReduxStore.getState().global;

    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <View style={styles.titleTextStyle}>

            <CheckBox
              iconLeft
              center
              // iconType="material"
              // checkedIcon="clear"
              // uncheckedIcon="add"
              checkedColor={bluecolor.basicBlueColor}
              // uncheckedColor="#003366"
              containerStyle={{
                // height: 15,
                backgroundColor: bluecolor.basicTrans,
                borderColor: 'transparent',
              }}
              textStyle={{
                // marginBottom: 15,
                alignItems: 'center',
                color: bluecolor.basicBlueFontColor,
                fontSize: 15,
              }}
              title={'모두 동의합니다'}
              size={20}
              checked={this.state.allTerm === 'Y'}
              onPress={() => {
                this.setState({
                  allTerm: this.state.allTerm === 'Y' ? 'N' : 'Y',
                  useTerm: this.state.allTerm === 'Y' ? 'N' : 'Y',
                  personalTerm: this.state.allTerm === 'Y' ? 'N' : 'Y',
                });
              }}
            />
          </View>
          <View style={styles.innerContainerStyle}>
            <View style={styles.innerTextStyle}>
              <CheckBox
                iconLeft
                center
                // iconType="material"
                // checkedIcon="clear"
                // uncheckedIcon="add"
                checkedColor={bluecolor.basicBlueColor}
                // uncheckedColor="#003366"
                containerStyle={{
                  // height: 20,
                  backgroundColor: bluecolor.basicTrans,
                  borderColor: 'transparent',
                }}
                textStyle={{
                  marginBottom: 2,
                  alignItems: 'flex-start',
                  fontSize: 10,
                }}
                title={'이용약관 동의(Terms of Use)'}
                size={20}
                checked={this.state.useTerm === 'Y'}
                onPress={() => {
                  this.openTerm('이용약관', 'UT');
                }}
              />
              <CheckBox
                iconLeft
                center
                // iconType="material"
                // checkedIcon="clear"
                // uncheckedIcon="add"
                checkedColor={bluecolor.basicBlueColor}
                // uncheckedColor="#003366"
                containerStyle={{
                  // height: 20,
                  backgroundColor: bluecolor.basicTrans,
                  borderColor: 'transparent',
                }}
                textStyle={{
                  marginBottom: 2,
                  alignItems: 'center',
                  fontSize: 10,
                }}
                title={'개인정보 이용동의(Personal Information Agreement)'}
                size={20}
                checked={this.state.personalTerm === 'Y'}
                onPress={() => {
                  this.openTerm('개인정보 처리약관', 'PT');
                }}
              />
            </View>
            <View style={styles.buttonStyle}>
              <HButton
                onPress={() => {
                  Util.toastMsg('약관 동의가 완료되었습니다.');
                  navigator.dismissOverlay(this.props.componentId);
                }}
                // name={'check-circle-o'}
                title={'save'}
                bStyle={{
                  paddingTop: 1,
                  paddingBottom: 3,
                  paddingLeft: 2,
                  paddingRight: 10,
                  backgroundColor: bluecolor.basicDeepGrayColor,
                  borderRadius: 5,
                }}
                disabled={this.state.allTerm === 'N'}
              />
            </View>
          </View>
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
  titleTextStyle: {
    marginBottom: 1,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.92,
    height: screenHeight * 0.30,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
  },
  innerContainerStyle: {
    backgroundColor: bluecolor.basicWhiteColor,
    width: screenWidth * 0.88,
    height: screenHeight * 0.20,
    borderRadius: 10,
  },
  innerTextStyle: {
    marginTop: 10,
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  barcodeText: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 15,
    alignItems: 'center',
    color: 'black',
  },
  buttonStyle: {
    // borderRadius: 10,
    // paddingTop: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TosBox;
