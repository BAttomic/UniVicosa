/**
 * chessEngine.js
 * -----------------------------------------------------------------------------
 * Núcleo de regras do xadrez (camada de domínio, sem dependência de UI).
 * Responsável por: geração de lances pseudo-legais e legais, validação de
 * xeque/xeque-mate/afogamento, lances especiais (roque, en passant, promoção)
 * e execução de movimentos sobre tabuleiros imutáveis (cada lance retorna uma
 * nova matriz). Consumido pela camada de tela (ChessGameScreen) e pela IA
 * (chessAI). Mantém-se puro e testável de forma isolada.
 */
import { BOARD_SIZE, COLORS, PIECE_TYPES, PIECE_VALUES } from './boardConstants';

/**
 * @typedef {{
 *  row:number,
 *  col:number,
 *  special?: 'en_passant' | 'castle_king_side' | 'castle_queen_side',
 *  capture?: { row:number, col:number }
 * }} ChessMove
 */

/**
 * Verifica se a posição está dentro do tabuleiro.
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
export function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Verifica se o rei da cor especificada está em xeque.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @returns {boolean}
 */
// isInCheck is implemented later in the file (below helpers)

/**
 * Retorna a peça localizada em uma posição válida.
 * @param {Array<Array<object|null>>} board
 * @param {number} row
 * @param {number} col
 * @returns {object|null}
 */
function getPieceAt(board, row, col) {
  if (!isInsideBoard(row, col)) {
    return null;
  }

  return board[row][col];
}

/**
 * Adiciona um movimento se a célula estiver vazia ou com peça adversária.
 * @param {Array<Array<object|null>>} board
 * @param {Array<{row:number,col:number}>} moves
 * @param {number} row
 * @param {number} col
 * @param {string} color
 */
function addMoveIfValid(board, moves, row, col, color) {
  if (!isInsideBoard(row, col)) {
    return;
  }

  const targetPiece = getPieceAt(board, row, col);
  if (!targetPiece || targetPiece.color !== color) {
    moves.push({ row, col });
  }
}

/**
 * Coleta os movimentos deslizantes de uma peça.
 * @param {Array<Array<object|null>>} board
 * @param {number} row
 * @param {number} col
 * @param {string} color
 * @param {Array<[number, number]>} directions
 * @returns {Array<{row:number,col:number}>}
 */
function collectSlidingMoves(board, row, col, color, directions) {
  const moves = [];

  directions.forEach(([rowStep, colStep]) => {
    let nextRow = row + rowStep;
    let nextCol = col + colStep;

    while (isInsideBoard(nextRow, nextCol)) {
      const targetPiece = getPieceAt(board, nextRow, nextCol);

      if (!targetPiece) {
        moves.push({ row: nextRow, col: nextCol });
      } else if (targetPiece.color !== color) {
        moves.push({ row: nextRow, col: nextCol });
        break;
      } else {
        // friendly piece - blocked
        break;
      }

      nextRow += rowStep;
      nextCol += colStep;
    }
  });

  return moves;
}

/**
 * Retorna todos os movimentos válidos de uma peça na posição dada.
 * @param {Array<Array<object|null>>} board
 * @param {number} row
 * @param {number} col
 * @returns {Array<{row:number,col:number}>}
 */
export function getValidMoves(board, row, col) {
  return getValidMovesWithContext(board, row, col, {});
}

/**
 * Retorna movimentos validos com contexto de regras especiais.
 * @param {Array<Array<object|null>>} board
 * @param {number} row
 * @param {number} col
 * @param {{
 *  lastMove?: { fromRow:number, fromCol:number, toRow:number, toCol:number, piece?: { type:string, color:string } } | null,
 *  castlingRights?: {
 *    whiteKingMoved?: boolean,
 *    blackKingMoved?: boolean,
 *    whiteRookAMoved?: boolean,
 *    whiteRookHMoved?: boolean,
 *    blackRookAMoved?: boolean,
 *    blackRookHMoved?: boolean,
 *  }
 * }} options
 * @returns {Array<ChessMove>}
 */
