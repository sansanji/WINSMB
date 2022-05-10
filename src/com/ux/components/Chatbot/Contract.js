/* *
 * Import Common
 * */
import { View, StyleSheet, Image } from 'react-native';
import {
  React,
  bluecolor,
  Util,
} from 'libs';
import { HText, HRow, HTextfield, Touchable, HIcon } from 'ux';
/* *
 * Import node_modules
 * */
import { Icon } from 'react-native-elements';

/**
 * 챗봇 연락처 조회 컴퍼넌트
 */

class Contract extends React.Component {
  constructor(props) {
    super(props);
  }
  // 전화 걸기
  onCalling(phoneNumber) {
    Util.onCalling(phoneNumber);
  }

  render() {
    const { paramObj } = this.props;
    return (
      <View>
        {paramObj.map((items, childIndex) => (
          <View key={items.USER_ID || childIndex} style={styles.serviceStyle}>
            <HRow>
              { items.PHOTO ?
                <Image
                  source={{ uri: items.PHOTO,
                    headers: {
                      'X-CSRF-TOKEN': globalThis.gToken,
                      Cookie: globalThis.gCookie,
                      // withCredentials: true,
                    } }}
                  style={{ width: 70,
                    height: 70,
                    borderRadius: 35 }}
                  rowflex={1}
                /> : <Icon name="face" type="MaterialIcons" color={bluecolor.basicBlueColor} size={80} />
              }
              <View rowflex={3}>
                <HText
                  style={{ padding: 10 }}
                  value={items.NAME}
                  rowflex={2}
                  textStyle={{ fontWeight: 'bold' }}
                />
                <HText
                  style={{ padding: 10 }}
                  value={items.DEPT}
                />
                <HText
                  style={{ padding: 10 }}
                  value={items.POSITION_DUTY_NAME}
                />
              </View>
            </HRow>
            <View style={{ paddingBottom: 5, marginTop: 5, marginBottom: 5, borderBottomWidth: 1, borderColor: bluecolor.basicBluelightColor }}>
              <HText
                value={items.ADDR}
              />
            </View>
            <HRow>
              <HTextfield label="E-mail" value={items.EMAIL} />
              <HTextfield label="Fax" value={items.FAX} />
            </HRow>
            <HRow>
              <Touchable
                onPress={() => {
                  this.onCalling(items.TEL);
                }}
              >
                <View style={styles.callContainer}>
                  <HIcon
                    name={'phone-square'}
                    color={bluecolor.basicGreenColor}
                    style={{ marginTop: 1 }}
                  />
                  <View style={{ flex: 1 }}>
                    <HText label="Tel" value={items.TEL} />
                  </View>
                </View>
              </Touchable>
              <Touchable
                onPress={() => {
                  this.onCalling(items.HP);
                }}
              >
                <View style={styles.callContainer}>
                  <HIcon
                    name={'phone-square'}
                    color={bluecolor.basicGreenColor}
                    style={{ marginTop: 1 }}
                  />
                  <View style={{ flex: 1 }}>
                    <HText label="HP" value={items.HP} />
                  </View>
                </View>
              </Touchable>
            </HRow>
          </View>
        ))}
      </View>);
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  serviceStyle: {
    width: 300,
    borderRadius: 10,
    padding: 10,
    marginTop: 5, // {this.props.paramObj.length > 1 ? 5 : 0},
    backgroundColor: bluecolor.basicWhiteColor,
    fontSize: bluecolor.basicFontSize,
  },
  callContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 5,
  },
});

/**
 * Wrapping with root component
 */
export default Contract;
