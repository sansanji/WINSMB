/* *
 * Import Common
 * */
import { View, Text, StyleSheet, Platform } from 'react-native';
import { React, Util, bluecolor } from 'libs';
// import {} from 'ux';

/* *
 * Import node_modules
 * */
// import { Kohana } from 'react-native-textinput-effects';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 상세조건 페이지 공통처리 컴포넌트 (부모 페이지에서 넘겨 받은 조회조건 설정 값을 그려준다.)
 * ParentPage -> DetailSearchForm -> InputSearchCondition
 */
class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      arraySearchCondition: this.props.inputSearhConfig,
    };
  }

  // 초기화 버튼을 클릭하거나, 다시 조건 값을 입력할 경우 처리 로직!
  // 초기화 버튼을 클릭했다면 true로 넘어옴
  // 조회 조건 값들이 변경될 경우 초기화 조건을 false 처리해야 함!
  // 결국은 부모에서 InputSearchCondition 자식으로 해당 값을 넘겨 받아 조건 처리하는게 목적!
  componentWillReceiveProps(nextProps) {
    const resetSearchConditon = nextProps.resetSearchConditon;

    // 초기화 값이 true일 경우만 처리한다!
    // 초기화는 무조건 다 처음 값으로 셋팅한다.
    if (resetSearchConditon) {
      nextProps.arrayResetConfig.forEach(config => {
        if (config.componentType === 'text') {
          if (config.mandatory) {
            this.setState({
              [config.stateColumn]: '',
              // [`${config.stateColumn}LabelChkColor`]: bluecolor.mandatoryColumnChkColor,
              [`${config.stateColumn}CancelBtnYN`]: false, // '#428BCA';
            });
          } else {
            this.setState({
              [config.stateColumn]: '',
              // [`${config.stateColumn}LabelChkColor`]: bluecolor.basicColumnChkColor,
              [`${config.stateColumn}CancelBtnYN`]: false, // '#428BCA';
            });
          }
        } else if (config.componentType === 'combo') {
          this.setState({
            [config.stateColumn.stateColumnCode]: 'ALL', // 모든 화면은 초기 값을 ALL로 하자!
            [config.stateColumn.stateColumnName]: 'All',
          });
        }
      });
    }
  }

  shouldComponentUpdate() {
    return true;
  }

  // 상세 조회 조건 중 Text에 해당 (DetailSearchForm으로 리턴 시킨다.)
  // (text.toUpperCase().trim(), 'hmblNo', 'Text')
  _changeConditionText(columnValue, columnName, columnType, columnMandatory) {
    // Object.assign(day, { dateOrigin: day.dateString.replace('-', '').replace('-', '') });
    if (columnType === 'text') {
      // 필수 항목 체크를 위한 변수 설정
      const columnValueLenth = columnValue.length;
      // let stateChkColor = bluecolor.basicBorderColor; // '#e6e8ea';
      // let stateLabelChkColor = bluecolor.basicColumnChkColor; // '#428BCA';
      let cancelBtnYN = false;

      if (columnValueLenth > 0) {
        // stateChkColor = bluecolor.basicBorderColor; // '#e6e8ea';
        // stateLabelChkColor = bluecolor.basicColumnChkColor; // '#e6e8ea';
        cancelBtnYN = true;
      } else {
        // stateChkColor = bluecolor.basicOrangeColor; // '#FF5E00';
        // stateLabelChkColor = bluecolor.mandatoryColumnChkColor; // '#428BCA';
        cancelBtnYN = false;
      }

      this.setState(
        {
          [columnName]: columnValue,
          // [`${columnName}ChkColor`]: stateChkColor,
          // [`${columnName}LabelChkColor`]: stateLabelChkColor,
          [`${columnName}CancelBtnYN`]: cancelBtnYN,
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

  // 상세 조회 조건 중 Combo에 해당
  _changeConditionCombo(dtCode, dtName, commonCode) {
    Util.openComboBox({
      code: `${commonCode}`,
      selected: `${commonCode}`,
      onChange: value => this._setSelectedCombo(`${commonCode}`, value, `${dtCode}`, `${dtName}`),
    });
  }

  // 콤보박스 팝업에서 선택된 값을 설정한다. (DetailSearchForm으로 리턴 시킨다.)
  _setSelectedCombo(code, value, dtCode, dtName) {
    const { value: selected } = value;
    const selOption = Util.getSelOption(code, selected);

    this.setState(
      {
        [dtCode]: selOption.DT_CODE,
        [dtName]: selOption.ENG_VALUE,
      },
      () => {
        // 호출한 부모의 state를 변경하기 위해 callback처리
        this.props.onChangeConditionCombo(
          selOption.DT_CODE,
          selOption.ENG_VALUE,
          `${dtCode}`,
          `${dtName}`,
        );
      },
    );
  }

  // text컴포넌트에 지정된 cancel(clear) 버튼 클릭 이벤트
  _cancelText(columnValue, columnName, columnType, columnMandatory) {
    this[columnName].focus();
    this._changeConditionText('', columnName, columnType, columnMandatory);
  }

  // text컴포넌트에 대한 cancel(clear) 버튼 뷰잉 유무 체크
  _cancelBtnControll(stateColumn, stateCancelBtn, columnValue) {
    // const cancelBtnVisible = this._cancelBtnControll(
    //   this.state[`${config.stateColumn}`],
    //   this.state[`${config.stateColumn}CancelBtnYN`],
    //   config.columnValue,
    // );

    let cancelBtnYN = false;
    let cancelBtnVisible = false;

    if (
      // ((stateColumn === null || stateColumn === undefined || !stateColumn) &&
      // columnValue === null) ||
      (Util.isEmpty(stateColumn) && columnValue === null) ||
      columnValue === undefined ||
      !columnValue
    ) {
      cancelBtnYN = false;
    } else {
      cancelBtnYN = true;
    }

    if (!stateCancelBtn && !cancelBtnYN && !columnValue) {
      cancelBtnVisible = false;
    } else if (stateCancelBtn && !cancelBtnYN && !columnValue) {
      cancelBtnVisible = true;
    } else if (stateCancelBtn === undefined && cancelBtnYN && columnValue) {
      cancelBtnVisible = true;
    } else if (stateCancelBtn && cancelBtnYN && columnValue) {
      cancelBtnVisible = true;
    } else if (!stateCancelBtn && cancelBtnYN && columnValue) {
      cancelBtnVisible = false;
    } else {
      cancelBtnVisible = false;
    }

    return cancelBtnVisible;
  }

  _setComponentStyle(stateColumn, mandatory, columnValue) {
    // const componentStyle = this._setComponentStyle(
    //   this.state[`${config.stateColumn}`],
    //   config.mandatory,
    //   config.columnValue,
    // );

    let chkColor = null;
    let labelChkColor = null;
    let componentStyle = null;

    // 필수값에 대한 스타일 적용 변수 설정!
    // if ((stateColumn === null || stateColumn === undefined) &&
    //     mandatory === true && !columnValue) {
    if (Util.isEmpty(stateColumn) && mandatory === true && !columnValue) {
      chkColor = bluecolor.basicOrangeColor;
      labelChkColor = bluecolor.mandatoryColumnChkColor;
    } else {
      chkColor = bluecolor.basicBorderColor;
      labelChkColor = bluecolor.basicColumnChkColor;
    }

    componentStyle = {
      chkColor,
      labelChkColor,
    };

    return componentStyle;
  }

  render() {
    // 컨테이너 스타일 조건 처리 (DetailSearchForm에서 호출된 경우는 margin이 없음(Border에 감싸져 있기 때문에!)
    //                     (DetailSearchForm을 거쳐서 오지 않고 원 부모 페이지에서 다이렉트로 호출할 경우 margin처리)
    const containerStyle =
      this.props.detailBlockYN === true ? styles.containerDetailBlock : styles.container;
    const deepBlueColor = bluecolor.basicBlueFontColor; // '#003366';

    // 넘겨받은 속성 값에 따라 map Loop를 통해 컴포넌트를 그려준다.
    // v20181206 : Text, Combo형태 추간
    const arraySearchCondition = this.state.arraySearchCondition.map(config => {
      // text 형태이냐, combo형태이냐에 따라 처리
      if (config.componentType === 'text') {
        /**
         * 필수값 항목에 대한 스타일 처리 <시작>
         * 필수값 항목에 대헤 입력 값이 없으면 labelStyle, iconStype 오렌지 색상 지정
         * 만약 입력값이 있다면 기본 컬러로 변경
         * 완벽히 구성이 되어 있지 않아 우선은 보류!
         */
        // let chkColor = null;
        // let labelChkColor = null;

        // const componentStyle = this._setComponentStyle(
        //   this.state[`${config.stateColumn}`],
        //   config.mandatory,
        //   config.columnValue,
        // );

        // chkColor = componentStyle.chkColor;
        // labelChkColor = componentStyle.chkColor;
        /**
         * 필수값 항목에 대한 스타일 처리 <끝>
         */

        /**
         * Text타입 컴포넌트에 대한 cancel(clear) 버튼 뷰잉 유무 처리 <시작>
         */
        const cancelBtnVisible = this._cancelBtnControll(
          this.state[`${config.stateColumn}`],
          this.state[`${config.stateColumn}CancelBtnYN`],
          config.columnValue,
        );
        /**
         * Text타입 컴포넌트에 대한 cancel(clear) 버튼 뷰잉 유무 처리 <끝>
         */

        return (
          <View style={styles.spaceAroundStyle} key={config.stateColumn}>
            {/* <Kohana
              // key={config.stateColumn}
              ref={c => {
                this[config.stateColumn] = c;
              }}
              style={styles.kohanaStyle}
              // style={[
              //   styles.kohanaStyle,
              //   {
              //     // 각각의 조회 항목 당 borderColor 지정이 있는지 체크!
              //     borderColor: this.state[`${config.stateColumn}ChkColor`] || chkColor,
              //   },
              // ]}
              label={`· ${config.label}`}
              iconClass={MaterialsIcon}
              iconName={config.iconName}
              // iconColor={'#428BCA'}
              // iconColor={this.state[`${config.stateColumn}LabelChkColor`] || labelChkColor}
              iconColor={
                config.mandatory === true
                  ? bluecolor.mandatoryColumnChkColor
                  : bluecolor.basicColumnChkColor
              }
              iconSize={18}
              // labelStyle={styles.kohanaLabelStyle}
              // labelStyle={[
              //   styles.kohanaLabelStyle,
              //   {
              //     color: this.state[`${config.stateColumn}LabelChkColor`] || labelChkColor,
              //   },
              // ]}
              labelStyle={[
                styles.kohanaLabelStyle,
                {
                  color:
                    config.mandatory === true
                      ? bluecolor.mandatoryColumnChkColor
                      : bluecolor.basicColumnChkColor,
                },
              ]}
              inputStyle={styles.kohanaInputStyle}
              inputHeight={15}
              useNativeDriver
              keyboardType={config.keyboardType}
              onChangeText={text =>
                this._changeConditionText(
                  // autoCapitalize 값이 대문자(characters) 일 경우는 한번 더 uppercase 처리!
                  config.autoCapitalize === 'characters' ? text.toUpperCase().trim() : text.trim(),
                  config.stateColumn,
                  'text',
                  config.mandatory, // 필수 항목 여부
                )
              }
              // value 설정 주의 :  기존에 하드코딩으로 각각의 view를 그렸다면 문제가 되지 않지만
              // map을 통해 loop로 view를 그린다면 해당하는 state를 설정하고 지정하는게 힘들기 때문에 처리 로직 추가
              // 해당 페이지에 state가 있다면 보여주고 없다면 부모에 설정된 state를 보여준다.
              // 부모와 자식간 state는 동기화 되어야 한다.
              value={
                // Util.isEmpty(this.state[`${config.stateColumn}`])
                this.state[`${config.stateColumn}`] === null ||
                this.state[`${config.stateColumn}`] === undefined
                  ? config.columnValue
                  : this.state[`${config.stateColumn}`]
              }
              autoCapitalize={config.autoCapitalize}
            /> */}

            {/* {this.state[`${config.stateColumn}CancelBtnYN`] || cancelBtnYN ? ( */}
            {cancelBtnVisible ? (
              <Text
                style={{ margin: 10, padding: 5 }}
                onPress={() =>
                  this._cancelText(
                    this.state[config.stateColumn],
                    config.stateColumn,
                    'text',
                    config.mandatory,
                  )
                }
              >
                <FontAwesome name="times" size={15} color={bluecolor.basicDeepGrayColor} />
              </Text>
            ) : null}
          </View>
        );
      } else if (config.componentType === 'combo') {
        return (
          <View style={styles.spaceAroundStyle} key={config.comboCommonCode}>
            <View style={{ width: '70%' }}>
              <Text
                style={styles.comboListTextStyle}
                onPress={() =>
                  this._changeConditionCombo(
                    config.stateColumnCode, // 'ediStatusCode'
                    config.stateColumnName, // 'ediStatusName'
                    config.comboCommonCode, // 'EDI_SEND_STATUS'
                  )
                }
              >
                {'     '}
                <FontAwesome name="caret-down" size={16} color={deepBlueColor} />{' '}
                {/* // value 설정 주의 :  기존에 하드코딩으로 각각의 view를 그렸다면 문제가 되지 않지만
                    // map을 통해 loop로 view를 그린다면 해당하는 state를 설정하고 지정하는게 힘들기 때문에 처리 로직 추가
                    // 해당 페이지에 state가 있다면 보여주고 없다면 부모에 설정된 state를 보여준다.
                    // 부모와 자식간 state는 동기화 되어야 한다. */}
                {/* {Util.isEmpty(this.state[`${config.stateColumnName}`]) */}
                {this.state[`${config.stateColumnName}`] === null ||
                this.state[`${config.stateColumnName}`] === undefined
                  ? config.comboDefaultName
                  : this.state[`${config.stateColumnName}`]}
              </Text>
            </View>
            <View style={{ width: '30%' }}>
              <Text style={styles.comboLabelStype}>· {config.label}</Text>
            </View>
          </View>
        );
      }
      return null;
    });

    // 변수로 넘겨받은 컴포넌트를 실질적으로 그려준다.
    return <View style={containerStyle}>{arraySearchCondition}</View>;
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  containerDetailBlock: {
    flex: 1,
  },
  kohanaStyle: {
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: bluecolor.basicBorderColor, // '#e6e8ea',
    borderRadius: 3,
    height: 40,
  },
  kohanaLabelStyle: {
    color: bluecolor.basicBlueFontColor, // '#428BCA',
    fontSize: 11,
    alignItems: 'center',
  },
  kohanaInputStyle: {
    color: '#428BCA',
    fontSize: 13,
  },
  comboListTextStyle: {
    flex: 1,
    // fontWeight: 'bold',
    backgroundColor: '#F6F6F6',
    borderColor: '#e6e8ea',
    borderWidth: 1,
    borderRadius: 3,
    color: '#428BCA', // bluecolor.deepBlueColor,
    alignItems: 'center',
    textAlignVertical: 'center', // -- 추가
    height: 40,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 0, // ios는 원래 20 이었음.
  },
  spaceAroundStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 40,
  },
  comboLabelStype: {
    marginLeft: 10,
    color: bluecolor.basicBlueFontColor,
    // fontWeight: 'bold',
    fontSize: 11,
  },
  cancelBtntyle: {
    padding: 5,
    margin: 5,
  },
});

export default Component;
