/* *
 * Import Common
 * */
import {Platform, Vibration, AsyncStorage} from 'react-native';
import Fetch from 'libs/fetch';
import ReduxStore from 'libs/store';
import Util from 'libs/util';
import modelUtil from 'libs/modelUtil';
/* *
 * Import node_modules
 * */
// import FCM, {
//   FCMEvent,
//   RemoteNotificationResult,
//   WillPresentNotificationResult,
//   NotificationType,
// } from 'react-native-fcm';
import Cookie from 'react-native-cookie';
import RNBeep from 'react-native-a-beep';
import messaging from '@react-native-firebase/messaging';

/**
 * 푸쉬메세지 관련 라이브러리
 */

export const initPushNotification = async () => {
  // if (
  //   Platform.OS === 'ios' &&
  //   !messaging().isDeviceRegisteredForRemoteMessages
  // ) {
  //   console.log('myMethod: ', 'registerDeviceForRemoteMessages');
  //   await messaging().registerDeviceForRemoteMessages();
  // }
  const authorizationStatus = await messaging().requestPermission();
  if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    messaging()
      .hasPermission()
      .then(async function () {
        const token = await messaging().getToken();
        updateToken(token);
        messaging().subscribeToTopic('G1MB');
      });
  }

  messaging().onMessage(async notif => {
    // optional, do some component related stuff
    console.log('notificationListener: ', notif);
    this.newalarm = '1';
    this.message = '1';
    this.title = notif.notification.title;

    // 현재 접속한 채팅방을 열고 있을때는 알림을 울리지 않는다.
    const room_id = modelUtil.getValue('ADM010108.ROOM_ID') || 'X없음';
    if (this.title && this.title.indexOf(room_id) < 0) {
      // 알림 설정
      const {ALRAM_YN} = ReduxStore.getState().global.config;

      if (Platform.OS === 'ios') {
        Util.toastMsg(this.title);
        if (ALRAM_YN === 'Y') {
          RNBeep.PlaySysSound(RNBeep.iOSSoundIDs.AudioToneBusy);
        }
        // ios에서 수신시 계속 시스템알림 발생 JKM 2019/12/26
        // notif.finish();
      } else {
        if (this.title !== undefined || this.title != null) {
          Util.toastMsg(`${this.title}\n${notif.notification.body}`);
        }
        if (ALRAM_YN === 'Y') {
          RNBeep.PlaySysSound(
            RNBeep.AndroidSoundIDs.TONE_CDMA_CALL_SIGNAL_ISDN_PING_RING,
          );
        }
      }
      Vibration.vibrate(1000);
      // 공지사항이나 배차지정알림시에 메일링 표시
      if (
        this.title.indexOf('[G1MB]') > -1 ||
        this.title.indexOf('배차 지정 알림') > -1
      ) {
        AsyncStorage.getItem('newalarm', (err, result) => {
          if (result) {
            this.newalarm = (Number.parseInt(result, 10) + 1).toString();
          }
          if (
            Platform.OS !== 'ios' ||
            // fcm자체 알림 이벤트 : will_present_notification
            // 알림 토스트 클릭 이벤트 : notification_response
            // ios는 조건 처리
            // App이 열려 있을 경우는 뱃지에 숫자를 표시해준다.
            //    (토스트 메시지를 클릭하면 해당 내역도 카운트되어 제외시킨다.)
            // 만약 App이 꺼진 상태에서는 알림 메시지를 확인할 수 있으므로 카운트 하지 않는다.
            (Platform.OS === 'ios' &&
              notif._notificationType === 'will_present_notification')
          ) {
            ReduxStore.dispatch({
              type: 'chat.newalarm.add',
              newalarm: this.newalarm,
            });
            AsyncStorage.setItem('newalarm', this.newalarm);
          }
        });
      } else {
        AsyncStorage.getItem('message', (err, result) => {
          if (result) {
            this.message = (Number.parseInt(result, 10) + 1).toString();
          }
          ReduxStore.dispatch({
            type: 'chat.message.add',
            message: this.message,
          });
          AsyncStorage.setItem('message', this.message);
        });
      }
    } else {
      // 이미 읽고 있다면 read 체크
      notif.finish();
      await Fetch.request('VTX010101SVC', 'readRoom', {
        body: JSON.stringify({ROOM_ID: room_id}),
      });
    }
  });

  // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
  // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
  // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
};

export const connectPushNotificationListeners = () => {
  // this shall be called regardless of app state: running, background or not running. Won't be called when app is killed by user in iOS
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    //  여기에 로직을 작성한다.
    //  remoteMessage.data로 메세지에 접근가능
    //  remoteMessage.from 으로 topic name 또는 message identifier
    //  remoteMessage.messageId 는 메시지 고유값 id
    //  remoteMessage.notification 메시지와 함께 보내진 추가 데이터
    //  remoteMessage.sentTime 보낸시간
  });
};

// http://127.0.0.1:8080/api/VTX010101SVC/appUserToken
/*
{
"APP_ID": "g1mb",
"MOBILE_TOKEN": "xMbXmhBanR2UOk1m1xKGt9vzndMdGBmy"
}
*/
// const api = 'http://127.0.0.1:8080/api/VTX010101SVC/appUserToken';
const updateToken = async token => {
  await Cookie.clear().then(res => {
    Fetch.updatePushToken(token);
  });
};
