// Monograma "TF" da marca — mesmas cores da logo (slate-950 + amber-400).
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#020617"/>
  <text x="50%" y="53%" dominant-baseline="central" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="29" fill="#fbbf24">TF</text>
</svg>
`.trim();

export async function GET() {
  return new Response(faviconSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