export function getValidMovesWithContext(board, row, col, options = {}) {
  const piece = getPieceAt(board, row, col);

  if (!piece) {
    return [];
  }

  const { lastMove = null, castlingRights = {} } = options;

  if (piece.type === PIECE_TYPES.PAWN) {
    const moves = [];
    const direction = piece.color === COLORS.WHITE ? -1 : 1;
    const startRow = piece.color === COLORS.WHITE ? 6 : 1;
    const nextRow = row + direction;

    // Helper to add moves with promotion check
    const addMove = (r, c) => {
      const isPromotionRow = (piece.color === COLORS.WHITE && r === 0) || (piece.color === COLORS.BLACK && r === 7);
      if (isPromotionRow) {
        // Promotion: add a move for each promotion piece
        [PIECE_TYPES.QUEEN, PIECE_TYPES.ROOK, PIECE_TYPES.BISHOP, PIECE_TYPES.KNIGHT].forEach(promoType => {
          moves.push({ row: r, col: c, promotion: promoType });
        });
      } else {
        moves.push({ row: r, col: c });
      }
    };

    if (!getPieceAt(board, nextRow, col)) {
      addMove(nextRow, col);

      const doubleStepRow = row + direction * 2;
      if (row === startRow && !getPieceAt(board, doubleStepRow, col)) {
        addMove(doubleStepRow, col);
      }
    }

    [-1, 1].forEach((colStep) => {
      const targetPiece = getPieceAt(board, nextRow, col + colStep);
      if (targetPiece && targetPiece.color !== piece.color) {
        addMove(nextRow, col + colStep);
      }
    });

    const enPassantEligible =
      lastMove?.piece?.type === PIECE_TYPES.PAWN &&
      Math.abs(lastMove.fromRow - lastMove.toRow) === 2 &&
      lastMove.toRow === row &&
      Math.abs(lastMove.toCol - col) === 1;

    if (enPassantEligible) {
      const enPassantCol = lastMove.toCol;
      const enPassantRow = row + direction;
      const adjacentPawn = getPieceAt(board, row, enPassantCol);

      if (
        isInsideBoard(enPassantRow, enPassantCol) &&
        !getPieceAt(board, enPassantRow, enPassantCol) &&
        adjacentPawn?.type === PIECE_TYPES.PAWN &&
        adjacentPawn.color !== piece.color
      ) {
        moves.push({
          row: enPassantRow,
          col: enPassantCol,
          special: 'en_passant',
          capture: { row, col: enPassantCol },
        });
      }
    }

    const legalMoves = moves.filter((move) => isInsideBoard(move.row, move.col) && isMoveLegal(board, row, col, move, piece.color, { lastMove, castlingRights }));
    return legalMoves;
  }

  if (piece.type === PIECE_TYPES.ROOK) {
    const moves = collectSlidingMoves(board, row, col, piece.color, [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]);
    const legalMoves = moves.filter((move) => isMoveLegal(board, row, col, move, piece.color, { lastMove, castlingRights }));
    return legalMoves;
  }

  if (piece.type === PIECE_TYPES.BISHOP) {
    const moves = collectSlidingMoves(board, row, col, piece.color, [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]);
    const legalMoves = moves.filter((move) => isMoveLegal(board, row, col, move, piece.color, { lastMove, castlingRights }));
    return legalMoves;
  }

  if (piece.type === PIECE_TYPES.QUEEN) {
    const moves = collectSlidingMoves(board, row, col, piece.color, [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]);
    const legalMoves = moves.filter((move) => isMoveLegal(board, row, col, move, piece.color, { lastMove, castlingRights }));
    return legalMoves;
  }

  if (piece.type === PIECE_TYPES.KNIGHT) {
    const moves = [];
    const knightSteps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    knightSteps.forEach(([rowStep, colStep]) => {
      addMoveIfValid(board, moves, row + rowStep, col + colStep, piece.color);
    });

    const legalMoves = moves.filter((move) => isMoveLegal(board, row, col, move, piece.color, { lastMove, castlingRights }));
    return legalMoves;
  }

  if (piece.type === PIECE_TYPES.KING) {
    const moves = [];

    [-1, 0, 1].forEach((rowStep) => {
      [-1, 0, 1].forEach((colStep) => {
        if (rowStep !== 0 || colStep !== 0) {
          addMoveIfValid(board, moves, row + rowStep, col + colStep, piece.color);
        }
      });
    });

    const isWhite = piece.color === COLORS.WHITE;
    const kingMoved = isWhite ? castlingRights.whiteKingMoved : castlingRights.blackKingMoved;

    if (!kingMoved) {
      const rookHCol = 7;
      const rookACol = 0;
      const rookHMoved = isWhite ? castlingRights.whiteRookHMoved : castlingRights.blackRookHMoved;
      const rookAMoved = isWhite ? castlingRights.whiteRookAMoved : castlingRights.blackRookAMoved;

      const kingSideRook = getPieceAt(board, row, rookHCol);
      const queenSideRook = getPieceAt(board, row, rookACol);

      const kingSideClear = !getPieceAt(board, row, col + 1) && !getPieceAt(board, row, col + 2);
      const queenSideClear =
        !getPieceAt(board, row, col - 1) && !getPieceAt(board, row, col - 2) && !getPieceAt(board, row, col - 3);

      if (
        !rookHMoved &&
        kingSideRook?.type === PIECE_TYPES.ROOK &&
        kingSideRook.color === piece.color &&
        kingSideClear
      ) {
        moves.push({ row, col: col + 2, special: 'castle_king_side' });
      }

      if (
        !rookAMoved &&
        queenSideRook?.type === PIECE_TYPES.ROOK &&
        queenSideRook.color === piece.color &&
        queenSideClear
      ) {
        moves.push({ row, col: col - 2, special: 'castle_queen_side' });
      }
    }

    const legalMoves = moves.filter((move) => isMoveLegal(board, row, col, move, piece.color, { lastMove, castlingRights }));
    return legalMoves;
  }

  return [];
}

