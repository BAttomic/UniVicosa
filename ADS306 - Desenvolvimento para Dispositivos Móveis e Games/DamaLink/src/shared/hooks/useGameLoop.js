/**
 * useGameLoop.js
 * -----------------------------------------------------------------------------
 * Hook reutilizável de game loop baseado em requestAnimationFrame. Expõe
 * `start`/`stop` e invoca o callback a cada quadro com o delta de tempo em
 * segundos, mantendo o callback mais recente via ref para evitar closures
 * obsoletas. Base genérica para animações e contadores por quadro.
 */
import { useCallback, useEffect, useRef } from 'react';

function useGameLoop(updateCallback) {
  const animationFrameIdRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const updateCallbackRef = useRef(updateCallback);

  useEffect(() => {
    updateCallbackRef.current = updateCallback;
  }, [updateCallback]);

  const stop = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();

    const gameLoop = (timestamp) => {
      const lastTimestamp = lastTimestampRef.current;
      const deltaSeconds = lastTimestamp === null ? 0 : (timestamp - lastTimestamp) / 1000;
      lastTimestampRef.current = timestamp;

      if (typeof updateCallbackRef.current === 'function') {
        updateCallbackRef.current({ deltaSeconds, timestamp });
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, [stop]);

  return { start, stop };
}

export default useGameLoop;
