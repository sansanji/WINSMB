/* *
 * Import Common
 * */
import { View, StyleSheet } from 'react-native';
import {
  React,
  bluecolor,
} from 'libs';
import { HRow, HTextfield, Touchable, HFadeinView, HText, HTexttitle } from 'ux';
/* *
 * Import node_modules
 * */
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * 챗봇 수입 통관 화물 조회 컴퍼넌트
 */

class CustomsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      btnIconName: 'chevron-down',
    };
  }

  render() {
    const { paramObj } = this.props;
    const paramHd = paramObj.data.headerInfo;
    const paramPg = paramObj.data.progressInfo;

    return (
      <View style={styles.serviceStyle}>
        <HTexttitle value={'수입화물 통관 정보'} />
        <HRow>
          <HTextfield label="화물관리번호" value={paramHd.cargMtNo} />
          <HTextfield label="진행상태" value={paramHd.prgsStts} />
        </HRow>
        <HRow>
          <HTextfield label="선사/항공사" value={paramHd.shcoFlco} />
          <HTextfield label="M B/L-H B/L" value={`${paramHd.mblNo}-${paramHd.hblNo}`} />
        </HRow>
        <HRow>
          <HTextfield label="화물구분" value={paramHd.cargTp} />
          <HTextfield label="선박/항공편명" value={paramHd.shipNm} />
        </HRow>
        <HRow>
          <HTextfield label="통관진행상태" value={paramHd.csclPrgsStts} />
          <HTextfield label="처리일시" value={paramHd.prcsDttm} />
        </HRow>
        <Touchable
          style={styles.iconStyle}
          onPress={() => {
            this.setState({
              btnIconName: this.state.btnIconName === 'chevron-up' ? 'chevron-down' : 'chevron-up',
            });
          }}
        >
          <FontAwesome
            name={this.state.btnIconName}
            size={15}
            color={bluecolor.basicBlueColorTrans}
          />
        </Touchable>
        {this.state.btnIconName === 'chevron-up' ? (
          <HFadeinView>
            <View>
              <HRow>
                <HTextfield label="선박국적" value={paramHd.shipNatNm} />
                <HTextfield label="선박대리점" value={paramHd.agnc} />
              </HRow>
              <HTextfield label="품명" value={paramHd.prnm} />
              <HRow>
                <HTextfield label="적재항" value={`${paramHd.ldprCd}-${paramHd.ldprNm}-${paramHd.lodCntyCd}`} />
                <HTextfield label="양륙항" value={`${paramHd.dsprCd}-${paramHd.dsprNm}`} />
              </HRow>
              <HRow>
                <HTextfield label="포장개수" value={`${paramHd.pckGcnt}-${paramHd.pckUt}`} />
                <HTextfield label="총 중량" value={`${paramHd.ttwg}-${paramHd.wghtUt}`} />
              </HRow>
              <HRow>
                <HTextfield label="입항세관" value={paramHd.etprCstm} />
                <HTextfield label="용적" value={paramHd.msrm} />
              </HRow>
              <HRow>
                <HTextfield label="B/L유형" value={paramHd.blPtNm} />
                <HTextfield label="입항일" value={paramHd.etprDt} />
              </HRow>
              <HRow>
                <HTextfield label="항차" value={paramHd.vydf} />
                <HTextfield label="관리대상지정여부" value={paramHd.mtTrgtCargYnNm} />
              </HRow>
              <HRow>
                <HTextfield label="컨테이너개수" value={paramHd.cntrGcnt} />
                <HTextfield label="반출의무과태료" value={paramHd.rlseDtyPridPassTpcd} />
              </HRow>
              <HRow>
                <HTextfield label="신고지연가산세" value={paramHd.dclrDelyAdtxYn} />
                <HTextfield label="특수화물코드" value={paramHd.spcnCargCd} />
              </HRow>
              <HTextfield label="컨테이너번호" value={paramHd.cntrNo} />
              <HTexttitle value={'수입화물 통관 진행사항'} />
              {paramPg.map((items, childIndex) => (
                <View key={`${items.seqNo}`} style={{ margin: 5, padding: 5, borderRadius: 5, backgroundColor: bluecolor.basicSkyBlueColor }}>
                  <HRow>
                    <HText value={items.progressName} />
                    <HText value={items.ProgressDate} textStyle={{ color: bluecolor.basicBlueImpactColor }} />
                  </HRow>

                </View>
              ))}
            </View>
          </HFadeinView>
        ) : null}

      </View>);
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  serviceStyle: {
    width: 300,
    borderRadius: 10,
    padding: 10,
    backgroundColor: bluecolor.basicWhiteColor,
    fontSize: bluecolor.basicFontSize,
  },
  iconStyle: {
    flex: 1,
    marginTop: 5,
    padding: 3,
    borderRadius: 5,
    backgroundColor: bluecolor.basicSoftGrayColor,
    alignItems: 'center',
  },
});

/**
 * Wrapping with root component
 */
export default CustomsView;
