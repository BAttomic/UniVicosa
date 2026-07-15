/**
 * checkersEngine.js
 * -----------------------------------------------------------------------------
 * Núcleo de regras das Damas brasileiras (camada de domínio, sem UI). Cobre:
 * montagem do tabuleiro inicial, geração de lances normais e de captura (com
 * captura obrigatória e captura encadeada), movimentação de damas a distância,
 * promoção e detecção de fim de jogo. Funções puras sobre tabuleiros imutáveis.
 */
const EMPTY = null;
const BLACK_PLAYER = 'black';
const WHITE_PLAYER = 'white';

function createPiece(player, king = false) {
  return { player, king };
}

function createInitialBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(EMPTY));

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const isDarkSquare = (row + col) % 2 === 1;

      if (!isDarkSquare) {
        continue;
      }

      if (row < 3) {
        board[row][col] = createPiece(WHITE_PLAYER);
      } else if (row > 4) {
        board[row][col] = createPiece(BLACK_PLAYER);
      }
    }
  }

  return board;
}

/**
 * Retorna movimentos válidos para uma peça.
 * Em damas brasileiras:
 * - Peças normais capturam em TODAS as 4 direções diagonais
 * - Peças normais movem-se apenas para frente (sem captura)
 * - Damas movem e capturam em todas as 4 direções, por qualquer distância
 */
function getValidMoves(board, row, col) {
  const piece = board[row]?.[col];

  if (!piece) {
    return [];
  }

  const captureMoves = getCaptureMoves(board, row, col, piece);

  if (captureMoves.length > 0) {
    return captureMoves;
  }

  const normalMoves = getNormalMoves(board, row, col, piece);
  return normalMoves;
}

/**
 * Movimentos normais (sem captura).
 * Peças normais: apenas para frente.
 * Damas: todas as 4 direções, qualquer distância.
 */
function getNormalMoves(board, row, col, piece) {
  if (piece.king) {
    return getKingMoves(board, row, col);
  }

  const directions = getForwardDirections(piece);
  const moves = [];

  directions.forEach(([rowOffset, colOffset]) => {
    const nextRow = row + rowOffset;
    const nextCol = col + colOffset;

    if (!isWithinBounds(nextRow, nextCol)) {
      return;
    }

    if (!board[nextRow][nextCol]) {
      moves.push({ row: nextRow, col: nextCol, capture: false });
    }
  });

  return moves;
}

/**
 * Movimentos de captura.
 * Tanto peças normais quanto damas capturam em TODAS as 4 direções diagonais.
 * (Regra das damas brasileiras)
 */
function getCaptureMoves(board, row, col, piece) {
  if (piece.king) {
    return getKingCaptureMoves(board, row, col, piece);
  }

  const allDirections = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  const captures = [];

  allDirections.forEach(([rowOffset, colOffset]) => {
    const midRow = row + rowOffset;
    const midCol = col + colOffset;

    if (!isWithinBounds(midRow, midCol)) {
      return;
    }

    const adjacentPiece = board[midRow][midCol];

    if (!adjacentPiece || adjacentPiece.player === piece.player) {
      return;
    }

    const landingRow = midRow + rowOffset;
    const landingCol = midCol + colOffset;

    if (!isWithinBounds(landingRow, landingCol)) {
      return;
    }

    if (!board[landingRow][landingCol]) {
      captures.push({
        row: landingRow,
        col: landingCol,
        capture: true,
        capturedRow: midRow,
        capturedCol: midCol,
      });
    }
  });

  return captures;
}

/**
 * Direções de movimento normal (sem captura).
 * Damas: 4 direções. Peças normais: apenas frente.
 */
function getForwardDirections(piece) {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }

  if (piece.player === BLACK_PLAYER) {
    return [
      [-1, -1],
      [-1, 1],
    ];
  }

  return [
    [1, -1],
    [1, 1],
  ];
}

function movePiece(board, from, to) {
  const nextBoard = cloneBoard(board);
  const movingPiece = nextBoard[from.row]?.[from.col];

  if (!movingPiece) {
    return {
      board: nextBoard,
      movedPiece: null,
      isCapture: false,
      capturedPiece: null,
    };
  }

  const rowDelta = to.row - from.row;
  const colDelta = to.col - from.col;
  const stepRow = Math.sign(rowDelta);
  const stepCol = Math.sign(colDelta);
  let capturedPiece = null;
  let capturedRow = null;
  let capturedCol = null;
  let encounteredPieces = 0;

  if (stepRow !== 0 && stepCol !== 0 && Math.abs(rowDelta) === Math.abs(colDelta)) {
    let scanRow = from.row + stepRow;
    let scanCol = from.col + stepCol;

    while (scanRow !== to.row && scanCol !== to.col) {
      const candidate = nextBoard[scanRow][scanCol];
      if (candidate) {
        encounteredPieces += 1;
        capturedPiece = candidate;
        capturedRow = scanRow;
        capturedCol = scanCol;
      }
      scanRow += stepRow;
      scanCol += stepCol;
    }
  }

  const isCapture = encounteredPieces === 1 && capturedPiece && capturedPiece.player !== movingPiece.player;

  if (isCapture && capturedRow !== null && capturedCol !== null) {
    nextBoard[capturedRow][capturedCol] = EMPTY;
  }

  nextBoard[to.row][to.col] = movingPiece;
  nextBoard[from.row][from.col] = EMPTY;

  const promotedBoard = checkPromotion(nextBoard, to.row, to.col);
  const movedPiece = promotedBoard[to.row][to.col];

  return {
    board: promotedBoard,
    movedPiece,
    isCapture,
    capturedPiece,
  };
}

