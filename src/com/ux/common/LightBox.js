/* *
 * Import Common
 * */
import { View, Text, Button, StyleSheet, Dimensions, Platform } from 'react-native';
import { React } from 'libs';

/**
 * 확인창 컴퍼넌트
 */
class Lightbox extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 8 }}>
          <Text style={styles.title}>{this.props.title}</Text>
          <Text style={styles.content}>{this.props.content}</Text>
        </View>
        <View style={{ flex: 2, paddingTop: 10 }}>
          <Button
            title={'확인'}
            onPress={() => this.props.onClose()}
            color={Platform.OS !== 'ios' ? 'rgba(44,123,186, 0.7)' : 'rgba(236,233,233, 0.7)'} // "rgba(44,123,186, 0.7)"
          />
        </View>
      </View>
    );
  }
}
const basicBlueColor = 'rgba(124,152,174, 0.7)';
const secondBlueColor = 'rgba(236,233,233, 0.7))';
const deepBlueColor = '#003366';
const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').height * 0.4,
    backgroundColor: basicBlueColor,
    borderRadius: 5,
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: deepBlueColor,
    // backgroundColor: secondBlueColor,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
  },
  content: {
    fontSize: 17,
    flex: 1,
    marginTop: 8,
    color: deepBlueColor,
    backgroundColor: secondBlueColor,
    padding: 10,
    borderRadius: 5,
  },
});

export default Lightbox;
