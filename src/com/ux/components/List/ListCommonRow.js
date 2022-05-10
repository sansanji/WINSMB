/* *
 * Import Common
 * */
import { View, Text, StyleSheet } from 'react-native';
import { React, Util, bluecolor } from 'libs';

/* *
 * Import node_modules
 * */
import { Icon } from 'react-native-elements';

/* *
 * 참조 : https://www.vobour.com/%EB%A6%AC%EC%95%A1%ED%8A%B8-react-%EC%9D%B4%ED%95%B4-%EA%B8%B0%EC%B4%88-component-vs-purecomp
 * 먼저, 클래스 기반 컴포넌트 (React.Component, React.PureComponent)에 대해 알아보자.
 * 사실, 두개는 shouldComponentUpdate 라이프 사이클 메소드를 다루는 방식을 제외하곤 동일하다.
 * 즉, PureComponent는 shouldComponentUpdate 라이프 사이클 메소드가 이미 적용 된 버전의
 * React.Component 클래스라고 보면 된다.
 * React.Component를 확장(extends)해서 컴포넌트를 만들 때, shouldComponentUpdate
 * 메쏘드를 별도로 선언하지 않았다면, 컴포넌트는 props, state 값이 변경되면
 * 항상 리렌더링(re-render) 하도록 되어 있다.
 * 하지만, React.PureComponent를 확장해서 컴포넌트를 만들면,
 * shouldComponentUpdate 메쏘드를 선언하지 않았다고 하더라도,
 * PureComponent 내부에서 props와 state를 shallow level 안에서 비교 하여,
 * 변경된 값이 있을 시에만 리렌더링 하도록 되어 있다.
 * 이를 제외하곤 React.Component와 React.PureComponent의 다른 점은 없다.
 * */

/**
 * 상세조건 페이지 공통처리 컴포넌트 (부모 페이지에서 넘겨 받은 조회조건 설정 값을 그려준다.)
 * ParentPage -> DetailSearchForm -> InputSearchCondition
 */
