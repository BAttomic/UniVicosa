/**
 * dimensions.js
 * -----------------------------------------------------------------------------
 * Tokens de layout responsivos do DamaLink. Deriva uma escala a partir da
 * largura da tela (base de 390pt) e expõe helpers `responsiveSize`/
 * `responsiveFont` além de escalas prontas de espaçamento, raio e tipografia.
 */
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const scale = screenWidth / 390;

function responsiveSize(size) {
  return Math.round(size * scale);
}

function responsiveFont(size) {
  return Math.round(size * scale);
}

const dimensions = {
  screenWidth,
  screenHeight,
  scale,
  responsiveSize,
  responsiveFont,
  boardWidthRatio: 0.92,
  boardCellPercent: '12.5%',
  spacing: {
    xs: responsiveSize(4),
    sm: responsiveSize(8),
    md: responsiveSize(12),
    lg: responsiveSize(16),
    xl: responsiveSize(24),
    xxl: responsiveSize(32),
  },
  radius: {
    sm: responsiveSize(8),
    md: responsiveSize(14),
    lg: responsiveSize(20),
    xl: responsiveSize(28),
  },
  typography: {
    xs: responsiveFont(11),
    sm: responsiveFont(13),
    md: responsiveFont(15),
    lg: responsiveFont(18),
    xl: responsiveFont(22),
    xxl: responsiveFont(28),
    xxxl: responsiveFont(34),
  },
};

export { dimensions, responsiveFont, responsiveSize };
export default dimensions;