/**
 * Verifica se uma peça pode atacar um quadrado específico (ignora regras de xeque).
 * @param {Array<Array<object|null>>} board
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {number} toRow
 * @param {number} toCol
 * @returns {boolean}
 */
export function canAttack(board, fromRow, fromCol, toRow, toCol) {
  // Verifica se a posição de origem está dentro do tabuleiro
  if (!isInsideBoard(fromRow, fromCol) || !isInsideBoard(toRow, toCol)) {
    return false;
  }

  const piece = board[fromRow][fromCol];
  if (!piece) {
    return false;
  }

  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Peão: captura apenas na diagonal
  if (piece.type === PIECE_TYPES.PAWN) {
    const direction = piece.color === COLORS.WHITE ? -1 : 1;
    // Peão captura na diagonal (uma casa na frente e uma na lateral)
    return (
      toRow === fromRow + direction &&
      colDiff === 1
    );
  }

  // Torre: movimento horizontal ou vertical
  if (piece.type === PIECE_TYPES.ROOK) {
    if (fromRow !== toRow && fromCol !== toCol) {
      return false; // Não é movimento reto
    }
    // Verifica se o caminho está livre
    const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null &&
          !(currentRow === toRow && currentCol === toCol)) {
        return false; // Bloqueado por outra peça (exceto no destino)
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  // Bispo: movimento diagonal
  if (piece.type === PIECE_TYPES.BISHOP) {
    if (rowDiff !== colDiff) {
      return false; // Não é movimento diagonal
    }
    // Verifica se o caminho está livre
    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null &&
          !(currentRow === toRow && currentCol === toCol)) {
        return false; // Bloqueado por outra peça (exceto no destino)
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  // Rainha: combina movimento de torre e bispo
  if (piece.type === PIECE_TYPES.QUEEN) {
    if (fromRow === toRow || fromCol === toCol) {
      // Movimento de torre
      const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
      const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
      let currentRow = fromRow + rowStep;
      let currentCol = fromCol + colStep;
      while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol] !== null &&
            !(currentRow === toRow && currentCol === toCol)) {
          return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
      }
      return true;
    } else if (rowDiff === colDiff) {
      // Movimento de bispo
      const rowStep = toRow > fromRow ? 1 : -1;
      const colStep = toCol > fromCol ? 1 : -1;
      let currentRow = fromRow + rowStep;
      let currentCol = fromCol + colStep;
      while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol] !== null &&
            !(currentRow === toRow && currentCol === toCol)) {
          return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
      }
      return true;
    }
    return false;
  }

  // Cavalo: movimento em L
  if (piece.type === PIECE_TYPES.KNIGHT) {
    return (
      (rowDiff === 2 && colDiff === 1) ||
      (rowDiff === 1 && colDiff === 2)
    );
  }

  // Rei: movimento de uma casa em qualquer direção
  if (piece.type === PIECE_TYPES.KING) {
    return rowDiff <= 1 && colDiff <= 1;
  }

  return false;
}

/**
 * Verifica se uma casa está sendo atacada por uma cor específica.
 * @param {Array<Array<object|null>>} board
 * @param {number} row
 * @param {number} col
 * @param {string} attackerColor
 * @returns {boolean}
 */
