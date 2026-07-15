import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../shared/components/Button';
import Header from '../../../shared/components/Header';
import NeonGradient from '../../../shared/components/NeonGradient';
import palette, { gradients } from '../../../shared/theme/colors';
import dimensions from '../../../shared/theme/dimensions';
import { isTouchInsideBoundingBox } from '../../../shared/utils/collisionDetection';
import {
  BLACK_PLAYER,
  WHITE_PLAYER,
  checkGameOver,
  createInitialBoard,
  getValidMoves,
  getCaptureMovesForPieceAt,
  playerHasCaptures,
  getPiecesWithCaptures,
  movePiece,
} from '../logic/checkersEngine';

const TURN_LIMIT_SECONDS = 30;
const MOVE_ANIMATION_DURATION = 260;
const AI_MOVE_DELAY = 650;
const STARTING_PLAYER = WHITE_PLAYER;
const BOARD_BORDER_WIDTH = 3;

function createInitialPlayers() {
  const humanPlayer = Math.random() < 0.5 ? BLACK_PLAYER : WHITE_PLAYER;
  const aiPlayer = humanPlayer === BLACK_PLAYER ? WHITE_PLAYER : BLACK_PLAYER;
  return { humanPlayer, aiPlayer };
}

function getOpponentPlayer(player) {
  return player === BLACK_PLAYER ? WHITE_PLAYER : BLACK_PLAYER;
}

