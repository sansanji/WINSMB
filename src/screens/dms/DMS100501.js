/* *
 * Import Common
 * */
import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { _, React, Util, Redux, Fetch, NavigationScreen, modelUtil, bluecolor } from 'libs';
import { HBaseView, Touchable, HRow, HTextfield, HFormView, HCombobox } from 'ux';

/**
 * 위치정보 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'DMS100501');

    this.state = {
      data: [],
      areaData: [],
      status: null,
      selectedCal: 0,
      spinner: false,
      locMap: [],
    };
    this.callapsed = false;
  }

  async componentWillMount() {
    this.fetchArea('', null);
    modelUtil.setModelData('DMS100501', {});
  }

  async componentDidMount() {
    // this._validCheckFunc('alert'); // 모든 화면은 기본적으로 dmsWhcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // LOCATION_CODE 구하기
  async fetchArea() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const result = await Fetch.request('DMS030511SVC', 'getStor', {
      body: JSON.stringify({
        DMS030511F1: {
          WH_CODE: whCode,
        },
        DMS030511G1: {},
      }),
    });

    if (result.TYPE === 1) {
      const areaData = result.DMS030511G2;
      if (areaData.length > 0) {
        this.setState({
          areaData,
        });
        Util.openLoader(this.screenId, false);
      } else {
        this.setState({
          areaData,
        });
        Util.openLoader(this.screenId, false);
      }
    } else {
      Util.openLoader(this.screenId, false);
    }
  }

  // LENGTH_COUNT , LENGTH_COUNT, WIDTH_COUNT, HEIGHT_COUNT 구하기
  async fetchLoc(area) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    const result = await Fetch.request('DMS030511SVC', 'getStor', {
      body: JSON.stringify({
        DMS030511F1: {
          WH_CODE: whCode,
        },
        DMS030511G1: {
          LOCATION_CODE: area || null,
        },
      }),
    });

    if (result.TYPE === 1) {
      const data = result.DMS030511G2;
      if (data.length > 0) {
        this.setState({
          width: data[0].WIDTH_COUNT,
          height: data[0].HEIGHT_COUNT,
        });
        const rack = Number(data[0].LENGTH_COUNT);
        // const length = data[0].LENGTH_COUNT;
        const rackCombo = [];

        // const lengthCombo = [];

        for (let i = 1; i <= rack; i++) {
          rackCombo.push({
            CODE: i,
            VALUE: i,
          });
        }

        this.setState({
          rackCombo,
        });

        Util.openLoader(this.screenId, false);
      } else {
        Util.openLoader(this.screenId, false);
      }
    } else {
      Util.openLoader(this.screenId, false);
    }
  }

  async _onSearch() {
    const modelData = modelUtil.getModelData('DMS100501');
    if (modelData.LOCATION_CODE == null && modelData.LENGTH_COUNT == null && modelData.REF_NO == null) {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please Input Area or Item No. information!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    if (modelData.LOCATION_CODE != null && modelData.LENGTH_COUNT == null) {
      Util.msgBox({
        title: 'Alert',
        msg: 'Please Input Rack data!',
        buttonGroup: [
          {
            title: 'OK',
          },
        ],
      });
      return;
    }

    Util.openLoader(this.screenId, true);
    const whCode = _.get(this.props.global, 'dmsWhcode.WH_CODE', null);
    // const vendorCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_CODE', null);
    // const vendorPlantCode = _.get(this.props.global, 'dmsVendorcode.VENDOR_PLANT_CODE', null);

    // const result = await Fetch.request('DMS030511', 'get', {
    const result = await Fetch.request('DMS030511SVC', 'getStockAll', {
      body: JSON.stringify({
        DMS030511F1: {
          WH_CODE: whCode,
          // VENDOR_CODE: vendorCode,
          // VENDOR_PLANT_CODE: vendorPlantCode,
          M_KEYWORD: modelUtil.getValue('DMS100501.REF_NO'),
          EXIST_YN: 'Y',
          GRGI_DAY: 'GR',
          GR_FLAG: 'N',
          LOC_YN: 'Y',
        },
      }),
    });
    // 맵만들기
    const locMap = [];
    if (modelData.LENGTH_COUNT != null && this.state.height != null && this.state.width) {
      const tempR = modelData.LENGTH_COUNT;
      const tempRack = Number(tempR) <= 9 ? `0${tempR}` : `${tempR}`;
      for (let h = this.state.height; h >= 1; h--) {
        for (let w = 1; w <= this.state.width; w++) {
          const tempW = w <= 9 ? `0${w}` : `${w}`;
          const tempH = h <= 9 ? `0${h}` : `${h}`;
          locMap.push({
            LOCATION_CODE: modelData.LOCATION_CODE,
            LENGTH_COUNT: tempRack,
            WIDTH_COUNT: tempW,
            HEIGHT_COUNT: tempH,
            LOCATION: `${modelData.LOCATION_CODE + tempRack}-${tempW}-${tempH}`,
          });
        }
      }
    }
    if (result.TYPE === 1) {
      const data = result.DMS030511G6;
      if (data.length > 0) {
        this.setState({
          data,
        });
        Util.openLoader(this.screenId, false);
        // 임시로 위치정보를저장함
        // data[0].LOCATION = 'B02-01-01';
        // data[1].LOCATION = 'B02-02-02';
        for (let l = 0; l < data.length; l++) {
          for (let loc = 0; loc < locMap.length; loc++) {
            if (locMap[loc].LOCATION === data[l].LOCATION) {
              locMap[loc].EXIST = 'Y';
              locMap[loc].GR_NO = data[l].GR_NO;
              locMap[loc].REF_NO = data[l].REF_NO;
              locMap[loc].GR_DATE_TIME = data[l].GR_DATE_TIME;
              locMap[loc].ITEM_QTY = data[l].ITEM_QTY;
            }
          }
        }
        this.setState({
          locMap,
          width: this.state.width,
        });
      } else {
        this.setState({
          locMap,
          data: null,
        });
        Util.openLoader(this.screenId, false);
      }
    } else {
      this.setState({
        locMap,
        data: null,
      });
      Util.openLoader(this.screenId, false);
    }
  }

  popupItem(item) {
    if (item != null) {
      if (item.EXIST != null && item.EXIST === 'Y') {
        const { navigator } = this.props.global;
        navigator.showOverlay({
          component: {
            name: 'screen.DMS100502',
            passProps: {
              title: 'Location Item',
              item,
            },
            options: {
              layout: {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                componentBackgroundColor: 'rgba(0, 0, 0, 0.3)',
              },
              overlay: {
                interceptTouchOutside: true,
              },
            },
          },
        });
      }
    }
  }

  render() {
    const modelDate = modelUtil.getModelData('DMS100501');
    return (
      <HBaseView button={() => this._onSearch()}>
        <HFormView>
          <HRow>
            <HCombobox
              label={'Area'}
              groupJson={this.state.areaData}
              codeField={'LOCATION_CODE'}
              nameField={'LOCATION_CODE'}
              bindVar={{
                CD: 'DMS100501.LOCATION_CODE',
                NM: 'DMS100501.LOCATION_CODE_NAME',
              }}
              editable
              onChanged={value => {
                this.setState({
                  locMap: [],
                  data: null,
                });
                modelUtil.setValue('DMS100501.LENGTH_COUNT', null);
                modelUtil.setValue('DMS100501.LENGTH_COUNT_NAME', null);
                // Rack갯수와 Length갯수를 가져온다.
                this.fetchLoc(value.code);
              }}
            />
            <HCombobox
              label={'Rack'}
              groupJson={this.state.rackCombo}
              codeField={'CODE'}
              nameField={'VALUE'}
              bindVar={{
                CD: 'DMS100501.LENGTH_COUNT',
                NM: 'DMS100501.LENGTH_COUNT_NAME',
              }}
              editable
              onChanged={value => {
                this.setState({
                  data: null,
                });
              }}
            />
          </HRow>
          <HTextfield
            label={'Keyword'}
            bind={'DMS100501.REF_NO'}
            editable
            onChanged={() => {
              modelUtil.setValue('DMS100501.LOCATION_CODE', null);
              modelUtil.setValue('DMS100501.LOCATION_CODE_NAME', null);
              modelUtil.setValue('DMS100501.LENGTH_COUNT', null);
              modelUtil.setValue('DMS100501.LENGTH_COUNT_NAME', null);
            }}
          />
        </HFormView>
        {modelDate.REF_NO == null || modelDate.REF_NO === '' ? (
          <ScrollView>
            <ScrollView horizontal>
              <View style={[styles.locmap, { paddingBottom: 10 }]}>
                <HRow>
                  {this.state.locMap != null ? (
                    <HRow groupNumber={this.state.width}>
                      {this.state.locMap.map(option => (
                        <Touchable
                          style={[styles.underbarButton, option.EXIST ? styles.selected : null]}
                          key={option.LOCATION}
                          onPress={() => this.popupItem(option)}
                        >
                          <Text
                            style={[
                              styles.buttonText,
                              option.EXIST ? styles.selectedButtonText : null,
                            ]}
                          >
                            {option.LOCATION}
                            {/* {props.value ? `\n*${props.value}` : null} */}
                          </Text>
                        </Touchable>
                      ))}
                    </HRow>
                  ) : null}
                </HRow>
              </View>
            </ScrollView>
          </ScrollView>
        ) : null}
        {modelDate.LENGTH_COUNT == null || modelDate.LOCATION_CODE == null ? (
          <ScrollView>
            <View style={[styles.container, { paddingBottom: 10 }]}>
              <FlatList
                data={this.state.data}
                renderItem={({ item, index }) => (
                  <View key={index}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: bluecolor.basicBlueFontColor,
                        }}
                      >
                        {item.REF_NO}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: bluecolor.basicBlueFontColor,
                        }}
                      >
                        {item.LOCATION}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ fontSize: 10, paddingTop: 5 }}>{`${item.ITEM_QTY} qty`}</Text>
                      <Text style={{ fontSize: 10, paddingTop: 5 }}>{`${item.GR_DATE_TIME}`}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        ) : null}
      </HBaseView>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  underbarButton: {
    padding: 10,
    // backgroundColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
    // width: '100%',
    width: 45,
    height: 50,
    marginBottom: 6,
    marginRight: 3,
    borderWidth: 0.5,
    borderColor: '#aaaaaa',
    borderRadius: 5,
  },
  selected: {
    borderColor: '#aaaaaa',
    borderWidth: 1.5,
    backgroundColor: bluecolor.basicGreenColor,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#696969',
    fontSize: 12,
  },
  selectedButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  locmap: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollview: {
    paddingTop: 20,
  },
});

/**
 * Inject redux actions and props
 */
const mapStateToProps = state => ({
  global: state.global,
  model: state.model,
});

/**
 * Wrapping with root component
 */
export default Redux.connect(mapStateToProps)(Component);
