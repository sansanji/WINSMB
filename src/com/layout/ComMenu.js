/* *
 * Import Common
 * */
import {View, FlatList, StyleSheet, ScrollView} from 'react-native';
import {
  React,
  Redux,
  NavigationScreen,
  bluecolor,
  Navigation,
  Fetch,
  ReduxStore,
  Util,
} from 'libs';
import {
  BackImage,
  HTableIcon,
  Accordion,
  Touchable,
  HTabView,
  HIcon,
  HText,
} from 'ux';

/* *
 * Import node_modules
 * */
import debounce from 'debounce';
/**
 * Menu. 화면
 */
class Component extends NavigationScreen {
  constructor(props) {
    super(props, 'ComMenu');
    let screenId = null;

    if (this.props.global.activeTab) {
      if (this.props.global.lmenu) {
        screenId = this.props.global.lmenu[this.props.global.activeTab].swidget;
      }
    }
    // const screenId = this.props.global.lmenu[this.props.global.activeTab].swidget;
    const sMenu = Util.parseSmenu(this.props.global.menu, screenId);
    this.state = {
      activeIcon: null,
      menuList: sMenu.menuList,
      menuFavList: sMenu.menuFavList,
      screenId,
    };
    this.callapsed = false;
    this._openScreen = debounce(this._openScreen.bind(this), 1000, true);
  }

  _renderRow = menuVar => {
    const header = (
      <View style={styles.contentHeader}>
        <HIcon
          name="list-ul"
          size={17}
          color={bluecolor.basicWhiteColor}
          style={styles.contentHeaderImg}
        />
        <HText textStyle={styles.contentHeaderTxt} value={menuVar.title} />
      </View>
    );
    const content = (
      <View style={styles.contentSub}>
        <FlatList
          contentHeight={menuVar.menu.length * 50}
          data={menuVar.menu}
          keyExtractor={item => item.subscreen}
          renderItem={({item, index}) => (
            <View style={styles.contentSubContainer}>
              <Touchable
                activeOpacity={0.5}
                onPress={() => {
                  this._openScreen(item.subscreen, null, item.subtitle);
                }}>
                <HText textStyle={styles.contentSubTxt}>{item.subtitle}</HText>
              </Touchable>
              <Touchable
                activeOpacity={0.5}
                onPress={() => {
                  this._setFavorite(item);
                }}>
                <HIcon
                  name={item.shortcut === 'Y' ? 'star' : 'star-o'}
                  size={15}
                  color={bluecolor.basicBluebt}
                  style={styles.contentHeaderImg}
                />
              </Touchable>
            </View>
          )}
        />
      </View>
    );

    return (
      <Accordion header={header} content={content} easing="easeOutCubic" />
    );
  };

  _openScreen(screen, index, title) {
    Util.openLoader(this.screenId, true); // Loader View 열기!

    const {navigator} = this.props;

    console.log(`activeIcon : ${index}`);
    Navigation(navigator, screen, {}, title);
    this.setState({
      activeIcon: index,
    });
    Util.openLoader(this.screenId, false);
    // Loader View 닫기!
  }

  async _setFavorite(item) {
    const shorcutYN = item.shortcut === 'Y' ? 'N' : 'Y';

    const result = await Fetch.request('OSPrivilegeSVC', 'menuPrvg', {
      body: JSON.stringify({
        MENU_ID: item.menuID,
        SHOTCUT: shorcutYN,
      }),
    });
    if (result) {
      // 즐겨찾기 등록
      const gMenu = this.props.global.menu;
      Object.assign(gMenu[item.menuIndex], {SHOTCUT: shorcutYN});
      ReduxStore.dispatch({
        type: 'global.menu.set',
        menu: gMenu,
      });

      const sMenu = Util.parseSmenu(gMenu, this.state.screenId);
      this.setState({
        activeIcon: null,
        menuList: sMenu.menuList,
        menuFavList: sMenu.menuFavList,
      });
    }
  }

  render() {
    // const { theme } = this.props.global;
    return (
      <View style={styles.container}>
        <HTabView>
          <View style={styles.container} tabLabel="Favorite">
            <BackImage />
            <ScrollView>
              <HTableIcon
                iconList={this.state.menuFavList}
                activeIcon={this.state.activeIcon}
                onClick={(screen, index, title) =>
                  this._openScreen(screen, index, title)
                }
                tableStyle={styles.menucontainer}
                iconStyle={styles.iconStyle}
              />
            </ScrollView>
          </View>
          <View style={styles.container} tabLabel="Menu">
            <BackImage />
            <FlatList
              data={this.state.menuList}
              keyExtractor={item => item.title}
              renderItem={({item, index}) => (
                <View
                  key={item.title} /* onPress={() => this._onPress(item)} */
                >
                  {this._renderRow(item, index)}
                </View>
              )}
            />
          </View>
        </HTabView>
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
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  contentHeader: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    paddingLeft: 20,
    // borderWidth: 1,
    // borderColor: bluecolor.basicBlueColor,
    backgroundColor: bluecolor.basicBluebt,
    borderRadius: 5,
  },
  contentHeaderTxt: {
    fontSize: 15,
    alignItems: 'center',
    color: bluecolor.basicWhiteColor,
  },
  contentHeaderImg: {
    marginRight: 10,
    alignItems: 'center',
  },
  contentSub: {
    margin: 2,
    padding: 2,
    borderColor: bluecolor.basicBlueColor,
  },
  contentSubContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 3,
    paddingLeft: 3,
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: bluecolor.basicBlueColor,
    marginLeft: 50,
    marginRight: 10,
  },
  contentSubTxt: {
    padding: 5,
    fontSize: 13,
    fontWeight: 'bold',
    alignItems: 'center',
    color: bluecolor.basicBlueColor,
    backgroundColor: bluecolor.basicTrans,
  },
  menucontainer: {
    paddingTop: 50,
    // borderWidth: 1,
    // marginTop: 100,
    // backgroundColor: bluecolor.basicBlueColor,
  },
  iconStyle: {
    width: 60,
    paddingTop: 20,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: bluecolor.basicBluebt,
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
