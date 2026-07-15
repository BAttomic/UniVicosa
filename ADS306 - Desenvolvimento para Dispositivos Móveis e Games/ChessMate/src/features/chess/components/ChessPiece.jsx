import { Image, StyleSheet, View } from 'react-native';

import { COLORS } from '../logic/boardConstants';

// Sprites das peças (PNG 60px) indexados por cor e por tipo (K/Q/R/B/N/P).
// O caminho sobe de src/features/chess/components até a raiz onde fica /assets.

const PIECE_IMAGES = {
  white: {
    K: require('../../../../assets/pieces/Chess_klt60.png'),
    Q: require('../../../../assets/pieces/Chess_qlt60.png'),
    R: require('../../../../assets/pieces/Chess_rlt60.png'),
    B: require('../../../../assets/pieces/Chess_blt60.png'),
    N: require('../../../../assets/pieces/Chess_nlt60.png'),
    P: require('../../../../assets/pieces/Chess_plt60.png'),
  },
  black: {
    K: require('../../../../assets/pieces/Chess_kdt60.png'),
    Q: require('../../../../assets/pieces/Chess_qdt60.png'),
    R: require('../../../../assets/pieces/Chess_rdt60.png'),
    B: require('../../../../assets/pieces/Chess_bdt60.png'),
    N: require('../../../../assets/pieces/Chess_ndt60.png'),
    P: require('../../../../assets/pieces/Chess_pdt60.png'),
  },
};

export default function ChessPiece({ piece, size = 40 }) {
  if (!piece) return <View style={{ width: size, height: size }} />;

  const isWhite = piece.color === COLORS.WHITE;
  const image = PIECE_IMAGES[isWhite ? 'white' : 'black'][piece.type];

  return (
    <Image
      source={image}
      style={[
        styles.piece,
        {
          width: size,
          height: size,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: {
    resizeMode: 'contain',
  },
});
