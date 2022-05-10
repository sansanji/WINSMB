import bluecolor from 'styles/theme-color-blue';

const mainNavigatorStyle = {
  navBarTextFontSize: 14, // change the font size of the title
  // navBarTextFontFamily: 'font-name', // Changes the title font
  navBarComponentAlignment: 'center', // center/fill
  navBarCustomViewInitialProps: {}, // Serializable JSON passed as props
  navBarButtonColor: bluecolor.basicWhiteColor, // Change color of nav bar buttons (eg. the back button) (remembered across pushes)
  navBarBackgroundColor: bluecolor.basicBlueColor,
  navBarTextColor: bluecolor.basicWhiteColor, // 바 타이틀 색상
  screenBackgroundColor: bluecolor.basicWhiteColor,
  tabBarHidden: true, // 지도와 함께 했을 때 문제가된다
  drawUnderTabBar: true,
  // navBarBlur: true,
  orientation: 'portrait',
  navBarHeight: 55,
  // navBarHidden: true,
  navBarTextFontBold: true,
};

export default mainNavigatorStyle;
