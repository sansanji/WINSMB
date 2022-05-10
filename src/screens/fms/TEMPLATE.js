/* *
 * Import Common
 * */
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { _, Navigation, React, Redux, Fetch, NavigationScreen, bluecolor, Util, env } from 'libs';
import {
  HBaseView,
  Touchable,
  ListCommonRow,
  DateSet,
  DetailSearchForm,
  SearchToolBar,
  ActionButton,
} from 'ux';

/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Global Var Set!
const setRowCnt = env().listCnt; // 20; // 페이징 처리 시 화면에 그려질 기본 Row 갯수!

/**
 *  Common Component Template! - AE GSCL(CELLO) EDI List
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPLATE');

    this.state = {
      data: [],
      dataTotal: [],
      btnIndex: 0,
      spinner: false,
      canScroll: true,
      headerHeight: 0,
      visible: true,
      toPositionVisible: false, // 스크롤 위치에 따른 버튼 보이기/가리기
      refreshing: false,
      // 실제 조회조건 State 설정 값 [시작]
      CAL_FROM_DATE: null,
      CAL_TO_DATE: null,
      FROM_DATE: null,
      TO_DATE: null,
      hmblNo: null,
      arrivalPort: null,
      ediStatusCode: 'ALL',
      ediStatusName: 'All',
      // 실제 조회조건 State 설정 값 [끝]
      DetailSearchlayoutVisible: false,
      fetchResult: null,
      // 페이징 관련 변수!
      currentPage: 0, // 상수로 설정된 "setRowCnt" 당 1 페이지
      currentRow: 0, // 전체 조회 건 수 대비 화면에 그려진 건 수!
      rowCountYN: true,
    };
    this.callapsed = false;
  }

  componentWillMount() {}

  shouldComponentUpdate() {
    return true;
  }

  // 화면을 조회한다.
  async fetch() {
    // ios에서는 스피너 처리가 불안해서 보류 처리
    // if (Platform.OS !== 'ios') {
    if (!this.state.spinner) this.setState({ spinner: true });
    // }

    const result = await Fetch.request(
      'BAS010101SVC',
      'getCelloIvAeApp',
      {
        body: JSON.stringify({
          BAS010101F1: {
            FROM_DATE: this.state.FROM_DATE,
            TO_DATE: this.state.TO_DATE,
            HMBL_NO: this.state.hmblNo,
            ARRIVAL_PORT: this.state.arrivalPort,
            SEND_TARGET_STATUS: this.state.ediStatusCode,
            SEND_TARGET_STATUS_NAME: this.state.ediStatusName,
            H_CONFIRM_YN: '',
            ONLY_QUE_CHK: 'N',
            USER_ID_CHK: 'N',
            AT_BLADVI_PUSH_SEND_YN: '',
            AT_BLADVI_EDI_SEND_YN: '',
          },
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result) {
      const arrSetRow = [];
      let currentRow = 0;
      const totalLength = result.BAS010101G1.length;

      // 만약 페이징 설정된 기본 로우 수 보다 전체 조회 건 수가 적을 경우 처리!
      if (Util.isEmpty(totalLength) || totalLength < setRowCnt) {
        currentRow = totalLength;
      } else {
        currentRow = setRowCnt;
      }

      // 최상단에 설정된 기본 갯수 만큼 우선 처리한다!
      for (let i = 0; i < currentRow; i += 1) {
        arrSetRow.push({
          ...result.BAS010101G1[i],
        });
      }

      // 스크롤 최 상단으로 이동!
      this.flatListRef.getScrollResponder().scrollTo({ animated: true }, 0);

      this.setState({
        dataTotal: result.BAS010101G1,
        data: arrSetRow, // data: result.BAS010101G1,
        fetchResult: result, // fetch후 리턴받은 모든 값
        spinner: false,
        DetailSearchlayoutVisible: false, // 상세조건 뷰가 열려있다면 닫는다.
        currentPage: 1,
        currentRow, // currentRow : currentRow
      });
    } else {
      this.setState({
        fetchResult: null, // fetch후 리턴받은 모든 값
        spinner: false,
        DetailSearchlayoutVisible: false, // 상세조건 뷰가 열려있다면 닫는다.
        currentPage: 0,
        currentRow: 0, // currentRow : currentRow
      });
    }
  }

  // 애니메이션 처리를 위한 부분
  _onScroll(event) {
    const {
      contentOffset: { y },
    } = event.nativeEvent;

    // 스크롤이 내려 갔을 경우!
    if (this.state.headerHeight < y && this.callapsed === false) {
      LayoutAnimation.spring();
      this.setState({
        visible: false,
        toPositionVisible: true, // 스크롤 위치에 따른 버튼 보이기
      });
      this.callapsed = true;
    }

    // 스크롤이 올라 갔을 경우!
    if (y < 30 && this.callapsed === true) {
      LayoutAnimation.spring();
      this.setState({
        visible: true,
        toPositionVisible: false, // 스크롤 위치에 따른 버튼 가리기
      });
      this.callapsed = false;
    }
  }

  // 애니메이션 처리를 위한 부분 (현재 미사용!)
  _onLayout(event) {
    const { x, y, width, height } = event.nativeEvent.layout;

    this.setState({
      headerHeight: 0,
      layoutWidth: width,
      layoutHeight: height,
      layoutX: x,
      layoutY: y,
    });
  }

  /**
   * 조회조건 form이 있는 화면은 공통적으로 선언! <시작>
   * 일자 : DateSet.js
   * 상세검색(Text & Combo) : DetailSearchForm > inputSearchCondition
   */
  // 화면이 처음 그려질 때 초기 일자를 셋팅한다.
  // DateSet 공통 모듈에서 넘겨받는다.
  // 일자(달력)항목에 대해 모든화면에서 CAL_FROM_DATE, FROM_DATE, CAL_TO_DATE, TO_DATE 공통 네이밍을 갖는것으로 하자!
  _onSetDefaultDate(fromDateString, fromDateOrigin, toDateString, toDateOrigin) {
    this.setState({
      CAL_FROM_DATE: `${fromDateString}`, // 'YYYYMMDD'
      FROM_DATE: `${fromDateOrigin}`, // 'YYYY-MM-DD'
      CAL_TO_DATE: `${toDateString}`, // 'YYYYMMDD'
      TO_DATE: `${toDateOrigin}`, // 'YYYY-MM-DD'
    });
  }

  // 시작일자, 종료일자를 선택한 값을 설정한다.
  // DateSet 공통 모듈에서 넘겨받는다.
  // 일자(달력)항목에 대해 모든화면에서 CAL_FROM_DATE, FROM_DATE, CAL_TO_DATE, TO_DATE 공통 네이밍을 갖는것으로 하자!
  _onChangeDatePick(dateString, dateOrigin, dateType) {
    if (dateType === 'fromDate') {
      this.setState({
        FROM_DATE: `${dateOrigin}`, // 'YYYYMMDD'
        CAL_FROM_DATE: `${dateString}`, //  'YYYY-MM-DD'
      });
    } else {
      this.setState({
        TO_DATE: `${dateOrigin}`, // 'YYYYMMDD'
        CAL_TO_DATE: `${dateString}`, // 'YYYY-MM-DD'
      });
    }
  }

  // 날짜타입 콤보 데이터를 설정하여 일자를 설정한다.
  // DateSet 공통 모듈에서 넘겨받는다.
  // 일자(달력)항목에 대해 모든화면에서 CAL_FROM_DATE, FROM_DATE, CAL_TO_DATE, TO_DATE 공통 네이밍을 갖는것으로 하자!
  _onChangeDateType(fromDateSet, searchFromDateSet, toDateSet, searchToDateSet) {
    this.setState({
      CAL_FROM_DATE: `${fromDateSet}`, // 'YYYYMMDD'
      FROM_DATE: `${searchFromDateSet}`, // 'YYYY-MM-DD'
      CAL_TO_DATE: `${toDateSet}`, // 'YYYYMMDD'
      TO_DATE: `${searchToDateSet}`, // 'YYYY-MM-DD'
    });
  }

  // 상세조건을 설정한다. (Text형식)
  // DetailSearchForm > InputSearchCondition 공통 모듈에서 넘겨받는다.
  _onChangeConditionText(columnValue, columnName, columnType, columnMandatory) {
    if (columnType === 'text') {
      this.setState({
        [columnName]: columnValue,
        [`${columnName}Madatory`]: columnMandatory,
      });
    }
  }

  // 상세조건을 설정한다. (Combo형식)
  // DetailSearchForm > InputSearchCondition 공통 모듈에서 넘겨받는다.
  _onChangeConditionCombo(dtCode, engValue, stateSetCode, stateSetName) {
    this.setState({
      [stateSetCode]: dtCode,
      [stateSetName]: engValue,
    });
  }

  // 초기화 리셋버튼을 클릭 시 상세조건을 초기값으로 설정한다.
  // DetailSearchForm 공통 모듈에서 넘겨받는다.
  _onResetSearchCondition(arrayResetConfig) {
    arrayResetConfig.forEach(config => {
      if (config.componentType === 'text') {
        this.setState({
          [config.stateColumn]: '',
        });
      } else if (config.componentType === 'combo') {
        this.setState({
          [config.stateColumn.stateColumnCode]: 'ALL', // 모든 화면은 초기 값을 ALL로 하자!
          [config.stateColumn.stateColumnName]: 'All',
        });
      }
    });
  }
  /**
   * 조회조건 form이 있는 화면은 공통적으로 선언! <끝>
   * 일자 : DateSet.js
   * 상세검색 : DetailSearchForm > inputSearchCondition
   */

  // 전송이력 화면 팝업 전 전송 유무 체크
  _commonSendRecvHistoryChk(item, docType) {
    if (docType === 'BLADVI') {
      if (item.BLADVI_SEND_YN === 'N') {
        Alert.alert(
          `${docType} No history send.`,
          'Please check again!',
          [{ text: '[ OK ]', onPress: () => console.log('cancel'), style: 'cancel' }],
          { cancelable: false },
        );
      } else {
        this._commonSendHistoryList(item, docType);
      }
    } else if (docType === 'SHPINF') {
      if (item.SHPINF_SEND_YN === 'N') {
        Alert.alert(
          `${docType} No history send.`,
          'Please check again!',
          [{ text: '[ OK ]', onPress: () => console.log('cancel'), style: 'cancel' }],
          { cancelable: false },
        );
      } else {
        this._commonSendHistoryList(item, docType);
      }
    } else {
      Alert.alert(
        'Developing...',
        'Please wait, coming soon!',
        [{ text: '[ OK ]', onPress: () => console.log('cancel'), style: 'cancel' }],
        { cancelable: false },
      );
    }
  }

  // 전송이력 화면 팝업
  _commonSendHistoryList(item, docType) {
    const { navigator } = this.props;
    // Object.entries(item).forEach(([key, value]) => {
    //   console.log(`${key}: ${value}`);
    // });

    // 이걸 선언 안해주면 이상하게 2번째 부터 화면을 열때 먹통이 된다;;
    // 이상하다 ㅠㅠ 다른 화면들은 그냥 잘만 됬는데 ㅠㅠ
    // Navigation(this.props.navigator, 'POP');

    Navigation(navigator, 'FMS010105', {
      HBL_NO: item.HBL_NO,
      MBL_NO: item.MBL_NO,
      FORWD_TYPE: 'AIR',
      IMP_EXP_FLAG: 'EX',
      SDS_SEND_DOC_TYPE: docType,
      ENDPOINT_FLAG: 'GSCL',
      DATE_FLAG: 'Y',
      item,
    });
  }

  /**
   * EDI 전송 이벤트 <시작>
   */
  // EDI 전송 전 알림 표시
  // LongPress 적용
  _sendEdiAlert(item, docType) {
    Alert.alert(
      `Are you sure you want to [${docType}] send?`,
      `· B/L No.: [${item.HBL_NO}]`,
      [
        { text: '[ Back ]', onPress: () => console.log('cancel'), style: 'cancel' },
        { text: '[ Nomal ]', onPress: () => this._sendEdi(item, docType, 'single') },
        {
          text: '[ Cancel ]',
          onPress: () => this._sendEdiCancelAlert(item, docType),
        },
      ],
      { cancelable: false },
    );
  }

  // 취소 단 건 전송 시 한번 더 되묻기!
  _sendEdiCancelAlert(item, docType) {
    Alert.alert(
      `Are you sure you want to [${docType} Cancel send]?`,
      `· B/L No.: [${item.HBL_NO}]`,
      [
        { text: '[ Back ]', onPress: () => console.log('cancel'), style: 'cancel' },
        {
          text: '[ Cancel Send ]',
          onPress: () => this._sendEdi(item, docType, 'single', 'cancel'),
        },
      ],
      { cancelable: false },
    );
  }

  // 조회된 전체 건 전송에 대해 EDI 전송 시 한번 더 되묻기!
  _sendEdiMultiAlert(docType, orgType) {
    const fetchDataAll = this.state.dataTotal;
    const dataLength = fetchDataAll.length;
    let targetHbl = null;
    let orgTypeName = null;

    if (dataLength > 1) {
      targetHbl = `${fetchDataAll[0].HBL_NO} 외 ${dataLength - 1}건`;
    } else {
      targetHbl = fetchDataAll[0].HBL_NO;
    }

    if (orgType === 'cancel') {
      orgTypeName = 'Cancel';
    } else {
      orgTypeName = 'Nomal';
    }

    Alert.alert(
      `Are you sure you want to [${docType} ${orgTypeName} send All]?`,
      `· B/L No.: [${targetHbl}]`,
      [
        { text: '[ Back ]', onPress: () => console.log('cancel'), style: 'cancel' },
        {
          text: `[ ${orgTypeName} Send All ]`,
          onPress: () => this._sendEdi(null, docType, 'multi', orgType),
        },
      ],
      { cancelable: false },
    );
  }

  /**
   * EDI 전송
   * parameters
   *   - item : 조회된 내역 중 선택된 행의 데이터 (단, 전체 전송은 "null" 처리)
   *   - docType : 전송할 문서명
   *   - sendType : single or multi 전송 구분
   *   - orgType : 일반(원본,재전송) or 취소 전송 구분
   *  */
  async _sendEdi(item, docType, sendType, orgType) {
    // OS 상관없이 EDI 전송 후 재 조회를 하기 때문에 2중으로 스피너 처리를 할 필요 없지 않을까?
    // 우선 해당 이벤트 내 callback에서 spinner = false 처리하지 않고, fetch에서 최종적으로 한다.
    if (!this.state.spinner) this.setState({ spinner: true });

    const fetchDataAll = this.state.dataTotal;
    const fetchDataLength = this.state.dataTotal.length;
    let cancelYN = 'N';

    if (orgType === 'cancel') {
      cancelYN = 'Y';
    }

    // 삭제 전송일 경우 "3" 처리!
    if (sendType === 'single') {
      // 단 건 전송은 선택한 데이터에만 취소 컬럼 설정!
      Object.assign(item, { BLADVI_CANCEL_YN: cancelYN });
    } else if (sendType === 'multi') {
      // 전체 건 전송은 반복문을 통해 모든 데이터에 취소 컬럼 설정!
      for (let i = 0; i < fetchDataLength; i += 1) {
        Object.assign(fetchDataAll[i], { BLADVI_CANCEL_YN: cancelYN });
      }
    }

    const result = await Fetch.request('FMS010401SVC', 'sendBlTargetSort', {
      body: JSON.stringify({
        FMS010401G1: {
          data: sendType === 'multi' ? fetchDataAll : [item], // 단 건 전송이냐? 다중 건 전송이냐?
        },
      }),
    });

    if (result) {
      // 응답 값 state 셋팅! (공통)
      this.setState({
        fetchResult: result, // fetch후 리턴받은 모든 값
      });

      // 성공 / 살패에 따른 처리
      if (result.TYPE === 1) {
        // 재조회를 해줘야 최신의 EDI 상태값을 refresh한다.
        // fetch callback에서 최종 스피너 false 처리
        this.fetch();
      } else {
        // 특정 이벤트 발생 후 리턴 메시지 Alert로 보여주기!
        this._popResultAlert(result.MSG);

        // android 아닌 경우만 설정
        // 팝업 오픈된 후 백그라운드에서는 스피너가 돌고 있는 상태일 경우 물리 백버튼을 터치시 무한 스피너가 될 수있다.
        // ios같은 경우는 스피너가 false 처리되면서 오픈된 팝업도 지워버리기 때문에 버튼 팝업 "확인" 터치시만 스피너 false 처리
        if (Platform.OS !== 'ios') {
          this.setState({
            spinner: false,
          });
        }
      }
    }
  }

  // 특정 이벤트 발생 후 리턴 메시지 Alert로 보여주기!
  // 우선은 오류나 실패할 경우만 팝업 알림 보여주기!
  _popResultAlert(msg) {
    const { navigator } = this.props;

    Navigation(this.props.componentId, 'POP');
    Navigation(navigator, 'ALERT', {
      title: 'EDI Send Alert Message!',
      content: msg,
      onClose: () => {
        // "확인" 버튼 클릭 시 팝업 창 닫고, 스피너 false 처리
        navigator.dismissOverlay(this.props.componentId);

        this.setState({
          spinner: false,
        });
      },
    });
  }

  // ActionButton 터치 시 이벤트 처리!
  _tappedActionButton(btnType, docType) {
    const fetchDataLength = this.state.dataTotal.length;

    if (btnType === 'Search') {
      this.fetch();
    } else if (btnType === 'Reset') {
      this.setState({
        data: [],
        dataTotal: [],
        currentPage: 0,
        currentRow: 0,
        fetchResult: null,
      });
    } else if (fetchDataLength > 0) {
      if (btnType === 'Send All') {
        this._sendEdiMultiAlert(docType);
      } else if (btnType === 'Cancel All') {
        this._sendEdiMultiAlert(docType, 'cancel');
      }
    } else {
      Alert.alert(
        'No search history.',
        'Please search first.',
        [{ text: '[ OK ]', onPress: () => console.log('cancel'), style: 'cancel' }],
        { cancelable: false },
      );
    }
  }
  /**
   * EDI 전송 이벤트 <끝>
   */

  // 페이징 처리 - flatList에서 가장 아래 데이터까지 스크롤을 했을 경우 트리거 형태로 처리된다.!
  onEndReached = () => {
    // 공통 모듈로 처리!
    const getRtnData = Util.flatListOnEndReached(
      setRowCnt, // 조회 시 그려질 row 갯수!
      Number(this.state.currentPage), // 현재 그려진 페이지!
      this.state.dataTotal, // 조회된 전체 건수!
    );

    // 리턴 된 값이 있을 경우만 setState 처리!
    if (!Util.isEmpty(getRtnData)) {
      // 추후에 비교 자료가 필요할 경우가 발생할 것 같은 느낌? 주석처리!
      // console.log('getRtnData= ', getRtnData);
      // console.log('getRtnData.arrData= ', getRtnData.arrData);
      // console.log('...getRtnData.arrData= ', ...getRtnData.arrData);
      this.setState({
        data: [...this.state.data, ...getRtnData.arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
        currentPage: Number(this.state.currentPage) + 1, // 기존 페이징에서 +1 처리!
        currentRow: getRtnData.applyToIndex, // 전체 건수 대비 화면에 그려진 Row 갯수!
      });
    }

    // 공통 펑션 미 처리 로직 하단! <시작>
    // const fromIndex = setRowCnt * Number(this.state.currentPage); // 20 부터
    // const toIndex = fromIndex * 2; // 40 까지
    // const ApplyToIndex = null;
    // const dataTotalLength = this.state.dataTotal.length; // 실제 조회된 전체 건수!
    // const toastMsg = null;
    // const arrData = [];

    // if (dataTotalLength >= toIndex && dataTotalLength > fromIndex) {
    //   // 전체 건수에 아직 도달하지 못했을 경우!
    //   ApplyToIndex = toIndex;
    //   toastMsg = `+ ${setRowCnt} View more ( ${fromIndex} / ${dataTotalLength} )`;

    //   Util.toastMsg(toastMsg); // 간략 정보 토스트 메시지 처리
    // } else if (dataTotalLength < toIndex && dataTotalLength > fromIndex) {
    //   // 전체 건수에 도달하였지만, 100% 페이징에 설정된 기본 갯수가 다 채워 지지 않았을 경우 나머지 값 처리!
    //   ApplyToIndex = dataTotalLength;
    //   toastMsg = `+ ${
    //     dataTotalLength % setRowCnt === 0 ? setRowCnt : dataTotalLength % setRowCnt
    //   } View more ( ${fromIndex} / ${dataTotalLength} )`;

    //   Util.toastMsg(toastMsg); // 간략 정보 토스트 메시지 처리
    // } else if (fromIndex >= dataTotalLength && dataTotalLength <= fromIndex) {
    //   // 페이징 처리 후 그려질 갯수가 더 이상 없을 경우! 리턴한다!
    //   // 간략 정보 토스트 메시지 처리
    //   Util.toastMsg(`The view end ( ${dataTotalLength} / ${dataTotalLength} )`);

    //   return;
    // }

    // // 지정된 페이징 Row 갯수만큼 임시 저장한다.
    // for (let i = fromIndex; i < ApplyToIndex; i += 1) {
    //   arrData.push({
    //     ...this.state.dataTotal[i],
    //   });
    // }

    // this.setState({
    //   data: [...this.state.data, ...arrData], // 기존 조회된 데이터와 페이징 처리 데이터 누적!
    //   currentPage: Number(this.state.currentPage) + 1, // 기존 페이징에서 +1 처리!
    //   currentRow: ApplyToIndex, // 전체 건수 대비 화면에 그려진 Row 갯수!
    // });
    // 공통 펑션 미 처리 로직 하단! <끝>
  };

  // SearchToolBar 공통 컴포넌트에서 넘겨 받음!
  onGoToScroll(position) {
    if (position === 'top') {
      this.flatListRef.getScrollResponder().scrollTo({ animated: true }, 0);
      // this.flatListRef.scrollToOffset({ x: 0, y: 0, animated: true });
    } else if (position === 'bottom') {
      this.flatListRef.getScrollResponder().scrollToEnd({ animated: true });
    }
  }

  // 조회조건 컴포넌트 설정
  // FLAT LIST 내부에 넣으면 키보드가 닫히는 이슈발생으로 ..
  renderHeader = () => {
    // const { theme } = this.props.global;

    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * 화면마다 원하는 조건이 다르므로 유동적으로 변경 바람!
     * componentType 주의!
     */
    // 1. autoCapitalize
    // characters: all characters.
    // words: first letter of each word.
    // sentences: first letter of each sentence (default).
    // none: don't auto capitalize anything.
    const inputSearhConfig = [
      {
        componentType: 'text',
        label: 'Arrival Port',
        iconName: 'edit-location', // materialIcon
        keyboardType: 'email-address', // default, number-pad, decimal-pad, numeric, email-address, phone-pad
        stateColumn: 'arrivalPort',
        autoCapitalize: 'characters',
        mandatory: false, // 필수 항목 유무!
        columnValue: this.state.arrivalPort, // 자식의 value값이 초기화 되는 경우가 발생하여 부모 값을 넘겨준다.
      },
      {
        componentType: 'text',
        label: 'H/M BL No.',
        iconName: 'font-download', // materialIcon
        keyboardType: 'email-address', // default, number-pad, decimal-pad, numeric, email-address, phone-pad
        stateColumn: 'hmblNo',
        autoCapitalize: 'characters',
        mandatory: false, // 필수 항목 유무!
        columnValue: this.state.hmblNo, // 자식의 value값이 초기화 되는 경우가 발생하여 부모 값을 넘겨준다.
      },
      {
        componentType: 'combo',
        label: 'EDI Status',
        stateColumnCode: 'ediStatusCode',
        stateColumnName: 'ediStatusName',
        comboCommonCode: 'EDI_SEND_STATUS',
        comboDefaultCode: this.state.ediStatusCode, // 자식의 value값이 초기화 되는 경우가 발생하여 부모 값을 넘겨준다.
        comboDefaultName: this.state.ediStatusName, // 자식의 value값이 초기화 되는 경우가 발생하여 부모 값을 넘겨준다.
      },
    ];
    /**
     * 공통처리 부분이므로 임의로 key값, 갯수나, 이름 변경 금지!!!!! <끝>
     * 화면마다 원하는 조건이 다르므로 유동적으로 변경 바람!
     * componentType 주의!
     */

    return (
      <View>
        <Text style={{ fontSize: 10, textAlign: 'center' }}>
          ※ 시작일자와 종료일자 사이 최대 3일치 건만 조회 가능합니다.
        </Text>

        {/**
         * 일자검색 조건 공통 컴포넌트 <시작>
         * 공통 컴포넌트 모듈들은 navigationView가 아니므로 리덕스를 통해 초기 설정값을 가져올 수 없다.
         */}
        <View>
          <DateSet
            fromDateNum={-1} // 오늘일자 기준 fromDate 설정
            toDateNum={0} // 오늘일자 기준 toDate 설정
            limitDay={3} // 기능: 시작일자와 종료일자의 일수 제한
            onSetDefaultDate={(fromDateString, fromDateOrigin, toDateString, toDateOrigin) =>
              this._onSetDefaultDate(fromDateString, fromDateOrigin, toDateString, toDateOrigin)
            } // 화면이 그려질 때 초기 일자 설정
            onChangeDatePick={(dateString, dateOrigin, dateType) =>
              this._onChangeDatePick(dateString, dateOrigin, dateType)
            } // 달력 팝업을 오픈하여 일자를 선택할 경우 처리
            onChangeDateType={(fromDateSet, searchFromDateSet, toDateSet, searchToDateSet) =>
              this._onChangeDateType(fromDateSet, searchFromDateSet, toDateSet, searchToDateSet)
            } // 일자타입 선택할 경우 처리
          />
        </View>
        {/**
         * 일자검색 조건 공통 컴포넌트 <끝>
         * 공통 컴포넌트 모듈들은 navigationView가 아니므로 리덕스를 통해 초기 설정값을 가져올 수 없다.
         */}

        {/**
         * 상세검색 조건 공통 컴포넌트 <시작>
         * 공통 컴포넌트 모듈들은 navigationView가 아니므로 리덕스를 통해 초기 설정값을 가져올 수 없다.
         */}
        <View>
          <DetailSearchForm
            // theme={theme}
            // 상세조건 펼치고 접기
            layoutVisible={this.state.DetailSearchlayoutVisible}
            inputSearhConfig={inputSearhConfig} // 조회조건 설정 값
            // text타입 값 설정
            onChangeConditionText={(columnValue, columnName, columnType, columnMandatory) =>
              this._onChangeConditionText(columnValue, columnName, columnType, columnMandatory)
            }
            // combo타입 값 설정
            onChangeConditionCombo={(dtCode, engValue, stateSetCode, stateSetName) =>
              this._onChangeConditionCombo(dtCode, engValue, stateSetCode, stateSetName)
            }
            // 초기화 버튼 : true /false
            onResetSearchCondition={arrayResetConfig =>
              this._onResetSearchCondition(arrayResetConfig)
            }
          />
        </View>
        {/**
         * 상세검색 조건 공통 컴포넌트 <끝>
         * 공통 컴포넌트 모듈들은 navigationView가 아니므로 리덕스를 통해 초기 설정값을 가져올 수 없다.
         */}
      </View>
    );
  };

  // flatList 가장 하단에 표시될 컴포넌트
  renderFooter = () => {
    if (this.state.data.length > 0 && this.state.data.length !== this.state.dataTotal.length) {
      return (
        <View
          style={{ alignItems: 'center', padding: 2, backgroundColor: bluecolor.basicWhiteColor }}
        >
          <Touchable
            activeOpacity={0.5}
            onPress={() => {
              this.onEndReached();
            }}
          >
            <Text style={styles.textVericalCenter} adjustsFontSizeToFit numberOfLines={1}>
              +{setRowCnt} View more
            </Text>
          </Touchable>
        </View>
      );
    }
    return null;
  };

  // 그리드에 조회된 EDI 송수신 상태 스타일 설정
  _getStatusTextStyle(themeStatus, docType, itemColumn, orgType) {
    if (docType === 'BLADVI' || docType === 'SHPINF') {
      if (itemColumn === 'S' || itemColumn === 'F') {
        // gsrm전송 로직중에 where조건을 걸지 않고 죄다 F로 처리되어 어쩔 수 없이 'F'조건도 추가
        if (orgType === '3') {
          // 취소전송 성공 시 짙은 회색 음영 처리!
          return themeStatus.myPageStatusCancel;
        }
        return themeStatus.myPageStatusOn;
      } else if (itemColumn === 'E') {
        return themeStatus.myPageStatusError;
      }
      return themeStatus.myPageStatusOff;
    }
    return themeStatus.myPageStatusOff;

    // 정해진 것이 아닌 커스터미아징이 필요할 경우
    // return {
    // height: 40,
    // }
  }

  // 실제로 화면을 그려준다.
  render() {
    const { theme } = this.props.global;

    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * 화면마다 원하는 조건이 다르므로 유동적으로 변경 바람!
     * componentType 주의!
     */
    // 1. rowType
    //   - 미 선언 or null : 기본적으로 한 행에 2가지 컬럼 나열
    //   - single : 한 가지 항목 단독 나열
    //   - multi : 세가지 이상 나열
    // 2. componentType
    //   - text
    //   - icon : MaterialIcons
    // 3. dataIndex : 백단에서 쿼리로 넘겨받은 컬럼명
    //              : 단, icon 타입인 경우 "MaterialIcons"의 iconName 기재
    // 4. labelName : 표시될 데이터 앞에 구분자 값 (S, C), 선언하지 않기
    // 5. textStyle : 강조하고 싶은 컬럼 설정 값
    const inputListConfig = [
      {
        componentType: 'text',
        dataIndex: 'HBL_NO',
        textStyle: 'impact', // blueColor & sizeUp & bold
      },
      {
        componentType: 'text',
        dataIndex: 'MBL_NO',
      },
      {
        rowType: 'single',
        componentType: 'text',
        dataIndex: 'SHIPPER_NAME',
        labelName: 'SHPR',
      },
      {
        rowType: 'single',
        componentType: 'text',
        dataIndex: 'CONSIGNEE_NAME',
        labelName: 'CNEE',
      },
      {
        componentType: 'icon',
        dataIndex: 'flight-takeoff', // MaterialIcons
      },
      {
        componentType: 'icon',
        dataIndex: 'flight-land', // MaterialIcons
      },
      {
        componentType: 'text',
        dataIndex: 'DEPART_PORT',
      },
      {
        componentType: 'text',
        dataIndex: 'ARRIVAL_PORT',
      },
      {
        componentType: 'text',
        dataIndex: 'ETD_DATE_TIME',
      },
      {
        componentType: 'text',
        dataIndex: 'ETA_DATE_TIME',
      },
      {
        componentType: 'text',
        dataIndex: 'FLNT_NO',
        textStyle: 'bold', // bold
      },
      {
        componentType: 'text',
        dataIndex: 'INV_NO',
      },
      {
        rowType: 'multi',
        item: [
          {
            componentType: 'text',
            dataIndex: 'PKG_QTY',
            labelName: 'Q`ty',
          },
          {
            componentType: 'text',
            dataIndex: 'GW',
            labelName: 'G/W',
          },
          {
            componentType: 'text',
            dataIndex: 'VW',
            labelName: 'V/W',
          },
          {
            componentType: 'text',
            dataIndex: 'CW',
            labelName: 'C/W',
          },
        ],
      },
    ];
    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * 화면마다 원하는 조건이 다르므로 유동적으로 변경 바람!
     * componentType 주의!
     */

    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * ActionButton 공통 컴포넌트 처리
     * 단, ActionButton을 사용하지 않고, 조회버튼만 필요한 경우
     *   : SearchToolBar > searchBtnVisible={tue} 처리
     */
    const actionButtonConfig = [
      {
        title: 'Cancel All', // 필수사항
        iconName: 'paper-plane', // 필수사항 // FontAwesome
        docType: 'BLADVI', // 선택사항
      },
      {
        title: 'Send All', // 필수사항
        iconName: 'paper-plane', // 필수사항 // FontAwesome
        docType: 'BLADVI', // 선택사항
      },
      {
        title: 'Reset', // 필수사항
        iconName: 'undo', // 필수사항  // FontAwesome
      },
      {
        title: 'Search', // 필수사항
        iconName: 'search', // 필수사항 // FontAwesome
      },
    ];
    /**
     * 공통처리 부분이므로 임의로 key의 갯수나, 이름 변경 금지!!!!! <시작>
     * ActionButton 공통 컴포넌트 처리
     */

    return (
      <HBaseView spinner={this.state.spinner}>
        <FlatList
          ref={ref => {
            this.flatListRef = ref;
          }}
          ListHeaderComponent={this.renderHeader()}
          // {this.state.data.length > 0 ? this.renderFooter() : null}
          ListFooterComponent={this.renderFooter()}
          refreshControl={
            <RefreshControl
              enabled={this.state.searchBtnVisible} // 밑으로 드래그 할 시 자동 조회 처리 여부 확인
              refreshing={this.state.refreshing}
              onRefresh={() => this.fetch()}
            />
          }
          canCancelContentTouches={this.state.canScroll}
          onScroll={event => this._onScroll(event)}
          onLayout={event => this._onLayout(event)} // 미사용!
          data={this.state.data}
          keyExtractor={item => item.SR_CODE}
          // disableVirtualization={false}
          // removeClippedSubviews
          // 버그가 많아 물리 버튼으로 전환!
          // initialNumToRender={setRowCnt}
          // onEndReachedThreshold={0.5}
          // onEndReached={this.onEndReached} // 스크롤이 맨 아래쪽을 터치하였을 경우 트리거 작동!
          //
          // renderItem={({ item, index }) => <ListGsclIvAe item={item} index={index} />}
          renderItem={({ item, index }) => (
            <Touchable
              activeOpacity={0.7}
              key={item.SR_CODE}
              onLongPress={() => this._sendEdiAlert(item, 'BLADVI')}
            >
              <ListCommonRow
                item={item} // 조회된 데이터!
                index={index} // List Index
                theme={theme} // 공통 테마
                // uniqKey={new Date().getTime()}
                mainFontSize={13}
                inputListConfig={inputListConfig} // 컬럼 배치 설정 값
                rowCountYN // Row의 순번 표기 여부!
              >
                {/**
                 * 하단 상태 정보 버튼 정렬 <시작> (선택사항)
                 * 명시된 것은 없지만, ListCommonRow 공통 컴포넌트에 {this.props.children} 으로 처리됨!
                 * 각각의 상태 버튼을 처리하는 조건이 다르기 때문에 공통으로 빼기가 어려운 부분이 있음
                 * (쿼리에서 하나의 컬럼을 활용하여 처리하던지 해야 하는데 어려움이 있음)
                 * 공통처리가 가능하다면 <flatList> 전체를 ListCommonRow에서 처리할 수 있을 것 같음
                 * 좀 더 연구과 분석이 필요함.....
                 */}
                <View style={theme.listRowStatusBtn}>
                  <Touchable activeOpacity={0.5} style={{ paddingRight: 5 }}>
                    <Text
                      style={
                        item.H_CONFIRM_STATUS === 'Confirmed'
                          ? theme.myPageStatusOn
                          : theme.myPageStatusOff
                      }
                      adjustsFontSizeToFit={Platform.OS !== 'ios'}
                      numberOfLines={1}
                    >
                      Confirm
                    </Text>
                  </Touchable>

                  <Touchable
                    activeOpacity={0.5}
                    style={{ paddingRight: 5 }}
                    onPress={() => this._commonSendRecvHistoryChk(item, 'INVOIC')}
                  >
                    <Text
                      style={
                        item.INVOICE_RECV_YN === 'Y' ? theme.myPageStatusOn : theme.myPageStatusOff
                      }
                      adjustsFontSizeToFit={Platform.OS !== 'ios'}
                      numberOfLines={1}
                    >
                      INVOIC
                    </Text>
                  </Touchable>

                  <Touchable
                    activeOpacity={0.5}
                    style={{ paddingRight: 5 }}
                    onPress={() => this._commonSendRecvHistoryChk(item, 'BLADVI')}
                  >
                    <Text
                      style={this._getStatusTextStyle(
                        theme,
                        'BLADVI',
                        item.BLADVI_ACK_TYPE,
                        item.BLADVI_SEND_TYPE,
                      )}
                      adjustsFontSizeToFit={Platform.OS !== 'ios'}
                      numberOfLines={1}
                    >
                      {item.BLADVI_DOC_TYPE || 'BLADVI'}
                    </Text>
                  </Touchable>

                  <Touchable
                    activeOpacity={0.5}
                    onPress={() => this._commonSendRecvHistoryChk(item, 'SHPINF')}
                  >
                    <Text
                      style={this._getStatusTextStyle(
                        theme,
                        'SHPINF',
                        item.SHPINF_ACK_TYPE,
                        item.SHPINF_SEND_TYPE,
                      )}
                      adjustsFontSizeToFit={Platform.OS !== 'ios'}
                      numberOfLines={1}
                    >
                      SHPINF
                    </Text>
                  </Touchable>
                </View>
                {/**
                 * 하단 상태 정보 버튼 정렬 <끝> (선택사항)
                 */}
              </ListCommonRow>
            </Touchable>
          )}
        />

        {/**
         * Action Button <시작>
         * Rest of the app comes ABOVE the action button component !
         * 단, 주의 사항! : 만약 자식 페이지에 선언 후 상속 받으면 이상하게 zIndex 버그로 인해
         *               화면애 정상적으로 그려지지 않아 본 화면에 처리한다.
         */}
        <ActionButton
          position={'right'}
          elevation={1} // 화면에 가장 위에 표시!
          zIndex={1} // 화면에 가장 위에 표시!
          style={{ overflow: 'visible' }}
          // bgColor={bluecolor.basicBlueLightTrans}
        >
          {actionButtonConfig.map(btnConfigItem => (
            <ActionButton.Item
              key={btnConfigItem.title}
              buttonColor={bluecolor.basicBluelightColor}
              title={btnConfigItem.title}
              onPress={() => this._tappedActionButton(btnConfigItem.title, btnConfigItem.docType)}
            >
              <FontAwesome name={btnConfigItem.iconName} style={theme.actionButtonIcon} />
            </ActionButton.Item>
          ))}
        </ActionButton>
        {/**
         * Action Button <끝>
         * Rest of the app comes ABOVE the action button component !
         */}

        {/**
         * List화면일 경우 조회 상태 메시지 항목과 조회 버튼 공통 컴포넌트 <시작>
         */}
        <SearchToolBar
          commonTheme={theme} // 테마 적용을 위함
          // fetch 및 이벤트 발생 후 G1 Back-End로 부터 리턴 받은 값
          fetchResult={this.state.fetchResult}
          // 조회된 전체 건 수
          // fetchResult에 포함되지 않은 이유는 각각의 API마다 실제 데이터가 담기는 key값이 다르기 때문에
          // (BAS010101G1, FMS010101G2 등...)
          totalRow={this.state.dataTotal.length}
          // 필수값이 아닌 옵션 값 ListRow 페이징 처리 시에만 설정 바람!
          currentRow={this.state.currentRow}
          // 공통컴포넌트에서 조회버튼을 터치했을 때 처리 부분
          // 필요에 따라(파라미터 필요 등) 별도의 function 처리 바람!
          onFetch={() => this.fetch()}
          // 만약 ActionButton을 화면에서 사용 시 false 처리 / 미 선언 시 true 강제 처리
          searchBtnVisible={false}
          // 만약 ActionButton을 화면에서 사용 시 false 처리 / 미 선언 시 true 강제 처리
          msgStatusVisible
          // toTop & toBottom 처리 유무
          toPositionVisible={this.state.toPositionVisible}
          // toTop & toBottom 처리 유무
          goToScroll={position => this.onGoToScroll(position)}
        />
        {/**
         * List화면일 경우 조회 상태 메시지 항목과 조회 버튼 공통 컴포넌트 <끝>
         */}
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textVericalCenter: {
    fontSize: 12,
    minHeight: 20,
    minWidth: '40%',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 3,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: bluecolor.basicBluelightColor,
    color: bluecolor.basicBlueFontColor,
    backgroundColor: bluecolor.basicWhiteColor,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
