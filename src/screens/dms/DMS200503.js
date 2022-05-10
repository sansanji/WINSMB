/* *
 * Import Common
 * */
import { View, StyleSheet, Dimensions } from 'react-native';
import { _, React, Util, Redux, Fetch, NavigationScreen, modelUtil, bluecolor } from 'libs';
import { Touchable, HRow, HFormView, HText, HListView, HIcon } from 'ux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
/**
 * Location Item 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS200503');
    this.state = {
      data: [],
      dataTotal: [],
      item: this.props.item,
      status: null,
    };
  }

  async componentWillMount() {
    this.getSerialNo();
  }

  async componentDidMount() {
  }

  async getSerialNo() {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    if (Util.isEmpty(this.state.item)) {
      this.setState({
        data: '',
      });
      Util.openLoader(this.screenId, false); // Loader View 열기!
      return;
    }

    const serialValue = this.state.item;
    const serialArray = serialValue.split(',');

    this.setState({
      data: serialArray,
    });

    Util.openLoader(this.screenId, false); // Loader View 열기!
  }

  renderBody = (item, index) => (
    <HFormView style={{ marginTop: 2 }}>
      <HRow between>
        <HText
          value={item}
          textStyle={{
            color: bluecolor.basicBlueImpactColor,
            fontWeight: 'bold',
            fontSize: 13,
          }}
        />
      </HRow>
    </HFormView>
  );
  render() {
    const { navigator } = this.props.global;
    return (
      <View style={styles.highContainer}>
        <View style={styles.container}>
          <View style={styles.cancelBtnStyle}>
            <HText textStyle={{ fontWeight: 'bold' }}>{this.props.title}</HText>
            <Touchable
              onPress={() => {
                navigator.dismissOverlay(this.props.componentId);
              }}
            >
              <HIcon name="times-circle" size={20} color={bluecolor.basicGrayColor} />
            </Touchable>
          </View>
          <HListView
            keyExtractor={item => item}
            renderHeader={null}
            renderItem={({ item, index }) => this.renderBody(item, index)}
            // onSearch={() => this.fetch()}
            onMoreView={null}
            // 그려진값
            data={this.state.data}
            // 조회된값
            totalData={this.state.dataTotal}
            // 하단에 표시될 메세지값
            status={this.state.status}
          />
        </View>
      </View>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  highContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnStyle: {
    marginBottom: 3,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.7,
    backgroundColor: bluecolor.basicBlueLightTrans,
    borderRadius: 10,
    padding: 10,
    // borderWidth: 5,
    borderColor: bluecolor.basicSkyBlueColor,
    justifyContent: 'space-between',
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
