import { AvatarItem, EditorSettings, PrintLayoutMode } from '../types';
import { removePortraitBackground } from './backgroundRemoval';

// In-memory cache for segmented face canvas to keep real-time rendering silky smooth
const segmentedFaceCache = new WeakMap<HTMLImageElement | ImageBitmap, HTMLCanvasElement>();

export async function getSegmentedFace(
  faceImage: HTMLImageElement | ImageBitmap,
  feather: number = 20
): Promise<HTMLCanvasElement> {
  if (segmentedFaceCache.has(faceImage)) {
    return segmentedFaceCache.get(faceImage)!;
  }
  const cutout = await removePortraitBackground(faceImage, null, { featherRadius: feather });
  segmentedFaceCache.set(faceImage, cutout);
  return cutout;
}

// In-memory cache for parsed SVG image elements to avoid re-parsing on every frame
const svgImageCache = new Map<string, HTMLImageElement>();

export function getAvatarSvgImage(avatar: AvatarItem): Promise<HTMLImageElement> {
  const cacheKey = avatar.id;
  if (svgImageCache.has(cacheKey)) {
    const cached = svgImageCache.get(cacheKey)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
        ${avatar.svgForeground}
      </svg>
    `.trim();

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      svgImageCache.set(cacheKey, img);
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Draw background onto canvas based on chosen pattern and color
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: EditorSettings['background']
) {
  ctx.save();

  // Solid base or gradient
  if (bg.gradient) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = bg.bgColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw pattern overlays
  if (bg.pattern === 'dots') {
    ctx.fillStyle = bg.patternColor || 'rgba(255,255,255,0.4)';
    const spacing = 36;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bg.pattern === 'stripes') {
    ctx.fillStyle = bg.patternColor || 'rgba(255,255,255,0.2)';
    const stripeW = 28;
    for (let x = -height; x < width + height; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW + height, height);
      ctx.lineTo(x + height, height);
      ctx.closePath();
      ctx.fill();
    }
  } else if (bg.pattern === 'stars' || bg.pattern === 'sparkles') {
    ctx.fillStyle = bg.patternColor || '#facc15';
    // Deterministic pleasant star field
    const stars = [
      { x: 80, y: 100, r: 12 }, { x: 520, y: 120, r: 14 },
      { x: 120, y: 240, r: 8 }, { x: 480, y: 220, r: 10 },
      { x: 60, y: 380, r: 10 }, { x: 530, y: 360, r: 12 },
      { x: 90, y: 520, r: 9 }, { x: 510, y: 530, r: 8 },
      { x: 70, y: 680, r: 12 }, { x: 520, y: 690, r: 11 },
      { x: 130, y: 820, r: 8 }, { x: 470, y: 830, r: 14 },
      { x: 300, y: 70, r: 10 }
    ];
    stars.forEach(s => {
      drawStar(ctx, (s.x / 600) * width, (s.y / 900) * height, 5, (s.r / 600) * width, ((s.r * 0.45) / 600) * width);
    });
  } else if (bg.pattern === 'sunburst') {
    ctx.save();
    ctx.translate(width / 2, height * 0.35);
    ctx.fillStyle = bg.patternColor || 'rgba(255,255,255,0.3)';
    const rays = 16;
    const angleStep = (Math.PI * 2) / rays;
    for (let i = 0; i < rays; i += 2) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.max(width, height) * 1.5, i * angleStep, (i + 1) * angleStep);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (bg.pattern === 'clouds') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    // Soft fluffy decorative clouds
    const clouds = [
      { x: 80, y: 120, s: 0.8 },
      { x: 500, y: 160, s: 0.9 },
      { x: 90, y: 600, s: 0.7 },
      { x: 500, y: 650, s: 0.85 }
    ];
    clouds.forEach(c => {
      drawCloud(ctx, (c.x / 600) * width, (c.y / 900) * height, c.s * (width / 600));
    });
  }

  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(-20, 0, 24, 0, Math.PI * 2);
  ctx.arc(10, -10, 30, 0, Math.PI * 2);
  ctx.arc(36, 4, 22, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw frame around avatar
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameType: EditorSettings['frame']
) {
  if (frameType === 'none') return;

  ctx.save();
  const s = width / 600;

  if (frameType === 'gold') {
    // Elegant Gold Frame with corner ornaments
    const borderW = 16 * s;
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#b45309');
    ctx.strokeStyle = grad;
    ctx.lineWidth = borderW;
    ctx.strokeRect(borderW / 2, borderW / 2, width - borderW, height - borderW);

    // Inner thin border
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3 * s;
    ctx.strokeRect(borderW + 6 * s, borderW + 6 * s, width - (borderW * 2 + 12 * s), height - (borderW * 2 + 12 * s));

    // Corner stars
    ctx.fillStyle = '#facc15';
    [
      [borderW + 10 * s, borderW + 10 * s],
      [width - (borderW + 10 * s), borderW + 10 * s],
      [borderW + 10 * s, height - (borderW + 10 * s)],
      [width - (borderW + 10 * s), height - (borderW + 10 * s)]
    ].forEach(([cx, cy]) => {
      drawStar(ctx, cx, cy, 4, 12 * s, 4 * s);
    });
  } else if (frameType === 'rainbow') {
    const borderW = 16 * s;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];
    const barW = borderW / colors.length;
    colors.forEach((c, idx) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = barW;
      const offset = idx * barW + barW / 2;
      ctx.strokeRect(offset, offset, width - offset * 2, height - offset * 2);
    });
  } else if (frameType === 'polaroid') {
    // Polaroid white card with subtle bottom weight
    ctx.fillStyle = '#ffffff';
    const topW = 14 * s;
    const sideW = 14 * s;
    const botW = 38 * s;
    // Outer white edges
    ctx.fillRect(0, 0, width, topW);
    ctx.fillRect(0, 0, sideW, height);
    ctx.fillRect(width - sideW, 0, sideW, height);
    ctx.fillRect(0, height - botW, width, botW);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(sideW, topW, width - sideW * 2, height - (topW + botW));
  } else if (frameType === 'comic') {
    const borderW = 14 * s;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = borderW;
    ctx.strokeRect(borderW / 2, borderW / 2, width - borderW, height - borderW);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4 * s;
    ctx.strokeRect(borderW + 3 * s, borderW + 3 * s, width - (borderW * 2 + 6 * s), height - (borderW * 2 + 6 * s));
  } else if (frameType === 'stars') {
    const borderW = 16 * s;
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = borderW;
    ctx.strokeRect(borderW / 2, borderW / 2, width - borderW, height - borderW);

    ctx.fillStyle = '#fde047';
    // Star studs around border
    const countX = 5;
    for (let i = 0; i <= countX; i++) {
      const x = borderW / 2 + (i / countX) * (width - borderW);
      drawStar(ctx, x, borderW / 2, 5, 8 * s, 4 * s);
      drawStar(ctx, x, height - borderW / 2, 5, 8 * s, 4 * s);
    }
  }

  ctx.restore();
}

/**
 * Draw custom text and slogans
 */
export function drawTextElements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: EditorSettings['text']
) {
  const s = width / 600;

  // 1. Slogan (Top Banner or Badge)
  if (text.showSlogan && text.sloganText?.trim()) {
    ctx.save();
    const slogan = text.sloganText.trim();
    const fontSize = Math.round(26 * s);
    ctx.font = `bold ${fontSize}px 'Fredoka', 'Plus Jakarta Sans', cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(slogan);
    const pillW = Math.max(textMetrics.width + 48 * s, 180 * s);
    const pillH = 46 * s;
    const pillX = (width - pillW) / 2;
    const pillY = 32 * s;

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10 * s;
    ctx.shadowOffsetY = 4 * s;

    // Pill background
    ctx.fillStyle = text.sloganBgColor || '#facc15';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();

    // Border
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3 * s;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Slogan Text
    ctx.fillStyle = text.sloganColor || '#78350f';
    ctx.fillText(slogan, width / 2, pillY + pillH / 2);

    ctx.restore();
  }

  // 2. User Name (Bottom Ribbon / Plaque)
  if (text.showUserName && text.userName?.trim()) {
    ctx.save();
    const name = text.userName.trim().toUpperCase();
    const fontSize = Math.round((text.nameSize || 32) * s);
    ctx.font = `900 ${fontSize}px 'Fredoka', 'Plus Jakarta Sans', cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(name);
    const plaqueW = Math.min(Math.max(textMetrics.width + 54 * s, 260 * s), width - 40 * s);
    const plaqueH = 58 * s;
    const plaqueX = (width - plaqueW) / 2;
    const plaqueY = height - 90 * s;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 14 * s;
    ctx.shadowOffsetY = 6 * s;

    // Outer Ribbon Plaque
    const ribbonGrad = ctx.createLinearGradient(0, plaqueY, 0, plaqueY + plaqueH);
    ribbonGrad.addColorStop(0, '#1e3a8a');
    ribbonGrad.addColorStop(1, '#172554');
    ctx.fillStyle = ribbonGrad;

    ctx.beginPath();
    ctx.roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 16 * s);
    ctx.fill();

    // Plaque gold border
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3.5 * s;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    // Text inner outline and glow
    ctx.fillStyle = text.nameColor || '#ffffff';
    ctx.fillText(name, width / 2, plaqueY + plaqueH / 2);

    ctx.restore();
  }
}

/**
 * Main Composite Function: Combines user's face, avatar SVG, background, frame & text into canvas
 */
export async function renderCompositeAvatar(
  targetCanvas: HTMLCanvasElement,
  avatar: AvatarItem,
  faceImage: HTMLImageElement | ImageBitmap | null,
  settings: EditorSettings,
  exportWidth: number = 600,
  exportHeight: number = 900
): Promise<void> {
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return;

  targetCanvas.width = exportWidth;
  targetCanvas.height = exportHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const s = exportWidth / 600;

  // 1. Draw Background
  drawBackground(ctx, exportWidth, exportHeight, settings.background);

  // 2. Draw User Face (if available) clipped inside the avatar's oval face hole
  if (faceImage) {
    ctx.save();

    const hole = avatar.faceHole;
    const cx = hole.cx * s;
    const cy = hole.cy * s;
    const rx = hole.rx * s * 1.04; // slight margin to ensure full coverage under the costume rim
    const ry = hole.ry * s * 1.04;
    const rot = (hole.rotate || 0) * (Math.PI / 180);

    // Create oval clipping path
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
    ctx.clip();

    // Apply User Face Transformations
    const tf = settings.faceTransform;
    ctx.translate(cx + tf.offsetX * s, cy + tf.offsetY * s);
    ctx.rotate((tf.rotation * Math.PI) / 180);

    if (tf.flipH) {
      ctx.scale(-1, 1);
    }

    // Apply Brightness & Contrast filter
    if (tf.brightness !== 100 || tf.contrast !== 100) {
      ctx.filter = `brightness(${tf.brightness}%) contrast(${tf.contrast}%)`;
    }

    // Scale face to nicely fill the hole area
    // Base fit: compute scale relative to faceImage natural dimensions
    const imgW = (faceImage as HTMLImageElement).naturalWidth || (faceImage as ImageBitmap).width || 400;
    const imgH = (faceImage as HTMLImageElement).naturalHeight || (faceImage as ImageBitmap).height || 400;

    // Face oval diameter is approx 2 * ry
    const targetFaceSize = ry * 2.3 * tf.scale;
    const aspect = imgW / imgH;

    let drawW: number;
    let drawH: number;

    if (aspect > 1) {
      drawH = targetFaceSize;
      drawW = targetFaceSize * aspect;
    } else {
      drawW = targetFaceSize;
      drawH = targetFaceSize / aspect;
    }

    let sourceToDraw: CanvasImageSource = faceImage;
    if (tf.removeBackground) {
      try {
        sourceToDraw = await getSegmentedFace(faceImage, tf.bgFeather || 20);
      } catch (err) {
        console.warn('Background removal error, drawing direct image:', err);
      }
    }

    ctx.drawImage(sourceToDraw, -drawW / 2, -drawH / 2, drawW, drawH);

    // 3D Ambient Occlusion Shadow along the lower rim of the face hole (where collar meets neck/chin)
    const shadowGrad = ctx.createRadialGradient(0, ry * 0.45, ry * 0.35, 0, ry * 0.75, ry * 0.95);
    shadowGrad.addColorStop(0, 'transparent');
    shadowGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.22)');
    shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.65)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3D Soft Rim Vignette around oval border for seamless volumetric integration
    const edgeVignette = ctx.createRadialGradient(0, 0, rx * 0.7, 0, 0, rx * 1.05);
    edgeVignette.addColorStop(0, 'transparent');
    edgeVignette.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = edgeVignette;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else {
    // If no face captured yet, draw a friendly cheerful placeholder silhouette
    ctx.save();
    const hole = avatar.faceHole;
    const cx = hole.cx * s;
    const cy = hole.cy * s;
    const rx = hole.rx * s;
    const ry = hole.ry * s;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.lineWidth = 3 * s;
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([8 * s, 6 * s]);
    ctx.stroke();

    ctx.font = `600 ${18 * s}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ruang Wajah', cx, cy - 10 * s);
    ctx.font = `500 ${13 * s}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText('(Ambil Gambar)', cx, cy + 14 * s);

    ctx.restore();
  }

  // 3. Draw Avatar Foreground SVG Vector Illustration
  try {
    const avatarImg = await getAvatarSvgImage(avatar);
    ctx.drawImage(avatarImg, 0, 0, exportWidth, exportHeight);
  } catch (err) {
    console.error('Failed to render avatar SVG layer:', err);
  }

  // 4. Draw Chosen Frame
  drawFrame(ctx, exportWidth, exportHeight, settings.frame);

  // 5. Draw Text (User Name & Slogans)
  drawTextElements(ctx, exportWidth, exportHeight, settings.text);
}

/**
 * Generate 4R Photo Canvas (1200 x 1800 at 300 DPI)
 */
export async function generate4RCanvas(
  avatar: AvatarItem,
  faceImage: HTMLImageElement | ImageBitmap | null,
  settings: EditorSettings
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  await renderCompositeAvatar(canvas, avatar, faceImage, settings, 1200, 1800);
  return canvas;
}

/**
 * Generate A4 Layout Canvas with choice of 1 full image, 2 medium images, or 4 sticker badges
 */
export async function generateA4Canvas(
  avatar: AvatarItem,
  faceImage: HTMLImageElement | ImageBitmap | null,
  settings: EditorSettings,
  mode: PrintLayoutMode
): Promise<HTMLCanvasElement> {
  // A4 standard at 150 DPI for high fidelity without exceeding memory: 1240 x 1754 px
  const a4Canvas = document.createElement('canvas');
  const a4W = 1240;
  const a4H = 1754;
  a4Canvas.width = a4W;
  a4Canvas.height = a4H;

  const ctx = a4Canvas.getContext('2d');
  if (!ctx) return a4Canvas;

  // Clean white paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, a4W, a4H);

  // Top school header branding
  ctx.fillStyle = '#1e3a8a';
  ctx.font = "bold 28px 'Fredoka', 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('AvatarKu Studio - Cetakan Rasmi', a4W / 2, 48);

  ctx.fillStyle = '#64748b';
  ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText('Potong mengikut garisan putus-putus untuk simpanan atau lencana', a4W / 2, 74);

  // Render high-res single avatar source
  const sourceCanvas = await generate4RCanvas(avatar, faceImage, settings);

  if (mode === 'single_full') {
    // 1 Full Page Picture centered (aspect 2:3 -> 960 x 1440)
    const targetW = 960;
    const targetH = 1440;
    const startX = (a4W - targetW) / 2;
    const startY = 120;

    // Draw image
    ctx.drawImage(sourceCanvas, startX, startY, targetW, targetH);

    // Dotted cutting border guide
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(startX - 4, startY - 4, targetW + 8, targetH + 8);
  } else if (mode === 'dual_medium') {
    // 2 Medium Pictures stacked vertically
    const targetW = 680;
    const targetH = 760;
    const startX = (a4W - targetW) / 2;

    [110, 920].forEach((startY, idx) => {
      ctx.drawImage(sourceCanvas, startX, startY, targetW, targetH);

      // Dotted cutting line
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(startX - 4, startY - 4, targetW + 8, targetH + 8);

      // Label
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Salinan ${idx + 1} (4R Sederhana)`, startX, startY - 10);
    });
  } else if (mode === 'quad_sticker') {
    // 4 Sticker Badges (2 x 2 grid)
    const targetW = 540;
    const targetH = 740;
    const gapX = 40;
    const gapY = 50;
    const startX = (a4W - (targetW * 2 + gapX)) / 2;
    const startY = 110;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = startX + col * (targetW + gapX);
        const y = startY + row * (targetH + gapY);

        ctx.drawImage(sourceCanvas, x, y, targetW, targetH);

        // Dotted cut border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(x - 3, y - 3, targetW + 6, targetH + 6);
      }
    }
  }

  return a4Canvas;
}
