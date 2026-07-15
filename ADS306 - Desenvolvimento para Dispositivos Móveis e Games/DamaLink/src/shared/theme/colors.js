// DamaLink — identidade "neon arcade / fintech":
// fundo quase-preto, superfícies de vidro, acentos neon ciano→magenta e brilho.
const palette = {
  // superfícies
  primary: '#0b0e1a',       // quase-preto azulado (fundo)
  primarySoft: '#12172a',   // elevado
  secondary: '#0a0d18',
  surface: 'rgba(255,255,255,0.05)',  // vidro
  surfaceSolid: '#141a30',
  surfaceMuted: '#0b0e1a',

  // neon
  accent: '#22d3ee',        // ciano
  accentSoft: '#67e8f9',
  magenta: '#d946ef',
  violet: '#8b5cf6',
  highlight: '#fbbf24',     // âmbar (dama/king)
  king: '#fbbf24',

  // estados
  success: '#34d399',
  warning: '#fbbf24',
  error: '#fb7185',
  info: '#22d3ee',

  // tabuleiro neon
  boardLight: '#1b2440',
  boardDark: '#0e1326',
  boardLine: 'rgba(34, 211, 238, 0.22)',
  selected: 'rgba(34, 211, 238, 0.30)',
  validMove: 'rgba(217, 70, 239, 0.28)',
  capture: 'rgba(251, 113, 133, 0.30)',

  // texto
  textPrimary: '#eef2ff',
  textSecondary: '#9aa3c8',
  textLight: '#eef2ff',
  muted: '#5b6488',

  // bordas / overlay
  border: 'rgba(34, 211, 238, 0.18)',
  borderMagenta: 'rgba(217, 70, 239, 0.30)',
  overlay: 'rgba(5, 7, 15, 0.82)',
  transparent: 'transparent',
};

// stops de gradiente reaproveitados pelo NeonGradient
const gradients = {
  brand: ['#22d3ee', '#8b5cf6', '#d946ef'],
  cool: ['#22d3ee', '#3b82f6'],
  danger: ['#fb7185', '#d946ef'],
};

const typography = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 30,
};

export { palette, palette as colors, gradients, typography };
export default palette;
