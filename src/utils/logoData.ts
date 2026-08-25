// Vector/Canvas Logo generator for Olor Gardenia
// Generates high-res PNG data URLs for PDF embedding and thermal ticket printing

export function createMariaMariaLogoDataUrl(options?: {
  grayscale?: boolean;
  watermark?: boolean;
  size?: number;
}): string {
  return createOlorGardeniaLogoDataUrl(options);
}

export function createOlorGardeniaLogoDataUrl(options?: {
  grayscale?: boolean;
  watermark?: boolean;
  size?: number;
}): string {
  const size = options?.size || 500;
  const isGray = !!options?.grayscale;
  const isWatermark = !!options?.watermark;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const center = size / 2;
  const radius = size * 0.46;

  ctx.clearRect(0, 0, size, size);

  if (isWatermark) {
    ctx.globalAlpha = 0.07; // subtle watermark opacity
  }

  // --- Background Circle ---
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = isGray ? '#f5f5f5' : '#fdfbf7';
  ctx.fill();

  // --- Outer Thick Ring ---
  const ringWidth = size * 0.045;
  ctx.beginPath();
  ctx.arc(center, center, radius - ringWidth / 2, 0, Math.PI * 2);
  ctx.strokeStyle = isGray ? '#333333' : '#c59b27';
  ctx.lineWidth = ringWidth;
  ctx.stroke();

  // --- Inner Thin Border ---
  ctx.beginPath();
  ctx.arc(center, center, radius - ringWidth * 1.15, 0, Math.PI * 2);
  ctx.strokeStyle = isGray ? '#666666' : '#d4af37';
  ctx.lineWidth = size * 0.004;
  ctx.stroke();

  // --- Gardenia Floral Petals Drawing in Center ---
  const goldColor = isGray ? '#222222' : '#c59b27';
  ctx.save();
  ctx.strokeStyle = goldColor;
  ctx.fillStyle = isGray ? 'rgba(0,0,0,0.06)' : 'rgba(212, 175, 55, 0.12)';
  ctx.lineWidth = size * 0.008;

  // Draw 8-petal layered gardenia icon at top center
  const flowerCenterY = center - size * 0.08;
  const petalR = size * 0.13;
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const px = center + Math.cos(ang) * (petalR * 0.45);
    const py = flowerCenterY + Math.sin(ang) * (petalR * 0.45);
    ctx.beginPath();
    ctx.arc(px, py, petalR * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Central bud
  ctx.beginPath();
  ctx.arc(center, flowerCenterY, size * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = goldColor;
  ctx.fill();
  ctx.restore();

  // --- Typography: "OLOR GARDENIA" ---
  ctx.fillStyle = goldColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. "OLOR"
  ctx.font = `700 ${size * 0.11}px "Poppins", "Outfit", "Segoe UI", sans-serif`;
  ctx.fillText('OLOR', center, center + size * 0.11);

  // 2. "GARDENIA" with letter spacing
  const subText = 'GARDENIA';
  const subFontSize = size * 0.085;
  ctx.font = `800 ${subFontSize}px "Poppins", "Outfit", "Segoe UI", sans-serif`;

  const letterSpacing = size * 0.015;
  const totalSubWidth = ctx.measureText(subText).width + (subText.length - 1) * letterSpacing;
  let startX = center - totalSubWidth / 2;
  const subY = center + size * 0.23;

  for (let i = 0; i < subText.length; i++) {
    const char = subText[i];
    ctx.fillText(char, startX + ctx.measureText(char).width / 2, subY);
    startX += ctx.measureText(char).width + letterSpacing;
  }

  return canvas.toDataURL('image/png');
}
