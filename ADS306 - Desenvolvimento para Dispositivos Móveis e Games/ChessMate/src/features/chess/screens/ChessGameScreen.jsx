/**
 * ChessGameScreen.jsx
 * -----------------------------------------------------------------------------
 * Tela e orquestração de estado de uma partida de xadrez Humano x IA.
 * Esta camada cuida apenas de UI e estado (tabuleiro, relógios, seleção,
 * promoção, fim de jogo); toda a regra de xadrez vive em `chessEngine` e a
 * decisão da IA em `chessAI`. O jogador recebe aleatoriamente brancas ou pretas,
 * e o tabuleiro é orientado de acordo (com a coluna de coordenadas à esquerda).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '../../../shared/components/AppButton';
import AppHeader from '../../../shared/components/AppHeader';
import { theme } from '../../../shared/theme/theme';
import ChessPiece from '../components/ChessPiece';
import { selectBestMove } from '../logic/chessAI';
import {
  executeMove,
  getGameResultForNextPlayer,
  getPieceValue,
  getValidMovesWithContext,
} from '../logic/chessEngine';
import { COLORS, INITIAL_BOARD, PIECE_TYPES } from '../logic/boardConstants';

/** Tempo inicial de cada relógio (10 minutos por lado). */
const INITIAL_CLOCK_SECONDS = 10 * 60;

/**
 * Tempo de "pensamento" da IA (ms). Precisa ser >= 1s para que o turno da IA
 * sempre cruze um tick do relógio (granularidade de 1s) e o cronômetro do
 * adversário conte de forma visível — além de dar uma sensação mais natural.
 */
const AI_MIN_THINK_MS = 1200;
const AI_MAX_THINK_MS = 2800;

/** Rótulos das colunas (files) conforme a orientação do tabuleiro. */
const FILE_LABELS_WHITE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const FILE_LABELS_BLACK = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

/** Largura da coluna de coordenadas (números de rank) à esquerda do tabuleiro. */
const COORDINATE_COLUMN_WIDTH = 22;

/** Altura reservada para a linha de coordenadas (letras de file) sob o tabuleiro. */
const FILE_ROW_HEIGHT = 24;

/** Peças oferecidas na promoção do peão, em ordem de relevância. */
const PROMOTION_PIECES = [
  PIECE_TYPES.QUEEN,
  PIECE_TYPES.ROOK,
  PIECE_TYPES.BISHOP,
  PIECE_TYPES.KNIGHT,
];

/** Cria uma cópia profunda da posição inicial (tabuleiros são imutáveis). */
function cloneInitialBoard() {
  return JSON.parse(JSON.stringify(INITIAL_BOARD));
}

/** Estado inicial dos direitos de roque (nada movido ainda). */
function cloneInitialCastlingRights() {
  return {
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookAMoved: false,
    whiteRookHMoved: false,
    blackRookAMoved: false,
    blackRookHMoved: false,
  };
}

