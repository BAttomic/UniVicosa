/**
 * collisionDetection.js
 * -----------------------------------------------------------------------------
 * Utilitário de detecção de toque dentro de uma bounding box (teste AABB ponto
 * × retângulo). Usado pelo tabuleiro de damas para validar em qual célula o
 * usuário tocou, dado o gesto bruto (locationX/locationY) do React Native.
 */
function isTouchInsideBoundingBox(touchX, touchY, boxX, boxY, boxWidth, boxHeight) {
  return touchX >= boxX && touchX <= boxX + boxWidth && touchY >= boxY && touchY <= boxY + boxHeight;
}

export { isTouchInsideBoundingBox };