function isSquareUnderAttack(board, row, col, attackerColor) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor) {
        if (canAttack(board, r, c, row, col)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Verifica se um movimento é legal (não deixa o rei em xeque).
 * @param {Array<Array<object|null>>} board
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {ChessMove} move
 * @param {string} color
 * @param {{
 *  lastMove?: { fromRow:number, fromCol:number, toRow:number, toCol:number, piece?: { type:string, color:string } } | null,
 *  castlingRights?: {
 *    whiteKingMoved?: boolean,
 *    blackKingMoved?: boolean,
 *    whiteRookAMoved?: boolean,
 *    whiteRookHMoved?: boolean,
 *    blackRookAMoved?: boolean,
 *    blackRookHMoved?: boolean,
 *  }
 * }} options
 * @returns {boolean}
 */
export function isMoveLegal(board, fromRow, fromCol, move, color, options = {}) {
  // Simula o movimento em um tabuleiro copiado
  const nextBoard = JSON.parse(JSON.stringify(board));
  const movingPiece = nextBoard[fromRow][fromCol];

  if (!movingPiece) {
    return false;
  }

  // Limpa a posição de origem
  nextBoard[fromRow][fromCol] = null;

  // Aplica o movimento considerando movimentos especiais
  if (move.special === 'en_passant' && move.capture) {
    // Remove o peão capturado en passant
    nextBoard[move.capture.row][move.capture.col] = null;
    // Coloca o peão movido na nova posição
    nextBoard[move.row][move.col] = movingPiece;
  } else if (move.special === 'castle_king_side') {
    // Roque pequeno: move o rei e a torre
    const rookFromCol = 7;
    const rookToCol = move.col - 1;
    nextBoard[move.row][rookToCol] = nextBoard[move.row][rookFromCol];
    nextBoard[move.row][rookFromCol] = null;
    nextBoard[move.row][move.col] = movingPiece;
  } else if (move.special === 'castle_queen_side') {
    // Roque grande: move o rei e a torre
    const rookFromCol = 0;
    const rookToCol = move.col + 1;
    nextBoard[move.row][rookToCol] = nextBoard[move.row][rookFromCol];
    nextBoard[move.row][rookFromCol] = null;
    nextBoard[move.row][move.col] = movingPiece;
  } else {
    // Movimento normal
    nextBoard[move.row][move.col] = movingPiece;
  }

  // Additional castling validation: king cannot be in check, nor pass through a square under attack
  if (move.special === 'castle_king_side' || move.special === 'castle_queen_side') {
    // King must not be currently in check
    if (isInCheck(board, color)) return false;

    const step = move.col > fromCol ? 1 : -1;
    const intermediateCol = fromCol + step;
    // simulate king on intermediate square for attack detection
    const tempBoard = JSON.parse(JSON.stringify(board));
    // remove original king
    tempBoard[fromRow][fromCol] = null;
    tempBoard[fromRow][intermediateCol] = { type: PIECE_TYPES.KING, color };
    const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    if (isSquareUnderAttack(tempBoard, fromRow, intermediateCol, opponentColor)) return false;
  }

  // Encontra a posição do rei da cor que moveu
  let kingRow = -1;
  let kingCol = -1;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = nextBoard[r][c];
      if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
        kingRow = r;
        kingCol = c;
        break;
      }
    }
    if (kingRow !== -1) break;
  }

  // Se não encontrou o rei (não deveria acontecer em condições normais), considera o movimento ilegal
  if (kingRow === -1 || kingCol === -1) {
    return false;
  }

  // Verifica se alguma peça adversária pode capturar o rei
  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = nextBoard[r][c];
      if (piece && piece.color === opponentColor) {
        // Verifica se esta peça pode atacar o rei
        if (canAttack(nextBoard, r, c, kingRow, kingCol)) {
          return false; // Rei está em xeque
        }
      }
    }
  }

  return true; // Movimento é legal (rei não está em xeque)
}

/**
 * Executa um movimento e retorna um novo tabuleiro.
 * @param {Array<Array<object|null>>} board
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {number} toRow
 * @param {number} toCol
 * @returns {Array<Array<object|null>>}
 */
/**
 * Encontra a posição do rei de uma cor no tabuleiro.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @returns {{row:number, col:number} | null}
 */