/** Formata segundos como mm:ss para exibição no relógio. */
function formatClock(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const remainingSeconds = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

/** Título do overlay de fim de jogo conforme o resultado. */
function getResultTitle(status) {
  if (status === 'white_wins') return 'Brancas Vencem!';
  if (status === 'black_wins') return 'Pretas Vencem!';
  return 'Empate!';
}

export default function ChessGameScreen() {
  const windowWidth = Dimensions.get('window').width;

  // Espaço real disponível para o tabuleiro (medido em runtime), para que ele
  // nunca estoure a área central invadindo os relógios ou as peças capturadas.
  const [boardAreaSize, setBoardAreaSize] = useState({ width: 0, height: 0 });

  // Limite por largura: desconta a coluna de coordenadas e as margens laterais.
  const widthBound = Math.min(windowWidth - 32 - COORDINATE_COLUMN_WIDTH, 420);
  // Limite por altura: desconta a linha de coordenadas (files) sob o tabuleiro.
  const heightBound =
    boardAreaSize.height > 0 ? boardAreaSize.height - FILE_ROW_HEIGHT : widthBound;

  const maxBoardWidth = Math.max(0, Math.min(widthBound, heightBound));
  const cellSize = maxBoardWidth / 8;

  const handleBoardAreaLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setBoardAreaSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  const boardStyle = useMemo(
    () => ({ width: maxBoardWidth, height: maxBoardWidth }),
    [maxBoardWidth]
  );
  const moveIndicatorStyle = useMemo(
    () => ({ width: cellSize * 0.24, height: cellSize * 0.24 }),
    [cellSize]
  );

  const [board, setBoard] = useState(cloneInitialBoard);
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(COLORS.WHITE);
  const [playerColor, setPlayerColor] = useState(() =>
    Math.random() > 0.5 ? COLORS.WHITE : COLORS.BLACK
  );
  const [score, setScore] = useState({ white: 0, black: 0 });
  const [gameStatus, setGameStatus] = useState('playing');
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [moveCount, setMoveCount] = useState(0);
  const [halfmoveClock, setHalfmoveClock] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [whiteClock, setWhiteClock] = useState(INITIAL_CLOCK_SECONDS);
  const [blackClock, setBlackClock] = useState(INITIAL_CLOCK_SECONDS);
  const [lastMove, setLastMove] = useState(null);
  const [castlingRights, setCastlingRights] = useState(cloneInitialCastlingRights);
  const [promotionChoice, setPromotionChoice] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  // Pré-move: lance que o jogador prepara durante a vez da IA. `premoveSelection`
  // é a peça escolhida (1º toque); `premove` é o par origem→destino já definido,
  // executado automaticamente assim que a vez volta para o jogador (se for legal).
  const [premove, setPremove] = useState(null);
  const [premoveSelection, setPremoveSelection] = useState(null);

  // Espelhos (refs) do estado para uso dentro de timers/intervals, que capturam
  // closures antigas e não enxergariam os valores mais recentes do state.
  const boardRef = useRef(board);
  const turnRef = useRef(currentTurn);
  const statusRef = useRef(gameStatus);
  // Relógio baseado em timestamp: `clockRef` guarda os segundos "commitados" de
  // cada lado no início da vez atual; `turnStartRef` marca quando a vez começou.
  // Assim o tempo real consumido até o lance é debitado com precisão.
  const clockRef = useRef({ white: INITIAL_CLOCK_SECONDS, black: INITIAL_CLOCK_SECONDS });
  const turnStartRef = useRef(Date.now());
  const lastMoveRef = useRef(lastMove);
  const castlingRef = useRef(castlingRights);
  const halfmoveClockRef = useRef(0);
  const moveHistoryRef = useRef([]);
  const clockIntervalRef = useRef(null);
  const aiRef = useRef(null);
  const playerColorRef = useRef(playerColor);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  useEffect(() => {
    turnRef.current = currentTurn;
  }, [currentTurn]);
  useEffect(() => {
    statusRef.current = gameStatus;
  }, [gameStatus]);
  useEffect(() => {
    lastMoveRef.current = lastMove;
  }, [lastMove]);
  useEffect(() => {
    castlingRef.current = castlingRights;
  }, [castlingRights]);
  useEffect(() => {
    halfmoveClockRef.current = halfmoveClock;
  }, [halfmoveClock]);
  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);
  useEffect(() => {
    playerColorRef.current = playerColor;
  }, [playerColor]);

  // Relógio de xadrez: conta o tempo REAL decorrido pelo lado que tem a vez
  // (do início da vez até o lance). Zerar encerra a partida.
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      return;
    }

    clockIntervalRef.current = setInterval(() => {
      if (statusRef.current !== 'playing') return;

      const active = turnRef.current;
      const key = active === COLORS.WHITE ? 'white' : 'black';
      const elapsed = (Date.now() - turnStartRef.current) / 1000;
      const remaining = clockRef.current[key] - elapsed;

      if (remaining <= 0) {
        clockRef.current[key] = 0;
        if (key === 'white') {
          setWhiteClock(0);
          setGameStatus('black_wins');
        } else {
          setBlackClock(0);
          setGameStatus('white_wins');
        }
        statusRef.current = key === 'white' ? 'black_wins' : 'white_wins';
        return;
      }

      const shown = Math.floor(remaining);
      if (key === 'white') {
        setWhiteClock((prev) => (prev === shown ? prev : shown));
      } else {
        setBlackClock((prev) => (prev === shown ? prev : shown));
      }
    }, 200);

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
    };
  }, [gameStatus]);

  // Limpa timers pendentes ao desmontar a tela.
  useEffect(() => {
    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (aiRef.current) clearTimeout(aiRef.current);
    };
  }, []);

  const aiColor = playerColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

  // Lances legais da peça selecionada, recalculados quando o contexto muda.
  const selectedMoves = useMemo(
    () =>
      selectedCell
        ? getValidMovesWithContext(board, selectedCell.row, selectedCell.col, {
            lastMove,
            castlingRights,
          })
        : [],
    [board, castlingRights, lastMove, selectedCell]
  );

  useEffect(() => {
    setValidMoves(selectedMoves);
  }, [selectedMoves]);

  // Atualiza os direitos de roque após um lance (rei/torre movidos ou capturados).
  const updateCastlingRights = useCallback(
    (piece, fromRow, fromCol, captured, toRow, toCol, rights) => {
      const next = { ...rights };

      if (piece?.type === PIECE_TYPES.KING) {
        if (piece.color === COLORS.WHITE) next.whiteKingMoved = true;
        else next.blackKingMoved = true;
      }

      if (piece?.type === PIECE_TYPES.ROOK) {
        if (piece.color === COLORS.WHITE && fromRow === 7 && fromCol === 0) next.whiteRookAMoved = true;
        if (piece.color === COLORS.WHITE && fromRow === 7 && fromCol === 7) next.whiteRookHMoved = true;
        if (piece.color === COLORS.BLACK && fromRow === 0 && fromCol === 0) next.blackRookAMoved = true;
        if (piece.color === COLORS.BLACK && fromRow === 0 && fromCol === 7) next.blackRookHMoved = true;
      }

      if (captured?.type === PIECE_TYPES.ROOK) {
        if (captured.color === COLORS.WHITE && toRow === 7 && toCol === 0) next.whiteRookAMoved = true;
        if (captured.color === COLORS.WHITE && toRow === 7 && toCol === 7) next.whiteRookHMoved = true;
        if (captured.color === COLORS.BLACK && toRow === 0 && toCol === 0) next.blackRookAMoved = true;
        if (captured.color === COLORS.BLACK && toRow === 0 && toCol === 7) next.blackRookHMoved = true;
      }

      return next;
    },
    []
  );

  // Aplica um lance: atualiza tabuleiro, relógios, capturas, regras de empate e
  // verifica o resultado da partida para o próximo jogador.
  const finalizeMove = useCallback(
    (color, fromRow, fromCol, move) => {
      const currentBoard = boardRef.current;
      const piece = currentBoard[fromRow][fromCol];
      if (!piece) return;

      // Debita o tempo real consumido por quem jogou e reinicia o cronômetro
      // para o próximo lado (a vez do adversário começa agora).
      const moverKey = color === COLORS.WHITE ? 'white' : 'black';
      const now = Date.now();
      clockRef.current[moverKey] = Math.max(
        0,
        clockRef.current[moverKey] - (now - turnStartRef.current) / 1000
      );
      turnStartRef.current = now;
      const moverShown = Math.floor(clockRef.current[moverKey]);
      if (moverKey === 'white') {
        setWhiteClock(moverShown);
      } else {
        setBlackClock(moverShown);
      }

      const captured =
        move.special === 'en_passant' && move.capture
          ? currentBoard[move.capture.row][move.capture.col]
          : currentBoard[move.row][move.col];

      const nextBoard = executeMove(currentBoard, fromRow, fromCol, move);
      const isCapture = Boolean(captured);
      const nextTurn = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

      const nextRights = updateCastlingRights(
        piece,
        fromRow,
        fromCol,
        captured,
        move.row,
        move.col,
        castlingRef.current
      );
      const nextLastMove = {
        fromRow,
        fromCol,
        toRow: move.row,
        toCol: move.col,
        piece: { type: piece.type, color: piece.color },
      };

      // Relógio dos 50 lances: zera em lance de peão ou captura.
      const isPawnMove = piece.type === PIECE_TYPES.PAWN || move.promotion;
      const nextHalfmove = isPawnMove || isCapture ? 0 : halfmoveClockRef.current + 1;

      // Chave de posição para detectar repetição tripla.
      const positionKey = JSON.stringify({
        board: nextBoard,
        turn: nextTurn,
        castlingRights: nextRights,
      });
      const nextHistory = [...moveHistoryRef.current, positionKey];

      // Empates por repetição tripla ou regra dos 50 lances (100 meios-lances).
      const occurrences = nextHistory.filter((entry) => entry === positionKey).length;
      if (occurrences >= 3 || nextHalfmove >= 100) {
        boardRef.current = nextBoard;
        lastMoveRef.current = nextLastMove;
        castlingRef.current = nextRights;
        halfmoveClockRef.current = nextHalfmove;
        moveHistoryRef.current = nextHistory;

        setBoard(nextBoard);
        setLastMove(nextLastMove);
        setCastlingRights(nextRights);
        setHalfmoveClock(nextHalfmove);
        setMoveHistory(nextHistory);
        setGameStatus('draw');
        statusRef.current = 'draw';
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }

      // Verifica xeque-mate / afogamento / material insuficiente para o próximo a jogar.
      const gameResult = getGameResultForNextPlayer(nextBoard, nextTurn, {
        lastMove: nextLastMove,
        castlingRights: nextRights,
      });

      // Sincroniza refs (para timers) e state (para render).
      boardRef.current = nextBoard;
      lastMoveRef.current = nextLastMove;
      castlingRef.current = nextRights;
      turnRef.current = nextTurn;
      halfmoveClockRef.current = nextHalfmove;
      moveHistoryRef.current = nextHistory;

      setBoard(nextBoard);
      setSelectedCell(null);
      setValidMoves([]);
      setMoveCount((value) => value + 1);
      setLastMove(nextLastMove);
      setCastlingRights(nextRights);
      setCurrentTurn(nextTurn);
      setHalfmoveClock(nextHalfmove);
      setMoveHistory(nextHistory);

      if (isCapture) {
        setCapturedPieces((prev) => ({
          ...prev,
          [color]: [...prev[color], captured],
        }));
        setScore((prev) => ({
          ...prev,
          [color]: prev[color] + getPieceValue(captured),
        }));
      }

      if (gameResult) {
        statusRef.current = gameResult;
        setGameStatus(gameResult);
      }
    },
    [updateCastlingRights]
  );

  const handleCellPress = useCallback(
    (row, col) => {
      if (statusRef.current !== 'playing') return;

      const piece = board[row][col];
      const activeColor = playerColorRef.current;

      // Vez do adversário → preparar/cancelar um PRÉ-MOVE.
      if (turnRef.current !== activeColor) {
        if (premoveSelection) {
          // Toque na mesma peça cancela a seleção.
          if (premoveSelection.row === row && premoveSelection.col === col) {
            setPremoveSelection(null);
            return;
          }
          // Toque em outra peça própria troca a seleção.
          if (piece?.color === activeColor) {
            setPremoveSelection({ row, col });
            return;
          }
          // Caso contrário, define o destino do pré-move.
          setPremove({ from: premoveSelection, to: { row, col } });
          setPremoveSelection(null);
          return;
        }

        // Sem seleção em curso: selecionar peça própria (limpando pré-move antigo)
        // ou cancelar um pré-move já definido ao tocar fora.
        if (piece?.color === activeColor) {
          setPremove(null);
          setPremoveSelection({ row, col });
        } else if (premove) {
          setPremove(null);
        }
        return;
      }

      if (!selectedCell) {
        if (piece?.color === activeColor) setSelectedCell({ row, col });
        return;
      }

      if (selectedCell.row === row && selectedCell.col === col) {
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }

      const movesToSquare = validMoves.filter((m) => m.row === row && m.col === col);
      if (movesToSquare.length === 0) {
        if (piece?.color === activeColor) {
          setSelectedCell({ row, col });
        } else {
          setSelectedCell(null);
          setValidMoves([]);
        }
        return;
      }

      if (movesToSquare.length === 1) {
        finalizeMove(activeColor, selectedCell.row, selectedCell.col, movesToSquare[0]);
        return;
      }

      // Vários lances para a mesma casa => promoção: pede a escolha da peça.
      setPromotionChoice({
        fromRow: selectedCell.row,
        fromCol: selectedCell.col,
        moves: movesToSquare,
        color: activeColor,
      });
      setSelectedCell(null);
    },
    [board, finalizeMove, selectedCell, validMoves, premove, premoveSelection]
  );

  // Executa o pré-move assim que a vez volta ao jogador, se ainda for legal.
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (currentTurn !== playerColor) return;

    // Ao voltar a vez, uma seleção de pré-move pendente (sem destino) perde o sentido.
    setPremoveSelection(null);
    if (!premove) return;

    const { from, to } = premove;
    const fromPiece = board[from.row][from.col];

    setPremove(null);

    // Descarta se a peça de origem não é mais do jogador (capturada/ocupada).
    if (fromPiece?.color !== playerColor) return;

    const moves = getValidMovesWithContext(board, from.row, from.col, {
      lastMove,
      castlingRights,
    });
    const matching = moves.filter((m) => m.row === to.row && m.col === to.col);

    if (matching.length === 0) return; // tornou-se ilegal → descartar

    // Promoção via pré-move é resolvida automaticamente para dama.
    const chosen = matching.find((m) => m.promotion === PIECE_TYPES.QUEEN) || matching[0];
    finalizeMove(playerColor, from.row, from.col, chosen);
  }, [currentTurn, gameStatus, premove, playerColor, board, lastMove, castlingRights, finalizeMove]);

  // Auto-promoção: se o jogador não escolher em 5s, promove a dama.
  useEffect(() => {
    if (!promotionChoice) return;
    const timer = setTimeout(() => {
      const queenMove =
        promotionChoice.moves.find((m) => m.promotion === PIECE_TYPES.QUEEN) ||
        promotionChoice.moves[0];
      if (queenMove) {
        finalizeMove(promotionChoice.color, promotionChoice.fromRow, promotionChoice.fromCol, queenMove);
      }
      setPromotionChoice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [promotionChoice, finalizeMove]);

  // Turno da IA: delega a escolha do lance ao módulo chessAI (negamax + alfa-beta).
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (currentTurn !== aiColor) return;

    setAiThinking(true);

    // Tempo de reflexão variável (>= 1s) para o relógio da IA contar de verdade.
    const thinkTime =
      AI_MIN_THINK_MS + Math.random() * (AI_MAX_THINK_MS - AI_MIN_THINK_MS);

    aiRef.current = setTimeout(() => {
      if (statusRef.current !== 'playing' || turnRef.current !== aiColor) {
        setAiThinking(false);
        return;
      }

      const bestMove = selectBestMove(boardRef.current, aiColor, {
        lastMove: lastMoveRef.current,
        castlingRights: castlingRef.current,
      });

      if (bestMove) {
        finalizeMove(aiColor, bestMove.fromRow, bestMove.fromCol, bestMove.move);
      }
      setAiThinking(false);
    }, thinkTime);

    return () => {
      if (aiRef.current) {
        clearTimeout(aiRef.current);
        aiRef.current = null;
      }
    };
  }, [currentTurn, gameStatus, aiColor, finalizeMove]);

  const resetGame = useCallback(() => {
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    if (aiRef.current) clearTimeout(aiRef.current);

    const freshBoard = cloneInitialBoard();
    const freshRights = cloneInitialCastlingRights();
    const newPlayerColor = Math.random() > 0.5 ? COLORS.WHITE : COLORS.BLACK;

    boardRef.current = freshBoard;
    turnRef.current = COLORS.WHITE; // brancas sempre começam no xadrez
    statusRef.current = 'playing';
    clockRef.current = { white: INITIAL_CLOCK_SECONDS, black: INITIAL_CLOCK_SECONDS };
    turnStartRef.current = Date.now();
    lastMoveRef.current = null;
    castlingRef.current = freshRights;
    halfmoveClockRef.current = 0;
    moveHistoryRef.current = [];
    playerColorRef.current = newPlayerColor;

    setBoard(freshBoard);
    setSelectedCell(null);
    setValidMoves([]);
    setPremove(null);
    setPremoveSelection(null);
    setCurrentTurn(COLORS.WHITE);
    setPlayerColor(newPlayerColor);
    setScore({ white: 0, black: 0 });
    setGameStatus('playing');
    setCapturedPieces({ white: [], black: [] });
    setMoveCount(0);
    setWhiteClock(INITIAL_CLOCK_SECONDS);
    setBlackClock(INITIAL_CLOCK_SECONDS);
    setLastMove(null);
    setCastlingRights(freshRights);
    setHalfmoveClock(0);
    setMoveHistory([]);
    setPromotionChoice(null);
    setAiThinking(false);
  }, []);

  // Orientação do tabuleiro: se o jogador é das pretas, o tabuleiro é espelhado.
  const isFlipped = playerColor === COLORS.BLACK;
  const fileLabels = isFlipped ? FILE_LABELS_BLACK : FILE_LABELS_WHITE;
  const rankNumbers = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  const renderCell = useCallback(
    (displayRi, displayCi) => {
      // Converte coordenadas de exibição em coordenadas reais do tabuleiro.
      const boardRow = isFlipped ? 7 - displayRi : displayRi;
      const boardCol = isFlipped ? 7 - displayCi : displayCi;

      const cellPiece = board[boardRow][boardCol];
      const selectedPiece = selectedCell ? board[selectedCell.row][selectedCell.col] : null;
      const isSelected = selectedCell?.row === boardRow && selectedCell?.col === boardCol;
      const targetMove = validMoves.find((m) => m.row === boardRow && m.col === boardCol);
      const isValidTarget = Boolean(targetMove);
      const isCaptureTarget =
        isValidTarget &&
        (targetMove.special === 'en_passant' ||
          (Boolean(cellPiece) && Boolean(selectedPiece) && cellPiece.color !== selectedPiece.color));

      // Realce do pré-move (peça escolhida e/ou origem→destino preparados).
      const isPremoveSquare =
        (premoveSelection?.row === boardRow && premoveSelection?.col === boardCol) ||
        (premove &&
          ((premove.from.row === boardRow && premove.from.col === boardCol) ||
            (premove.to.row === boardRow && premove.to.col === boardCol)));

      // Realce do último lance (origem e destino).
      const isLastMoveSquare =
        Boolean(lastMove) &&
        ((lastMove.fromRow === boardRow && lastMove.fromCol === boardCol) ||
          (lastMove.toRow === boardRow && lastMove.toCol === boardCol));

      const backgroundColor = isSelected
        ? theme.colors.boardSelected
        : isPremoveSquare
        ? theme.colors.boardPremove
        : isLastMoveSquare
        ? theme.colors.boardLastMove
        : (boardRow + boardCol) % 2 === 0
        ? theme.colors.boardLight
        : theme.colors.boardDark;

      return (
        <TouchableOpacity
          key={`${displayRi}-${displayCi}`}
          activeOpacity={0.88}
          onPress={() => handleCellPress(boardRow, boardCol)}
          style={[
            { width: cellSize, height: cellSize, backgroundColor },
            styles.cell,
            isCaptureTarget && styles.captureCell,
          ]}
        >
          {isValidTarget && <View style={[styles.moveIndicator, moveIndicatorStyle]} />}
          {cellPiece && <ChessPiece piece={cellPiece} size={cellSize * 0.75} />}
        </TouchableOpacity>
      );
    },
    [
      board,
      cellSize,
      handleCellPress,
      isFlipped,
      moveIndicatorStyle,
      selectedCell,
      validMoves,
      premove,
      premoveSelection,
      lastMove,
    ]
  );

  // Relógio de cima = adversário (IA); de baixo = jogador.
  const topColor = playerColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  const bottomColor = playerColor;
  const topClock = topColor === COLORS.WHITE ? whiteClock : blackClock;
  const bottomClock = bottomColor === COLORS.WHITE ? whiteClock : blackClock;
  const topLabel = topColor === COLORS.WHITE ? '♔ Brancas' : '♚ Pretas';
  const bottomLabel = bottomColor === COLORS.WHITE ? '♔ Brancas' : '♚ Pretas';
  const topCritical = topClock < 60;
  const bottomCritical = bottomClock < 60;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Cabeçalho do app (identidade ChessMate) + ação de reiniciar */}
      <View style={styles.topBar}>
        <AppHeader title="ChessMate" subtitle="Humano vs. Máquina" style={styles.appHeader} />
        <TouchableOpacity
          onPress={resetGame}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar partida"
          style={styles.restartButton}
        >
          <Text style={styles.restartGlyph}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Cabeçalho com os relógios e o contador de jogadas */}
      <View style={styles.header}>
        <View
          style={[
            styles.clockBox,
            currentTurn === topColor && gameStatus === 'playing' && styles.clockActive,
          ]}
        >
          <Text style={styles.side}>{topLabel} (IA)</Text>
          <Text style={[styles.time, topCritical && styles.timeCrit]}>
            {formatClock(topClock)}
          </Text>
        </View>

        <View style={styles.midBox}>
          <Text style={styles.moveNum}>Rodada {Math.floor(moveCount / 2) + 1}</Text>
          {aiThinking && <Text style={styles.thinkingText}>Pensando...</Text>}
        </View>

        <View
          style={[
            styles.clockBox,
            currentTurn === bottomColor && gameStatus === 'playing' && styles.clockActive,
          ]}
        >
          <Text style={styles.side}>{bottomLabel} (Você)</Text>
          <Text style={[styles.time, bottomCritical && styles.timeCrit]}>
            {formatClock(bottomClock)}
          </Text>
        </View>
      </View>

      {/* Tabuleiro centralizado, com coluna de ranks à esquerda e files abaixo */}
      <View style={styles.boardArea} onLayout={handleBoardAreaLayout}>
        <View style={styles.boardRow}>
          <View style={styles.rankColumn}>
            {rankNumbers.map((rank, i) => (
              <Text key={`rank-${i}`} style={[styles.rankLabel, { height: cellSize }]}>
                {rank}
              </Text>
            ))}
          </View>

          <View>
            <View style={boardStyle}>
              {Array.from({ length: 8 }, (_, ri) => (
                <View key={`r${ri}`} style={{ flexDirection: 'row', height: cellSize }}>
                  {Array.from({ length: 8 }, (_, ci) => renderCell(ri, ci))}
                </View>
              ))}
              {gameStatus !== 'playing' && (
                <View style={[styles.endOverlay, boardStyle]}>
                  <Text style={styles.endTitle}>{getResultTitle(gameStatus)}</Text>
                  <Text style={styles.endScore}>{`${score.white} : ${score.black}`}</Text>
                  <AppButton
                    title="Jogar Novamente"
                    onPress={resetGame}
                    style={styles.endButton}
                  />
                </View>
              )}
            </View>

            <View style={styles.fileRow}>
              <View style={{ width: COORDINATE_COLUMN_WIDTH }} />
              {fileLabels.map((file, i) => (
                <Text key={`file-${i}`} style={[styles.fileLabel, { width: cellSize }]}>
                  {file}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Rodapé: peças capturadas */}
      <View style={styles.footer}>
        <View style={styles.capturedBox}>
          <Text style={styles.capturedLabel}>Capturadas</Text>
          <View style={styles.capturedRow}>
            <Text style={styles.capturedSide}>{bottomLabel}: </Text>
            {capturedPieces[bottomColor]?.length > 0 ? (
              capturedPieces[bottomColor].map((p, i) => (
                <View key={`p-${i}`} style={styles.capturedPiece}>
                  <ChessPiece piece={p} size={20} />
                </View>
              ))
            ) : (
              <Text style={styles.noCaptured}>—</Text>
            )}
          </View>
          <View style={styles.capturedRow}>
            <Text style={styles.capturedSide}>{topLabel}: </Text>
            {capturedPieces[topColor]?.length > 0 ? (
              capturedPieces[topColor].map((p, i) => (
                <View key={`o-${i}`} style={styles.capturedPiece}>
                  <ChessPiece piece={p} size={20} />
                </View>
              ))
            ) : (
              <Text style={styles.noCaptured}>—</Text>
            )}
          </View>
        </View>
      </View>

      {/* Modal de promoção do peão */}
      {promotionChoice && (
        <View style={styles.promotionOverlay}>
          <View style={styles.promotionMenu}>
            <Text style={styles.promotionTitle}>Promover para:</Text>
            <View style={styles.promotionRow}>
              {PROMOTION_PIECES.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const move = promotionChoice.moves.find((m) => m.promotion === type);
                    if (move) {
                      finalizeMove(
                        promotionChoice.color,
                        promotionChoice.fromRow,
                        promotionChoice.fromCol,
                        move
                      );
                      setPromotionChoice(null);
                    }
                  }}
                  style={styles.promotionButton}
                >
                  <ChessPiece piece={{ type, color: promotionChoice.color }} size={44} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingBottom: theme.spacing.xs,
  },
  topBar: {
    width: '100%',
    justifyContent: 'center',
  },
  appHeader: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  restartButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.sm,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
    ...theme.shadow.card,
  },
  restartGlyph: {
    color: theme.colors.emerald,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    marginTop: -1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 8,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  clockBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    ...theme.shadow.card,
  },
  clockActive: {
    borderColor: theme.colors.gold,
    backgroundColor: '#fffaf0',
  },
  side: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  time: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  timeCrit: {
    color: theme.colors.danger,
  },
  midBox: {
    flex: 1,
    backgroundColor: theme.colors.emerald,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  moveNum: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.serif,
    fontSize: 14,
    fontWeight: '700',
  },
  thinkingText: {
    color: theme.colors.goldSoft,
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Área central que centraliza o tabuleiro vertical e horizontalmente.
  boardArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardRow: {
    flexDirection: 'row',
  },
  rankColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: COORDINATE_COLUMN_WIDTH,
  },
  rankLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    width: COORDINATE_COLUMN_WIDTH,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  fileLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(43, 36, 27, 0.08)',
  },
  moveIndicator: {
    backgroundColor: theme.colors.boardMove,
    borderRadius: 999,
    position: 'absolute',
  },
  captureCell: {
    borderColor: theme.colors.boardCapture,
    borderWidth: 2.5,
  },
  endOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endTitle: {
    color: theme.colors.goldSoft,
    fontFamily: theme.fonts.serif,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  endScore: {
    color: theme.colors.surface,
    fontSize: 16,
    marginTop: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  endButton: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
    width: '70%',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  capturedBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 12,
    marginBottom: theme.spacing.xs,
    alignItems: 'center',
    ...theme.shadow.card,
  },
  capturedLabel: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  capturedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    marginBottom: 4,
  },
  capturedSide: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  capturedPiece: {
    width: 24,
    height: 24,
  },
  noCaptured: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  promotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  promotionMenu: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    alignItems: 'center',
  },
  promotionTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  promotionRow: {
    flexDirection: 'row',
  },
  promotionButton: {
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
});
