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
    super(props, 'WMS100501');

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
    modelUtil.setModelData('WMS100501', {});
  }

  async componentDidMount() {
    this._validCheckFunc('alert'); // 모든 화면은 기본적으로 whcode와 vendor정보가 필요하기 때문에 체크 로직을 태운다.
  }

  // AREA 구하기
  async fetchArea() {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const result = await Fetch.request('WMS010218SVC', 'getStor', {
      body: JSON.stringify({
        WMS010218F1: {
          WH_CODE: whCode,
        },
        WMS010218G1: {},
      }),
    });

    if (result.TYPE === 1) {
      const areaData = result.WMS010218G2;
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

  // RACK , LENGTH, WIDTH, HEIGHT 구하기
  async fetchLoc(area) {
    Util.openLoader(this.screenId, true); // Loader View 열기!
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    const result = await Fetch.request('WMS010218SVC', 'getStor', {
      body: JSON.stringify({
        WMS010218F1: {
          WH_CODE: whCode,
        },
        WMS010218G1: {
          AREA: area || null,
        },
      }),
    });

    if (result.TYPE === 1) {
      const data = result.WMS010218G2;
      if (data.length > 0) {
        this.setState({
          width: data[0].WIDTH,
          height: data[0].HEIGHT,
        });
        const rack = Number(data[0].RACK);
        // const length = data[0].LENGTH;
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
    const modelData = modelUtil.getModelData('WMS100501');
    if (modelData.AREA == null && modelData.RACK == null && modelData.REF_NO == null) {
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

    if (modelData.AREA != null && modelData.RACK == null) {
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
    const whCode = _.get(this.props.global, 'whcode.WH_CODE', null);
    // const vendorCode = _.get(this.props.global, 'vendorcode.VENDOR_CODE', null);
    // const vendorPlantCode = _.get(this.props.global, 'vendorcode.VENDOR_PLANT_CODE', null);

    // const result = await Fetch.request('WMS010212', 'get', {
    const result = await Fetch.request('WMS010212SVC', 'getStockAll', {
      body: JSON.stringify({
        WMS010212F1: {
          WH_CODE: whCode,
          // VENDOR_CODE: vendorCode,
          // VENDOR_PLANT_CODE: vendorPlantCode,
          M_KEYWORD: modelUtil.getValue('WMS100501.REF_NO'),
          EXIST_YN: 'Y',
          GRGI_DAY: 'GR',
          GR_FLAG: 'N',
          LOC_YN: 'Y',
        },
      }),
    });
    // 맵만들기
    const locMap = [];
    if (modelData.RACK != null && this.state.height != null && this.state.width) {
      const tempR = modelData.RACK;
      const tempRack = Number(tempR) <= 9 ? `0${tempR}` : `${tempR}`;
      for (let h = this.state.height; h >= 1; h--) {
        for (let w = 1; w <= this.state.width; w++) {
          const tempW = w <= 9 ? `0${w}` : `${w}`;
          const tempH = h <= 9 ? `0${h}` : `${h}`;
          locMap.push({
            AREA: modelData.AREA,
            RACK: tempRack,
            WIDTH: tempW,
            HEIGHT: tempH,
            LOCATION: `${modelData.AREA + tempRack}-${tempW}-${tempH}`,
          });
        }
      }
    }
    if (result.TYPE === 1) {
      const data = result.WMS010212G6;
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
            name: 'screen.WMS100502',
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
    const modelDate = modelUtil.getModelData('WMS100501');
    return (
      <HBaseView button={() => this._onSearch()}>
        <HFormView>
          <HRow>
            <HCombobox
              label={'Area'}
              groupJson={this.state.areaData}
              codeField={'AREA'}
              nameField={'AREA'}
              bindVar={{
                CD: 'WMS100501.AREA',
                NM: 'WMS100501.AREA_NAME',
              }}
              editable
              onChanged={value => {
                this.setState({
                  locMap: [],
                  data: null,
                });
                modelUtil.setValue('WMS100501.RACK', null);
                modelUtil.setValue('WMS100501.RACK_NAME', null);
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
                CD: 'WMS100501.RACK',
                NM: 'WMS100501.RACK_NAME',
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
            bind={'WMS100501.REF_NO'}
            editable
            onChanged={() => {
              modelUtil.setValue('WMS100501.AREA', null);
              modelUtil.setValue('WMS100501.AREA_NAME', null);
              modelUtil.setValue('WMS100501.RACK', null);
              modelUtil.setValue('WMS100501.RACK_NAME', null);
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
        {modelDate.RACK == null || modelDate.AREA == null ? (
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
