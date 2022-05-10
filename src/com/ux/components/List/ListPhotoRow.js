/* *
 * Import Common
 * */
import { View, Text, StyleSheet, Image } from 'react-native';
import { React, Redux, env } from 'libs';

/**
 * 포토 리스트 컴포넌트
 */
const envConfig = env();
const fetchURL = envConfig.fetchURL;

/**
 * 리스트 뷰의 개별 행의 컨테이너 역할을 한다.
 */
const ListPhotoRow = props => {
  const { item, index } = props;
  const { theme } = props.global;

  return (
    <View>
      <View style={styles.startColumn}>
        <View style={{ flexDirection: 'row' }}>
          {item.READ_YN === 'N' ? <Text style={styles.newItem}>N</Text> : null}
          {/* {item.TASK_STEP === '1' ? <Text style={styles.newItem}>N</Text> : null} */}
          <Text style={styles.startText}>{item.ISSUE_TIME}</Text>
        </View>

        <View>
          <Text style={styles.startText}>{item.REF_NO}</Text>
        </View>
      </View>

      {/* <View style={styles.middelColumn}>
          <Text style={styles.middelTextColor}>{item.REF_TYPE} Photo</Text>
          <Text style={styles.middelTextColor}>{item.ARRIVAL_CODE_NAME} 도착</Text>
          </View> */}

      <View style={styles.endColumn}>
        <Text style={styles.endText}>{item.IRRE_INFO}</Text>
      </View>
      <Image
        style={styles.image}
        source={{
          uri: `${fetchURL}/api/file/getDownload/${props.global.session.COMPANY_CODE}/MB/${
            item.PHOTO_VALUE
          }`,
          headers: {
            'X-CSRF-TOKEN': globalThis.gToken,
            Cookie: globalThis.gCookie,
            // withCredentials: true,
          },
        }}
      />
      {props.children}
      <View style={theme.line} />
    </View>
  );
};

/**
 * Define component prop types
 */
// ListRow.propTypes = {
//   children: PropTypes.element.isRequired,
// };

/**
 * Define component styles
 */
const basicBlueColor = '#517fa4';
const deepBlueColor = '#003366';
const styles = StyleSheet.create({
  startColumn: {
    flex: 1,
    paddingRight: 10,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: basicBlueColor,
  },
  startTextDate: {
    fontSize: 13,
    color: basicBlueColor,
  },
  middelTextColor: {
    color: basicBlueColor,
  },
  endColumn: {
    flex: 1,
    paddingRight: 10,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: deepBlueColor,
  },
  newItem: {
    width: 14,
    alignSelf: 'flex-start',
    textAlign: 'center',
    marginTop: 3,
    paddingTop: 1,
    paddingBottom: 1,
    borderRadius: 4,
    fontSize: 10,
    color: '#fafafafa',
    backgroundColor: '#E53935',
  },
  middelColumn: {
    flex: 1,
    paddingRight: 10,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: defaultBackColorWihte,
    paddingBottom: 5,
    paddingTop: 5,
  },
  charge: {
    fontWeight: 'bold',
    fontSize: 12,
    padding: 3,
    color: '#003366',
  },
  image: {
    flex: 1,
    height: 100,
    backgroundColor: 'transparent',
  },
});

const mapStateToProps = state => ({
  global: state.global,
});

export default Redux.connect(mapStateToProps)(ListPhotoRow);
