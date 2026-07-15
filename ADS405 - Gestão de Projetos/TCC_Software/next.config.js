/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera a saída "standalone" (.next/standalone) para uma imagem Docker enxuta
  // — usada pela pipeline do Easypanel.
  output: "standalone",
};

module.exports = nextConfig;