export function findKingPosition(board, color) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Verifica a condição de vitória simplificada (rei capturado).
 * @param {Array<Array<object|null>>} board
 * @returns {'white' | 'black' | null}
 */
export function checkWinCondition(board) {
  let whiteKingExists = false;
  let blackKingExists = false;

  board.forEach((row) => {
    row.forEach((piece) => {
      if (piece?.type === PIECE_TYPES.KING) {
        if (piece.color === COLORS.WHITE) {
          whiteKingExists = true;
        }

        if (piece.color === COLORS.BLACK) {
          blackKingExists = true;
        }
      }
    });
  });

  if (!whiteKingExists) {
    return 'black';
  }

  if (!blackKingExists) {
    return 'white';
  }

  return null;
}

/**
 * Verifica se o rei da cor especificada está em xeque.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @returns {boolean}
 */
export function isInCheck(board, color) {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false; // Should not happen
  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        if (canAttack(board, r, c, kingPos.row, kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Retorna todos os movimentos legais de uma cor.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @param {{
 *  lastMove?: { fromRow:number, fromCol:number, toRow:number, toCol:number, piece?: { type:string, color:string } } | null,
 *  castlingRights?: {
 *    whiteKingMoved?: boolean,
 *    blackKingMoved?: boolean,
 *    whiteRookAMoved?: boolean,
 *    whiteRookHMoved?: boolean,
 *    blackRookAMoved?: boolean,
 *    blackRookHMoved?: boolean,
 *  }
 * }} options
 * @returns {Array<ChessMove>}
 */
export function getLegalMoves(board, color, options = {}) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const pieceMoves = getValidMovesWithContext(board, r, c, options);
        moves.push(...pieceMoves);
      }
    }
  }
  return moves;
}

/**
 * Verifica se o jogador está em xeque-mate.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @returns {boolean}
 */
export function isCheckmate(board, color) {
  if (!isInCheck(board, color)) return false;
  const moves = getLegalMoves(board, color, { lastMove: null, castlingRights: { whiteKingMoved: false, blackKingMoved: false, whiteRookAMoved: false, whiteRookHMoved: false, blackRookAMoved: false, blackRookHMoved: false } });
  return moves.length === 0;
}

/**
 * Verifica se o jogador está em afogamento (stalemate).
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @returns {boolean}
 */
export function isStalemate(board, color) {
  if (isInCheck(board, color)) return false;
  const moves = getLegalMoves(board, color, { lastMove: null, castlingRights: { whiteKingMoved: false, blackKingMoved: false, whiteRookAMoved: false, whiteRookHMoved: false, blackRookAMoved: false, blackRookHMoved: false } });
  return moves.length === 0;
}

/**
 * Verifica se há material insuficiente para continuar o jogo (resultado em empate).
 * @param {Array<Array<object|null>>} board
 * @returns {boolean}
 */
export function insufficientMaterial(board) {
  let whitePieces = 0, blackPieces = 0;
  let whiteBishops = 0, blackBishops = 0;
  let whiteKnights = 0, blackKnights = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if (piece.color === COLORS.WHITE) {
        whitePieces++;
        if (piece.type === PIECE_TYPES.BISHOP) whiteBishops++;
        if (piece.type === PIECE_TYPES.KNIGHT) whiteKnights++;
      } else {
        blackPieces++;
        if (piece.type === PIECE_TYPES.BISHOP) blackBishops++;
        if (piece.type === PIECE_TYPES.KNIGHT) blackKnights++;
      }
    }
  }

  // King vs King
  if (whitePieces === 1 && blackPieces === 1) return true;

  // King and Bishop vs King
  if ((whitePieces === 2 && blackPieces === 1 && whiteBishops === 1 && whiteKnights === 0) ||
      (blackPieces === 2 && whitePieces === 1 && blackBishops === 1 && blackKnights === 0)) {
    return true;
  }

  // King and Knight vs King
  if ((whitePieces === 2 && blackPieces === 1 && whiteKnights === 1 && whiteBishops === 0) ||
      (blackPieces === 2 && whitePieces === 1 && blackKnights === 1 && blackBishops === 0)) {
    return true;
  }

  // King and Bishop vs King and Bishop (assuming bishops on same color - simplified)
  if (whitePieces === 2 && blackPieces === 2 && whiteBishops === 1 && blackBishops === 1 && whiteKnights === 0 && blackKnights === 0) {
    return true;
  }

  return false;
}