class Component extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      rowCountYN: Util.isEmpty(this.props.rowCountYN) ? true : this.props.rowCountYN,
    };
  }

  // React.Component 알 경우 주석 해제
  // shouldComponentUpdate() {
  //   return false; // true, false ???
  // }

  /**
   * Single, Twice, Multi 설정 값에 대한 컴포넌트 배치 및 설정 function <시작>
   */
  // 한 행에 2개의 항목만 설정한다.! - 가장 기본이 되는 설정
  // 변수 값을 Temp에 Save하고 Load하고 하는 문제가 발생하여 자체 내에서 처리한다!
  // renderTwiceType() {}

  // 한 행에 1개의 항목만 단독 설정한다.!
  renderSingleType(item, config) {
    const theme = this.props.theme;

    return (
      <View style={styles.SingleColumn} key={config.dataIndex}>
        {config.labelName !== null && config.labelName !== undefined ? (
          <Text style={theme.dataIndexLabel}> {`${config.labelName} `} </Text>
        ) : null}
        <Text style={styles.SoftText}> {item[config.dataIndex]} </Text>
      </View>
    );
  }

  // 한 행에 3개 이상의 항목들을 설정한다.!
  renderMultiType(item, config) {
    const theme = this.props.theme;

    return (
      <View style={styles.multiColumn}>
        {config.item.map(configItem => (
          <View style={[styles.SingleColumn, { paddingTop: 1 }]} key={configItem.dataIndex}>
            {/* text 타입 */}
            {configItem.componentType === 'text' && !Util.isEmpty(configItem.labelName) ? (
              <Text style={theme.dataIndexLabel}> {` ${configItem.labelName} `} </Text>
            ) : null}
            {configItem.componentType === 'text' ? (
              <Text style={styles.SoftText}> {item[configItem.dataIndex]}</Text>
            ) : null}
            {/* icon 타입 */}
            {configItem.componentType === 'icon' ? (
              <Icon
                name={configItem.dataIndex}
                type="MaterialIcons"
                color={bluecolor.basicBlueColor}
                size={23}
              />
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  /**
   * Single, Twice, Multi 설정 값에 대한 컴포넌트 배치 및 설정 function <끝>
   */

  // 실질적으로 화면을 그려주기 위한 로직!
  render() {
    const { item, index, inputListConfig } = this.props; // uniqKey
    const theme = this.props.theme;

    // 한행에 2개의 컬럼을 위한 중요 변수 설정!
    let firstColumn = null; // 한행에 2개의 컬럼을 설정하기 위해 처음 설정될 컬럼을 Temp 변수에 저장시킨다.
    let secondColumn = null; // 첫번 째 컬럼이 설정되고 두번 째 컬럼이 완성된 후 최종적으로 화면에 그려준다.
    let secondCompleted = true; // 두번 째 컬럼까지 완성되었는지 확인 변수

    // 부모 페이지에서 넘겨 받은 설정 값을 map 을 통해 데이터를 표시한다.
    const arrayListCondition = this.props.inputListConfig.map((config, configIndex) => {
      // rowType이 정의되지 않은 설정 값은 기본적으로 한 행에 두 컬럼 기본 정책을 따른다.
      if (Util.isEmpty(config.rowType)) {
        // 한행에 2개의 컬럼이 존재

        // 설정 값 갯수만큼 반복문 처리!
        if (configIndex <= inputListConfig.length - 1) {
          /**
           * textStyle 및 iconStyle 변수 설정 <시작>
           * 'impact': blueColor & sizeUp & bold
           * 'bold': bold
           */
          let currentTextStyle = styles.SoftText; // "text" 타입 스타일 변수 설정
          let currentIconStyle = null; // "icon" 타입 스타일 변수 설정

          if (config.textStyle === 'impact') {
            currentTextStyle = styles.BoldBlueText;
          } else if (config.textStyle === 'bold') {
            currentTextStyle = styles.SoftBoldText;
          } else {
            currentTextStyle = styles.SoftText;
          }
          /**
           * textStyle 및 iconStyle 변수 설정 <끝>
           */

          /**
           * 해당 index의 전 후 컬럼을 비교하기 위한 변수 설정 <시작>
           */
          let nextRowTypeChk = false; // 현재 해당 설정 값의 이전 설정 값 체크!
          let preRowTypeChk = false; // 현재 해당 설정 값의 이후 설정 값 체크!

          // 이전 설정 값도 일반적인 정렬인지 확인!
          if (configIndex >= 0) {
            if (configIndex !== inputListConfig.length - 1) {
              nextRowTypeChk = !!Util.isEmpty(inputListConfig[configIndex + 1].rowType);
            }
          }
          // 이후 설정 값도 일반적인 정렬인지 확인!
          if (configIndex >= 1) {
            preRowTypeChk = !!Util.isEmpty(inputListConfig[configIndex - 1].rowType);
          }
          /**
           * 해당 index의 전 후 컬럼을 비교하기 위한 변수 설정 <시작>
           */

          /**
           * text & icon 컴포넌트 변수 설정 <시작>
           */
          const textComponent = <Text style={currentTextStyle}>{item[config.dataIndex]}</Text>;
          const iconComponent = (
            <Icon
              name={config.dataIndex}
              type="MaterialIcons"
              color={bluecolor.basicBlueColor}
              size={23}
            />
          );
          /**
           * text & icon 컴포넌트 변수 설정 <시작>
           */

          /**
           * 컴포넌트 최종 완성 로직 <시작>
           */
          // 행의 첫번째 컬럼 설정!
          // secondCompleted = true 일 경우만 처리! - 즉, 이전 단계에서 "두 번째 까지 완성되서 첫번 째 설정을 해라" 라는 의미
          if ((configIndex === 0 || configIndex > 1) && secondCompleted) {
            if (config.componentType === 'text') {
              firstColumn = textComponent;
            } else if (config.componentType === 'icon') {
              firstColumn = iconComponent;
            }

            if (nextRowTypeChk) {
              // 다음 항목이 일반적인 한행에 2컬럼 설정일 경우!
              secondCompleted = false;

              return null;
            } else if (!nextRowTypeChk) {
              // 다음 항목이 일반적인 한행에 2컬럼이 아닐 경우! 나머지 건은 해당 컬럼만 설정!
              secondCompleted = true;

              return (
                <View style={[styles.startEndColumn, currentIconStyle]} key={config.dataIndex}>
                  {firstColumn}
                  {null}
                </View>
              );
            }
          }

          // 행의 두번째 컬럼 설정!
          // secondCompleted = false 일 경우만 처리! - 즉, 이전 단계에서 "두 번째 까지 완성되지 않아 두번 째 설정을 해라" 라는 의미
          if ((configIndex === 1 || configIndex > 1) && preRowTypeChk && !secondCompleted) {
            secondCompleted = true;

            if (config.componentType === 'text') {
              secondColumn = textComponent;
            } else if (config.componentType === 'icon') {
              currentIconStyle = { marginTop: 5, marginLeft: 10, marginRight: 10 };
              secondColumn = iconComponent;
            }

            // 최종적으로 한행에 2개의 컬럼을 설정한다.
            return (
              <View style={[styles.startEndColumn, currentIconStyle]} key={config.dataIndex}>
                {firstColumn}
                {secondColumn}
              </View>
            );
          }
          /**
           * 컴포넌트 최종 완성 로직 <끝>
           */
        }
      } else if (config.rowType === 'single') {
        // 한행에 1개의 컬럼만 존재 - 별도 fuction에서 처리!
        const renderSingleType = this.renderSingleType(item, config);

        return <View key={index + config.dataIndex}>{renderSingleType}</View>;
      } else if (config.rowType === 'multi') {
        // 한 행에 3컬럼 이상 존재할 경우를 대비하여 설정함! - 별도 fuction에서 처리!
        const renderMultiType = this.renderMultiType(item, config);

        return <View key={index + config.dataIndex}>{renderMultiType}</View>;
      }
      // 정해진 rowType 설정 값이 없거나, 잘못 된 값을 경우 null 처리
      return null;
    });

    // 상단 조건처리로 생성된 View 셋팅!
    return (
      <View style={[index % 2 === 0 ? theme.evenRowColor : theme.oddRowColor]} key={index}>
        <View>{arrayListCondition}</View>
        {this.props.children}
        {/**
         * Row의 순번 표기 여부! <시작>
         */}
        {this.state.rowCountYN ? <Text style={styles.rowCount}>{index + 1}</Text> : null}
        {/**
         * Row의 순번 표기 여부! <끝>
         */}
        <View style={theme.line} />
      </View>
    );
  }
}

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
  BoldBlueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: bluecolor.basicBlueImpactColor,
  },
  SoftText: {
    fontSize: 13,
    color: bluecolor.basicBlueFontColor,
  },
  SoftBoldText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: bluecolor.basicBlueFontColor,
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
  rowCount: {
    fontWeight: 'bold',
    color: bluecolor.basicBlueFontColor,
    fontSize: 10,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
  },
});

export default Component;
