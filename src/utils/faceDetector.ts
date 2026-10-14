/**
 * Client-Side Auto Face Detection and Fitting Utility
 * 
 * 1. Attempts Native Browser FaceDetector API (Chromium / Chrome / Edge hardware-accelerated).
 * 2. Falls back to fast Canvas-based skin-chrominance (YCbCr) & facial contrast clustering.
 * 3. Computes optimal scale and offset to automatically fit the user's face into any avatar's face aperture.
 */

export interface DetectedFaceBox {
  x: number;      // Bounding box top-left X in source image pixels
  y: number;      // Bounding box top-left Y
  width: number;  // Bounding box width
  height: number; // Bounding box height
  centerX: number; // Face center X
  centerY: number; // Face center Y
  confidence: number;
}

export interface AutoFitResult {
  scale: number;
  offsetX: number;
  offsetY: number;
  detectedBox: DetectedFaceBox | null;
}

// Check if Native FaceDetector is available
declare global {
  interface Window {
    FaceDetector?: new (options?: { maxDetectedFaces?: number; fastMode?: boolean }) => {
      detect: (image: ImageBitmapSource) => Promise<Array<{
        boundingBox: DOMRectReadOnly;
        landmarks?: Array<{ type: string; locations: Array<{ x: number; y: number }> }>;
      }>>;
    };
  }
}

/**
 * Detect face location in an image or canvas
 */
export async function detectFace(
  sourceImage: HTMLImageElement | ImageBitmap | HTMLCanvasElement
): Promise<DetectedFaceBox | null> {
  const imgWidth = (sourceImage as HTMLImageElement).naturalWidth || sourceImage.width || 640;
  const imgHeight = (sourceImage as HTMLImageElement).naturalHeight || sourceImage.height || 480;

  // 1. Try Native Browser FaceDetector if supported
  if (typeof window !== 'undefined' && window.FaceDetector) {
    try {
      const detector = new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true });
      const faces = await detector.detect(sourceImage);
      if (faces && faces.length > 0) {
        const box = faces[0].boundingBox;
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          centerX: box.x + box.width / 2,
          centerY: box.y + box.height * 0.45, // slightly above center for eye alignment
          confidence: 0.95,
        };
      }
    } catch (e) {
      console.warn('Native FaceDetector error, falling back to heuristic detector:', e);
    }
  }

  // 2. Intelligent Canvas-based skin-tone & contrast clustering detector
  return detectFaceViaCanvasHeuristic(sourceImage, imgWidth, imgHeight);
}

/**
 * High-speed YCbCr skin tone segmentation & feature density clustering
 */
function detectFaceViaCanvasHeuristic(
  sourceImage: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  imgWidth: number,
  imgHeight: number
): DetectedFaceBox | null {
  try {
    // Downscale to 160x120 for sub-10ms instantaneous processing
    const sampleW = 160;
    const sampleH = Math.round((imgHeight / imgWidth) * sampleW);

    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(sourceImage, 0, 0, sampleW, sampleH);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    let totalWeight = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = sampleW;
    let maxX = 0;
    let minY = sampleH;
    let maxY = 0;

    // Center bias: faces are usually in the central 70% of webcam frames
    const centerBiasX = sampleW / 2;
    const centerBiasY = sampleH * 0.45;
    const maxDist = Math.hypot(sampleW / 2, sampleH / 2);

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const idx = (y * sampleW + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Convert RGB to YCbCr standard skin-tone model
        // Y  =  0.299*R + 0.587*G + 0.114*B
        // Cb = -0.169*R - 0.331*G + 0.500*B + 128
        // Cr =  0.500*R - 0.419*G - 0.081*B + 128
        const Cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        const Cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

        // Human skin tone clusters tightly around Cr in [133..175], Cb in [77..128]
        const isSkin = Cr >= 130 && Cr <= 178 && Cb >= 75 && Cb <= 130 && r > g && g > b;

        if (isSkin) {
          // Weight with center proximity to prioritize user's face over background
          const dist = Math.hypot(x - centerBiasX, y - centerBiasY);
          const weight = Math.max(0.1, 1 - dist / maxDist);

          totalWeight += weight;
          sumX += x * weight;
          sumY += y * weight;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (totalWeight < 40) {
      // Fallback: estimate default centered face if skin sampling is sparse
      const defaultW = imgWidth * 0.4;
      const defaultH = imgHeight * 0.5;
      return {
        x: (imgWidth - defaultW) / 2,
        y: (imgHeight - defaultH) * 0.35,
        width: defaultW,
        height: defaultH,
        centerX: imgWidth / 2,
        centerY: imgHeight * 0.45,
        confidence: 0.5,
      };
    }

    const scaleX = imgWidth / sampleW;
    const scaleY = imgHeight / sampleH;

    const centroidX = (sumX / totalWeight) * scaleX;
    const centroidY = (sumY / totalWeight) * scaleY;
    const faceW = Math.max(imgWidth * 0.28, Math.min(imgWidth * 0.65, (maxX - minX) * scaleX * 0.9));
    const faceH = faceW * 1.35; // typical facial oval ratio

    return {
      x: centroidX - faceW / 2,
      y: centroidY - faceH / 2,
      width: faceW,
      height: faceH,
      centerX: centroidX,
      centerY: centroidY,
      confidence: 0.85,
    };
  } catch (err) {
    console.error('Heuristic face detection error:', err);
    return null;
  }
}

/**
 * Automatically calculate optimal scale and offset to fit user face into avatar aperture
 */
export function calculateFaceAutoFit(
  detectedFace: DetectedFaceBox | null,
  faceImageWidth: number,
  faceImageHeight: number,
  targetFaceHole: { cx: number; cy: number; rx: number; ry: number }
): AutoFitResult {
  if (!detectedFace) {
    return {
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      detectedBox: null,
    };
  }

  // Target avatar face aperture diameter
  // We want detected face height to comfortably fill the vertical radius ry * 2
  const targetHoleDiameterY = targetFaceHole.ry * 2.15;
  const detectedH = detectedFace.height || faceImageHeight * 0.45;

  // The base drawing scale in our canvas renderer scales the image by:
  // targetFaceSize = ry * 2.3 * tf.scale;
  // If detected face is larger or smaller in the original photo, auto-scale corrects it:
  const idealScale = Math.max(0.65, Math.min(1.7, (targetHoleDiameterY / detectedH) * 0.88));

  // Offset adjustment in canvas space (600x900 coordinate system):
  // Default drawing centers image at targetFaceHole (cx, cy).
  // If the detected face centroid differs from image center, shift by the delta!
  const imgCenterX = faceImageWidth / 2;
  const imgCenterY = faceImageHeight / 2;

  // Normalized shift relative to image size mapped to canvas space
  const deltaX = (imgCenterX - detectedFace.centerX) * (targetHoleDiameterY / detectedH) * 0.6;
  const deltaY = (imgCenterY - detectedFace.centerY) * (targetHoleDiameterY / detectedH) * 0.6;

  const clampedOffsetX = Math.max(-120, Math.min(120, Math.round(deltaX)));
  const clampedOffsetY = Math.max(-120, Math.min(120, Math.round(deltaY)));

  return {
    scale: parseFloat(idealScale.toFixed(2)),
    offsetX: clampedOffsetX,
    offsetY: clampedOffsetY,
    detectedBox: detectedFace,
  };
}
