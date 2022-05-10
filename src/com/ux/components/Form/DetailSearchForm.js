/**
 * Import default modules
 */
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { React, bluecolor } from 'libs';

/** ux에서 ux의 libraries를 선언할 수 없어 우선은 개별 정의! */
// import { Touchable } from 'ux';
import Touchable from 'common/Touchable';
import InputSearchCondition from 'components/Form/InputSearchCondition'; // 공통 Form 처리
import HFadeinView from 'ani/HFadeinView'; // animation 처리

/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 상세조건 페이지 공통처리 컴포넌트
 * ParentPage -> DetailSearchForm -> InputSearchCondition
 */
class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      layoutVisible: this.props.layoutVisible || false, // 밑으로 드래그 할 시 자동 조회 처리 여부 확인
      btnIconName: 'long-arrow-down',
      resetSearchConditon: false,
      arrayResetConfig: [],
      inputSearhConfig: this.props.inputSearhConfig,
    };
    this.callapsed = false;
  }

  componentWillMount() {}

  shouldComponentUpdate() {
    return true;
  }

  // 상세 조회 조건 중 Text에 해당 (InputSearchCondition에서 callback)
  // (text.toUpperCase().trim(), 'hmblNo', 'Text')
  _changeFromDtConditionText(columnValue, columnName, columnType, columnMandatory) {
    // Object.assign(day, { dateOrigin: day.dateString.replace('-', '').replace('-', '') });
    if (columnType === 'text') {
      this.setState(
        {
          [columnName]: columnValue,
          // 초기화할 조회 설정 값 false처리
          // InputSearchCondition 공통 모듈에서 "componentWillReceiveProps" 처리함
          // 조회 조건 값들이 변경될 경우 초기화 조건을 false 처리해야 함!
          // 결국은 InputSearchCondition 자식으로 해당 값을 넘겨 조건 처리하는게 목적!
          resetSearchConditon: false,
        },
        () => {
          // 호출한 부모의 state를 변경하기 위해 callback처리
          this.props.onChangeConditionText(
            `${columnValue}`,
            `${columnName}`,
            `${columnType}`,
            `${columnMandatory}`,
          );
        },
      );
    }
  }

  // 상세 조회 조건 중 Combo에 해당 (InputSearchCondition에서 callback)
  _changeFromDtConditionCombo(dtCode, engValue, stateSetCode, stateSetName) {
    this.setState(
      {
        [stateSetCode]: dtCode,
        [stateSetName]: engValue,
        // 초기화할 조회 설정 값 false처리
        // InputSearchCondition 공통 모듈에서 "componentWillReceiveProps" 처리함
        // 조회 조건 값들이 변경될 경우 초기화 조건을 false 처리해야 함!
        // 결국은 InputSearchCondition 자식으로 해당 값을 넘겨 조건 처리하는게 목적!
        resetSearchConditon: false,
      },
      () => {
        // 호출한 부모의 state를 변경하기 위해 callback처리
        this.props.onChangeConditionCombo(`${dtCode}`, `${engValue}`, stateSetCode, stateSetName);
      },
    );
  }

  // 상세조건 초기화 (본인/부모/자식 페이지의 모든 상세 검색조건 관련하여 state 초기화)
  _resetSearchConditon() {
    const inputSearhConfig = this.props.inputSearhConfig; // this.props.inputSearhConfig;
    const arrayResetConfig = [];

    Alert.alert(
      '[상세조건 초기화]',
      '상세조건 값이 초기화 됩니다.',
      [{ text: '[ OK ]', onPress: () => console.log('cancel'), style: 'cancel' }],
      { cancelable: false },
    );

    // Case 1. forEach
    inputSearhConfig.forEach(config => {
      if (config.componentType === 'text') {
        arrayResetConfig.push({
          componentType: config.componentType,
          stateColumn: config.stateColumn,
          mandatory: config.mandatory,
          columnValue: config.columnValue,
        });
      } else if (config.componentType === 'combo') {
        arrayResetConfig.push({
          componentType: config.componentType,
          stateColumn: {
            stateColumnCode: config.stateColumnCode,
            stateColumnName: config.stateColumnName,
          },
        });
      }
    });

    // Case 2. map
    // inputSearhConfig.map(config => {
    //   if (config.componentType === 'text') {
    //     arrayResetConfig.push({
    //       componentType: config.componentType,
    //       stateColumn: config.stateColumn,
    //       mandatory: config.mandatory,
    //       columnValue: config.columnValue,
    //     });
    //   } else if (config.componentType === 'combo') {
    //     arrayResetConfig.push({
    //       componentType: config.componentType,
    //       stateColumn: {
    //         stateColumnCode: config.stateColumnCode,
    //         stateColumnName: config.stateColumnName,
    //       },
    //     });
    //   }
    // });

    // Object.assign(day, { dateOrigin: day.dateString.replace('-', '').replace('-', '') });
    this.setState(
      {
        resetSearchConditon: true, // 초기화할 조회 설정 값 true처리
        arrayResetConfig,
      },
      () => {
        // 호출한 부모의 state를 변경하기 위해 callback처리
        this.props.onResetSearchCondition(arrayResetConfig);
      },
    );
  }

  render() {
    const deepBlueColor = bluecolor.basicBlueFontColor; // '#003366';

    return (
      <View style={styles.container}>
        <View style={styles.btnTextHolder}>
          <Touchable
            activeOpacity={0.5}
            onPress={() => {
              this.setState({
                layoutVisible: this.state.layoutVisible === false,
                // 상세조건 페이지를 펼치고 접을 때 아이콘 변경
                btnIconName:
                  this.state.layoutVisible === false ? 'long-arrow-up' : 'long-arrow-down',
              });
            }}
            style={styles.btnStyle}
          >
            <Text style={styles.btnText}>
              [ 상세 조건 ]{'   '}
              <FontAwesome
                name={this.state.btnIconName} // "long-arrow-down"
                size={12}
                color={deepBlueColor}
              />
            </Text>
          </Touchable>
          {this.state.layoutVisible === true ? (
            <HFadeinView>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                {/**
                 * 상세검색 조건 공통 컴포넌트 <시작>
                 * 공통 컴포넌트 모듈들은 navigationView가 아니므로 리덕스를 통해 초기 설정값을 가져올 수 없다.
                 */}
                <View>
                  <InputSearchCondition
                    // 본 공통 컴포넌트를 호출할 경우와 다이렉트로 InputSearchCondition을 호출할 경우 style 각기 적용을 하기 위한 값
                    detailBlockYN
                    // 조회조건 설정 값
                    inputSearhConfig={this.props.inputSearhConfig}
                    // text타입 값 설정
                    onChangeConditionText={(columnValue, columnName, columnType, columnMandatory) =>
                      this._changeFromDtConditionText(
                        columnValue,
                        columnName,
                        columnType,
                        columnMandatory,
                      )
                    }
                    // combo타입 값 설정
                    onChangeConditionCombo={(dtCode, engValue, stateSetCode, stateSetName) =>
                      this._changeFromDtConditionCombo(dtCode, engValue, stateSetCode, stateSetName)
                    }
                    // 초기화 버튼 : true /false
                    resetSearchConditon={this.state.resetSearchConditon}
                    // 초기화할 조회 설정 값
                    arrayResetConfig={this.state.arrayResetConfig}
                  />
                </View>
                {/**
                 * 상세검색 조건 공통 컴포넌트 <끝>
                 * 공통 컴포넌트 모듈들은 navigationView가 아니므로 리덕스를 통해 초기 설정값을 가져올 수 없다.
                 */}

                <Touchable
                  style={{ padding: 2 }}
                  activeOpacity={0.5}
                  onPress={() => this._resetSearchConditon()}
                >
                  <Text style={styles.btnResetText}>
                    [ 조건 초기화 ]{'   '}
                    <FontAwesome name={'undo'} size={12} color={deepBlueColor} />
                  </Text>
                </Touchable>
              </View>
            </HFadeinView>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 3,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 0, // ios는 원래 20 이었음.
  },
  btnText: {
    textAlign: 'center',
    color: bluecolor.basicBlueFontColor,
    fontSize: 11,
    fontWeight: 'bold',
  },
  btnTextHolder: {
    borderWidth: 1,
    borderColor: bluecolor.basicBluelightColor, // 'rgba(0,0,0,0.5)',
    marginLeft: 5,
    marginRight: 5,
  },
  btnStyle: {
    padding: 5,
    backgroundColor: '#FDFFFF', // bluecolor.basicBlueFontColor, // 'rgba(0,0,0,0.5)',
  },
  btnResetText: {
    textAlign: 'center',
    color: bluecolor.basicBlueFontColor,
    backgroundColor: bluecolor.basicBlueLightTrans,
    fontSize: 11,
    fontWeight: 'bold',
    padding: 5, // Platform.OS === 'ios' ? 10 : 0, // ios는 원래 20 이었음.
  },
});

export default Component;