function getKingMoves(board, row, col) {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const moves = [];

  directions.forEach(([rowOffset, colOffset]) => {
    let nextRow = row + rowOffset;
    let nextCol = col + colOffset;

    while (isWithinBounds(nextRow, nextCol) && !board[nextRow][nextCol]) {
      moves.push({ row: nextRow, col: nextCol, capture: false });
      nextRow += rowOffset;
      nextCol += colOffset;
    }
  });

  return moves;
}

function getKingCaptureMoves(board, row, col, piece) {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const captures = [];

  directions.forEach(([rowOffset, colOffset]) => {
    let scanRow = row + rowOffset;
    let scanCol = col + colOffset;

    while (isWithinBounds(scanRow, scanCol) && !board[scanRow][scanCol]) {
      scanRow += rowOffset;
      scanCol += colOffset;
    }

    if (!isWithinBounds(scanRow, scanCol)) {
      return;
    }

    const candidate = board[scanRow][scanCol];
    if (!candidate || candidate.player === piece.player) {
      return;
    }

    let landingRow = scanRow + rowOffset;
    let landingCol = scanCol + colOffset;

    while (isWithinBounds(landingRow, landingCol) && !board[landingRow][landingCol]) {
      captures.push({
        row: landingRow,
        col: landingCol,
        capture: true,
        capturedRow: scanRow,
        capturedCol: scanCol,
      });
      landingRow += rowOffset;
      landingCol += colOffset;
    }
  });

  return captures;
}

function checkPromotion(board, row, col) {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[row]?.[col];

  if (!piece || piece.king) {
    return nextBoard;
  }

  if (piece.player === BLACK_PLAYER && row === 0) {
    nextBoard[row][col] = createPiece(BLACK_PLAYER, true);
  }

  if (piece.player === WHITE_PLAYER && row === 7) {
    nextBoard[row][col] = createPiece(WHITE_PLAYER, true);
  }

  return nextBoard;
}

/**
 * Verifica se ainda existem capturas disponíveis para uma peça
 * específica numa posição. Usado para captura encadeada.
 */
function getCaptureMovesForPieceAt(board, row, col) {
  const piece = board[row]?.[col];
  if (!piece) {
    return [];
  }
  return getCaptureMoves(board, row, col, piece);
}

/**
 * Verifica se o jogador tem alguma captura obrigatória disponível.
 */
function playerHasCaptures(board, player) {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) {
        continue;
      }
      if (getCaptureMoves(board, row, col, piece).length > 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Retorna todas as peças de um jogador que possuem capturas disponíveis.
 */
function getPiecesWithCaptures(board, player) {
  const result = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) {
        continue;
      }
      const captures = getCaptureMoves(board, row, col, piece);
      if (captures.length > 0) {
        result.push({ row, col, moves: captures });
      }
    }
  }

  return result;
}

function checkGameOver(board, currentPlayer) {
  if (!hasAnyPiece(board, currentPlayer)) {
    return { gameOver: true, winner: getOpponent(currentPlayer) };
  }

  if (!hasAnyValidMove(board, currentPlayer)) {
    return { gameOver: true, winner: getOpponent(currentPlayer) };
  }

  const opponent = getOpponent(currentPlayer);

  if (!hasAnyPiece(board, opponent)) {
    return { gameOver: true, winner: currentPlayer };
  }

  return { gameOver: false, winner: null };
}

function hasAnyValidMove(board, player) {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) {
        continue;
      }

      if (getValidMoves(board, row, col).length > 0) {
        return true;
      }
    }
  }

  return false;
}

function hasAnyPiece(board, player) {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        return true;
      }
    }
  }

  return false;
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : EMPTY)));
}

function getOpponent(player) {
  return player === BLACK_PLAYER ? WHITE_PLAYER : BLACK_PLAYER;
}

function isWithinBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export {
  EMPTY,
  BLACK_PLAYER,
  WHITE_PLAYER,
  createInitialBoard,
  getValidMoves,
  getCaptureMoves,
  getCaptureMovesForPieceAt,
  playerHasCaptures,
  getPiecesWithCaptures,
  movePiece,
  checkPromotion,
  checkGameOver,
};
