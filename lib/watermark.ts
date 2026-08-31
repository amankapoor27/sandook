import sharp from "sharp";

const WATERMARK_TEXT = "Sandook studio";

function buildWatermarkSvg(width: number, height: number): string {
  const tileWidth = 260;
  const tileHeight = 110;
  const fontSize = Math.max(16, Math.min(28, Math.round(width / 28)));

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="wm" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
      <text
        x="12"
        y="58"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${fontSize}"
        fill="#ffffff"
        fill-opacity="0.26"
        letter-spacing="0.08em"
      >${WATERMARK_TEXT}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)" />
</svg>`;
}

export async function applyWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const { width, height } = await image.metadata();

  if (!width || !height) return buffer;

  const svg = buildWatermarkSvg(width, height);

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer();
}
