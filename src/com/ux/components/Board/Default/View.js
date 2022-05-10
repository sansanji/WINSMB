/* *
 * Import Common
 * */
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { React, Redux, bluecolor } from 'libs';
/* *
 * Import node_modules
 * */
import { Card } from 'react-native-elements';

/**
 * Form View 컴포넌트
 */
const screenWidth = Dimensions.get('window').width;

/**
 * 게시판 상세 조회 컴포넌트
 */
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { theme } = this.props.global;
    const { title, date, content, qna } = this.props;
    return (
      <View style={styles.container}>
        <Card containerStyle={{ borderColor: bluecolor.basicBlueColor }}>
          <Text style={[styles.title]}>{title}</Text>
          <Text style={[styles.date]}>Date : {date}</Text>
          <View style={[theme.line, { marginBottom: 5, marginTop: 5 }]} />
          <Text style={[styles.content]}>{content}</Text>
        </Card>

        <FlatList
          keyExtractor={item => item.REQ_NO}
          data={qna}
          renderItem={({ item, index }) => (
            <View style={styles.repContainer}>
              <Text style={styles.date}>Rep Date : {item.ADD_DATE}</Text>
              <View style={[theme.line]} />
              <Text style={styles.content}>{item.REPLY_CONTENTS}</Text>
            </View>
          )}
        />
      </View>
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
  repContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    width: '100%',
    color: bluecolor.basicBlueFontColor,
  },
  content: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 5,
    color: bluecolor.basicBlueFontColor,
  },
  date: {
    fontSize: 10,
    paddingTop: 7,
    color: bluecolor.basicBlueFontColor,
  },
  image: {
    width: screenWidth,
    aspectRatio: 1,
    resizeMode: 'contain',
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