function GameScreen() {
  const initialPlayers = useMemo(() => createInitialPlayers(), []);
  const [board, setBoard] = useState(() => createInitialBoard());
  const [humanPlayer, setHumanPlayer] = useState(initialPlayers.humanPlayer);
  const [aiPlayer, setAiPlayer] = useState(initialPlayers.aiPlayer);
  const [currentPlayer, setCurrentPlayer] = useState(STARTING_PLAYER);
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [blackCaptured, setBlackCaptured] = useState(0);
  const [whiteCaptured, setWhiteCaptured] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState(TURN_LIMIT_SECONDS);
  const [selectionPulse, setSelectionPulse] = useState(1);
  const [movingPiece, setMovingPiece] = useState(null);
  const [chainCapture, setChainCapture] = useState(null);

  const boardRef = useRef(board);
  const currentPlayerRef = useRef(STARTING_PLAYER);
  const selectedCellRef = useRef(selectedCell);
  const movingPieceRef = useRef(movingPiece);
  const gameOverRef = useRef(gameOver);
  const chainCaptureRef = useRef(null);
  const turnDeadlineRef = useRef(getNow() + TURN_LIMIT_SECONDS * 1000);
  const timeoutHandledRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const aiMoveTimeoutRef = useRef(null);

  const cellSize = useMemo(() => {
    if (!boardWidth) {
      return (dimensions.screenWidth * 0.92 - BOARD_BORDER_WIDTH * 2) / 8;
    }
    return (boardWidth - BOARD_BORDER_WIDTH * 2) / 8;
  }, [boardWidth]);

  const isBoardFlipped = humanPlayer === WHITE_PLAYER;

  const mapDisplayToBoard = useCallback(
    (row, col) => (isBoardFlipped ? { row: 7 - row, col: 7 - col } : { row, col }),
    [isBoardFlipped]
  );

  const mapBoardToDisplay = useCallback(
    (row, col) => (isBoardFlipped ? { row: 7 - row, col: 7 - col } : { row, col }),
    [isBoardFlipped]
  );

  const resetTurnClock = useCallback((timestamp = getNow()) => {
    turnDeadlineRef.current = timestamp + TURN_LIMIT_SECONDS * 1000;
    timeoutHandledRef.current = false;
    setTurnSecondsLeft(TURN_LIMIT_SECONDS);
  }, []);

  const resetGame = useCallback(() => {
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    const nextPlayers = createInitialPlayers();
    const initialBoard = createInitialBoard();
    boardRef.current = initialBoard;
    currentPlayerRef.current = STARTING_PLAYER;
    selectedCellRef.current = null;
    movingPieceRef.current = null;
    gameOverRef.current = false;
    chainCaptureRef.current = null;

    setBoard(initialBoard);
    setHumanPlayer(nextPlayers.humanPlayer);
    setAiPlayer(nextPlayers.aiPlayer);
    setCurrentPlayer(STARTING_PLAYER);
    setSelectedCell(null);
    setValidMoves([]);
    setBlackCaptured(0);
    setWhiteCaptured(0);
    setGameOver(false);
    setWinner(null);
    setMovingPiece(null);
    setSelectionPulse(1);
    setChainCapture(null);
    resetTurnClock();
  }, [resetTurnClock]);

  const getAllMovesForPlayer = useCallback((boardState, player) => {
    const moves = [];
    const captureMoves = [];

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const piece = boardState[row][col];
        if (!piece || piece.player !== player) {
          continue;
        }

        const pieceMoves = getValidMoves(boardState, row, col);
        pieceMoves.forEach((move) => {
          const entry = { from: { row, col }, to: { row: move.row, col: move.col }, capture: move.capture };
          if (move.capture) {
            captureMoves.push(entry);
          } else {
            moves.push(entry);
          }
        });
      }
    }

    return captureMoves.length > 0 ? captureMoves : moves;
  }, []);

  const finalizeTurn = useCallback(
    (nextPlayer, timestamp) => {
      currentPlayerRef.current = nextPlayer;
      chainCaptureRef.current = null;
      setChainCapture(null);
      setCurrentPlayer(nextPlayer);
      setSelectedCell(null);
      selectedCellRef.current = null;
      setValidMoves([]);
      resetTurnClock(timestamp);

      const gameState = checkGameOver(boardRef.current, nextPlayer);
      if (gameState.gameOver) {
        gameOverRef.current = true;
        setGameOver(true);
        setWinner(gameState.winner);
      }
    },
    [resetTurnClock]
  );

  const startMoveAnimation = useCallback((piece, from, to, timestamp) => {
    const animatedPiece = {
      piece,
      from,
      to,
      startTime: timestamp,
      duration: MOVE_ANIMATION_DURATION,
      progress: 0,
    };
    movingPieceRef.current = animatedPiece;
    setMovingPiece(animatedPiece);
  }, []);

  const applyMove = useCallback(
    (origin, destination, timestamp) => {
      const moveResult = movePiece(boardRef.current, origin, destination);
      const nextBoard = moveResult.board;

      boardRef.current = nextBoard;
      setBoard(nextBoard);
      setSelectedCell(null);
      selectedCellRef.current = null;
      setValidMoves([]);

      if (moveResult.isCapture) {
        if (currentPlayerRef.current === BLACK_PLAYER) {
          setBlackCaptured((previous) => previous + 1);
        } else {
          setWhiteCaptured((previous) => previous + 1);
        }
      }

      if (moveResult.movedPiece) {
        startMoveAnimation(moveResult.movedPiece, origin, destination, timestamp);
      }

      // Captura encadeada: após uma captura, verificar se a mesma peça pode capturar novamente
      if (moveResult.isCapture) {
        const followUpCaptures = getCaptureMovesForPieceAt(nextBoard, destination.row, destination.col);
        if (followUpCaptures.length > 0) {
          const forcedCell = { row: destination.row, col: destination.col };
          chainCaptureRef.current = forcedCell;
          setChainCapture(forcedCell);
          setSelectedCell(forcedCell);
          selectedCellRef.current = forcedCell;
          setValidMoves(followUpCaptures);

          // Se é a vez da IA, ela deve continuar capturando
          if (currentPlayerRef.current === aiPlayer) {
            if (aiMoveTimeoutRef.current) {
              clearTimeout(aiMoveTimeoutRef.current);
            }
            aiMoveTimeoutRef.current = setTimeout(() => {
              if (gameOverRef.current) return;
              const choice = followUpCaptures[Math.floor(Math.random() * followUpCaptures.length)];
              applyMove(forcedCell, { row: choice.row, col: choice.col }, getNow());
            }, AI_MOVE_DELAY);
          }
          return;
        }
      }

      // Sem mais capturas encadeadas, finalizar turno
      chainCaptureRef.current = null;
      setChainCapture(null);
      const nextPlayer = getOpponentPlayer(currentPlayerRef.current);
      const gameState = checkGameOver(nextBoard, nextPlayer);

      if (gameState.gameOver) {
        gameOverRef.current = true;
        setGameOver(true);
        setWinner(gameState.winner);
        return;
      }

      finalizeTurn(nextPlayer, timestamp);
    },
    [aiPlayer, finalizeTurn, startMoveAnimation]
  );

  const handleBoardTouch = useCallback(
    (event) => {
      if (gameOverRef.current || currentPlayerRef.current !== humanPlayer) {
        return;
      }

      const { locationX, locationY } = event.nativeEvent;
      const displayRow = Math.floor(locationY / cellSize);
      const displayCol = Math.floor(locationX / cellSize);

      if (displayRow < 0 || displayRow > 7 || displayCol < 0 || displayCol > 7) {
        return;
      }

      const boxX = displayCol * cellSize;
      const boxY = displayRow * cellSize;

      if (!isTouchInsideBoundingBox(locationX, locationY, boxX, boxY, cellSize, cellSize)) {
        return;
      }

      const { row, col } = mapDisplayToBoard(displayRow, displayCol);
      const currentBoard = boardRef.current;
      const touchedPiece = currentBoard[row][col];

      // Se estamos em captura encadeada, só podemos mover a peça obrigatória
      if (chainCaptureRef.current) {
        const forcedCell = chainCaptureRef.current;

        // Se clicou num destino válido
        const chosenMove = validMoves.find((move) => move.row === row && move.col === col);
        if (chosenMove) {
          applyMove(forcedCell, { row, col }, getNow());
          return;
        }

        // Não permitir selecionar outra peça durante captura encadeada
        return;
      }

      // Verificar se o jogador tem capturas obrigatórias
      const mustCapture = playerHasCaptures(currentBoard, currentPlayerRef.current);

      // Se já existe uma peça selecionada, tentar mover
      if (selectedCellRef.current) {
        const chosenMove = validMoves.find((move) => move.row === row && move.col === col);

        if (chosenMove) {
          const origin = selectedCellRef.current;
          applyMove(origin, { row, col }, getNow());
          return;
        }
      }

      // Tentar selecionar uma peça
      if (touchedPiece && touchedPiece.player === currentPlayerRef.current) {
        // Se captura é obrigatória, só permitir selecionar peças que podem capturar
        if (mustCapture) {
          const pieceCaps = getCaptureMovesForPieceAt(currentBoard, row, col);
          if (pieceCaps.length === 0) {
            // Esta peça não pode capturar, não permitir seleção
            return;
          }
          const selected = { row, col };
          setSelectedCell(selected);
          selectedCellRef.current = selected;
          setValidMoves(pieceCaps);
          return;
        }

        // Sem captura obrigatória, mostrar todos os movimentos válidos
        const moves = getValidMoves(currentBoard, row, col);
        const selected = { row, col };
        setSelectedCell(selected);
        selectedCellRef.current = selected;
        setValidMoves(moves);
        return;
      }

      // Clicou em célula vazia sem destino válido - deselecionar
      setSelectedCell(null);
      selectedCellRef.current = null;
      setValidMoves([]);
    },
    [applyMove, cellSize, humanPlayer, mapDisplayToBoard, validMoves]
  );

  const handleTimeout = useCallback(
    (timestamp) => {
      if (timeoutHandledRef.current || gameOverRef.current) {
        return;
      }

      timeoutHandledRef.current = true;
      const nextPlayer = getOpponentPlayer(currentPlayerRef.current);
      const gameState = checkGameOver(boardRef.current, nextPlayer);

      if (gameState.gameOver) {
        gameOverRef.current = true;
        setGameOver(true);
        setWinner(currentPlayerRef.current);
        return;
      }

      finalizeTurn(nextPlayer, timestamp);
    },
    [finalizeTurn]
  );

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp = getNow()) => {
      if (!gameOverRef.current) {
        const remainingMilliseconds = Math.max(0, turnDeadlineRef.current - timestamp);
        const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);

        setTurnSecondsLeft((previous) => (previous === remainingSeconds ? previous : remainingSeconds));

        if (selectedCellRef.current) {
          const pulse = 0.72 + 0.28 * Math.sin(timestamp / 120);
          setSelectionPulse(pulse);
        } else {
          setSelectionPulse(1);
        }

        if (movingPieceRef.current) {
          const progress = Math.min(
            1,
            (timestamp - movingPieceRef.current.startTime) / movingPieceRef.current.duration
          );
          movingPieceRef.current = { ...movingPieceRef.current, progress };
          setMovingPiece(movingPieceRef.current);

          if (progress >= 1) {
            movingPieceRef.current = null;
            setMovingPiece(null);
          }
        }

        if (remainingSeconds <= 0 && !timeoutHandledRef.current) {
          handleTimeout(timestamp);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [handleTimeout]);

  // Reset turn clock when player changes
  useEffect(() => {
    resetTurnClock();
  }, [currentPlayer, resetTurnClock]);

  // IA move
  useEffect(() => {
    if (gameOverRef.current || currentPlayer !== aiPlayer) {
      return undefined;
    }

    // Se estamos em captura encadeada da IA, o applyMove já agenda o próximo
    if (chainCaptureRef.current) {
      return undefined;
    }

    const availableMoves = getAllMovesForPlayer(boardRef.current, aiPlayer);
    if (availableMoves.length === 0) {
      const gameState = checkGameOver(boardRef.current, aiPlayer);
      if (gameState.gameOver) {
        gameOverRef.current = true;
        setGameOver(true);
        setWinner(gameState.winner);
      }
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (gameOverRef.current) return;
      const choice = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      applyMove(choice.from, choice.to, getNow());
    }, AI_MOVE_DELAY);

    aiMoveTimeoutRef.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [aiPlayer, applyMove, currentPlayer, getAllMovesForPlayer]);

  const renderCells = () => {
    const rows = [];

    for (let row = 0; row < 8; row += 1) {
      const cells = [];

      for (let col = 0; col < 8; col += 1) {
        const boardCell = mapDisplayToBoard(row, col);
        const isDark = (row + col) % 2 === 1;
        const isSelected = selectedCell?.row === boardCell.row && selectedCell?.col === boardCell.col;
        const isMoveTarget = validMoves.some(
          (move) => move.row === boardCell.row && move.col === boardCell.col
        );

        let bgColor;
        if (isSelected) {
          bgColor = palette.selected;
        } else if (isMoveTarget) {
          bgColor = palette.validMove;
        } else if (isDark) {
          bgColor = palette.boardDark;
        } else {
          bgColor = palette.boardLight;
        }

        cells.push(
          <View
            key={`cell-${row}-${col}`}
            pointerEvents="none"
            style={[
              styles.cell,
              {
                backgroundColor: bgColor,
              },
            ]}
          />
        );
      }

      rows.push(
        <View key={`row-${row}`} pointerEvents="none" style={styles.row}>
          {cells}
        </View>
      );
    }

    return rows;
  };

  const renderPieces = () => {
    const pieces = [];

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const piece = board[row][col];
        const isSelected = selectedCell?.row === row && selectedCell?.col === col;
        const isAnimatingAway = movingPiece && movingPiece.from.row === row && movingPiece.from.col === col;

        const displayPos = mapBoardToDisplay(row, col);

        if (!piece || isAnimatingAway) {
          continue;
        }

        pieces.push(
          <View
            key={`piece-${row}-${col}`}
            pointerEvents="none"
            style={[
              styles.piece,
              {
                left: displayPos.col * cellSize + cellSize * 0.14,
                top: displayPos.row * cellSize + cellSize * 0.14,
                width: cellSize * 0.72,
                height: cellSize * 0.72,
                opacity: isSelected ? selectionPulse : 1,
                transform: isSelected ? [{ scale: 0.94 + selectionPulse * 0.08 }] : [{ scale: 1 }],
                backgroundColor: piece.player === BLACK_PLAYER ? palette.magenta : palette.accent,
                borderColor: piece.player === BLACK_PLAYER ? '#f0abfc' : '#a5f3fc',
                shadowColor: piece.player === BLACK_PLAYER ? palette.magenta : palette.accent,
                borderWidth: 2,
              },
            ]}
          >
            {piece.king ? <Text style={styles.kingText}>♛</Text> : null}
          </View>
        );
      }
    }

    // Peça animada
    if (movingPiece) {
      const displayFrom = mapBoardToDisplay(movingPiece.from.row, movingPiece.from.col);
      const displayTo = mapBoardToDisplay(movingPiece.to.row, movingPiece.to.col);
      const startX = displayFrom.col * cellSize + cellSize * 0.14;
      const startY = displayFrom.row * cellSize + cellSize * 0.14;
      const endX = displayTo.col * cellSize + cellSize * 0.14;
      const endY = displayTo.row * cellSize + cellSize * 0.14;
      const animatedX = startX + (endX - startX) * movingPiece.progress;
      const animatedY = startY + (endY - startY) * movingPiece.progress;

      pieces.push(
        <View
          key="moving-piece"
          pointerEvents="none"
          style={[
            styles.piece,
            {
              left: animatedX,
              top: animatedY,
              width: cellSize * 0.72,
              height: cellSize * 0.72,
              opacity: 0.98,
              backgroundColor: movingPiece.piece.player === BLACK_PLAYER ? palette.magenta : palette.accent,
              borderColor: movingPiece.piece.player === BLACK_PLAYER ? '#f0abfc' : '#a5f3fc',
              shadowColor: movingPiece.piece.player === BLACK_PLAYER ? palette.magenta : palette.accent,
              borderWidth: 2,
              zIndex: 100,
            },
          ]}
        >
          {movingPiece.piece.king ? <Text style={styles.kingText}>♛</Text> : null}
        </View>
      );
    }

    return pieces;
  };

  const winnerLabel =
    winner === BLACK_PLAYER ? 'Pretas' : winner === WHITE_PLAYER ? 'Brancas' : 'Sem vencedor';

  const humanLabel = humanPlayer === BLACK_PLAYER ? 'Pretas' : 'Brancas';
  const aiLabel = aiPlayer === BLACK_PLAYER ? 'Pretas' : 'Brancas';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.hero}>
          <Header
            title="Damas 2D"
            subtitle="Capture todas as peças adversárias para vencer."
          />
          <NeonGradient colors={gradients.brand} style={styles.heroBar} />
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.turnCard}>
            <Text style={styles.turnLabel}>Vez das</Text>
            <Text style={styles.turnValue}>{currentPlayer === BLACK_PLAYER ? 'Pretas' : 'Brancas'}</Text>
          </View>

          <View style={styles.turnCard}>
            <Text style={styles.turnLabel}>Tempo</Text>
            <Text style={[styles.turnValue, turnSecondsLeft <= 10 && styles.turnValueWarning]}>
              {turnSecondsLeft}s
            </Text>
          </View>
        </View>

        <View style={styles.scorePanel}>
          <Text style={styles.scoreText}>Pretas capturaram: {blackCaptured}</Text>
          <Text style={styles.scoreText}>Brancas capturaram: {whiteCaptured}</Text>
          <Text style={styles.scoreText}>
            Você: {humanLabel} | Bot: {aiLabel}
          </Text>
          {chainCapture ? (
            <Text style={[styles.scoreText, { color: palette.warning }]}>Captura obrigatória!</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.boardShell}>
        <View
          onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleBoardTouch}
          style={styles.board}
        >
          {renderCells()}
          {renderPieces()}
        </View>
      </View>

      <Modal animationType="fade" transparent visible={gameOver}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Fim de jogo</Text>
            <Text style={styles.modalSubtitle}>{winnerLabel} venceram!</Text>
            <Text style={styles.modalScore}>Pretas {blackCaptured} x {whiteCaptured} Brancas</Text>
            <Button title="Jogar Novamente" onPress={resetGame} variant="primary" style={styles.modalButton} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getNow() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surfaceMuted,
    flex: 1,
  },
  topSection: {
    backgroundColor: palette.primary,
    paddingHorizontal: dimensions.spacing.xl,
    paddingVertical: dimensions.spacing.lg,
  },
  hero: {
    alignItems: 'center',
  },
  heroBar: {
    borderRadius: 3,
    height: 4,
    marginTop: dimensions.spacing.lg,
    width: 80,
  },
  infoPanel: {
    flexDirection: 'row',
    gap: dimensions.spacing.md,
    marginTop: dimensions.spacing.lg,
  },
  turnCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: dimensions.radius.lg,
    flex: 1,
    padding: dimensions.spacing.md,
  },
  turnLabel: {
    color: palette.accentSoft,
    fontSize: dimensions.typography.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  turnValue: {
    color: palette.textLight,
    fontSize: dimensions.typography.lg,
    fontWeight: '900',
    marginTop: dimensions.spacing.xs,
  },
  turnValueWarning: {
    color: palette.warning,
  },
  scorePanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensions.spacing.sm,
    marginTop: dimensions.spacing.lg,
  },
  scoreText: {
    color: palette.textSecondary,
    fontSize: dimensions.typography.sm,
    fontWeight: '700',
  },
  boardShell: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    flex: 1,
    justifyContent: 'center',
    padding: dimensions.spacing.xl,
  },
  board: {
    aspectRatio: 1,
    backgroundColor: palette.boardDark,
    borderColor: palette.accent,
    borderRadius: dimensions.radius.md,
    borderWidth: BOARD_BORDER_WIDTH,
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    width: '92%',
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
    elevation: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  cell: {
    flex: 1,
  },
  piece: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  kingText: {
    color: palette.highlight,
    fontSize: dimensions.typography.lg,
    fontWeight: '900',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: palette.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: dimensions.spacing.xl,
  },
  modalCard: {
    alignItems: 'center',
    backgroundColor: palette.surfaceSolid,
    borderColor: palette.accent,
    borderWidth: 1,
    borderRadius: dimensions.radius.xl,
    padding: dimensions.spacing.xl,
    width: '100%',
    shadowColor: palette.magenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    color: palette.textPrimary,
    fontSize: dimensions.typography.xxl,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: palette.textSecondary,
    fontSize: dimensions.typography.lg,
    fontWeight: '700',
    marginTop: dimensions.spacing.sm,
    textAlign: 'center',
  },
  modalScore: {
    color: palette.textPrimary,
    fontSize: dimensions.typography.md,
    marginTop: dimensions.spacing.md,
    textAlign: 'center',
  },
  modalButton: {
    alignSelf: 'center',
    marginTop: dimensions.spacing.lg,
  },
});

export default GameScreen;
