/* *
 * Import Common
 * */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Fetch, moment, React, Redux, NavigationScreen, bluecolor, Util, Navigation } from 'libs';
import {
  HBaseView,
  HText,
  HRow,
  HIcon,
  HListView,
} from 'ux';

/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ADM010116');

    this.state = {
      ROOM_ID: this.props.ROOM_ID,
      ROOM_NAME: this.props.ROOM_NAME,
      PHOTO_PATH: null,
      // 투표 기본 설정값
      MULTIPLE_YN: 'N',
      ANONY_YN: 'N',
      VOTE_STATUS: 'Y',
      VOTE_ID: null,
      // calandar , timer의 초기값
      VOTE_CLOSE_DATE_NAME: Util.formatDate(),
      VOTE_CLOSE_DATE: null,
      VOTE_CLOSE_TIME_CODE: Util.formatTime(),
      VOTE_CLOSE_TIME: null,
      TIME_HOUR_NAME: null,
      TIME_MIN_NAME: null,
      data: [
        { VOTE_SEQ: 0, VOTE_NUM: 0, VOTE_CONTENTS: null },
        { VOTE_SEQ: 1, VOTE_NUM: 1, VOTE_CONTENTS: null },
        { VOTE_SEQ: 2, VOTE_NUM: 2, VOTE_CONTENTS: null },
      ],
      // 사용자가 빈값을 입력했을때, 새로운 배열에 값있는것만 뺴옴
      uniqdata: [],
      dataTotal: [],
      VOTE_TITLE: null,
      // 시간(분) 설정을 위한 초기값
      label: null,
      groupCode: null,
      groupJson: null,
      sql: null,
      codeField: null,
      nameField: null,
      selected: null,
    };
  }

  // 초기값을 셋팅해준다.
  componentWillMount() {
    this.timeParsing();
  }

  async componentDidMount() {
    this.fetch();
  }

  shouldComponentUpdate() {
    return true;
  }

  // 사용자 정보 조회
  async fetch() {
    Util.openLoader(this.screenId, true);

    const user = this.props.global.session.USER_ID;
    const result = await Fetch.request('VTX010102SVC', 'getUserPhoto', {
      body: JSON.stringify({
        VTX010102F1: { USER_ID: user } }),
    });

    if (result) {
      this.setState({ PHOTO_PATH: result.VTX010102F1[0].PHOTO_PATH });
      Util.openLoader(this.screenId, false);
    } else {
      this.setState({ status: null });
      Util.openLoader(this.screenId, false);
    }
    Util.openLoader(this.screenId, false);
  }


  // 투표 생성
  async createVote(array) {
    // Util.openLoader(this.screenId, true); // Loader View 열기!
    const result = await Fetch.request(
      'VTX010102SVC',
      'createVote',
      // 요청이된다.
      {
        body: JSON.stringify({
          VTX010102F1: this.state,
          VTX010102G1: { data: array },
        }),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result.TYPE === 1) {
      this.props.passVoteCreate(result.VTX010102F1);
      Navigation(this.props.componentId, 'POP');
    } else {
      Util.msgBox({
        title: 'Alert',
        msg: result.MSG,
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }

  // 현재일자보다 이전날자 선택시 경고창 보여줌
  limitDateCheck(value) {
    const tDate = moment().format('YYYY-MM-DD');
    const selDate = value.dateOrigin;
    const diffDays = moment(tDate).diff(selDate, 'day');
    console.log(diffDays);

    // 최대일자수 체크
    if (Number(diffDays) >= 1) {
      Util.msgBox({
        title: 'Notice.',
        msg: '마감시간은 현재시간 이후로만 설정 가능합니다.',
        buttonGroup: [
          {
            title: 'OK',
            onPress: () => {
              console.log('cancel');
              this.setState({ VOTE_CLOSE_DATE_NAME: tDate });
            },
          },
        ],
      });
    }
  }

  // 햔제 시간보다 이전시간 선택시 경고창 보여줌
  limitTimeCheck() {
    const tDate = moment().format('YYYYMMDD');
    const selDateNum = this.state.VOTE_CLOSE_DATE;
    const pTime = moment().format('HHmm');
    const selTime = `${this.state.TIME_HOUR_NAME}${this.state.TIME_MIN_NAME}`;

    if (tDate === selDateNum) {
      if (Number(pTime) >= Number(selTime)) {
        Util.msgBox({
          title: 'Notice.',
          msg: '마감시간은 현재시간 기준으로 이후 시간만 설정 가능합니다.',
          buttonGroup: [
            {
              title: 'OK',
              onPress: () => {
                console.log('cancel');
                this.timeParsing();
              },
            },
          ],
        });
      } else {
        this.checkContents();
      }
    } else {
      this.checkContents();
    }
  }

  // 달력 open
  _onPress() {
    Util.openCalendar({
      onChange: date => {
        const { dateString, dateOrigin } = date;
        this.setState({ VOTE_CLOSE_DATE_NAME: dateString, VOTE_CLOSE_DATE: dateOrigin });
        // 값이 변할때 이벤트 발생
        if (this.props.onChanged) {
          this.props.onChanged(date);
        }
        this.limitDateCheck(date);
      },
      current: Util.formatDate(
        this.state.VOTE_CLOSE_DATE_NAME,
      ),
    });
  }

  // 시간 설정
  setTimeValue(param) {
    if (!Util.isEmpty(param)) {
      this._onPressHour(
        {
          label: 'Hour',
          groupCode: 'SP8942',
          codeField: 'DT_CODE',
          nameField: 'LOC_VALUE',
          value: this.state.TIME_HOUR_NAME,
          sql: { DT_CODE: '' },
        },

      );
    } else {
      this._onPressHour(
        {
          label: 'Min',
          groupCode: 'TIME_MIN',
          value: this.state.TIME_MIN_NAME,
        },
      );
    }
  }

  // open combobox
  _onPressHour(param) {
    Util.openComboBox({
      label: param.lable,
      groupCode: param.groupCode,
      groupJson: param.groupJson,
      sql: param.sql,
      codeField: param.codeField || 'DT_CODE', // 기본적으로 DT_CODE
      nameField: param.nameField || 'LOC_VALUE', // 기본적으로 LOC_VALUE
      selected: param.selected,
      onChange: (value, comboValues) => {
        if (param.label === 'Hour') {
          this.setState({
            TIME_HOUR_NAME: value.name,
          });
        } else {
          this.setState({
            TIME_MIN_NAME: value.name,
          });
        }
        // 값이 변할때 이벤트 발생
        if (this.props.onChanged) {
          this.props.onChanged(value, comboValues);
        }
      },
    });
  }

  // 초기 투표 마감시간 값을 세팅해줌
  timeParsing() {
    const TDate = moment().format('YYYY-MM-DD HH:mm:ss');

    const TIME_HOUR_NAME = moment(TDate).add(1, 'hours').format('HH');
    const TIME_MIN_NAME = moment(TDate).add(1, 'hours').format('mm');
    const VOTE_CLOSE_TIME = moment(TDate).add(1, 'hours').format('HHmm');
    const VOTE_CLOSE_DATE = moment(TDate).format('YYYYMMDD');


    this.setState({
      TIME_HOUR_NAME,
      TIME_MIN_NAME,
      VOTE_CLOSE_TIME,
      VOTE_CLOSE_DATE,
    });
  }

  // 익명 및 복수투표 여부
  setVoteType(type) {
    if (type === 'MULTIPLE_YN') {
      if (this.state.MULTIPLE_YN === 'N') {
        this.setState({ MULTIPLE_YN: 'Y' });
      } else {
        this.setState({ MULTIPLE_YN: 'N' });
      }
    } else if (this.state.ANONY_YN === 'N') {
      this.setState({ ANONY_YN: 'Y' });
    } else {
      this.setState({ ANONY_YN: 'N' });
    }
  }


  // textinput삭제
  onDeleteContents = (data) => {
    const countList = this.state.data.length;

    if (countList > 2) {
      const dataList = this.state.data.filter(item => item.VOTE_NUM !== data.VOTE_NUM);
      this.setState({ data: dataList });
    } else {
      Util.msgBox({
        title: 'Notice.',
        msg: '투표내용을 두가지 이상 입력해주세요.',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    }
  }

  // 새로운 textInput생성
  addTextInput = (contents) => {
    const dataList = [...this.state.data,
      { VOTE_SEQ: null, VOTE_NUM: Date.now(), VOTE_CONTENTS: contents },
    ];
    this.setState({ data: dataList });
  }

  // contents에 모든 값이 입력되어있는지 체크
  checkContents = () => {
    const array = this.state.data.filter(item => (!Util.isEmpty(item.VOTE_CONTENTS)));
    this.setState({ uniqdata: array });

    // Vote contents check
    if (array.length < 2) {
      Util.msgBox({
        title: 'Notice.',
        msg: '투표내용을 두가지 이상 입력해주세요.',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    } else {
      this.checkDuplicateContents(array);
    }
  }

  // content에 동일한 값이 세팅됬을때 경고 메세지 표출
  checkDuplicateContents(array) {
    const valueArr = array.map((item) => item.VOTE_CONTENTS);
    const isDuplicate = valueArr.some((item, idx) => valueArr.indexOf(item) !== idx);

    if (isDuplicate === true) {
      Util.msgBox({
        title: 'Notice.',
        msg: '동일한 투표 내용이 들어갈 수 없습니다. 투표 내용을 확인 해주세요.',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    } else {
      this.checkTitle(array);
    }
  }

  // Vote title check
  checkTitle(array) {
    if (Util.isEmpty(this.state.VOTE_TITLE)) {
      Util.msgBox({
        title: 'Notice.',
        msg: '투표제목을 입력해주세요.',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
    } else {
      this.createVote(array);
    }
  }

  // 배열 내에 contents값 삽입
  pushContents(index) {
    return (text) => {
      const data = [...this.state.data];
      data[index].VOTE_CONTENTS = text;

      this.setState({ data });
    };
  }


  renderBody = (item, index) => (
    <View style={styles.rowContainer}>
      <TextInput
        multiline
        style={styles.contentsInput}
        placeholder="  투표 내용을 입력해 주세요"
        placeholderTextColor="#d4d4d4"
        onChangeText={this.pushContents(index)}
      />
      <TouchableOpacity
        style={{ flexDirection: 'row', flexWrap: 'wrap' }}
        onPress={() => this.onDeleteContents(item)}
      >
        <HIcon
          name="trash-o"
          size={25}
        />
      </TouchableOpacity>
    </View>
  );

  // 실제로 화면을 그려준다.
  render() {
    return (
      <HBaseView>
        <View style={styles.listItemContainer}>
          <View style={styles.iconContainer}>
            <HIcon
              name="file-text-o"
              size={55}
              style={{ alignSelf: 'center' }}
            />
          </View>
          <View style={styles.contentsContainer}>
            <View style={styles.input}>
              <TextInput
                style={styles.contentsInput}
                multiline
                placeholder="  투표 제목을 입력해 주세요"
                placeholderTextColor="#d4d4d4"
                onChangeText={text => this.setState({ VOTE_TITLE: text })}
              />
            </View>
            <HRow>
              <TouchableOpacity onPress={() => this.setVoteType('MULTIPLE_YN')}>
                <View style={styles.voteType} >
                  <HIcon style={this.state.MULTIPLE_YN === 'N' ? { color: 'rgba(212,212,212,0)' } : null} name="check" size={20} />
                  <HText
                    value={'복수 투표'}
                    textStyle={this.state.MULTIPLE_YN === 'N' ? styles.bOffStyle : styles.bStyle}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setVoteType('ANONY_YN')}>
                <View style={styles.voteType} >
                  <HIcon style={this.state.ANONY_YN === 'N' ? { color: 'rgba(212,212,212,0)' } : null} name="check" size={20} />
                  <HText
                    value={'익명 투표'}
                    textStyle={this.state.ANONY_YN === 'N' ? styles.bOffStyle : styles.bOStyle}
                  />
                </View>
              </TouchableOpacity>
            </HRow>
          </View>
        </View>
        <View style={styles.inputContents}>
          <HListView
            keyExtractor={item => item.VOTE_NUM}
            renderItem={({ item, index }) => this.renderBody(item, index)}
            onMoreView={null}
            // 그려진값
            data={this.state.data}
            // 조회된값
            totalData={this.state.dataTotal}
            // 하단에 표시될 메세지값
            status={this.state.status}
            msgStatusVisible={false}
          />
          <TouchableOpacity
            style={{ flexDirection: 'row', alignSelf: 'center', margin: 10 }}
          >
            <HIcon
              name="plus-circle"
              size={35}
              onPress={() => this.addTextInput()}
            />
          </TouchableOpacity>
        </View>
        <View>
          <View style={{ marginTop: 5, flexDirection: 'row' }}>
            <HIcon style={styles.checkbutton} name="check" size={20} />
            <HText value={'투표 마감 시간 : '} textStyle={styles.voteTimeStyle} />
          </View>
          <View style={{ marginStart: 20, flexDirection: 'row' }}>
            <View>
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this._onPress()}>
                <HText value={this.state.VOTE_CLOSE_DATE_NAME} textStyle={styles.onVoteTimeStyle} />
                <FontAwesome name="calendar" size={10} style={styles.onVoteTimeIconStyle} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity
                style={styles.timeStyle}
                onPress={() => this.setTimeValue('hour')}
              >
                <HText value={this.state.TIME_HOUR_NAME} textStyle={styles.onVoteTimeStyle} />
              </TouchableOpacity>
              <HText value={'시'} textStyle={styles.onVoteTimeStyle} />
              <HText value={':'} textStyle={styles.onVoteTimeStyle} />
              <TouchableOpacity
                style={styles.timeStyle}
                onPress={() => this.setTimeValue()}
                // style={{ marginStart: 'auto' }}
              >
                <HText value={this.state.TIME_MIN_NAME} textStyle={styles.onVoteTimeStyle} />
              </TouchableOpacity>
              <HText value={'분'} textStyle={styles.onVoteTimeStyle} />
              <HIcon
                name="clock-o"
                style={styles.onVoteTimeClockIconStyle}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => this.limitTimeCheck()}
          activeOpacity={0.8}
          style={styles.ResultButton}
        >
          <Text style={styles.ResultAlerttext}>{ '투표 만들기' }</Text>
        </TouchableOpacity>
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  timeStyle: {
    width: 42,
    borderColor: bluecolor.basicRedColor,
    borderBottomWidth: 4,
    margin: 'auto',
  },
  checkbutton: {
    color: bluecolor.basicBlueColor,
    fontSize: 15,
    marginTop: 6,

    fontWeight: 'bold',
  },
  checkbuttonOff: {
    color: 'rgba(212,212,212,3)',
    marginTop: 2,
    fontSize: 15,
    fontWeight: 'bold',
  },
  voteTimeStyle: {
    fontSize: 15,
    marginTop: 8,
    fontWeight: 'bold',
  },
  onVoteTimeStyle: {
    fontSize: 17,
    marginTop: 8,
    fontWeight: 'bold',
    color: bluecolor.basicRedColor,
  },
  voteTimeIconStyle: {
    fontSize: 16,
    marginTop: 2,
    fontWeight: 'bold',
    color: 'rgba(212,212,212,0.7)',
  },
  onVoteTimeIconStyle: {
    paddingTop: 5,
    marginTop: 3,
    fontSize: 17,
    marginStart: 1,
    color: bluecolor.basicRedColor,
  },
  onVoteTimeClockIconStyle: {
    paddingTop: 5,
    fontSize: 20,
    color: bluecolor.basicRedColor,
  },
  inputContents: {
    paddingTop: 3,
    borderWidth: 1,
    borderColor: 'rgba(212,212,212,0.6)',
    flex: 1,
    borderRadius: 8,
  },
  bStyle: {
    paddingTop: 4,
    fontSize: 14,
    color: 'rgba(0,51,102,0.7)',
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  bOffStyle: {
    paddingTop: 4,
    fontSize: 14,
    color: bluecolor.basicGrayColor,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  voteType: {
    paddingTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  clockStyle: {
    marginTop: 10,
    paddingTop: 3,
    flexDirection: 'row',
    fontSize: 35,
    alignItems: 'flex-start',
  },
  input: {
    marginStart: 5,
    marginTop: 5,
    fontSize: 14,
    height: 40,
    borderColor: 'rgba(63,119,161,0.7)',
    borderWidth: 1,
    borderRadius: 5,
  },
  contentsInput: {
    fontSize: 14,
    marginStart: 5,
    marginTop: 3,
    height: 32,
    flex: 1,
  },
  ResultAlerttext: {
    alignSelf: 'center',
    fontSize: 18,
    color: bluecolor.basicBlueColor,
    fontWeight: 'bold',
  },
  ResultButton: {
    margin: 10,
    marginTop: 30,
    flex: 1,
    width: 160,
    height: 40,
    borderRadius: 22,
    borderColor: bluecolor.basicBlueColor,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginBottom: 1,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  contentsContainer: {
    flex: 5,
  },
  rowContainer: {
    margin: 3,
    borderWidth: 1,
    borderColor: 'rgba(92,94,94,0.5)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    flexWrap: 'wrap',
    flex: 1,
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
