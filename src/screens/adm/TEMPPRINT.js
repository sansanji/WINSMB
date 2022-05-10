/* *
 * Import Common
 * */
import { Text, StyleSheet, Alert } from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  modelUtil,
  io,
  env,
  bluecolor,
  // KeepAwake,
} from 'libs';
import {
  HButton,
  HTexttitle,
  HBaseView,
  HTextfield,
  HRow,
} from 'ux';

let lsocket = null;
let printer = 'EPRINT';

/**
 * 소켓통신을 이용한 샘플 프린트
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'TEMPPRINT');

    this.state = ({
      output: 'Ready',
      printCombo: [],
      startDisabled: false,
      stopDisabled: true,
      textEditable: true,
    });
    this.devices = [];
  }

  componentWillMount() {
    // this.init();
    // this.logon();
    modelUtil.setModelData('TEMPPRINT', { ROOM_ID: null });
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    lsocket.socket.disconnect();
    console.log('SocketProcess2', 'disconnect');
    // modelUtil.delGlobalModel('TEMPPRINT');
  }

  initSocket() {
    printer = modelUtil.getValue('TEMPPRINT.ROOM_ID') || printer;
    const socket = io.connect(env().chatURL, {
      path: '',
      'force new connection': true,
    });
    socket.on('connect', data => {
      console.log('socekt connect!!');
      this.textLog('connect!!');
    });
    console.log(`join - ${printer}`);
    this.textLog(`join - ${printer}`);
    socket.emit('join', {
      ROOM_ID: printer,
      ROOM_NAME: printer,
    });
    modelUtil.setModelData('TEMPPRINT', { ROOM_ID: printer });
    return socket;
  }

  startPrint() {
    try {
      lsocket = this.initSocket();
      console.log('socket', lsocket);
    } catch (error) {
      Alert.alert(
        '프린터 통신 오류발생',
        '프린터를 다시 실행해 주세요 잠시후 다시 시도해주세요',
        [{ text: 'OK' }, { cancelable: false }],
        { cancelable: false },
      );
    }
    this.setState({
      startDisabled: true,
      stopDisabled: false,
      textEditable: false,
    });
  }

  stopPrint() {
    lsocket.socket.disconnect();
    console.log('SocketProcess2', 'disconnect');
    this.textLog('disconnect');

    this.setState({
      startDisabled: false,
      stopDisabled: true,
      textEditable: true,
    });
  }

  onSend(testMessage) {
    if (!lsocket || !lsocket.socket.connected) {
      Alert.alert(
        '프린터 통신 문제 발생',
        '프린터를 다시 실행해 주세요 잠시후 다시 시도해주세요',
        [{ text: 'OK' }, { cancelable: false }],
        { cancelable: false },
      );
      return;
    }
    this.sendMsg(testMessage);
  }

  // 소켓 출력 메세지보내기
  sendMsg(sMsg, msgObjects) {
    // const socket = this.initSocket();
    // BizTalk이 자동으로 호출된 경우는 User Name도 "BizTalk"로 설정!
    lsocket.emit('utilmsg', {
      ROOM_ID: printer,
      MSG_CONTENTS: sMsg,
      MSG_OBJECTS: msgObjects,
    });
    this.setState({ output: `${new Date()} = ${sMsg} sent!\n${this.state.output}` });
  }

  textLog(textResult) {
    this.setState({ output: `${new Date()} = ${textResult}\n${this.state.output}` });
  }


  render() {
    // const jsCode = 'window.postMessage(document.cookie)';
    // if (this.state.isLoaded) {
    return (

      <HBaseView>
        <HTexttitle>Print</HTexttitle>
        <HTextfield label={'Printer Name'} bind={'TEMPPRINT.ROOM_ID'} editable={this.state.textEditable} />
        <HRow>
          <HButton onPress={() => this.startPrint()} name={'print'} title={'Start Printer'} disabled={this.state.startDisabled} />
          <HButton
            onPress={() => this.stopPrint()}
            name={'print'}
            title={'Stop Printer'}
            disabled={this.state.stopDisabled}
            bStyle={{
              backgroundColor: bluecolor.basicRedColor,
            }}
          />
        </HRow>
        <HButton onPress={() => this.onSend('^XA^FO200,200^A0N36,36^FDTest Label^FS^XZ')} name={'print'} title={'Print'} />
        <Text style={styles.title}>{this.state.output}</Text>
      </HBaseView>
    );
  }
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 16,
    marginRight: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    // alignItems: "center"
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
  },
  line2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
  },
  value: {
    marginLeft: 20,
  },
  output: {
    marginTop: 10,
    height: 300,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  inputContainer: {
    marginTop: 10,
    borderBottomWidth: 2,
  },
  textInput: {
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingLeft: 15,
    paddingRight: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#147efb',
    borderRadius: 3,
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({ global: state.global, model: state.model });

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
