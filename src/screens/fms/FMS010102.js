/* *
 * Import Common
 * */
import { View, Text, StyleSheet, Linking } from 'react-native';
import { React, Redux, Fetch, NavigationScreen, Util, bluecolor, modelUtil } from 'libs';
import { HBaseView, Touchable, HTextfield, HRow, HCombobox, HFormView } from 'ux';
/* *
 * Import node_modules
 * */
import { Card, Divider } from 'react-native-elements';

/**
 * 인천공항 스케줄 조회
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'FMS010102');

    this.state = {
      data: {},
      cardScheduleTitle: '【 ICN Airport Schedule Info. 】',
      cardLinkcTitle: '【 Link the Tracking sites 】',
      btnIconName: 'chevron-up',
    };
    this.callapsed = false;
  }

  componentWillMount() {
    // 모델에 데이터를 set해주면 모델을 쓸수 있다.
    modelUtil.setModelData('FMS010102', { DEP_ARR_TYPE: 'D', DEP_ARR_TYPE_NAME: 'Departure' });
  }

  async fetch() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const mData = modelUtil.getModelData('FMS010102');

    // 필수 값 체크!
    if (Util.isEmpty(mData.FLIGHT_NO)) {
      Util.toastMsg('The Flight No. is required value!');
      return;
    }
    if (Util.isEmpty(mData.DEP_ARR_TYPE)) {
      Util.toastMsg('The Departure/Arrival is required value!');
      return;
    }

    let method = null;
    let body = {};
    if (mData.DEP_ARR_TYPE === 'D') {
      method = 'icnAirportDepartSchedule';
      body = {
        callType: 'apicall',
        USER_CONTENT_TYPE: 'AI_MOBILE_APP',
        FLIGHT_NO: mData.FLIGHT_NO.toUpperCase(),
        BOT_ID: 'BOT-cdyoo42-20170605151812471',
        PAS_ACTION_ID: 'BOT-cdyoo42-20171203151812471',
        PAS_CARD_ID: 'BOT-cdyoo42-20171203011812471',
        CAR_ACTION_ID: 'BOT-cdyoo42-20171103151812471',
        CAR_CARD_ID: 'BOT-cdyoo42-20171103011812471',
      };
    } else {
      method = 'icnAirportArrivalSchedule';
      body = {
        callType: 'apicall',
        USER_CONTENT_TYPE: 'AI_MOBILE_APP',
        FLIGHT_NO: mData.FLIGHT_NO.toUpperCase(),
        BOT_ID: 'BOT-cdyoo42-20170605151812471',
        PAS_ACTION_ID: 'BOT-cdyoo42-20171206151812471',
        PAS_CARD_ID: 'BOT-cdyoo42-20171206011812471',
        CAR_ACTION_ID: 'BOT-cdyoo42-20171106151812471',
        CAR_CARD_ID: 'BOT-cdyoo42-20171106011812471',
      };
    }

    const result = await Fetch.request(
      'BAS010101SVC',
      method,
      {
        body: JSON.stringify(body),
      },
      true, // 응답 메시지를 토스트 처리할지 여부!
    );

    if (result) {
      this.setState({
        data: result,
      });
      Util.openLoader(this.screenId, false); // Loader View 열기!
    }
  }

  _onSearch() {
    this.fetch();
  }

  renderHeader = () => (
    <View>
      <HRow>
        <HCombobox
          label={'Departure/Arrival'}
          groupJson={[
            { DT_CODE: 'D', LOC_VALUE: 'Departure' },
            { DT_CODE: 'A', LOC_VALUE: 'Arrival' },
          ]}
          bindVar={{
            CD: 'FMS010102.DEP_ARR_TYPE',
            NM: 'FMS010102.DEP_ARR_TYPE_NAME',
          }}
          editable
          require
        />
        <HTextfield
          label={'Flight No.'}
          bind={'FMS010102.FLIGHT_NO'}
          editable
          require
          keyboardType={'email-address'}
          autoCapitalize={'characters'} // 옵션 적용이 잘 안되는 듯?
          returnKeyType={'search'} // 옵션 적용이 잘 안되는 듯?
          uppercase // 옵션 적용 여부 판단 필요
          onSubmitEditing={() => {
            this._onSearch();
          }}
        />
      </HRow>
    </View>
  );

  render() {
    const buttonConfig = [
      {
        title: 'Track-trace',
        linkURL: 'https://touch.track-trace.com/aircargo',
      },
      {
        title: 'Korean Air',
        linkURL: 'https://cargo.koreanair.com/kor/trc/iMawbTrackingSearch.jsp',
      },
      {
        title: 'Asiana',
        linkURL: 'https://www.asianacargo.com/tracking/viewTraceAirWaybill.do',
      },
    ];

    return (
      <HBaseView button={() => this._onSearch()}>
        <HFormView style={styles.headerStyle} renderHeader={this.renderHeader} />
        <Card title={this.state.cardScheduleTitle} titleStyle={styles.titleStyle}>
          <Text style={styles.cardTxtStyle}>{this.state.data.NO_KEY}</Text>
          <Divider />
        </Card>
        <Card title={this.state.cardLinkcTitle} titleStyle={styles.titleStyle}>
          <View style={styles.linkBtnStyle}>
            {buttonConfig.map(btnConfigItem => (
              <Touchable
                key={btnConfigItem.title}
                activeOpacity={0.5}
                onPress={() => {
                  Linking.openURL(btnConfigItem.linkURL);
                }}
              >
                <Text style={styles.textVericalCenter} adjustsFontSizeToFit numberOfLines={1}>
                  {btnConfigItem.title}
                </Text>
              </Touchable>
            ))}
          </View>
        </Card>
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  cardTxtStyle: {
    alignItems: 'center',
    marginBottom: 15,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: '18%',
    marginRight: '15%',
  },
  linkBtnStyle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  textVericalCenter: {
    minHeight: 30,
    minWidth: 98,
    textAlign: 'center',
    textAlignVertical: 'center',
    // padding: 5,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: bluecolor.basicBluelightColor,
    color: bluecolor.basicBlueFontColor,
    backgroundColor: bluecolor.basicWhiteColor,
  },
  headerStyle: {
    padding: 10,
  },
  titleStyle: { fontSize: 12 },
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