/**
 * Determina o resultado do jogo com base na posição atual.
 * @param {Array<Array<object|null>>} board
 * @returns {'white_wins' | 'black_wins' | 'draw' | null}
 */
export function getGameResult(board) {
  // Check for checkmate
  if (isCheckmate(board, COLORS.WHITE)) return 'black_wins';
  if (isCheckmate(board, COLORS.BLACK)) return 'white_wins';
  // Check for stalemate
  if (isStalemate(board, COLORS.WHITE) || isStalemate(board, COLORS.BLACK)) return 'draw';
  // Check for insufficient material
  if (insufficientMaterial(board)) return 'draw';
  // TODO: 50-move rule, threefold repetition
  return null;
}

/**
 * Retorna o valor de pontuação de uma peça capturada.
 * @param {object|null} piece
 * @returns {number}
 */
export function getPieceValue(piece) {
  if (!piece) {
    return 0;
  }

  return PIECE_VALUES[piece.type] ?? 0;
}

/**
 * Executa movimento com suporte a en passant, roque e promoção.
 * @param {Array<Array<object|null>>} board
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {ChessMove} move
 * @returns {Array<Array<object|null>>}
 */
export function executeMove(board, fromRow, fromCol, move) {
  const nextBoard = JSON.parse(JSON.stringify(board));
  const movingPiece = nextBoard[fromRow][fromCol];

  if (!movingPiece) {
    return nextBoard;
  }

  nextBoard[fromRow][fromCol] = null;

  if (move.special === 'en_passant' && move.capture) {
    // Remove o peão capturado en passant
    nextBoard[move.capture.row][move.capture.col] = null;
    // Coloca o peão movido na nova posição
    nextBoard[move.row][move.col] = movingPiece;
  } else if (move.special === 'castle_king_side') {
    // Roque pequeno: move o rei e a torre
    const rookFromCol = 7;
    const rookToCol = move.col - 1;
    nextBoard[move.row][rookToCol] = nextBoard[move.row][rookFromCol];
    nextBoard[move.row][rookFromCol] = null;
    nextBoard[move.row][move.col] = movingPiece;
  } else if (move.special === 'castle_queen_side') {
    // Roque grande: move o rei e a torre
    const rookFromCol = 0;
    const rookToCol = move.col + 1;
    nextBoard[move.row][rookToCol] = nextBoard[move.row][rookFromCol];
    nextBoard[move.row][rookFromCol] = null;
    nextBoard[move.row][move.col] = movingPiece;
  } else {
    // Movimento normal ou promoção
    if (move.promotion) {
      // Promoção: substitui o peão pela peça escolhida
      nextBoard[move.row][move.col] = {
        type: move.promotion,
        color: movingPiece.color
      };
    } else {
      nextBoard[move.row][move.col] = movingPiece;
    }
  }
  return nextBoard;
}

/**
 * Gera todos os lances legais de uma cor, já anotando a casa de origem.
 * Formato pensado para a busca da IA e para a detecção de fim de jogo.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @param {{ lastMove?: object|null, castlingRights?: object }} [options]
 * @returns {Array<{ fromRow:number, fromCol:number, move:ChessMove }>}
 */
export function getAllMovesForColor(board, color, options = {}) {
  const moves = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) {
        continue;
      }

      const pieceMoves = getValidMovesWithContext(board, row, col, options);
      for (const move of pieceMoves) {
        moves.push({ fromRow: row, fromCol: col, move });
      }
    }
  }

  return moves;
}

/**
 * Determina o desfecho da partida sob a ótica de quem está prestes a jogar.
 * Considera o contexto (último lance e direitos de roque) para que regras
 * como en passant influenciem a contagem de lances disponíveis.
 * @param {Array<Array<object|null>>} board
 * @param {string} nextColor cor que tem a vez
 * @param {{ lastMove?: object|null, castlingRights?: object }} [options]
 * @returns {'white_wins'|'black_wins'|'draw'|null}
 */
export function getGameResultForNextPlayer(board, nextColor, options = {}) {
  const availableMoves = getAllMovesForColor(board, nextColor, options);

  if (availableMoves.length === 0) {
    // Sem lances: xeque-mate se em xeque, afogamento (empate) caso contrário.
    if (isInCheck(board, nextColor)) {
      return nextColor === COLORS.WHITE ? 'black_wins' : 'white_wins';
    }
    return 'draw';
  }

  if (insufficientMaterial(board)) {
    return 'draw';
  }

  return null;
}