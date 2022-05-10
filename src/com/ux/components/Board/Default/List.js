/* *
 * Import Common
 * */
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { React, Redux } from 'libs';
import { Touchable } from 'ux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * Import components
 */

/**
 * 게시판 목록 조회
 */
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
    };
  }

  render() {
    const { theme } = this.props.global;
    const deepBlueColor = '#003366';
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.searchContainer}>
            {/* <Search onChangeKeyword={this.props.onChangeKeyword} /> */}
            <TextInput
              style={(styles.searchInput, { flex: 1 })}
              placeholder="Please input keyword"
              onChangeText={this.props.onChangeKeyword}
              keyboardType="email-address"
            />
          </View>
          {this.props.isWritable === true ? (
            <View style={styles.writeButtonContainer}>
              <TouchableOpacity style={styles.writeButton} onPress={() => this.props.onWrite()}>
                <FontAwesome name="edit" size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <FlatList
          data={this.props.data}
          renderItem={({ item, index }) => (
            <View style={[index % 2 === 0 ? theme.evenRowColor : theme.oddRowColor]} key={index}>
              <Touchable
                onPress={() => {
                  this.props.onView(item);
                }}
              >
                <View
                  style={{
                    // flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: deepBlueColor }}>
                    {item[this.props.field.title]}{' '}
                    {this.props.isWritable === true ? `[${item[this.props.field.repCt]}]` : null}
                  </Text>
                  <Text style={{ fontSize: 10, paddingTop: 5, color: deepBlueColor }}>
                    {item[this.props.field.userid] == null
                      ? `조회수 ${item.VIEW_COUNT} |`
                      : `${item[this.props.field.userid]} |`}{' '}
                    {item[this.props.field.date]}
                  </Text>
                </View>
              </Touchable>
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
    backgroundColor: '#f2f2f2',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 3,
    paddingLeft: 3,
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 40,
  },
  writeButtonContainer: {
    justifyContent: 'center',
  },
  writeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#428BCA',
    borderRadius: 10,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {},
  date: {},
  valueLabel: {
    fontSize: 12,
    // fontWeight: 'bold',
    marginLeft: 10,
    borderRadius: 20,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    color: '#ffffff',
  },
  searchInput: {
    height: 40,
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    textDecorationLine: 'none',
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
