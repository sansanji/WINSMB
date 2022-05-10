/* *
 * Import Common
 * */
import { StyleSheet, View, Dimensions, Image, ScrollView } from 'react-native';
import { Util, React, env } from 'libs';
import Touchable from 'common/Touchable';
import HText from 'components/Form/Text/HText';
/* *
 * Import node_modules
 * */
const envConfig = env();
const fetchURL = envConfig.fetchURL;

/**
 * 바둑판 사진 레이아웃 컴포넌트
 * @param {styles} tableStyle - 사진 컨테이너 스타일
 * @param {JSONArray} photoList - 표시될 사진정보를 넘긴다(COMPANY_CODE, FILE_MGT_CODE, ADD_DATE, ADD_USER_NAME)
 * @param {Function} onPressed - 사진이 눌러졌을때 이벤트(item, index값 리턴)
 * @param {Number} rowCt - 가로열에  최대 보여줄 갯수
 * @example
 * <HTablePhoto
 photoList={this.state.data}
 onPressed={(item, i) => {
   this.setRepPhoto(item);
 }}
/>
 */
class HTablePhoto extends React.Component {
  render() {
    const { tableStyle, rowCt } = this.props;
    const screenWidth = Dimensions.get('window').width / (rowCt || 3) - 9;

    if (!Util.isEmpty(this.props.photoList)) {
      const photoItem = this.props.photoList.map((item, i) => (
        <View
          key={i}
          style={{ height: screenWidth, width: screenWidth, marginRight: 3, marginLeft: 3 }}
        >
          <Touchable
            style={{
              height: screenWidth,
              width: screenWidth,
              alignItems: 'center',
            }}
            onPress={() => {
              if (this.props.onPressed) {
                this.props.onPressed(item, i);
              }
            }}
          >
            <Image
              resizeMode={'stretch'}
              style={{ height: screenWidth - 15, width: screenWidth, alignItems: 'center' }}
              source={{
                uri: `${fetchURL}/api/file/getDownload/${item.COMPANY_CODE}/MB/${
                  item.FILE_MGT_CODE
                }`,
                headers: {
                  'X-CSRF-TOKEN': globalThis.gToken,
                  Cookie: globalThis.gCookie,
                  // withCredentials: true,
                },
              }}
            />
            <HText textStyle={{ fontSize: 6 }}>{item.ADD_DATE}</HText>
          </Touchable>
        </View>
      ));

      return (
        <ScrollView style={styles.mainView} horizontal>
          <View style={[tableStyle, styles.menucontainer]}>{photoItem}</View>
        </ScrollView>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderWidth: 1,
    // justifyContent: 'flex-start',
  },
  menucontainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // paddingLeft: 15,
    // paddingRight: 15,
    justifyContent: 'flex-start',
  },
});

export default HTablePhoto;
